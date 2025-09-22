package com.thubongshop.backend.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="orders", indexes = {
  @Index(name="idx_orders_user", columnList="user_id"),
  @Index(name="idx_orders_status", columnList="status")
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Order {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name="user_id", nullable=false)
  private Integer userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable=false, length=30)
  private OrderStatus status;

  @Column(name="items_total", nullable=false, precision=12, scale=2)
  private BigDecimal itemsTotal;

  @Column(name="shipping_fee", nullable=false, precision=12, scale=2)
  private BigDecimal shippingFee;

  @Column(name="shipping_discount", nullable=false, precision=12, scale=2)
  private BigDecimal shippingDiscount;

  @Column(name="grand_total", nullable=false, precision=12, scale=2)
  private BigDecimal grandTotal;

  @Column(name="voucher_code", length=50)
  private String voucherCode;

  @Column(name="receiver_name", length=120)
  private String receiverName;
  @Column(name="phone", length=20)
  private String phone;
  @Column(name="address_line", length=255)
  private String addressLine;
  @Column(name="province", length=100)
  private String province;

  @Column(name="weight_kg", precision=12, scale=3)
  private BigDecimal weightKg;

  @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<OrderItem> items = new ArrayList<>();

  @OneToOne(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private ShippingRecord shippingRecord;

  @Column(name="created_at", nullable=false)
  private LocalDateTime createdAt;

  @Column(name="updated_at", nullable=false)
  private LocalDateTime updatedAt;

  @PrePersist
  public void prePersist() {
    if (createdAt == null) createdAt = LocalDateTime.now();
    if (updatedAt == null) updatedAt = LocalDateTime.now();
    if (status == null) status = OrderStatus.PENDING_PAYMENT;
  }

  @PreUpdate
  public void preUpdate() { updatedAt = LocalDateTime.now(); }
}
