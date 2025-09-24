package com.thubongshop.backend.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name="order_items")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class OrderItem {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="order_id")
  private Order order;

  @Column(name="product_id")
  private Integer productId;

  @Column(name="product_name")
  private String productName;

  @Column(name="unit_price", precision=10, scale=2)
  private BigDecimal unitPrice;

  @Column(name="quantity", nullable=false)
  private Integer quantity;

  @Column(name="weight_kg_per_item", precision=12, scale=3)
  private BigDecimal weightKgPerItem;

  public BigDecimal lineTotal() { return unitPrice.multiply(BigDecimal.valueOf(quantity)); }
  public BigDecimal lineWeight() { return (weightKgPerItem==null?BigDecimal.ZERO:weightKgPerItem).multiply(BigDecimal.valueOf(quantity)); }
}

