// ChatService.java
package com.thubongshop.backend.chat.service;

import com.thubongshop.backend.chat.dto.ChatSessionResponse;
import com.thubongshop.backend.chat.dto.MessageDTO;
import com.thubongshop.backend.chat.entity.ChatSession;
import com.thubongshop.backend.chat.entity.Message;
import com.thubongshop.backend.chat.entity.Notification;
import com.thubongshop.backend.chat.repo.ChatSessionRepo;
import com.thubongshop.backend.chat.repo.MessageRepo;
import com.thubongshop.backend.chat.repo.NotificationRepo;
// ✅ sửa import đúng package PusherService bạn đang đặt
import com.thubongshop.backend.chat.service.PusherService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

  private final ChatSessionRepo sessionRepo;
  private final MessageRepo messageRepo;
  private final NotificationRepo notificationRepo;
  private final PusherService pusher;

  @Value("${chat.default-admin-id:1}")
  private Integer defaultAdminId;

  /* ==================== Session ==================== */

  @Transactional
  public ChatSession openWithAdmin(Integer userId) {
    return sessionRepo.findBetween(userId, defaultAdminId).orElseGet(() -> {
      ChatSession s = new ChatSession();
      s.setParticipant1Id(userId);
      s.setParticipant2Id(defaultAdminId);
      s.setStatus(ChatSession.Status.open);
      // ❌ KHÔNG cần set createdAt/updatedAt vì có @Creation/@UpdateTimestamp
      return sessionRepo.save(s);
    });
  }

  @Transactional(readOnly = true)
  public Page<ChatSessionResponse> sessionsOfUser(Integer viewerId, Pageable pageable) {
    PageRequest pr = PageRequest.of(
        pageable.getPageNumber(),
        pageable.getPageSize(),
        Sort.by(Sort.Direction.DESC, "updatedAt") // ✅ field Instant
    );
    Page<ChatSession> page = sessionRepo.findAll(pr);

    List<ChatSessionResponse> mapped = new ArrayList<>();
    for (ChatSession s : page) {
      if (!canView(viewerId, s.getId())) continue;
      String lastSnippet = lastMessageSnippet(s.getId());
      int unread = countUnreadForViewer(viewerId, s.getId());
      mapped.add(ChatSessionResponse.of(s, viewerId, lastSnippet, unread));
    }
    return new PageImpl<>(mapped, pr, page.getTotalElements());
  }

  @Transactional(readOnly = true)
  @PreAuthorize("@chatService.canView(#viewerId, #sessionId)")
  public Page<MessageDTO> messagesOfSession(Integer viewerId, Integer sessionId, Pageable pageable) {
    ChatSession s = sessionRepo.findById(sessionId).orElseThrow();
    PageRequest pr = PageRequest.of(
        pageable.getPageNumber(),
        pageable.getPageSize(),
        Sort.by(Sort.Direction.ASC, "createdAt") // ✅ field Timestamp của Message
    );
    Page<Message> page = messageRepo.findAll(
        (root, cq, cb) -> cb.equal(root.get("session"), s), pr
    );
    return page.map(MessageDTO::of);
  }

  /* ==================== Send / Read ==================== */

  @Transactional
  @PreAuthorize("@chatService.canView(#senderId, #sessionId)")
  public MessageDTO send(Integer senderId, Integer sessionId, String content) {
    ChatSession s = sessionRepo.findById(sessionId).orElseThrow();
    String c = content == null ? "" : content.trim();
    if (c.isBlank()) throw new IllegalArgumentException("Nội dung trống");

    Message m = new Message();
    m.setSession(s);
    m.setSenderId(senderId);
    m.setContent(c);
    m.setRead(false); // ✅ chỉ thế này, không dùng named-arg
    // ❌ KHÔNG set createdAt vì DB tự set
    m = messageRepo.save(m);

    // ✅ bump để list nhảy lên đầu (kiểu Instant)
    s.setUpdatedAt(Instant.now());
    sessionRepo.save(s);

    Integer recipientId = senderId.equals(s.getParticipant1Id())
        ? s.getParticipant2Id() : s.getParticipant1Id();

    Notification no = new Notification();
    no.setUserId(recipientId);
    no.setMessage(m);
    no.setType(Notification.Type.new_message); // ✅ đúng enum
    no.setRead(false);
    notificationRepo.save(no);

    Map<String, Object> payload = Map.of("message", MessageDTO.of(m), "sessionId", s.getId());
    try {
      pusher.trigger(PusherService.channelOf(s.getId()), "message:new", payload);
      pusher.trigger("private-admin.livechat", "session:updated", Map.of("sessionId", s.getId()));
    } catch (Exception e) {
      log.warn("Pusher trigger fail: {}", e.getMessage());
    }
    return MessageDTO.of(m);
  }

  @Transactional
  @PreAuthorize("@chatService.canView(#viewerId, #sessionId)")
  public int markReadAll(Integer viewerId, Integer sessionId) {
    ChatSession s = sessionRepo.findById(sessionId).orElseThrow();
    int changed = messageRepo.markReadAll(s, viewerId);
    notificationRepo.markReadBySession(viewerId, sessionId);

    try {
      pusher.trigger(PusherService.channelOf(sessionId), "message:read",
          Map.of("by", viewerId, "sessionId", sessionId));
    } catch (Exception e) {
      log.warn("Pusher trigger fail: {}", e.getMessage());
    }
    return changed;
  }

  /* ==================== Helpers & ACL ==================== */

  public boolean canView(Integer viewerId, Integer sessionId) {
    Optional<ChatSession> op = sessionRepo.findById(sessionId);
    if (op.isEmpty()) return false;
    ChatSession s = op.get();
    if (Objects.equals(s.getParticipant1Id(), viewerId) || Objects.equals(s.getParticipant2Id(), viewerId)) {
      return true;
    }
    try {
      var auth = org.springframework.security.core.context.SecurityContextHolder
                  .getContext().getAuthentication();
      if (auth != null && auth.getAuthorities().stream()
          .anyMatch(a -> "manage_livechat".equals(a.getAuthority()))) return true;
    } catch (Exception ignored) {}
    return false;
  }

  private String lastMessageSnippet(Integer sessionId) {
    Page<Message> p = messageRepo.findAll(
        (root, cq, cb) -> cb.equal(root.get("session").get("id"), sessionId),
        PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt"))
    );
    return p.isEmpty() ? "" : safeSnippet(p.getContent().get(0).getContent());
  }

  private int countUnreadForViewer(Integer viewerId, Integer sessionId) {
    return (int) messageRepo.count((root, cq, cb) -> cb.and(
        cb.equal(root.get("session").get("id"), sessionId),
        cb.notEqual(root.get("senderId"), viewerId),
        cb.isFalse(root.get("read"))
    ));
  }

  private String safeSnippet(String s) {
    if (s == null) return "";
    String t = s.replaceAll("\\s+", " ").trim();
    return t.length() <= 120 ? t : t.substring(0, 117) + "...";
  }
}
