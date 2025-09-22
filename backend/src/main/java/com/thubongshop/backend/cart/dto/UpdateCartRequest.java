package com.thubongshop.backend.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateCartRequest {
    @NotNull
    private Integer productId;

    @Min(0) // 0 = remove
    private Integer quantity;
}
