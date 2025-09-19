package com.thubongshop.backend.chat.controller;

import com.thubongshop.backend.chat.dto.*;
import com.thubongshop.backend.chat.service.ChatService;
import com.thubongshop.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Map;


@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ChatAdminController {

  private final ChatService chat;

  @GetMapping("/sessions")
  public PageResponse<ChatSessionDTO> list(
      @RequestParam(defaultValue = "open") String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {

    var p = chat.adminList(status, PageRequest.of(page, size));
    return PageResponse.map(p, x -> x);
  }

  @GetMapping("/sessions/{sessionId}/messages")
  public PageResponse<MessageDTO> messages(
      @AuthenticationPrincipal UserPrincipal admin,
      @PathVariable Integer sessionId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "50") int size) {

    var p = chat.messages(admin.getId().intValue(), sessionId, PageRequest.of(page, size));
    return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
  }

  @PostMapping("/sessions/{sessionId}/reply")
  public MessageDTO reply(
      @AuthenticationPrincipal UserPrincipal admin,
      @PathVariable Integer sessionId,
      @Valid @RequestBody SendMessageRequest req) {

    return chat.sendFromAdmin(admin.getId().intValue(), sessionId, req.getContent());
  }

  // ✅ CHỈ ghi relative path vì đã có prefix ở class
  @PatchMapping("/sessions/{sessionId}/read")
  public ResponseEntity<Integer> markReadAdmin(
      @AuthenticationPrincipal UserPrincipal admin,
      @PathVariable Integer sessionId) {

    int count = chat.markReadAll(admin.getId().intValue(), sessionId); // ✅ dùng 'chat'
    return ResponseEntity.ok(count);
  }

  @PatchMapping("/sessions/{sessionId}/close")
  public ResponseEntity<Void> close(@PathVariable Integer sessionId) {
    chat.closeSession(sessionId);
    return ResponseEntity.ok().build();
  }
}

