package com.thubongshop.backend.coupon.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name="coupon_categories")
public class CouponCategory {
    @EmbeddedId private CouponCategoryId id;
    public CouponCategory() {}
    public CouponCategory(Integer couponId, Integer categoryId){ this.id = new CouponCategoryId(couponId, categoryId); }
    public CouponCategoryId getId(){return id;} public void setId(CouponCategoryId id){this.id=id;}

    @Embeddable
    public static class CouponCategoryId implements Serializable {
        @Column(name="coupon_id")  private Integer couponId;
        @Column(name="category_id")private Integer categoryId;
        public CouponCategoryId() {}
        public CouponCategoryId(Integer c, Integer cat){this.couponId=c; this.categoryId=cat;}
        public Integer getCouponId(){return couponId;} public void setCouponId(Integer v){this.couponId=v;}
        public Integer getCategoryId(){return categoryId;} public void setCategoryId(Integer v){this.categoryId=v;}
        @Override public boolean equals(Object o){ if(this==o)return true; if(!(o instanceof CouponCategoryId d))return false;
            return Objects.equals(couponId,d.couponId)&&Objects.equals(categoryId,d.categoryId);}
        @Override public int hashCode(){return Objects.hash(couponId,categoryId);}
    }
}
