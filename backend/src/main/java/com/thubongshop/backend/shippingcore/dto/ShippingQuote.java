package com.thubongshop.backend.shippingcore.dto;

import java.math.BigDecimal;

public record ShippingQuote(
  String carrier,
  BigDecimal baseFee,
  BigDecimal feePerKg,
  BigDecimal feeBeforeDiscount,
  BigDecimal discount,
  BigDecimal finalFee,
  String appliedVoucher
) {}
