package com.thubongshop.backend.shippingvoucher;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ShipVoucherResponse(
    Integer id,
    String code,
    String description,
    String discountType,
    BigDecimal discountValue,
    BigDecimal maxDiscountAmount,
    BigDecimal minOrderAmount,
    BigDecimal minShippingFee,
    String applicableCarriers,
    String regionInclude,
    String regionExclude,
    Integer maxUses,
    Integer usedCount,
    Integer maxUsesPerUser,
    LocalDateTime startDate,
    LocalDateTime endDate,
    Boolean active,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
