package com.thubongshop.backend.shippingvoucher;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class ApplyShipVoucherResponse {
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;   // số tiền giảm phí ship
    private BigDecimal finalShippingFee; // phí ship sau giảm
    private String message;
}
