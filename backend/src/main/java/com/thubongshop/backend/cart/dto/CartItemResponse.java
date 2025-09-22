package com.thubongshop.backend.cart.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class CartItemResponse {
    private Integer productId;
    private String productName;
    private String imageUrl;
    private Integer availableStock;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
