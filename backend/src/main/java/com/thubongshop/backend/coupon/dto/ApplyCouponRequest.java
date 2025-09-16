package com.thubongshop.backend.coupon.dto;

import lombok.Getter; import lombok.Setter;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
public class ApplyCouponRequest {
    @NotBlank private String code;
    @NotNull  @DecimalMin("0.0") private BigDecimal orderTotal;
    @NotNull  @Size(min=1) private List<CartItemDTO> items;

    private Integer userId;
    private String userRole;
    private Boolean isFirstOrder;
    private String paymentMethod;
    private String region;
}
