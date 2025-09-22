package com.thubongshop.backend.shipping;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_rates",
       indexes = { @Index(name="idx_shiprate_active", columnList = "active") })
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ShippingRate {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable=false, length=50)
  private String carrier;

  @Column(name="base_fee", nullable=false, precision=12, scale=2)
  private BigDecimal baseFee;

  @Column(name="fee_per_kg", nullable=false, precision=12, scale=2)
  private BigDecimal feePerKg;

  @Column(name="free_threshold", precision=12, scale=2)
  private BigDecimal freeThreshold;

  @Column(nullable=false)
  private Boolean active;

  @Column(name="created_at", nullable=false)
  private LocalDateTime createdAt;

  @Column(name="updated_at", nullable=false)
  private LocalDateTime updatedAt;

  @PrePersist
  public void prePersist() {
    if (createdAt == null) createdAt = LocalDateTime.now();
    if (updatedAt == null) updatedAt = LocalDateTime.now();
    if (active == null) active = true;
  }

  @PreUpdate
  public void preUpdate() { updatedAt = LocalDateTime.now(); }
}
