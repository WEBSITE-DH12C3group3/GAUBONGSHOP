package com.thubongshop.backend.shippingvoucher;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
public class ShipVoucherRequest {
    @NotBlank @Size(max=50) private String code;
    @Size(max=10_000) private String description;

    @NotBlank private String discountType; // free | percent | fixed
    @NotNull  @DecimalMin("0.0") private BigDecimal discountValue; // 0 for free

    @DecimalMin("0.0") private BigDecimal maxDiscountAmount;
    @DecimalMin("0.0") private BigDecimal minOrderAmount;
    @DecimalMin("0.0") private BigDecimal minShippingFee;

    @Size(max=255) private String applicableCarriers; // CSV
    @Size(max=255) private String regionInclude;      // CSV
    @Size(max=255) private String regionExclude;      // CSV

    @Min(0) private Integer maxUses;
    @Min(0) private Integer maxUsesPerUser;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Boolean active = true;
}
