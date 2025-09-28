package com.thubongshop.backend.shippingcore.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ShippingQuoteRequest(
    BigDecimal orderSubtotal,
    BigDecimal weightKg,
    BigDecimal destLat,
    BigDecimal destLng,
    String voucherCode,   // optional
    String carrierCode,   // optional (default INTERNAL)
    String serviceCode    // optional (default STD)              // để BE tự tính khoảng cách
) {
  public static record Address(Double lat, Double lng) {}
}

