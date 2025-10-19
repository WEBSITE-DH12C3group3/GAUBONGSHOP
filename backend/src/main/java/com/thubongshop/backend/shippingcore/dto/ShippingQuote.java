    package com.thubongshop.backend.shippingcore.dto;

    import java.math.BigDecimal;

    public record ShippingQuote(
        BigDecimal distanceKm,
        BigDecimal feeBeforeVoucher,
        BigDecimal feeAfterVoucher,
        Integer etaDaysMin,
        Integer etaDaysMax,
        String carrier,
        String service
    ) {}