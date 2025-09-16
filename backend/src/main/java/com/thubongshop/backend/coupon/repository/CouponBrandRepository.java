package com.thubongshop.backend.coupon.repository;

import com.thubongshop.backend.coupon.entity.CouponBrand;
import com.thubongshop.backend.coupon.entity.CouponBrand.CouponBrandId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponBrandRepository extends JpaRepository<CouponBrand, CouponBrandId> {
    List<CouponBrand> findByIdCouponId(Integer couponId);
    void deleteByIdCouponId(Integer couponId);
}
