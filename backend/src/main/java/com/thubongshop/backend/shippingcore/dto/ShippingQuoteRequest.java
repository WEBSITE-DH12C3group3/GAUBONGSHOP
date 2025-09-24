package com.thubongshop.backend.shippingcore.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ShippingQuoteRequest(
  @NotNull BigDecimal orderSubtotal,
  @NotNull BigDecimal weightKg,
  String province,
  String voucherCode,
  String carrierCode,            // ưu tiên hãng (GHN/GHTK…)
  Double distanceKm,             // nếu FE đã tính sẵn
  Address address                // để BE tự tính khoảng cách
) {
  public static record Address(Double lat, Double lng) {}
}

