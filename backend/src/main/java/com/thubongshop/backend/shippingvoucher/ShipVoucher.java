package com.thubongshop.backend.shippingvoucher;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_vouchers",
       indexes = {
         @Index(name = "uk_ship_voucher_code", columnList = "code", unique = true),
         @Index(name = "idx_ship_voucher_active", columnList = "active")
       })
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ShipVoucher {

  public enum DiscountType { free, percent, fixed }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable=false, unique=true, length=50)
  private String code;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "discount_type", nullable=false, length=10)
  private DiscountType discountType;

  @Column(name = "discount_value", nullable=false, precision=12, scale=2)
  private BigDecimal discountValue;

  @Column(name = "max_discount_amount", precision=12, scale=2)
  private BigDecimal maxDiscountAmount;

  @Column(name = "min_order_amount", precision=12, scale=2)
  private BigDecimal minOrderAmount;

  @Column(name = "start_at")
  private LocalDateTime startAt;

  @Column(name = "end_at")
  private LocalDateTime endAt;

  @Column(name = "usage_limit")
  private Integer usageLimit;

  @Column(name = "used_count")
  private Integer usedCount;

  @Column(nullable=false)
  private Boolean active;

  @Column(name = "created_at", nullable=false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable=false)
  private LocalDateTime updatedAt;

  @PrePersist
  public void prePersist() {
    if (discountValue == null) discountValue = BigDecimal.ZERO;
    if (maxDiscountAmount == null) maxDiscountAmount = BigDecimal.ZERO;
    if (minOrderAmount == null) minOrderAmount = BigDecimal.ZERO;
    if (usedCount == null) usedCount = 0;
    if (active == null) active = true;
    if (createdAt == null) createdAt = LocalDateTime.now();
    if (updatedAt == null) updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  public void preUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
