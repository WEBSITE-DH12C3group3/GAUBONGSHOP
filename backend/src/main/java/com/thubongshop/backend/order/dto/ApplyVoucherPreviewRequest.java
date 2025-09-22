package com.thubongshop.backend.order.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ApplyVoucherPreviewRequest(
  @NotNull BigDecimal orderSubtotal,
  @NotNull BigDecimal weightKg,
  String voucherCode
) { }
