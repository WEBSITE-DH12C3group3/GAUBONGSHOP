package com.thubongshop.backend.orderv2.audit;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity @Table(name="order_audits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderAudit {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name="order_id")   private Integer orderId;
  @Column(name="action")     private String action;
  @Column(name="old_status") private String oldStatus;
  @Column(name="new_status") private String newStatus;
  @Column(name="by_user_id") private Integer byUserId;
  @Column(name="note")       private String note;
  @Column(name="created_at") private java.sql.Timestamp createdAt;
}
