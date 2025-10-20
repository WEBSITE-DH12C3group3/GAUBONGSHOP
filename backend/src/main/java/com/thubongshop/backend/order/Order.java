package com.thubongshop.backend.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  // ✅ Mã đơn hàng (liên kết với VNPay)
  @Column(name = "order_code", unique = true, nullable = false, length = 50)
  private String orderCode;

  @Column(name = "user_id", nullable = false)
  private Integer userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OrderStatus status;

  @Column(name = "payment_method", length = 30)
private String paymentMethod;

  // ====== Tổng tiền hàng ======
  @Column(name = "items_total", precision = 12, scale = 2)
  private BigDecimal itemsTotal;

  // ====== Thông tin vận chuyển ======
  @Column(name = "shipping_distance_km", precision = 12, scale = 2)
  private BigDecimal shippingDistanceKm;

  @Column(name = "shipping_fee_before", precision = 12, scale = 2)
  private BigDecimal shippingFeeBefore;

  @Column(name = "shipping_discount", precision = 12, scale = 2)
  private BigDecimal shippingDiscount;

  @Column(name = "shipping_fee_final", precision = 12, scale = 2)
  private BigDecimal shippingFeeFinal;

  @Column(name = "shipping_fee", precision = 12, scale = 2)
  private BigDecimal shippingFee;

  // ====== Tổng cộng ======
  @Column(name = "grand_total", precision = 12, scale = 2)
  private BigDecimal grandTotal;

  @Column(name = "total_amount", precision = 12, scale = 2)
  private BigDecimal totalAmount;

  // ====== Voucher ======
  @Column(name = "voucher_code")
  private String voucherCode;

  @Column(name = "coupon_code", length = 50)
  private String couponCode;

  @Column(name = "coupon_discount", precision = 10, scale = 2)
  private BigDecimal couponDiscount = BigDecimal.ZERO;

  // ====== Địa chỉ nhận ======
  @Column(name = "receiver_name")
  private String receiverName;

  @Column(name = "phone")
  private String phone;

  @Column(name = "address_line")
  private String addressLine;

  @Column(name = "province")
  private String province;

  // ====== Khối lượng ======
  @Column(name = "weight_kg", precision = 12, scale = 2)
  private BigDecimal weightKg;

  // ====== Thời gian ======
  @Column(name = "order_date", updatable = false, insertable = false,
          columnDefinition = "timestamp default current_timestamp")
  private Instant createdAt;

  // ====== Quan hệ ======
  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItem> items;

  @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
  private ShippingRecord shippingRecord;

  // ====== Hỗ trợ tương thích ngược ======
  public BigDecimal getShippingFeeOrFinal() {
    return shippingFeeFinal != null ? shippingFeeFinal : shippingFee;
  }

  // ✅ Hàm tiện ích: tự sinh mã orderCode khi tạo mới
  @PrePersist
  public void generateOrderCode() {
    if (this.orderCode == null || this.orderCode.isBlank()) {
      this.orderCode = "ORDER" + System.currentTimeMillis();
    }
  }
}
