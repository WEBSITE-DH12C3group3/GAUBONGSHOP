package com.thubongshop.backend.chat.service;

import com.thubongshop.backend.chat.dto.*;
import com.thubongshop.backend.chat.entity.ChatSession;
import com.thubongshop.backend.chat.entity.Message;
import com.thubongshop.backend.chat.entity.Notification;
import com.thubongshop.backend.chat.repo.ChatSessionRepo;
import com.thubongshop.backend.chat.repo.MessageRepo;
import com.thubongshop.backend.chat.repo.NotificationRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service @RequiredArgsConstructor
public class ChatService {
  private final ChatSessionRepo sessionRepo;
  private final MessageRepo messageRepo;
  private final NotificationRepo notifRepo;
  private final PusherService pusher;

  // id admin mặc định -> bạn có thể inject từ properties
  private final Integer defaultAdminId = 1;

  // ===== Session =====

  @Transactional
  public ChatSession openWithAdmin(Integer userId) {
    return sessionRepo.findBetween(userId, defaultAdminId).orElseGet(() -> {
      var s = ChatSession.builder()
        .participant1Id(userId)
        .participant2Id(defaultAdminId)
        .status(ChatSession.Status.open)
        .build();
      return sessionRepo.save(s);
    });
  }

  public Page<ChatSessionDTO> sessionsOfViewer(Integer viewerId, Pageable pageable) {
    return sessionRepo.findAllOfUser(viewerId, pageable).map(s -> {
      long unread = messageRepo.countUnreadFor(s, viewerId);
      var last = messageRepo.findLastMessage(s);
      String snippet = last == null ? null :
        (last.getContent().length() > 60 ? last.getContent().substring(0, 60) + "…" : last.getContent());
      return ChatSessionDTO.of(s, viewerId, unread, snippet);
    });
  }

  public Page<ChatSessionDTO> adminList(String status, Pageable pageable) {
    var st = status == null ? ChatSession.Status.open : ChatSession.Status.valueOf(status);
    return sessionRepo.findByStatusOrderByUpdatedAtDesc(st, pageable)
        .map(s -> {
          // đối với admin, unreadForViewer = tổng tin khách chưa đọc không cần thiết,
          // nhưng ta sẽ hiển thị số tin chưa đọc "của admin" (viewer = participant2 = admin)
          long unread = messageRepo.countUnreadFor(s, s.getParticipant2Id());
          var last = messageRepo.findLastMessage(s);
          String snippet = last == null ? null :
            (last.getContent().length() > 60 ? last.getContent().substring(0, 60) + "…" : last.getContent());
          return ChatSessionDTO.of(s, s.getParticipant2Id(), unread, snippet);
        });
  }

  // ===== Message =====

  public Page<MessageDTO> messages(Integer viewerId, Integer sessionId, Pageable pageable) {
    var s = mustCanView(viewerId, sessionId);
    return messageRepo.findBySession(s, pageable).map(MessageDTO::of);
  }

  @Transactional
  public MessageDTO sendFromClient(Integer userId, Integer sessionId, String content) {
    var s = mustCanView(userId, sessionId);
    var msg = messageRepo.save(Message.builder()
      .session(s).senderId(userId).content(content).read(false).build());

    // notify admin
    Integer receiverId = s.getParticipant2Id().equals(userId) ? s.getParticipant1Id() : s.getParticipant2Id();
    notifRepo.save(Notification.builder()
      .userId(receiverId).message(msg).type(Notification.Type.new_message).read(false).build());

    pushNewMessage(s.getId(), msg);
    return MessageDTO.of(msg);
  }

  @Transactional
  public MessageDTO sendFromAdmin(Integer adminId, Integer sessionId, String content) {
    var s = sessionRepo.findById(sessionId).orElseThrow(() -> new EntityNotFoundException("Session not found"));
    var msg = messageRepo.save(Message.builder()
      .session(s).senderId(adminId).content(content).read(false).build());

    // notify client
    Integer clientId = s.getParticipant1Id().equals(adminId) ? s.getParticipant2Id() : s.getParticipant1Id();
    notifRepo.save(Notification.builder()
      .userId(clientId).message(msg).type(Notification.Type.new_message).read(false).build());

    pushNewMessage(s.getId(), msg);
    return MessageDTO.of(msg);
  }

  @Transactional
  public int markReadAll(Integer viewerId, Integer sessionId) {
    var s = mustCanView(viewerId, sessionId);
    int updated = messageRepo.markReadAll(s, viewerId);
    // cũng đánh dấu notification đã đọc
    notifRepo.markAllRead(viewerId);
    return updated;
  }

  public java.util.List<Notification> unreadNotifications(Integer userId) {
    return notifRepo.findByUserIdAndReadFalse(userId);
  }

  @Transactional
  public void closeSession(Integer sessionId) {
    var s = sessionRepo.findById(sessionId).orElseThrow(() -> new EntityNotFoundException("Session not found"));
    s.setStatus(ChatSession.Status.closed);
    sessionRepo.save(s);
  }

  // ===== Helpers =====
  private ChatSession mustCanView(Integer viewerId, Integer sessionId) {
    var s = sessionRepo.findById(sessionId)
        .orElseThrow(() -> new EntityNotFoundException("Session not found"));

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    boolean isAdmin = auth != null && auth.getAuthorities().stream()
        .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    if (isAdmin) return s; // ADMIN xem mọi phiên

  if (!s.getParticipant1Id().equals(viewerId) && !s.getParticipant2Id().equals(viewerId))
    throw new EntityNotFoundException("Not allowed");
  return s;
}

  private void pushNewMessage(Integer sessionId, Message msg) {
  // Nếu chưa cấu hình Pusher thì bỏ qua (tránh lỗi khi dev)
  if (pusher == null) return;

  Map<String, Object> payload = new LinkedHashMap<>();
  payload.put("id",        msg != null ? msg.getId()       : null);
  payload.put("sessionId", sessionId);
  payload.put("senderId",  msg != null ? msg.getSenderId() : null);
  payload.put("content",   msg != null ? msg.getContent()  : null);

  // createdAt do DB tự set có thể null ngay sau save → dùng thời gian hiện tại làm fallback
  String createdAtIso = (msg != null && msg.getCreatedAt() != null)
      ? msg.getCreatedAt().toInstant().toString()
      : Instant.now().toString();
  payload.put("createdAt", createdAtIso);

  // pusher có thể là PusherService hoặc Pusher trực tiếp, đều có trigger(channel,event,data)
  pusher.trigger("private-chat-session-" + sessionId, "new-message", payload);
}
}
