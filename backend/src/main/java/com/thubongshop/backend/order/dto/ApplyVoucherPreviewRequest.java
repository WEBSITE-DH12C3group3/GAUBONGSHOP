package com.thubongshop.backend.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ApplyVoucherPreviewRequest(
    @NotNull(message = "orderSubtotal bắt buộc") BigDecimal orderSubtotal,
    @NotNull(message = "weightKg bắt buộc")      BigDecimal weightKg,
    @NotBlank(message = "province bắt buộc")     String province,
    String voucherCode
) {}
