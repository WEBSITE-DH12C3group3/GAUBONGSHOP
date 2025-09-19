// ChatSession.java
package com.thubongshop.backend.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity @Table(name="chat_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatSession {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name="participant1_id", nullable=false)
  private Integer participant1Id; // client

  @Column(name="participant2_id", nullable=false)
  private Integer participant2Id; // admin

  @Enumerated(EnumType.STRING)
  @Column(nullable=false)
  private Status status = Status.pending;

  @CreationTimestamp
  @Column(name="created_at", nullable=false, updatable=false)
  private Instant createdAt;

  @UpdateTimestamp
  @Column(name="updated_at", nullable=false)
  private Instant updatedAt;

  public enum Status { open, closed, pending }
}
