package com.thubongshop.backend.chat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

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
  private Status status = Status.pending; // open/closed/pending

  @Column(name="created_at", insertable=false, updatable=false)
  private Timestamp createdAt;

  @Column(name="updated_at", insertable=false, updatable=false)
  private Timestamp updatedAt;

  public enum Status { open, closed, pending }
}
