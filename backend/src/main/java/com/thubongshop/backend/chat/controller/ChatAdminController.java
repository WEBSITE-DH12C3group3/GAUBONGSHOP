package com.thubongshop.backend.chat.controller;

import com.thubongshop.backend.chat.dto.ChatSessionResponse;
import com.thubongshop.backend.chat.dto.MessageDTO;
import com.thubongshop.backend.chat.service.ChatService;
import com.thubongshop.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage_livechat')") // ✅ mọi endpoint admin chat cần quyền
public class ChatAdminController {

  private final ChatService chat;

  @GetMapping("/sessions")
  public Page<ChatSessionResponse> sessions(@AuthenticationPrincipal UserPrincipal me,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size,
                                            @RequestParam(defaultValue = "open") String status) {
    // ở bản đơn giản: lấy tất cả rồi FE lọc status; có thể viết spec nếu bạn có field status
    return chat.sessionsOfUser(me.getId(), PageRequest.of(page, size));
  }

  @GetMapping("/sessions/{id}/messages")
  public Page<MessageDTO> messages(@AuthenticationPrincipal UserPrincipal me,
                                   @PathVariable Integer id,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "50") int size) {
    return chat.messagesOfSession(me.getId(), id, PageRequest.of(page, size));
  }

  @PostMapping("/sessions/{id}/messages")
  public MessageDTO send(@AuthenticationPrincipal UserPrincipal me,
                         @PathVariable Integer id,
                         @RequestBody SendReq req) {
    return chat.send(me.getId(), id, req.content);
  }

  @PatchMapping("/sessions/{id}/read")
  public ResponseEntity<?> markRead(@AuthenticationPrincipal UserPrincipal me, @PathVariable Integer id) {
    chat.markReadAll(me.getId(), id);
    return ResponseEntity.ok().build();
  }

  public record SendReq(String content) {}
}
