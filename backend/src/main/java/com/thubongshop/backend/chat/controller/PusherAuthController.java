package com.thubongshop.backend.chat.controller;

import com.thubongshop.backend.chat.service.ChatService;
import com.thubongshop.backend.chat.service.PusherService;
import com.thubongshop.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
public class PusherAuthController {

  private final PusherService pusher;
  private final ChatService chatService;

  @PostMapping(
      path = "/api/chat/pusher/auth",
      consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE
  )
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<String> auth(
      @AuthenticationPrincipal UserPrincipal me,
      @RequestParam("channel_name") String channelName,
      @RequestParam("socket_id") String socketId
  ) {
    if (me == null) {
      return ResponseEntity.status(401).body("{\"message\":\"Unauthorized\"}");
    }
    if (channelName == null || channelName.isBlank() || socketId == null || socketId.isBlank()) {
      return ResponseEntity.badRequest().body("{\"message\":\"Missing channel_name/socket_id\"}");
    }

    if ("private-admin.livechat".equals(channelName)) {
      boolean ok = me.getAuthorities().stream()
          .anyMatch(a -> "manage_livechat".equals(a.getAuthority())
              || "ROLE_ADMIN".equals(a.getAuthority())
              || "ADMIN".equalsIgnoreCase(a.getAuthority()));
      if (!ok) {
        return ResponseEntity.status(403).body("{\"message\":\"Forbidden\"}");
      }
      return authenticateChannel(channelName, socketId, "admin");
    }

    if (channelName.startsWith("private-chat.")) {
      Integer sessionId;
      try {
        sessionId = Integer.valueOf(channelName.substring("private-chat.".length()));
      } catch (NumberFormatException ex) {
        return ResponseEntity.status(403).body("{\"message\":\"Invalid session id\"}");
      }

      boolean isAdmin = me.getAuthorities().stream()
          .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equalsIgnoreCase(a.getAuthority()));
      if (!isAdmin) {
        boolean allowed = chatService.canView(me.getId(), sessionId);
        if (!allowed) {
          return ResponseEntity.status(403).body("{\"message\":\"Forbidden\"}");
        }
      }

      return authenticateChannel(channelName, socketId, "chat-session");
    }

    return ResponseEntity.status(403).body("{\"message\":\"Invalid channel\"}");
  }

  private ResponseEntity<String> authenticateChannel(String channelName, String socketId, String type) {
    try {
      String json = pusher.authenticate(channelName, socketId);
      return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(json);
    } catch (Exception e) {
      log.error("Pusher auth failed [{}] channel={}: {}", type, channelName, e.getMessage(), e);
      return ResponseEntity.status(503).body("{\"message\":\"Pusher unavailable or misconfigured\"}");
    }
  }
}
