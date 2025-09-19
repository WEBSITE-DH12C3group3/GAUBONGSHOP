// src/main/java/com/thubongshop/backend/chat/service/ChatService.java
package com.thubongshop.backend.chat.service;

import com.thubongshop.backend.chat.dto.ChatSessionDTO;
import com.thubongshop.backend.chat.dto.MessageDTO;
import com.thubongshop.backend.chat.entity.ChatSession;
import com.thubongshop.backend.chat.entity.Message;
import com.thubongshop.backend.chat.entity.Notification;
import com.thubongshop.backend.chat.repo.ChatSessionRepo;
import com.thubongshop.backend.chat.repo.MessageRepo;
import com.thubongshop.backend.chat.repo.NotificationRepo;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * ChatService
 * - Quản lý phiên chat & tin nhắn
 * - Phát realtime ra Pusher qua PusherService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

  private final ChatSessionRepo sessionRepo;
  private final MessageRepo messageRepo;
  private final NotificationRepo notifRepo;
  private final PusherService pusher; // wrapper quanh com.pusher.rest.Pusher

  /** TODO: có thể đọc từ config thay vì hard-code */
  private final Integer defaultAdminId = 1;

  // -------------------------------------------------------------------------
  // Session
  // -------------------------------------------------------------------------

  /**
   * Tạo (hoặc lấy) phiên chat giữa user và admin mặc định.
   */
  @Transactional
  public ChatSession openWithAdmin(Integer userId) {
    return sessionRepo.findBetween(userId, defaultAdminId).orElseGet(() -> {
      var s = ChatSession.builder()
          .participant1Id(userId)
          .participant2Id(defaultAdminId)
          .status(ChatSession.Status.open)
          .build();
      var saved = sessionRepo.save(s);
      log.debug("Created new chat session {} for user {}", saved.getId(), userId);
      return saved;
    });
  }

  /**
   * Danh sách phiên mà viewer nhìn thấy (client hoặc admin).
   * unread được tính theo viewerId truyền vào.
   */
  public Page<ChatSessionDTO> sessionsOfViewer(Integer viewerId, Pageable pageable) {
    return sessionRepo.findAllOfUser(viewerId, pageable).map(s -> {
      long unread = messageRepo.countUnreadFor(s, viewerId);
      var last = messageRepo.findLastMessage(s);
      String snippet = (last == null || last.getContent() == null)
          ? null
          : (last.getContent().length() > 60 ? last.getContent().substring(0, 60) + "…" : last.getContent());
      return ChatSessionDTO.of(s, viewerId, unread, snippet);
    });
  }

  /**
   * Dành cho admin: liệt kê theo status + sort updatedAt desc.
   * unread tính theo admin (viewer = participant2).
   */
  public Page<ChatSessionDTO> adminList(String status, Pageable pageable) {
    var st = status == null ? ChatSession.Status.open : ChatSession.Status.valueOf(status);
    return sessionRepo.findByStatusOrderByUpdatedAtDesc(st, pageable).map(s -> {
      Integer adminViewer = s.getParticipant2Id();
      long unread = messageRepo.countUnreadFor(s, adminViewer);
      var last = messageRepo.findLastMessage(s);
      String snippet = (last == null || last.getContent() == null)
          ? null
          : (last.getContent().length() > 60 ? last.getContent().substring(0, 60) + "…" : last.getContent());
      return ChatSessionDTO.of(s, adminViewer, unread, snippet);
    });
  }

  // -------------------------------------------------------------------------
  // Message
  // -------------------------------------------------------------------------

  /**
   * Lấy tin nhắn trong 1 session, có kiểm tra quyền xem.
   */
  public Page<MessageDTO> messages(Integer viewerId, Integer sessionId, Pageable pageable) {
    var s = mustCanView(viewerId, sessionId);
    return messageRepo.findBySession(s, pageable).map(MessageDTO::of);
  }

  /**
   * Client gửi tin.
   */
  @Transactional
  public MessageDTO sendFromClient(Integer userId, Integer sessionId, String content) {
    var s = mustCanView(userId, sessionId);

    var msg = messageRepo.save(Message.builder()
        .session(s)
        .senderId(userId)
        .content(content == null ? "" : content)
        .read(false)
        .build());

    // cập nhật updatedAt của session để sort list
    touchSession(s);

    // Xác định người nhận để tạo notification
    Integer receiverId = s.getParticipant2Id().equals(userId) ? s.getParticipant1Id() : s.getParticipant2Id();
    notifRepo.save(Notification.builder()
        .userId(receiverId)
        .message(msg)
        .type(Notification.Type.new_message)
        .read(false)
        .build());

    pushNewMessage(s.getId(), msg);
    return MessageDTO.of(msg);
  }

  /**
   * Admin gửi tin.
   */
  @Transactional
  public MessageDTO sendFromAdmin(Integer adminId, Integer sessionId, String content) {
    var s = sessionRepo.findById(sessionId)
        .orElseThrow(() -> new EntityNotFoundException("Session not found"));

    var msg = messageRepo.save(Message.builder()
        .session(s)
        .senderId(adminId)
        .content(content == null ? "" : content)
        .read(false)
        .build());

    touchSession(s);

    // Người nhận là client (đầu kia khác sender)
    Integer receiverId = s.getParticipant1Id().equals(adminId) ? s.getParticipant2Id() : s.getParticipant1Id();
    notifRepo.save(Notification.builder()
        .userId(receiverId)
        .message(msg)
        .type(Notification.Type.new_message)
        .read(false)
        .build());

    pushNewMessage(s.getId(), msg);
    return MessageDTO.of(msg);
  }

  /**
   * Đánh dấu đã đọc toàn bộ tin trong session cho viewerId.
   * Đồng thời clear các notification tương ứng.
   */
  @Transactional
  public int markReadAll(Integer viewerId, Integer sessionId) {
    var s = mustCanView(viewerId, sessionId);
    int updated = messageRepo.markReadAll(s, viewerId);
    notifRepo.markAllRead(viewerId);

    // 🔔 Bắn realtime "message:read"
    pusher.trigger(
        "private-chat." + sessionId,
        "message:read",
        Map.of(
            "sessionId", sessionId,
            "viewerId", viewerId
        )
    );

    log.debug("Marked {} messages read in session {} by viewer {}", updated, sessionId, viewerId);
    return updated;
  }

  /**
   * Lấy danh sách notification chưa đọc.
   */
  public List<Notification> unreadNotifications(Integer userId) {
    return notifRepo.findByUserIdAndReadFalse(userId);
  }

  /**
   * Đóng session (status = closed) và bắn realtime "session:closed".
   */
  @Transactional
  public void closeSession(Integer sessionId) {
    var s = sessionRepo.findById(sessionId)
        .orElseThrow(() -> new EntityNotFoundException("Session not found"));
    s.setStatus(ChatSession.Status.closed);
    sessionRepo.save(s);

    pushSessionClosed(sessionId);
    log.info("Closed chat session {}", sessionId);
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /**
   * Kiểm tra viewer có quyền xem session hay không.
   * Admin (ROLE_ADMIN) được phép xem tất cả.
   */
  private ChatSession mustCanView(Integer viewerId, Integer sessionId) {
    var s = sessionRepo.findById(sessionId)
        .orElseThrow(() -> new EntityNotFoundException("Session not found"));

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    boolean isAdmin = auth != null && auth.getAuthorities().stream()
        .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    if (isAdmin) return s;

    if (!s.getParticipant1Id().equals(viewerId) && !s.getParticipant2Id().equals(viewerId)) {
      throw new EntityNotFoundException("Not allowed");
    }
    return s;
  }

  /**
   * Cập nhật updatedAt cho session (nếu entity có field này).
   */
  private void touchSession(ChatSession s) {
    try {
      // Nếu entity có trường updatedAt kiểu Instant/LocalDateTime…, hãy set ở đây.
      s.setUpdatedAt(Instant.now()); // cần trường updatedAt trong entity
    } catch (Exception ignore) {
      // Không có trường updatedAt thì bỏ qua
    }
    sessionRepo.save(s);
  }

  // -------------------------------------------------------------------------
  // Pusher events
  // -------------------------------------------------------------------------

  /**
   * Phát event "message:new" tới kênh "private-chat.{sessionId}".
   * Payload đồng nhất với MessageDTO (tối thiểu các field client cần).
   */
  private void pushNewMessage(Integer sessionId, Message msg) {
    try {
      String createdAt = null;
      try {
        // Ưu tiên toInstant nếu là java.util.Date
        if (msg.getCreatedAt() != null) {
          var ca = msg.getCreatedAt();
          if (ca instanceof java.util.Date d) {
            createdAt = d.toInstant().toString();
          } else {
            createdAt = ca.toString(); // LocalDateTime/Instant…
          }
        }
      } catch (Exception e) {
        createdAt = Instant.now().toString();
      }
      if (createdAt == null) createdAt = Instant.now().toString();

      Map<String, Object> payload = Map.of(
          "id", msg.getId(),
          "sessionId", sessionId,
          "senderId", msg.getSenderId(),
          "content", msg.getContent() == null ? "" : msg.getContent(),
          "read", Boolean.TRUE,              // client render ngay; mark-read vẫn gọi API riêng
          "createdAt", createdAt
      );

      pusher.trigger("private-chat." + sessionId, "message:new", payload);
      log.debug("Pushed message:new to private-chat.{} payload={}", sessionId, payload);
    } catch (Exception e) {
      log.warn("Failed to push message:new for session {}", sessionId, e);
    }
  }

  /**
   * Phát event "session:closed" để 2 phía đóng UI nếu đang mở.
   */
  private void pushSessionClosed(Integer sessionId) {
    try {
      pusher.trigger(
          "private-chat." + sessionId,
          "session:closed",
          Map.of("sessionId", sessionId)
      );
      log.debug("Pushed session:closed to private-chat.{}", sessionId);
    } catch (Exception e) {
      log.warn("Failed to push session:closed for {}", sessionId, e);
    }
  }
}
