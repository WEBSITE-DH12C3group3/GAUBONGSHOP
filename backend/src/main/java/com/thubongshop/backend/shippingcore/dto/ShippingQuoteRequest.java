package com.thubongshop.backend.shippingcore.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ShippingQuoteRequest(
  @NotNull BigDecimal orderSubtotal,
  @NotNull BigDecimal weightKg,
  String province,
  String voucherCode
) {}
