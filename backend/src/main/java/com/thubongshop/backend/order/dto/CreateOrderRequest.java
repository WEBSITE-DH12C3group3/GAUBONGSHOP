package com.thubongshop.backend.order.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

/**
 * Yêu cầu tạo đơn hàng từ phía client.
 * - BẮT BUỘC: receiverName, phone, addressLine, province, destLat, destLng, items
 * - TÙY CHỌN: voucherCode
 *
 * Lưu ý:
 * - destLat/destLng là toạ độ mà khách chọn trên bản đồ (WGS84).
 * - weightKgPerItem có thể null -> OrderService sẽ quy về 0.
 */
public record CreateOrderRequest(
    @NotBlank String receiverName,
    @NotBlank String phone,
    @NotBlank String addressLine,
    @NotBlank String province,

    // Toạ độ điểm giao khách chọn trên bản đồ
    @NotNull @DecimalMin(value = "-90.0")  BigDecimal destLat,
    @NotNull @DecimalMin(value = "-180.0") BigDecimal destLng,

    // Mã voucher vận chuyển (optional)
    String voucherCode,
    String couponCode,

    // Danh sách sản phẩm
    @NotNull List<Item> items
) {
  public record Item(
      @NotNull            Integer productId,
      @NotNull @Min(1)    Integer quantity,
      @DecimalMin("0.0")  BigDecimal weightKgPerItem // có thể null -> service quy về 0
  ) {}
}
