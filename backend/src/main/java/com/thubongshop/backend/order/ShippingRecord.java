package com.thubongshop.backend.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="shipping_records", indexes = {
  @Index(name="idx_shipping_order", columnList="order_id"),
  @Index(name="idx_shipping_status", columnList="status")
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ShippingRecord {

  public enum ShipStatus { CREATED, PICKED, IN_TRANSIT, DELIVERED, FAILED }

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="order_id", nullable=false, unique = true)
  private Order order;

  @Column(length=50, nullable=false)
  private String carrier;

  @Column(name="tracking_code", length=100)
  private String trackingCode;

  @Enumerated(EnumType.STRING)
  @Column(name="status", length=30, nullable=false)
  private ShipStatus status;

  @Column(name="fee_charged", precision=12, scale=2, nullable=false)
  private BigDecimal feeCharged;

  @Column(name="created_at", nullable=false)
  private LocalDateTime createdAt;

  @Column(name="updated_at", nullable=false)
  private LocalDateTime updatedAt;

  @PrePersist
  public void prePersist() {
    if (createdAt == null) createdAt = LocalDateTime.now();
    if (updatedAt == null) updatedAt = LocalDateTime.now();
    if (status == null) status = ShipStatus.CREATED;
  }

  @PreUpdate
  public void preUpdate() { updatedAt = LocalDateTime.now(); }
}
