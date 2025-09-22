package com.thubongshop.backend.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AddCartRequest {
    @NotNull
    private Integer productId;

    @Min(1)
    private Integer quantity = 1;
}
