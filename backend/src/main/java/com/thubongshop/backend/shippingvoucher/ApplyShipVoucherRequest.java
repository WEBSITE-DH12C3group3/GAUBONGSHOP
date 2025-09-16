package com.thubongshop.backend.shippingvoucher;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class ApplyShipVoucherRequest {
    @NotBlank private String code;
    @NotNull  @DecimalMin("0.0") private BigDecimal orderTotal;
    @NotNull  @DecimalMin("0.0") private BigDecimal shippingFee;

    @Size(max=100) private String carrier; // GHTK, Viettel Post, ...
    @Size(max=100) private String region;  // tỉnh/thành (để đối chiếu include/exclude)
    private Integer userId;                // để check max_uses_per_user (nếu cần)
}
