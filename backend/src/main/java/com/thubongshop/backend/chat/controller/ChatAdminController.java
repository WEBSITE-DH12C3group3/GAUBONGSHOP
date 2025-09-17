package com.thubongshop.backend.chat.controller;

import com.thubongshop.backend.chat.dto.ChatMessageRequest;
import com.thubongshop.backend.chat.dto.ChatMessageResponse;
import com.thubongshop.backend.chat.dto.ChatSessionResponse;
import com.thubongshop.backend.chat.entity.ChatSession;
import com.thubongshop.backend.chat.service.ChatService;
import com.thubongshop.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
public class ChatAdminController {

  private final ChatService chat;

  // Danh sách phiên chat (lọc theo status: open/closed/pending)
  @GetMapping("/sessions")
  public Page<ChatSessionResponse> listSessions(
      @RequestParam(required = false) ChatSession.Status status,   // <— dùng enum
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size
  ) {
    return chat.sessionsForAdmin(                                  // <— gọi đúng tên hàm service
        status,
        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"))
    );
  }

  // Lấy tin nhắn trong 1 phiên (admin phải là participant)
  @GetMapping("/sessions/{id}/messages")
  public Page<ChatMessageResponse> messages(
      @PathVariable Integer id,
      @AuthenticationPrincipal UserPrincipal me,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "50") int size
  ) {
    return chat.listMessages(
        id,
        PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id")),
        me.getId()
    );
  }

  // Gửi tin trong 1 phiên
  @PostMapping("/sessions/{id}/messages")
  public ChatMessageResponse send(
      @PathVariable Integer id,
      @AuthenticationPrincipal UserPrincipal me,
      @Valid @RequestBody ChatMessageRequest body
  ) {
    return chat.send(id, me.getId(), body.getContent());
  }

  // Đổi trạng thái phiên: ?status=open|closed|pending
  @PostMapping("/sessions/{id}/status")
  public ResponseEntity<ChatSession.Status> updateStatus(          // <— trả về Status
      @PathVariable Integer id,
      @RequestParam ChatSession.Status status
  ) {
    return ResponseEntity.ok(chat.updateStatus(id, status));
  }

  // Đánh dấu đã đọc các tin từ phía còn lại
  @PostMapping("/sessions/{id}/read")
  public ResponseEntity<Integer> markRead(                         // <— trả về Integer
      @PathVariable Integer id,
      @AuthenticationPrincipal UserPrincipal me
  ) {
    return ResponseEntity.ok(chat.markRead(id, me.getId()));
  }
}
