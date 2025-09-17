package com.thubongshop.backend.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_session", columnList = "chat_session_id"),
    @Index(name = "idx_sender", columnList = "sender_id"),
    @Index(name = "idx_unread", columnList = "is_read")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "chat_session_id", nullable = false)
  private Integer chatSessionId;

  @Column(name = "sender_id", nullable = false)
  private Integer senderId;

  @Lob
  @Column(nullable = false)
  private String content;

  @Builder.Default
  @Column(name = "is_read", nullable = false)
  private Boolean isRead = false;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false, nullable = false)
  private Instant createdAt;
}
