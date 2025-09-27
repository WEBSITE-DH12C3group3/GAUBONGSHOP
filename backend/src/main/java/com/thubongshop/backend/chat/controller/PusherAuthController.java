package com.thubongshop.backend.chat.controller;

import com.thubongshop.backend.chat.service.ChatService;
import com.thubongshop.backend.chat.service.PusherService;
import com.thubongshop.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PusherAuthController {

  private final PusherService pusher;
  private final ChatService chatService;

  /**
   * Pusher sẽ POST form-url-encoded: channel_name=...&socket_id=...
   * FE không cần tự set Content-Type, Pusher lib làm sẵn.
   */
  @PostMapping(
      path = "/api/chat/pusher/auth",
      consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE
  )
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<String> auth(
      @AuthenticationPrincipal UserPrincipal me,
      @RequestParam("channel_name") String channelName,
      @RequestParam("socket_id")   String socketId
  ) {
    if (me == null) {
      // Đúng ra Security sẽ chặn trước; phòng xa
      return ResponseEntity.status(401).body("{\"message\":\"Unauthorized\"}");
    }
    if (channelName == null || channelName.isBlank() || socketId == null || socketId.isBlank()) {
      return ResponseEntity.badRequest().body("{\"message\":\"Missing channel_name/socket_id\"}");
    }

    // Kênh hub dành cho admin (nếu bạn có)
    if ("private-admin.livechat".equals(channelName)) {
      boolean ok = me.getAuthorities().stream()
          .anyMatch(a -> "manage_livechat".equals(a.getAuthority())
                      || "ROLE_ADMIN".equals(a.getAuthority())
                      || "ADMIN".equalsIgnoreCase(a.getAuthority()));
      if (!ok) {
        return ResponseEntity.status(403).body("{\"message\":\"Forbidden\"}");
      }
      String json = pusher.authenticate(channelName, socketId); // Trả JSON {"auth":"<key>:<signature>"}
      return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(json);
    }

    // Kênh chat theo phiên: private-chat.{sessionId}
    if (channelName.startsWith("private-chat.")) {
      Integer sessionId;
      try {
        sessionId = Integer.valueOf(channelName.substring("private-chat.".length()));
      } catch (NumberFormatException ex) {
        return ResponseEntity.status(403).body("{\"message\":\"Invalid session id\"}");
      }

      // Admin -> được vào mọi phiên; Khách -> phải là chủ phiên
      boolean isAdmin = me.getAuthorities().stream()
          .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equalsIgnoreCase(a.getAuthority()));
      if (!isAdmin) {
        boolean allowed = chatService.canView(me.getId(), sessionId);
        if (!allowed) {
          return ResponseEntity.status(403).body("{\"message\":\"Forbidden\"}");
        }
      }

      String json = pusher.authenticate(channelName, socketId);
      return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(json);
    }

    // Kênh lạ -> chặn
    return ResponseEntity.status(403).body("{\"message\":\"Invalid channel\"}");
  }
}
