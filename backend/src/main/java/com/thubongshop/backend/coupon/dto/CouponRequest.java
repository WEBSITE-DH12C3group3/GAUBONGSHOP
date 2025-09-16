package com.thubongshop.backend.coupon.dto;

import lombok.Getter; import lombok.Setter;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
public class CouponRequest {
    @NotBlank @Size(max=50) private String code;
    @Size(max=10_000) private String description;

    @NotBlank private String discountType; // percent | fixed
    @NotNull  @DecimalMin("0.0") private BigDecimal discountValue;
    @DecimalMin("0.0") private BigDecimal maxDiscountAmount;

    @DecimalMin("0.0") private BigDecimal minOrderAmount;
    private Boolean excludeDiscountedItems = false;

    @Size(max=255) private String applicablePaymentMethods; // CSV
    @Size(max=255) private String applicableRoles;          // CSV
    @Size(max=255) private String regionInclude;
    @Size(max=255) private String regionExclude;

    private Boolean firstOrderOnly = false;
    private Boolean stackable = false;

    @Min(0) private Integer maxUses;
    @Min(0) private Integer maxUsesPerUser;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Boolean active = true;

    private List<Integer> categoryIds;
    private List<Integer> brandIds;
    private List<Integer> productIds;
}
