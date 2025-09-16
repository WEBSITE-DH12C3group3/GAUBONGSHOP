package com.thubongshop.backend.coupon.repository;

import com.thubongshop.backend.coupon.entity.CouponProduct;
import com.thubongshop.backend.coupon.entity.CouponProduct.CouponProductId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponProductRepository extends JpaRepository<CouponProduct, CouponProductId> {
    List<CouponProduct> findByIdCouponId(Integer couponId);
    void deleteByIdCouponId(Integer couponId);
}
