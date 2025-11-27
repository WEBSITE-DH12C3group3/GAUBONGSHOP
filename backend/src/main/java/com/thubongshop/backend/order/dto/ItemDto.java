package com.thubongshop.backend.orderv2.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDto {
    private Integer productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;

    public static ItemDto fromEntity(com.thubongshop.backend.order.OrderItem it) {
        return ItemDto.builder()
                .productId(it.getProductId())
                .productName(it.getProductName())
                .quantity(it.getQuantity())
                .unitPrice(it.getUnitPrice())
                .total(it.lineTotal())
                .build();
    }
}
