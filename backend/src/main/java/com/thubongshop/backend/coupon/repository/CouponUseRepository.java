package com.thubongshop.backend.coupon.repository;

import com.thubongshop.backend.coupon.entity.CouponUse;
import com.thubongshop.backend.coupon.entity.CouponUse.CouponUseId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponUseRepository extends JpaRepository<CouponUse, CouponUseId> { }
