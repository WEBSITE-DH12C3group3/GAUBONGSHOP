package com.thubongshop.backend.orderv2.dto;

import com.thubongshop.backend.order.ShippingRecord;
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
      String carrier,
      String service,
      String trackingCode,
      String status,
      Integer etaDaysMin,
      Integer etaDaysMax,
      BigDecimal distanceKm,
      BigDecimal feeBeforeDiscount,
      BigDecimal discount,
      BigDecimal finalFee
  ) {
    public static ShippingDto fromEntity(ShippingRecord sr) {
      if (sr == null) return null;
      return new ShippingDto(
          sr.getCarrier(),
          null,
          sr.getTrackingCode(),
          sr.getStatus() != null ? sr.getStatus().name() : null,
          null,
          null,
          null,
          null,
          null,
          sr.getFeeCharged()
      );
    }
  }

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
