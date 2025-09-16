package com.thubongshop.backend.coupon.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name="coupon_brands")
public class CouponBrand {
    @EmbeddedId private CouponBrandId id;
    public CouponBrand() {}
    public CouponBrand(Integer couponId, Integer brandId){ this.id = new CouponBrandId(couponId, brandId); }
    public CouponBrandId getId(){return id;} public void setId(CouponBrandId id){this.id=id;}

    @Embeddable
    public static class CouponBrandId implements Serializable {
        @Column(name="coupon_id") private Integer couponId;
        @Column(name="brand_id")  private Integer brandId;
        public CouponBrandId() {}
        public CouponBrandId(Integer c, Integer b){this.couponId=c; this.brandId=b;}
        public Integer getCouponId(){return couponId;} public void setCouponId(Integer v){this.couponId=v;}
        public Integer getBrandId(){return brandId;} public void setBrandId(Integer v){this.brandId=v;}
        @Override public boolean equals(Object o){ if(this==o)return true; if(!(o instanceof CouponBrandId d))return false;
            return Objects.equals(couponId,d.couponId)&&Objects.equals(brandId,d.brandId);}
        @Override public int hashCode(){return Objects.hash(couponId,brandId);}
    }
}
