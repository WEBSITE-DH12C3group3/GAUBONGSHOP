package com.thubongshop.backend.cart.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
public class CartSummaryResponse {
    private List<CartItemResponse> items;
    private Integer totalQuantity;
    private BigDecimal totalAmount;
}
