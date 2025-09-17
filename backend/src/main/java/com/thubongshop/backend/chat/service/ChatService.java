package com.thubongshop.backend.chat.service;

import com.thubongshop.backend.chat.dto.*;
import com.thubongshop.backend.chat.entity.*;
import com.thubongshop.backend.chat.repo.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {
  private final ChatSessionRepo sessionRepo;
  private final MessageRepo messageRepo;
  private final NotificationRepo notiRepo;
  private final PusherService pusher;

  @Value("${chat.default-admin-id}") private Integer defaultAdminId;

  // Session
  @Transactional
  public ChatSession openWithAdmin(Integer currentUserId) {
    Integer u1 = Math.min(currentUserId, defaultAdminId), u2 = Math.max(currentUserId, defaultAdminId);
    return sessionRepo.findBetween(u1, u2).orElseGet(() ->
      sessionRepo.save(ChatSession.builder().participant1Id(u1).participant2Id(u2).status(ChatSession.Status.open).build()));
  }

  public Page<ChatSessionResponse> sessionsOfUser(Integer userId, Pageable pageable) {
    return sessionRepo.findByParticipant1IdOrParticipant2Id(userId, userId, pageable).map(s -> mapSession(s, userId));
  }

  public Page<ChatSessionResponse> sessionsForAdmin(ChatSession.Status status, Pageable pageable) {
    var page = (status==null) ? sessionRepo.findAll(pageable) : sessionRepo.findByStatus(status, pageable);
    return page.map(s -> mapSession(s, defaultAdminId));
  }

  private ChatSessionResponse mapSession(ChatSession s, Integer meId) {
    var last = messageRepo.findTop1ByChatSessionIdOrderByIdDesc(s.getId());
    long unread = messageRepo.countByChatSessionIdAndSenderIdNotAndIsReadFalse(s.getId(), meId);
    return ChatSessionResponse.builder()
      .id(s.getId()).meId(meId).peerId(s.getPeerOf(meId)).status(s.getStatus())
      .createdAt(s.getCreatedAt()).updatedAt(s.getUpdatedAt())
      .lastMessage(last!=null?last.getContent():null).unreadCount(unread).build();
  }

  // Messages
  public Page<ChatMessageResponse> listMessages(Integer sessionId, Pageable pageable, Integer requesterId) {
    var s = sessionRepo.findById(sessionId).orElseThrow(); Assert.isTrue(s.isParticipant(requesterId), "Không thuộc phiên chat");
    return messageRepo.findByChatSessionIdOrderByIdAsc(sessionId, pageable).map(this::mapMsg);
  }
@Transactional
    public ChatMessageResponse send(Integer sessionId, Integer senderId, String content) {
    var s = sessionRepo.findById(sessionId).orElseThrow();
    org.springframework.util.Assert.isTrue(s.isParticipant(senderId), "Không thuộc phiên chat");

    var m = messageRepo.save(Message.builder()
        .chatSessionId(sessionId)
        .senderId(senderId)
        .content(content)
        .isRead(false)
        .build());

    // nếu muốn chắc chắn createdAt được set (khi dùng @CreationTimestamp)
    // messageRepo.flush();

    notiRepo.save(Notification.builder()
        .userId(s.getPeerOf(senderId))
        .messageId(m.getId())
        .type(Notification.Type.new_message)
        .isRead(false)
        .build());

    // ✅ Dùng HashMap để chấp nhận giá trị null (như createdAt)
    java.util.Map<String,Object> payload = new java.util.HashMap<>();
    payload.put("id", m.getId());
    payload.put("sessionId", sessionId);
    payload.put("senderId", senderId);
    payload.put("content", content);

    if (m.getCreatedAt() != null) {
        payload.put("createdAt", m.getCreatedAt().toString()); // ví dụ "2025-09-16T16:48:06Z"
    }

    pusher.trigger(PusherService.channelOf(sessionId), "message.new", payload);

    return mapMsg(m);
}


  @Transactional
  public int markRead(Integer sessionId, Integer readerId) {
    var s = sessionRepo.findById(sessionId).orElseThrow(); Assert.isTrue(s.isParticipant(readerId), "Không thuộc phiên chat");
    int n = messageRepo.markReadForSession(sessionId, readerId);
    pusher.trigger(PusherService.channelOf(sessionId), "message.read", Map.of("sessionId", sessionId, "readerId", readerId));
    return n;
  }

  @Transactional
  public ChatSession.Status updateStatus(Integer sessionId, ChatSession.Status status) {
    var s = sessionRepo.findById(sessionId).orElseThrow(); s.setStatus(status); sessionRepo.save(s);
    pusher.trigger(PusherService.channelOf(sessionId), "session.update", Map.of("sessionId", sessionId, "status", status.name()));
    return status;
  }

  private ChatMessageResponse mapMsg(Message m){
    return ChatMessageResponse.builder().id(m.getId()).sessionId(m.getChatSessionId())
      .senderId(m.getSenderId()).content(m.getContent()).isRead(Boolean.TRUE.equals(m.getIsRead()))
      .createdAt(m.getCreatedAt()).build();
  }
}
