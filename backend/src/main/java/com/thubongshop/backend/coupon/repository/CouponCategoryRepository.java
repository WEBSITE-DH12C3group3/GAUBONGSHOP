package com.thubongshop.backend.coupon.repository;

import com.thubongshop.backend.coupon.entity.CouponCategory;
import com.thubongshop.backend.coupon.entity.CouponCategory.CouponCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponCategoryRepository extends JpaRepository<CouponCategory, CouponCategoryId> {
    List<CouponCategory> findByIdCouponId(Integer couponId);
    void deleteByIdCouponId(Integer couponId);
}
