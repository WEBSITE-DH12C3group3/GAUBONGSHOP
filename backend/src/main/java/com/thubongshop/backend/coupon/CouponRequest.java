package com.thubongshop.backend.coupon;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
public class CouponRequest {
    @NotBlank @Size(max=50) private String code;
    @Size(max=10_000) private String description;

    @NotBlank
    private String discountType; // "percent" | "fixed"

    @NotNull @DecimalMin("0.0")
    private BigDecimal discountValue;

    @DecimalMin("0.0")
    private BigDecimal minOrderAmount;

    @Min(0)
    private Integer maxUses; // có thể null

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Boolean active = true;
}
