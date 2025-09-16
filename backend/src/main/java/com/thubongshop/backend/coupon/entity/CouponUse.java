package com.thubongshop.backend.coupon.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name="coupon_uses")
public class CouponUse {
    @EmbeddedId private CouponUseId id;
    @Column(name="used_count",nullable=false) private Integer usedCount=0;

    public CouponUseId getId(){return id;} public void setId(CouponUseId id){this.id=id;}
    public Integer getUsedCount(){return usedCount;} public void setUsedCount(Integer v){this.usedCount=v;}

    @Embeddable
    public static class CouponUseId implements Serializable {
        @Column(name="coupon_id") private Integer couponId;
        @Column(name="user_id")   private Integer userId;
        public CouponUseId(){}
        public CouponUseId(Integer c,Integer u){this.couponId=c;this.userId=u;}
        public Integer getCouponId(){return couponId;} public void setCouponId(Integer v){this.couponId=v;}
        public Integer getUserId(){return userId;} public void setUserId(Integer v){this.userId=v;}
        @Override public boolean equals(Object o){ if(this==o)return true; if(!(o instanceof CouponUseId d))return false;
          return Objects.equals(couponId,d.couponId)&&Objects.equals(userId,d.userId);}
        @Override public int hashCode(){ return Objects.hash(couponId,userId); }
    }
}
