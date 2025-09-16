package com.thubongshop.backend.coupon.dto;

import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class CartItemDTO {
    private Integer productId;
    private Integer categoryId;
    private Integer brandId;
    private BigDecimal unitPrice;
    private Integer quantity;
    private Boolean discounted;
}
