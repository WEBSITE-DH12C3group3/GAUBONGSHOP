package com.thubongshop.backend.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name="order_items", indexes = {
  @Index(name="idx_order_items_order", columnList="order_id")
})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class OrderItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="order_id", nullable=false)
  private Order order;

  @Column(name="product_id", nullable=false)
  private Integer productId;

  @Column(name="product_name", nullable=false, length=200)
  private String productName;

  @Column(name="unit_price", nullable=false, precision=12, scale=2)
  private BigDecimal unitPrice;

  @Column(name="quantity", nullable=false)
  private Integer quantity;

  @Column(name="weight_kg_per_item", precision=12, scale=3)
  private BigDecimal weightKgPerItem;

  public BigDecimal lineTotal() {
    return unitPrice.multiply(new BigDecimal(quantity));
  }
  public BigDecimal lineWeight() {
    return (weightKgPerItem == null ? BigDecimal.ZERO : weightKgPerItem)
      .multiply(new BigDecimal(quantity));
  }
}
