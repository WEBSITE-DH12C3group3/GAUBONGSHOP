package com.thubongshop.backend.orderv2.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class OrderV2Dtos {
  public enum OrderStatus { PENDING_PAYMENT, PAID, PACKING, SHIPPED, DELIVERED, CANCELED }

  public record OrderListItemDto(
      Integer id,
      OrderStatus status,
      BigDecimal itemsTotal,
      BigDecimal shippingFee,
      BigDecimal shippingDiscount,
      BigDecimal grandTotal,
      String receiverName,
      String phone,
      String addressLine,
      String province,
      OffsetDateTime orderDate
  ) {}

  public record ItemDto(
      Integer productId,
      String productName,
      BigDecimal unitPrice,
      Integer quantity,
      BigDecimal weightKgPerItem
  ) {}

  public record ShippingDto(
      String carrier,          // từ shipping_carriers.code/name nếu có
      String service,          // từ orders.shipping_service_id -> shipping_services.code/label
      String trackingCode,     // ưu tiên shipping_records.tracking_code, fallback shipping.tracking_number
      String status,           // ưu tiên shipping_records.status, fallback shipping.status
      Integer etaDaysMin,      // orders.shipping_eta_min
      Integer etaDaysMax,      // orders.shipping_eta_max
      BigDecimal distanceKm,   // orders.shipping_distance_km
      BigDecimal feeBeforeDiscount, // orders.shipping_fee_before
      BigDecimal discount,     // orders.shipping_discount
      BigDecimal finalFee      // orders.shipping_fee_final
  ) {}

  public record OrderDetailDto(
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
      OffsetDateTime orderDate,
      ShippingDto shipping,
      List<ItemDto> items
  ) {}

  public record CancelRequest(String reason) {}
  public record AdminStatusUpdateRequest(String status) {}
}
