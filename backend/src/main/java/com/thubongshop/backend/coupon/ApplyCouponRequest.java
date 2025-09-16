package com.thubongshop.backend.coupon;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class ApplyCouponRequest {
    @NotBlank private String code;
    @NotNull @DecimalMin("0.0") private BigDecimal orderTotal;
}
