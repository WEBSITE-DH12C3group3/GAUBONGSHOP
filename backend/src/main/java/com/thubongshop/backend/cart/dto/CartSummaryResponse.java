package com.thubongshop.backend.cart.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
public class CartSummaryResponse {
    private List<CartItemResponse> items;

    // Tổng của cả giỏ (giữ nguyên logic cũ)
    private Integer totalQuantity;
    private BigDecimal totalAmount;

    // NEW: Tổng theo lựa chọn (để checkout)
    private boolean hasAnySelected;
    private Integer selectedQuantity;
    private BigDecimal selectedAmount;
}
