package com.thubongshop.backend.coupon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {

    public enum DiscountType { percent, fixed }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable=false, unique=true, length=50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name="discount_type", nullable=false, length=10)
    private DiscountType discountType;

    @Column(name="discount_value", nullable=false, precision=10, scale=2)
    private BigDecimal discountValue;

    @Column(name="max_discount_amount", precision=10, scale=2)
    private BigDecimal maxDiscountAmount;

    @Column(name="min_order_amount", precision=10, scale=2)
    private BigDecimal minOrderAmount;

    @Column(name="exclude_discounted_items", nullable=false)
    private Boolean excludeDiscountedItems = false;

    @Column(name="applicable_payment_methods", length=255)
    private String applicablePaymentMethods;

    @Column(name="applicable_roles", length=255)
    private String applicableRoles;

    @Column(name="region_include", length=255)
    private String regionInclude;

    @Column(name="region_exclude", length=255)
    private String regionExclude;

    @Column(name="first_order_only", nullable=false)
    private Boolean firstOrderOnly = false;

    @Column(name="stackable", nullable=false)
    private Boolean stackable = false;

    @Column(name="max_uses")
    private Integer maxUses;

    @Column(name="used_count", nullable=false)
    private Integer usedCount = 0;

    @Column(name="max_uses_per_user")
    private Integer maxUsesPerUser;

    @Column(name="start_date")
    private LocalDateTime startDate;

    @Column(name="end_date")
    private LocalDateTime endDate;

    @Column(nullable=false)
    private Boolean active = true;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }
    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }

    // getters/setters (rút gọn)
    public Integer getId() {return id;}
    public void setId(Integer id){this.id=id;}
    public String getCode(){return code;}
    public void setCode(String code){this.code=code;}
    public String getDescription(){return description;}
    public void setDescription(String description){this.description=description;}
    public DiscountType getDiscountType(){return discountType;}
    public void setDiscountType(DiscountType discountType){this.discountType=discountType;}
    public BigDecimal getDiscountValue(){return discountValue;}
    public void setDiscountValue(BigDecimal discountValue){this.discountValue=discountValue;}
    public BigDecimal getMaxDiscountAmount(){return maxDiscountAmount;}
    public void setMaxDiscountAmount(BigDecimal v){this.maxDiscountAmount=v;}
    public BigDecimal getMinOrderAmount(){return minOrderAmount;}
    public void setMinOrderAmount(BigDecimal v){this.minOrderAmount=v;}
    public Boolean getExcludeDiscountedItems(){return excludeDiscountedItems;}
    public void setExcludeDiscountedItems(Boolean v){this.excludeDiscountedItems=v;}
    public String getApplicablePaymentMethods(){return applicablePaymentMethods;}
    public void setApplicablePaymentMethods(String s){this.applicablePaymentMethods=s;}
    public String getApplicableRoles(){return applicableRoles;}
    public void setApplicableRoles(String s){this.applicableRoles=s;}
    public String getRegionInclude(){return regionInclude;}
    public void setRegionInclude(String s){this.regionInclude=s;}
    public String getRegionExclude(){return regionExclude;}
    public void setRegionExclude(String s){this.regionExclude=s;}
    public Boolean getFirstOrderOnly(){return firstOrderOnly;}
    public void setFirstOrderOnly(Boolean b){this.firstOrderOnly=b;}
    public Boolean getStackable(){return stackable;}
    public void setStackable(Boolean b){this.stackable=b;}
    public Integer getMaxUses(){return maxUses;}
    public void setMaxUses(Integer i){this.maxUses=i;}
    public Integer getUsedCount(){return usedCount;}
    public void setUsedCount(Integer i){this.usedCount=i;}
    public Integer getMaxUsesPerUser(){return maxUsesPerUser;}
    public void setMaxUsesPerUser(Integer i){this.maxUsesPerUser=i;}
    public LocalDateTime getStartDate(){return startDate;}
    public void setStartDate(LocalDateTime t){this.startDate=t;}
    public LocalDateTime getEndDate(){return endDate;}
    public void setEndDate(LocalDateTime t){this.endDate=t;}
    public Boolean getActive(){return active;}
    public void setActive(Boolean b){this.active=b;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setCreatedAt(LocalDateTime t){this.createdAt=t;}
    public LocalDateTime getUpdatedAt(){return updatedAt;}
    public void setUpdatedAt(LocalDateTime t){this.updatedAt=t;}
}
