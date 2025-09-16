package com.thubongshop.backend.coupon;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class CouponService {

    private final CouponRepository repo;

    public CouponService(CouponRepository repo) {
        this.repo = repo;
    }

    public Page<CouponResponse> list(String q, Pageable pageable) {
        Page<Coupon> page = (q == null || q.isBlank())
                ? repo.findAll(pageable)
                : repo.findByCodeContainingIgnoreCase(q.trim(), pageable);
        return page.map(this::toRes);
    }

    public CouponResponse get(Integer id) {
        Coupon c = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        return toRes(c);
    }

    public CouponResponse create(CouponRequest r) {
        validateCouponData(r);
        String code = r.getCode().trim();
        if (repo.existsByCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("Coupon code already exists");
        }
        Coupon c = new Coupon();
        apply(c, r);
        c.setCode(code);
        return toRes(repo.save(c));
    }

    public CouponResponse update(Integer id, CouponRequest r) {
        validateCouponData(r);
        Coupon c = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        String code = r.getCode().trim();
        repo.findByCodeIgnoreCase(code).ifPresent(ex -> {
            if (!ex.getId().equals(id)) throw new IllegalArgumentException("Coupon code already exists");
        });
        apply(c, r);
        c.setCode(code);
        return toRes(repo.save(c));
    }

    public void delete(Integer id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Coupon not found");
        repo.deleteById(id);
    }

    public CouponResponse setActive(Integer id, boolean value) {
        Coupon c = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        c.setActive(value);
        return toRes(repo.save(c));
    }

    public ApplyCouponResponse applyCoupon(ApplyCouponRequest req) {
        Coupon c = repo.findByCodeIgnoreCase(req.getCode().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid coupon code"));

        validateUsable(c, req.getOrderTotal());
        BigDecimal discount = calcDiscount(c, req.getOrderTotal());
        BigDecimal finalAmount = req.getOrderTotal().subtract(discount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;

        ApplyCouponResponse res = new ApplyCouponResponse();
        res.setCode(c.getCode());
        res.setDiscountType(c.getDiscountType().name());
        res.setDiscountValue(c.getDiscountValue());
        res.setDiscountAmount(discount);
        res.setFinalAmount(finalAmount);
        res.setMessage("OK");
        return res;
    }

    /* Helpers */

    private void apply(Coupon c, CouponRequest r) {
        c.setDescription(r.getDescription());
        c.setDiscountType(Coupon.DiscountType.valueOf(r.getDiscountType()));
        c.setDiscountValue(r.getDiscountValue());
        c.setMinOrderAmount(r.getMinOrderAmount());
        c.setMaxUses(r.getMaxUses());
        c.setStartDate(r.getStartDate());
        c.setEndDate(r.getEndDate());
        c.setActive(r.getActive() != null ? r.getActive() : true);
    }

    private void validateCouponData(CouponRequest r) {
        if ("percent".equals(r.getDiscountType())) {
            if (r.getDiscountValue() == null || r.getDiscountValue().doubleValue() <= 0
                    || r.getDiscountValue().doubleValue() > 100) {
                throw new IllegalArgumentException("Giá trị % giảm phải trong (0,100]");
            }
        } else if ("fixed".equals(r.getDiscountType())) {
            if (r.getDiscountValue() == null || r.getDiscountValue().doubleValue() < 0) {
                throw new IllegalArgumentException("Giảm cố định phải ≥ 0");
            }
        } else {
            throw new IllegalArgumentException("discountType phải là percent hoặc fixed");
        }

        if (r.getMinOrderAmount() != null && r.getMinOrderAmount().doubleValue() < 0) {
            throw new IllegalArgumentException("Đơn tối thiểu phải ≥ 0");
        }
        if (r.getStartDate() != null && r.getEndDate() != null && r.getStartDate().isAfter(r.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc");
        }
    }

    private void validateUsable(Coupon c, BigDecimal total) {
        LocalDateTime now = LocalDateTime.now();
        if (Boolean.FALSE.equals(c.getActive())) throw new IllegalArgumentException("Coupon đang tắt");
        if (c.getStartDate() != null && now.isBefore(c.getStartDate())) throw new IllegalArgumentException("Coupon chưa tới hạn");
        if (c.getEndDate() != null && now.isAfter(c.getEndDate())) throw new IllegalArgumentException("Coupon đã hết hạn");
        if (c.getMaxUses() != null && c.getUsedCount() != null && c.getUsedCount() >= c.getMaxUses())
            throw new IllegalArgumentException("Coupon đã đạt giới hạn sử dụng");
        if (c.getMinOrderAmount() != null && total.compareTo(c.getMinOrderAmount()) < 0)
            throw new IllegalArgumentException("Không đạt đơn tối thiểu");
    }

    private BigDecimal calcDiscount(Coupon c, BigDecimal total) {
        if (c.getDiscountType() == Coupon.DiscountType.percent) {
            return total.multiply(c.getDiscountValue()).divide(BigDecimal.valueOf(100));
        }
        return c.getDiscountValue();
    }

    private CouponResponse toRes(Coupon c) {
        CouponResponse r = new CouponResponse();
        r.setId(c.getId());
        r.setCode(c.getCode());
        r.setDescription(c.getDescription());
        r.setDiscountType(c.getDiscountType().name());
        r.setDiscountValue(c.getDiscountValue());
        r.setMinOrderAmount(c.getMinOrderAmount());
        r.setMaxUses(c.getMaxUses());
        r.setUsedCount(c.getUsedCount());
        r.setStartDate(c.getStartDate());
        r.setEndDate(c.getEndDate());
        r.setActive(c.getActive());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}
