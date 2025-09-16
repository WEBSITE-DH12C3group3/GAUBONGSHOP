package com.thubongshop.backend.shippingvoucher;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Locale;

@Service
@Transactional
public class ShipVoucherService {

    private final ShipVoucherRepository repo;
    private final ShipVoucherUseRepository useRepo;

    public ShipVoucherService(ShipVoucherRepository repo, ShipVoucherUseRepository useRepo) {
        this.repo = repo;
        this.useRepo = useRepo;
    }

    /* ===== Admin CRUD ===== */

    public Page<ShipVoucherResponse> list(String q, Pageable pageable) {
        Page<ShipVoucher> page = (q == null || q.isBlank())
                ? repo.findAll(pageable)
                : repo.findByCodeContainingIgnoreCase(q.trim(), pageable);
        return page.map(this::toRes);
    }

    public ShipVoucherResponse get(Integer id) {
        ShipVoucher s = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Voucher not found"));
        return toRes(s);
    }

    public ShipVoucherResponse create(ShipVoucherRequest r) {
        validateData(r);
        String code = r.getCode().trim();
        if (repo.existsByCodeIgnoreCase(code)) throw new IllegalArgumentException("Code already exists");
        ShipVoucher v = new ShipVoucher();
        apply(v, r);
        v.setCode(code);
        return toRes(repo.save(v));
    }

    public ShipVoucherResponse update(Integer id, ShipVoucherRequest r) {
        validateData(r);
        ShipVoucher v = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Voucher not found"));
        String code = r.getCode().trim();
        repo.findByCodeIgnoreCase(code).ifPresent(ex -> {
            if (!ex.getId().equals(id)) throw new IllegalArgumentException("Code already exists");
        });
        apply(v, r);
        v.setCode(code);
        return toRes(repo.save(v));
    }

    public void delete(Integer id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Voucher not found");
        repo.deleteById(id);
    }

    public ShipVoucherResponse setActive(Integer id, boolean value) {
        ShipVoucher v = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Voucher not found"));
        v.setActive(value);
        return toRes(repo.save(v));
    }

    /* ===== Public Apply (preview) ===== */

    public ApplyShipVoucherResponse apply(ApplyShipVoucherRequest req) {
        ShipVoucher v = repo.findByCodeIgnoreCase(req.getCode().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid voucher code"));

        validateUsable(v, req.getOrderTotal(), req.getShippingFee(),
                nullSafeLower(req.getCarrier()), nullSafeLower(req.getRegion()),
                req.getUserId());

        BigDecimal discount = calcDiscount(v, req.getShippingFee());
        BigDecimal finalShip = req.getShippingFee().subtract(discount);
        if (finalShip.compareTo(BigDecimal.ZERO) < 0) finalShip = BigDecimal.ZERO;

        ApplyShipVoucherResponse res = new ApplyShipVoucherResponse();
        res.setCode(v.getCode());
        res.setDiscountType(v.getDiscountType().name());
        res.setDiscountValue(v.getDiscountValue());
        res.setDiscountAmount(discount);
        res.setFinalShippingFee(finalShip);
        res.setMessage("OK");
        return res;
    }

    /* ===== Helpers ===== */

    private void apply(ShipVoucher v, ShipVoucherRequest r) {
        v.setDescription(r.getDescription());
        v.setDiscountType(ShipVoucher.DiscountType.valueOf(r.getDiscountType()));
        v.setDiscountValue(r.getDiscountValue());
        v.setMaxDiscountAmount(r.getMaxDiscountAmount());
        v.setMinOrderAmount(r.getMinOrderAmount());
        v.setMinShippingFee(r.getMinShippingFee());
        v.setApplicableCarriers(trimToNull(r.getApplicableCarriers()));
        v.setRegionInclude(trimToNull(r.getRegionInclude()));
        v.setRegionExclude(trimToNull(r.getRegionExclude()));
        v.setMaxUses(r.getMaxUses());
        v.setMaxUsesPerUser(r.getMaxUsesPerUser());
        v.setStartDate(r.getStartDate());
        v.setEndDate(r.getEndDate());
        v.setActive(r.getActive() != null ? r.getActive() : true);
    }

    private void validateData(ShipVoucherRequest r) {
        String t = r.getDiscountType();
        if (!"free".equals(t) && !"percent".equals(t) && !"fixed".equals(t)) {
            throw new IllegalArgumentException("discountType must be free|percent|fixed");
        }
        if ("percent".equals(t)) {
            if (r.getDiscountValue() == null ||
                r.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0 ||
                r.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("percent value must be (0,100]");
            }
        } else if ("fixed".equals(t)) {
            if (r.getDiscountValue() == null || r.getDiscountValue().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("fixed value must be >= 0");
            }
        } else { // free
            // allow 0
        }
        if (r.getStartDate() != null && r.getEndDate() != null && r.getStartDate().isAfter(r.getEndDate())) {
            throw new IllegalArgumentException("startDate must be before endDate");
        }
    }

    private void validateUsable(ShipVoucher v, BigDecimal orderTotal, BigDecimal shippingFee,
                                String carrier, String region, Integer userId) {
        LocalDateTime now = LocalDateTime.now();
        if (Boolean.FALSE.equals(v.getActive())) throw new IllegalArgumentException("Voucher is disabled");
        if (v.getStartDate() != null && now.isBefore(v.getStartDate()))
            throw new IllegalArgumentException("Voucher not started");
        if (v.getEndDate() != null && now.isAfter(v.getEndDate()))
            throw new IllegalArgumentException("Voucher expired");
        if (v.getMaxUses() != null && v.getUsedCount() != null && v.getUsedCount() >= v.getMaxUses())
            throw new IllegalArgumentException("Voucher exhausted");
        if (v.getMinOrderAmount() != null && orderTotal.compareTo(v.getMinOrderAmount()) < 0)
            throw new IllegalArgumentException("Not meet min order amount");
        if (v.getMinShippingFee() != null && shippingFee.compareTo(v.getMinShippingFee()) < 0)
            throw new IllegalArgumentException("Not meet min shipping fee");

        // Carrier check
        if (notBlank(v.getApplicableCarriers())) {
            boolean ok = containsCsv(v.getApplicableCarriers(), carrier);
            if (!ok) throw new IllegalArgumentException("Carrier not applicable");
        }
        // Region include
        if (notBlank(v.getRegionInclude())) {
            boolean ok = containsCsv(v.getRegionInclude(), region);
            if (!ok) throw new IllegalArgumentException("Region not allowed");
        }
        // Region exclude
        if (notBlank(v.getRegionExclude())) {
            boolean blocked = containsCsv(v.getRegionExclude(), region);
            if (blocked) throw new IllegalArgumentException("Region excluded");
        }

        // per-user limit
        if (v.getMaxUsesPerUser() != null && v.getMaxUsesPerUser() > 0) {
            if (userId == null) throw new IllegalArgumentException("User required for this voucher");
            ShipVoucherUse.ShipVoucherUseId id = new ShipVoucherUse.ShipVoucherUseId(v.getId(), userId);
            ShipVoucherUse use = useRepo.findById(id).orElse(null);
            int usedByUser = (use != null ? use.getUsedCount() : 0);
            if (usedByUser >= v.getMaxUsesPerUser())
                throw new IllegalArgumentException("Reached user usage limit");
        }
    }

    private BigDecimal calcDiscount(ShipVoucher v, BigDecimal fee) {
        switch (v.getDiscountType()) {
            case free:
                return fee;
            case percent:
                BigDecimal d = fee.multiply(v.getDiscountValue()).divide(BigDecimal.valueOf(100));
                if (v.getMaxDiscountAmount() != null && d.compareTo(v.getMaxDiscountAmount()) > 0) {
                    d = v.getMaxDiscountAmount();
                }
                return d;
            case fixed:
                return fee.min(v.getDiscountValue());
            default:
                return BigDecimal.ZERO;
        }
    }

    /* Utility */

    private ShipVoucherResponse toRes(ShipVoucher v) {
        ShipVoucherResponse r = new ShipVoucherResponse();
        r.setId(v.getId());
        r.setCode(v.getCode());
        r.setDescription(v.getDescription());
        r.setDiscountType(v.getDiscountType().name());
        r.setDiscountValue(v.getDiscountValue());
        r.setMaxDiscountAmount(v.getMaxDiscountAmount());
        r.setMinOrderAmount(v.getMinOrderAmount());
        r.setMinShippingFee(v.getMinShippingFee());
        r.setApplicableCarriers(v.getApplicableCarriers());
        r.setRegionInclude(v.getRegionInclude());
        r.setRegionExclude(v.getRegionExclude());
        r.setMaxUses(v.getMaxUses());
        r.setUsedCount(v.getUsedCount());
        r.setMaxUsesPerUser(v.getMaxUsesPerUser());
        r.setStartDate(v.getStartDate());
        r.setEndDate(v.getEndDate());
        r.setActive(v.getActive());
        r.setCreatedAt(v.getCreatedAt());
        r.setUpdatedAt(v.getUpdatedAt());
        return r;
    }

    private boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private String nullSafeLower(String s) {
        return s == null ? null : s.trim().toLowerCase(Locale.ROOT);
    }

    private boolean containsCsv(String csv, String probe) {
        if (!notBlank(csv)) return true; // no restriction
        if (probe == null || probe.isEmpty()) return false;
        String p = probe.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .map(v -> v.toLowerCase(Locale.ROOT))
                .anyMatch(v -> v.equals(p));
    }

    private String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    /* ===== Hook để OrderService gọi khi đơn hoàn tất (tuỳ bạn dùng) ===== */
    public void consume(Integer voucherId, Integer userId) {
        ShipVoucher v = repo.findById(voucherId)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found"));
        // tăng tổng
        v.setUsedCount((v.getUsedCount() == null ? 0 : v.getUsedCount()) + 1);
        repo.save(v);

        // tăng theo user nếu có
        if (userId != null) {
            ShipVoucherUse.ShipVoucherUseId id = new ShipVoucherUse.ShipVoucherUseId(voucherId, userId);
            ShipVoucherUse use = useRepo.findById(id).orElse(null);
            if (use == null) {
                use = new ShipVoucherUse();
                use.setId(id);
                use.setUsedCount(1);
            } else {
                use.setUsedCount(use.getUsedCount() + 1);
            }
            useRepo.save(use);
        }
    }
}
