package com.thubongshop.backend.chat.controller;

import com.thubongshop.backend.chat.service.ChatService;
import com.thubongshop.backend.chat.service.PusherService;
import com.thubongshop.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PusherAuthController {

  private final PusherService pusher;
  private final ChatService chatService;

  @PostMapping(value = "/api/chat/pusher/auth", consumes = "application/json", produces = "application/json")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<String> auth(@AuthenticationPrincipal UserPrincipal me,
                                     @RequestBody Map<String, String> body) {
    String socketId = body.get("socket_id");
    String channel = body.get("channel_name");
    if (socketId == null || channel == null) return ResponseEntity.badRequest().build();

    // admin hub
    if ("private-admin.livechat".equals(channel)) {
      boolean ok = me.getAuthorities().stream().anyMatch(a -> "manage_livechat".equals(a.getAuthority()));
      if (!ok) return ResponseEntity.status(403).build();
      String json = pusher.authenticate(channel, socketId);
      return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(json);
    }

    // kênh đoạn chat riêng
    if (channel.startsWith("private-chat.")) {
      Integer sid = Integer.valueOf(channel.substring("private-chat.".length()));
      if (!chatService.canView(me.getId(), sid)) {
        return ResponseEntity.status(403).build();
      }
      String json = pusher.authenticate(channel, socketId);
      return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(json);
    }

    return ResponseEntity.status(403).build();
  }
}
