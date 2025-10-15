package com.thubongshop.backend.order.dto;

import com.thubongshop.backend.order.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
    Integer id,
    Integer userId,
    OrderStatus status,
    BigDecimal itemsTotal,
    BigDecimal shippingFee,
    BigDecimal shippingDiscount,
    BigDecimal grandTotal,
    String voucherCode,
    String receiverName,
    String phone,
    String addressLine,
    String province,
    BigDecimal weightKg,
    LocalDateTime createdAt,
    Shipping shipping,
    String couponCode,
    BigDecimal couponDiscount,
    List<Item> items
) {
  public record Item(Integer productId, String productName, BigDecimal unitPrice, Integer quantity, BigDecimal weightKgPerItem) {}
  public record Shipping(String carrier, String trackingCode, String status, BigDecimal feeCharged) {}
}
