package com.thubongshop.backend.order.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingDto {
    private String carrier;
    private String trackingCode;
    private String status;
    private BigDecimal feeCharged;

    public static ShippingDto fromEntity(com.thubongshop.backend.order.ShippingRecord sr) {
        if (sr == null) return null;
        return ShippingDto.builder()
                .carrier(sr.getCarrier())
                .trackingCode(sr.getTrackingCode())
                .status(sr.getStatus() != null ? sr.getStatus().name() : null)
                .feeCharged(sr.getFeeCharged())
                .build();
    }
    
}
