package com.thubongshop.backend.coupon.dto;

import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
public class CouponResponse {
    private Integer id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderAmount;
    private Boolean excludeDiscountedItems;
    private String applicablePaymentMethods;
    private String applicableRoles;
    private String regionInclude;
    private String regionExclude;
    private Boolean firstOrderOnly;
    private Boolean stackable;
    private Integer maxUses;
    private Integer usedCount;
    private Integer maxUsesPerUser;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<Integer> categoryIds;
    private List<Integer> brandIds;
    private List<Integer> productIds;
}
