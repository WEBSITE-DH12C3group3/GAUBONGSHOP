package com.thubongshop.backend.cart.dto;

import lombok.Data;

@Data
public class MergeCartItem {
    private Integer productId;
    private Integer quantity;
    private Boolean selected; // optional
}
