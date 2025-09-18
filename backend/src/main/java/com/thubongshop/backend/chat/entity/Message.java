package com.thubongshop.backend.chat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Entity @Table(name="messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="chat_session_id", nullable=false)
  private ChatSession session;

  @Column(name="sender_id", nullable=false)
  private Integer senderId;

  @Column(columnDefinition = "TEXT", nullable=false)
  private String content;

  @Column(name="is_read", nullable=false)
  private boolean read = false;

  @Column(name="created_at", insertable=false, updatable=false)
  private Timestamp createdAt;
}
