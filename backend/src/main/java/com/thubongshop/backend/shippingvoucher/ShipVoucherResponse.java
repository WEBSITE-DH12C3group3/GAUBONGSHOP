package com.thubongshop.backend.shippingvoucher;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
public class ShipVoucherResponse {
    private Integer id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderAmount;
    private BigDecimal minShippingFee;
    private String applicableCarriers;
    private String regionInclude;
    private String regionExclude;
    private Integer maxUses;
    private Integer usedCount;
    private Integer maxUsesPerUser;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
