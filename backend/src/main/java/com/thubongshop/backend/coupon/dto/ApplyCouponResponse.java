package com.thubongshop.backend.coupon.dto;

import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class ApplyCouponResponse {
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    private String message;
}
