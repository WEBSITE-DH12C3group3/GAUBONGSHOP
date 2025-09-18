package com.thubongshop.backend.chat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Entity @Table(name="notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name="user_id", nullable=false)
  private Integer userId;

  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name="message_id", nullable=false)
  private Message message;

  @Enumerated(EnumType.STRING)
  @Column(nullable=false)
  private Type type = Type.new_message; // new_message | session_update

  @Column(name="is_read", nullable=false)
  private boolean read = false;

  @Column(name="created_at", insertable=false, updatable=false)
  private Timestamp createdAt;

  public enum Type { new_message, session_update }
}
