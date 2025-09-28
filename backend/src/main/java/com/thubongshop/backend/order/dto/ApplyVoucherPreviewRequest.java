package com.thubongshop.backend.order.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * Yêu cầu preview phí vận chuyển trước khi tạo đơn.
 * - Dùng tọa độ khách chọn trên bản đồ: destLat/destLng (WGS84).
 * - Không cần province ở bước preview (province chỉ là text lưu vào Order).
 */
public record ApplyVoucherPreviewRequest(
    @NotNull(message = "orderSubtotal bắt buộc")
    @DecimalMin(value = "0.0", message = "orderSubtotal không hợp lệ")
    BigDecimal orderSubtotal,

    @NotNull(message = "weightKg bắt buộc")
    @DecimalMin(value = "0.0", message = "weightKg không hợp lệ")
    BigDecimal weightKg,

    // Toạ độ điểm giao hàng KH chọn trên bản đồ
    @NotNull(message = "destLat bắt buộc") BigDecimal destLat,
    @NotNull(message = "destLng bắt buộc") BigDecimal destLng,

    // Mã voucher vận chuyển (tùy chọn)
    String voucherCode,

    // (tùy chọn) Cho phép chọn carrier/service, nếu null sẽ dùng mặc định INTERNAL/STD
    String carrierCode,
    String serviceCode
) {}
