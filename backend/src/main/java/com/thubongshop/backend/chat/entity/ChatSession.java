package com.thubongshop.backend.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(
  name = "chat_sessions",
  uniqueConstraints = @UniqueConstraint(
      name = "uq_participants",
      columnNames = {"participant1_id", "participant2_id"}
  ),
  indexes = {
      @Index(name = "idx_p1", columnList = "participant1_id"),
      @Index(name = "idx_p2", columnList = "participant2_id"),
      @Index(name = "idx_status", columnList = "status")
  }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {

  public enum Status { open, closed, pending }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "participant1_id", nullable = false)
  private Integer participant1Id;

  @Column(name = "participant2_id", nullable = false)
  private Integer participant2Id;

  @Builder.Default
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Status status = Status.open;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false, nullable = false)
  private Instant createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  // --- Helpers ---
  public boolean isParticipant(Integer userId) {
    return userId != null && (userId.equals(participant1Id) || userId.equals(participant2Id));
  }

  /** Trả về id của người còn lại trong phiên; nếu userId không thuộc phiên sẽ trả về null */
  public Integer getPeerOf(Integer userId) {
    if (userId == null) return null;
    if (userId.equals(participant1Id)) return participant2Id;
    if (userId.equals(participant2Id)) return participant1Id;
    return null;
  }
}
