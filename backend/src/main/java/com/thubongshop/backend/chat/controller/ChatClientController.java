package com.thubongshop.backend.chat.controller;

import com.thubongshop.backend.chat.dto.ChatSessionResponse;
import com.thubongshop.backend.chat.dto.MessageDTO;
import com.thubongshop.backend.chat.service.ChatService;
import com.thubongshop.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client/chat")
@RequiredArgsConstructor
public class ChatClientController {

  private final ChatService chat;

  /** ===================== Sessions ===================== */

  /**
   * FE gọi: GET /api/client/chat/sessions/with-admin
   * Tạo/mở session với admin rồi trả DTO của chính session đó.
   * Dùng sessionsOfUser(...) để lấy đúng dạng DTO (có lastSnippet + unread).
   */
  @GetMapping("/sessions/with-admin")
  public ResponseEntity<ChatSessionResponse> openWithAdmin(@AuthenticationPrincipal UserPrincipal me) {
    var s = chat.openWithAdmin(me.getId());

    // Lấy DTO từ trang phiên của user rồi lọc đúng session ID (an toàn, không cần viết mapper mới)
    // Size 50 để chắc chắn bắt được trong danh sách (thường session vừa mở sẽ lên đầu).
    Page<ChatSessionResponse> page = chat.sessionsOfUser(me.getId(), PageRequest.of(0, 50));
    var dto = page.stream()
        .filter(x -> x.getId().equals(s.getId()))
        .findFirst()
        .orElseGet(() -> {
          // Fallback: nếu vì lý do gì đó không thấy trong page, trả một DTO tối thiểu
          // (tuỳ bạn có thể viết helper trong service để map entity -> DTO chuẩn)
          return ChatSessionResponse.of(s, me.getId(), "", 0);
        });

    return ResponseEntity.ok(dto);
  }

  /**
   * FE gọi: GET /api/client/chat/sessions?page=&size=
   * Trả Page các session của user (DTO đã kèm lastSnippet/unread do service xử lý)
   */
  @GetMapping("/sessions")
  public Page<ChatSessionResponse> mySessions(@AuthenticationPrincipal UserPrincipal me,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
    return chat.sessionsOfUser(me.getId(), PageRequest.of(page, size));
  }

  /** ===================== Messages ===================== */

  /**
   * FE gọi: GET /api/client/chat/sessions/{id}/messages
   * FE đang mong đợi ARRAY nên controller trả List<MessageDTO> (không phải Page).
   * Nếu sau này FE cần phân trang, có thể đổi lại trả Page<> và FE đọc .content.
   */
  @GetMapping("/sessions/{id}/messages")
  public List<MessageDTO> messages(@AuthenticationPrincipal UserPrincipal me,
                                   @PathVariable Integer id,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "50") int size) {
    Page<MessageDTO> pg = chat.messagesOfSession(me.getId(), id, PageRequest.of(page, size));
    return pg.getContent();
  }

  /**
   * FE gọi: POST /api/client/chat/messages
   * Body: { "text": "...", "sessionId": 123 }
   */
  @PostMapping("/messages")
  public MessageDTO send(@AuthenticationPrincipal UserPrincipal me,
                         @RequestBody SendReq req) {
    if (req == null || req.sessionId() == null || req.text() == null || req.text().isBlank()) {
      throw new IllegalArgumentException("sessionId and text are required");
    }
    return chat.send(me.getId(), req.sessionId(), req.text());
  }

  /**
   * LEGACY: Nếu FE cũ còn gọi POST /sessions/{id}/messages với body { "content": "..." }
   */
  @PostMapping("/sessions/{id}/messages")
  public MessageDTO sendLegacy(@AuthenticationPrincipal UserPrincipal me,
                               @PathVariable Integer id,
                               @RequestBody LegacySendReq req) {
    String content = req != null ? req.content() : null;
    if (content == null || content.isBlank()) {
      throw new IllegalArgumentException("content is required");
    }
    return chat.send(me.getId(), id, content);
  }

  /**
   * FE gọi: POST /api/client/chat/sessions/{id}/read
   */
  @PostMapping("/sessions/{id}/read")
  public ResponseEntity<?> markRead(@AuthenticationPrincipal UserPrincipal me, @PathVariable Integer id) {
    chat.markReadAll(me.getId(), id);
    return ResponseEntity.ok().build();
  }

  /** ====== Request DTOs ====== */
  public record SendReq(Integer sessionId, String text) {}
  public record LegacySendReq(String content) {}
}
