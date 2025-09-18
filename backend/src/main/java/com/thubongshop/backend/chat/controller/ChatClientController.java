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
@RequestMapping("/api/client/chat")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()") // bắt buộc đăng nhập
public class ChatClientController {
  private final ChatService chat;

  // Tạo/lấy session giữa current user và admin mặc định
    @PostMapping("/sessions/with-admin")
    public ResponseEntity<ChatSessionDTO> openWithAdmin(@AuthenticationPrincipal UserPrincipal me) {
    var s = chat.openWithAdmin(me.getId().intValue());

    // load DTO + unread + snippet
    var page = chat.sessionsOfViewer(me.getId().intValue(), PageRequest.of(0, 20));
    var dto  = page.getContent()                      // ✅ đúng
                .stream()
                .filter(x -> x.getId().equals(s.getId()))
                .findFirst()
                .orElse(null);

    return ResponseEntity.ok(dto);
    }

  // Danh sách session của tôi
  @GetMapping("/sessions")
  public PageResponse<ChatSessionDTO> mySessions(@AuthenticationPrincipal UserPrincipal me,
                                                 @RequestParam(defaultValue="0") int page,
                                                 @RequestParam(defaultValue="10") int size) {
    var p = chat.sessionsOfViewer(me.getId().intValue(), PageRequest.of(page, size));
    return PageResponse.map(p, x -> x);
  }

  // Lấy tin nhắn của 1 session
  @GetMapping("/sessions/{sessionId}/messages")
  public PageResponse<MessageDTO> myMessages(@AuthenticationPrincipal UserPrincipal me,
                                             @PathVariable Integer sessionId,
                                             @RequestParam(defaultValue="0") int page,
                                             @RequestParam(defaultValue="20") int size) {
    var p = chat.messages(me.getId().intValue(), sessionId, PageRequest.of(page, size));
    return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
  }

  // Gửi tin nhắn
  @PostMapping("/sessions/{sessionId}/messages")
  public MessageDTO send(@AuthenticationPrincipal UserPrincipal me,
                         @PathVariable Integer sessionId,
                         @Valid @RequestBody SendMessageRequest req) {
    return chat.sendFromClient(me.getId().intValue(), sessionId, req.getContent());
  }

  // Đánh dấu đã đọc
  @PatchMapping("/sessions/{sessionId}/read")
  public ResponseEntity<Integer> markRead(@AuthenticationPrincipal UserPrincipal me,
                                          @PathVariable Integer sessionId) {
    return ResponseEntity.ok(chat.markReadAll(me.getId().intValue(), sessionId));
  }

  // Lấy thông báo chưa đọc
  @GetMapping("/notifications/unread")
  public java.util.List<?> myUnread(@AuthenticationPrincipal UserPrincipal me) {
    return chat.unreadNotifications(me.getId().intValue()).stream().map(n -> java.util.Map.of(
      "id", n.getId(),
      "messageId", n.getMessage().getId(),
      "type", n.getType().name(),
      "createdAt", n.getCreatedAt()
    )).toList();
  }
}
