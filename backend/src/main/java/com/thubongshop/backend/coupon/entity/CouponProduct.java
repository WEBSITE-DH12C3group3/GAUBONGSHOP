package com.thubongshop.backend.coupon.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name="coupon_products")
public class CouponProduct {
    @EmbeddedId private CouponProductId id;
    public CouponProduct(){}
    public CouponProduct(Integer couponId, Integer productId){ this.id = new CouponProductId(couponId, productId); }
    public CouponProductId getId(){return id;} public void setId(CouponProductId id){this.id=id;}

    @Embeddable
    public static class CouponProductId implements Serializable {
        @Column(name="coupon_id")  private Integer couponId;
        @Column(name="product_id") private Integer productId;
        public CouponProductId() {}
        public CouponProductId(Integer c,Integer p){this.couponId=c; this.productId=p;}
        public Integer getCouponId(){return couponId;} public void setCouponId(Integer v){this.couponId=v;}
        public Integer getProductId(){return productId;} public void setProductId(Integer v){this.productId=v;}
        @Override public boolean equals(Object o){ if(this==o)return true; if(!(o instanceof CouponProductId d))return false;
            return Objects.equals(couponId,d.couponId)&&Objects.equals(productId,d.productId);}
        @Override public int hashCode(){return Objects.hash(couponId,productId);}
    }
}
