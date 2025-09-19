// PusherAuthController.java
package com.thubongshop.backend.chat.controller;

import com.pusher.rest.Pusher;
import com.thubongshop.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PusherAuthController {

  private final Pusher pusher;

  // Form-URL-Encoded (Pusher mặc định)
  @PostMapping(
      value = "/api/pusher/auth",
      consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE
  )
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<String> authForm(
      @AuthenticationPrincipal UserPrincipal me,
      @RequestParam("socket_id") String socketId,
      @RequestParam("channel_name") String channelName
  ) {
    String authJson = pusher.authenticate(socketId, channelName); // ✅ đúng thứ tự, KHÔNG .toJson()
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_JSON)
        .body(authJson);
  }

  // JSON (nếu FE gửi JSON)
  @PostMapping(
      value = "/api/pusher/auth",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE
  )
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<String> authJson(
      @AuthenticationPrincipal UserPrincipal me,
      @RequestBody Map<String, String> body
  ) {
    String socketId = body.get("socket_id");
    String channelName = body.get("channel_name");
    String authJson = pusher.authenticate(channelName, socketId);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_JSON)
        .body(authJson);
  }
}
