package com.thubongshop.backend.chat.controller;

import com.thubongshop.backend.chat.dto.ChatSessionResponse;
import com.thubongshop.backend.chat.dto.MessageDTO;
import com.thubongshop.backend.chat.service.ChatService;
import com.thubongshop.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('manage_livechat')") // tất cả endpoint dưới đây yêu cầu quyền manage_livechat
public class ChatAdminController {

  private final ChatService chat;

  /** Danh sách phiên chat (Admin thấy được tất cả vì canView() cho phép role manage_livechat) */
  @GetMapping("/sessions")
  public Page<ChatSessionResponse> sessions(@AuthenticationPrincipal UserPrincipal me,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size,
                                            @RequestParam(defaultValue = "open") String status // TODO: hiện chưa dùng
  ) {
    // Dùng sessionsOfUser(me) vì canView() cho phép admin thấy toàn bộ
    return chat.sessionsOfUser(me.getId(), PageRequest.of(page, size));
  }

  /** Tin nhắn của một phiên — FE mong đợi ARRAY, nên trả List<MessageDTO> thay vì Page */
  @GetMapping("/sessions/{id}/messages")
  public List<MessageDTO> messages(@AuthenticationPrincipal UserPrincipal me,
                                   @PathVariable Integer id,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "50") int size) {
    Page<MessageDTO> pg = chat.messagesOfSession(me.getId(), id, PageRequest.of(page, size));
    return pg.getContent();
  }

  /** Gửi tin nhắn (admin) — FE gọi POST /api/admin/chat/messages { text, sessionId } */
  @PostMapping("/messages")
  public MessageDTO send(@AuthenticationPrincipal UserPrincipal me,
                         @RequestBody SendReq req) {
    if (req == null || req.sessionId() == null || req.text() == null || req.text().isBlank()) {
      throw new IllegalArgumentException("sessionId and text are required");
    }
    return chat.send(me.getId(), req.sessionId(), req.text());
  }

  /** Đánh dấu đã đọc — FE gọi POST /api/admin/chat/sessions/{id}/read */
  @PostMapping("/sessions/{id}/read")
  public ResponseEntity<?> markRead(@AuthenticationPrincipal UserPrincipal me, @PathVariable Integer id) {
    chat.markReadAll(me.getId(), id);
    return ResponseEntity.ok().build();
  }

  /** ====== Request DTO ====== */
  public record SendReq(Integer sessionId, String text) {}
}
