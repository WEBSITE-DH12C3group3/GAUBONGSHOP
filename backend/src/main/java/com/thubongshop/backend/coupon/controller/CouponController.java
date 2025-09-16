package com.thubongshop.backend.coupon.controller;

import com.thubongshop.backend.coupon.ApplyCouponRequest;
import com.thubongshop.backend.coupon.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponService service;

    public CouponController(CouponService service) {
        this.service = service;
    }

    // POST /api/coupons/apply  (body: { code, orderTotal })
    @PostMapping("/apply")
    public ResponseEntity<?> apply(@Valid @RequestBody ApplyCouponRequest req) {
        return ResponseEntity.ok(service.applyCoupon(req));
    }
}
