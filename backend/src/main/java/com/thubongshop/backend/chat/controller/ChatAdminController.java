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

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // chỉ admin
public class ChatAdminController {
  private final ChatService chat;

  // Danh sách phiên chat theo trạng thái (open/pending/closed) + phân trang
  @GetMapping("/sessions")
  public PageResponse<ChatSessionDTO> list(@RequestParam(defaultValue="open") String status,
                                           @RequestParam(defaultValue="0") int page,
                                           @RequestParam(defaultValue="10") int size) {
    var p = chat.adminList(status, PageRequest.of(page, size));
    return PageResponse.map(p, x -> x);
  }

  // Xem tin nhắn trong 1 session
  @GetMapping("/sessions/{sessionId}/messages")
  public PageResponse<MessageDTO> messages(@AuthenticationPrincipal UserPrincipal admin,
                                           @PathVariable Integer sessionId,
                                           @RequestParam(defaultValue="0") int page,
                                           @RequestParam(defaultValue="50") int size) {
    var p = chat.messages(admin.getId().intValue(), sessionId, PageRequest.of(page, size));
    return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
  }

  // Trả lời khách
  @PostMapping("/sessions/{sessionId}/reply")
  public MessageDTO reply(@AuthenticationPrincipal UserPrincipal admin,
                          @PathVariable Integer sessionId,
                          @Valid @RequestBody SendMessageRequest req) {
    return chat.sendFromAdmin(admin.getId().intValue(), sessionId, req.getContent());
  }

  // Đóng session
  @PatchMapping("/sessions/{sessionId}/close")
  public ResponseEntity<Void> close(@PathVariable Integer sessionId) {
    chat.closeSession(sessionId);
    return ResponseEntity.ok().build();
  }
}
