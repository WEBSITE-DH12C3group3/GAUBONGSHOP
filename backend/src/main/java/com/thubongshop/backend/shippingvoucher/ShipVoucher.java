package com.thubongshop.backend.shippingvoucher;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_vouchers")
public class ShipVoucher {

    public enum DiscountType { free, percent, fixed }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable=false, unique=true, length=50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable=false, length=10)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable=false, precision=10, scale=2)
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Column(name = "max_discount_amount", precision=10, scale=2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "min_order_amount", precision=10, scale=2)
    private BigDecimal minOrderAmount;

    @Column(name = "min_shipping_fee", precision=10, scale=2)
    private BigDecimal minShippingFee;

    @Column(name = "applicable_carriers", length = 255)
    private String applicableCarriers; // CSV: "GHTK,Viettel Post"

    @Column(name = "region_include", length = 255)
    private String regionInclude; // CSV: "Hà Nội,Hồ Chí Minh"

    @Column(name = "region_exclude", length = 255)
    private String regionExclude;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "used_count", nullable=false)
    private Integer usedCount = 0;

    @Column(name = "max_uses_per_user")
    private Integer maxUsesPerUser;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(nullable=false)
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // getters & setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
    public BigDecimal getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }
    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }
    public BigDecimal getMinShippingFee() { return minShippingFee; }
    public void setMinShippingFee(BigDecimal minShippingFee) { this.minShippingFee = minShippingFee; }
    public String getApplicableCarriers() { return applicableCarriers; }
    public void setApplicableCarriers(String applicableCarriers) { this.applicableCarriers = applicableCarriers; }
    public String getRegionInclude() { return regionInclude; }
    public void setRegionInclude(String regionInclude) { this.regionInclude = regionInclude; }
    public String getRegionExclude() { return regionExclude; }
    public void setRegionExclude(String regionExclude) { this.regionExclude = regionExclude; }
    public Integer getMaxUses() { return maxUses; }
    public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }
    public Integer getUsedCount() { return usedCount; }
    public void setUsedCount(Integer usedCount) { this.usedCount = usedCount; }
    public Integer getMaxUsesPerUser() { return maxUsesPerUser; }
    public void setMaxUsesPerUser(Integer maxUsesPerUser) { this.maxUsesPerUser = maxUsesPerUser; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
