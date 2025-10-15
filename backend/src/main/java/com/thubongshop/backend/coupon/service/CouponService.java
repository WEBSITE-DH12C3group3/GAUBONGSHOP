package com.thubongshop.backend.coupon.service;

import com.thubongshop.backend.coupon.dto.*;
import com.thubongshop.backend.coupon.entity.*;
import com.thubongshop.backend.coupon.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CouponService {

    private final CouponRepository repo;
    private final CouponCategoryRepository catRepo;
    private final CouponBrandRepository brandRepo;
    private final CouponProductRepository prodRepo;
    private final CouponUseRepository useRepo;

    public CouponService(CouponRepository repo,
                         CouponCategoryRepository catRepo,
                         CouponBrandRepository brandRepo,
                         CouponProductRepository prodRepo,
                         CouponUseRepository useRepo) {
        this.repo = repo; this.catRepo = catRepo; this.brandRepo = brandRepo; this.prodRepo = prodRepo; this.useRepo=useRepo;
    }

    /* ========== Admin CRUD ========== */

    public Page<CouponResponse> list(String q, Pageable pageable) {
        Page<Coupon> page = (q==null||q.isBlank()) ? repo.findAll(pageable) : repo.findByCodeContainingIgnoreCase(q.trim(), pageable);
        return page.map(this::toResWithScopes);
    }

    public CouponResponse get(Integer id) {
        Coupon c = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu giảm giá"));
        return toResWithScopes(c);
    }

    public CouponResponse create(CouponRequest r) {
        validate(r);
        String code = r.getCode().trim();
        if (repo.existsByCodeIgnoreCase(code)) throw new IllegalArgumentException("Mã giảm giá đã tồn tại");
        Coupon c = new Coupon();
        apply(c, r);
        c.setCode(code);
        Coupon saved = repo.save(c);
        saveScopes(saved.getId(), r);
        return toResWithScopes(saved);
    }

    public CouponResponse update(Integer id, CouponRequest r) {
        validate(r);
        Coupon c = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu giảm giá"));
        String code = r.getCode().trim();
        repo.findByCodeIgnoreCase(code).ifPresent(ex -> { if(!ex.getId().equals(id)) throw new IllegalArgumentException("Mã giảm giá đã tồn tại");});
        apply(c, r);
        c.setCode(code);
        Coupon saved = repo.save(c);
        clearScopes(id);
        saveScopes(id, r);
        return toResWithScopes(saved);
    }

    public void delete(Integer id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Không tìm thấy phiếu giảm giá");
        clearScopes(id);
        repo.deleteById(id);
    }

    public CouponResponse setActive(Integer id, boolean value) {
        Coupon c = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu giảm giá"));
        c.setActive(value);
        return toResWithScopes(repo.save(c));
    }

    /* ========== Public Apply (preview) ========== */

    public ApplyCouponResponse apply(ApplyCouponRequest req) {
        Coupon c = repo.findByCodeIgnoreCase(req.getCode().trim())
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không hợp lệ"));

        validateEligibility(c, req);

        Set<Integer> cats = catRepo.findByIdCouponId(c.getId()).stream().map(e->e.getId().getCategoryId()).collect(Collectors.toSet());
        Set<Integer> brands = brandRepo.findByIdCouponId(c.getId()).stream().map(e->e.getId().getBrandId()).collect(Collectors.toSet());
        Set<Integer> prods = prodRepo.findByIdCouponId(c.getId()).stream().map(e->e.getId().getProductId()).collect(Collectors.toSet());

        BigDecimal applicableSubtotal = BigDecimal.ZERO;
        for (CartItemDTO it : req.getItems()) {
            if (Boolean.TRUE.equals(c.getExcludeDiscountedItems()) && Boolean.TRUE.equals(it.getDiscounted())) continue;
            boolean inScope = isInScope(it, cats, brands, prods);
            if (inScope) {
                BigDecimal line = it.getUnitPrice().multiply(BigDecimal.valueOf(it.getQuantity()));
                applicableSubtotal = applicableSubtotal.add(line);
            }
        }

        if (!cats.isEmpty() || !brands.isEmpty() || !prods.isEmpty()) {
            if (applicableSubtotal.compareTo(BigDecimal.ZERO) <= 0)
                throw new IllegalArgumentException("Mã giảm giá không áp dụng cho các sản phẩm trong giỏ");
        } else {
            applicableSubtotal = req.getOrderTotal();
        }

        BigDecimal discount = calcDiscount(c, applicableSubtotal);
        BigDecimal finalTotal = req.getOrderTotal().subtract(discount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) finalTotal = BigDecimal.ZERO;

        ApplyCouponResponse res = new ApplyCouponResponse();
        res.setCode(c.getCode());
        res.setDiscountType(c.getDiscountType().name());
        res.setDiscountValue(c.getDiscountValue());
        res.setDiscountAmount(discount);
        res.setFinalTotal(finalTotal);
        res.setMessage("Áp dụng mã thành công");
        return res;
    }

    /* ========== Helpers ========== */

    private void validate(CouponRequest r) {
        if (!"percent".equals(r.getDiscountType()) && !"fixed".equals(r.getDiscountType()))
            throw new IllegalArgumentException("discountType phải là 'percent' hoặc 'fixed'");
        if ("percent".equals(r.getDiscountType())) {
            if (r.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0 ||
                r.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0)
                throw new IllegalArgumentException("Giá trị phần trăm phải trong (0, 100]");
        } else {
            if (r.getDiscountValue().compareTo(BigDecimal.ZERO) < 0)
                throw new IllegalArgumentException("Giá trị giảm cố định phải ≥ 0");
        }
        if (r.getStartDate()!=null && r.getEndDate()!=null && r.getStartDate().isAfter(r.getEndDate()))
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc");
    }

    private void apply(Coupon c, CouponRequest r) {
        c.setDescription(r.getDescription());
        c.setDiscountType(Coupon.DiscountType.valueOf(r.getDiscountType()));
        c.setDiscountValue(r.getDiscountValue());
        c.setMaxDiscountAmount(r.getMaxDiscountAmount());
        c.setMinOrderAmount(r.getMinOrderAmount());
        c.setExcludeDiscountedItems(Boolean.TRUE.equals(r.getExcludeDiscountedItems()));
        c.setApplicablePaymentMethods(trimToNull(r.getApplicablePaymentMethods()));
        c.setApplicableRoles(trimToNull(r.getApplicableRoles()));
        c.setRegionInclude(trimToNull(r.getRegionInclude()));
        c.setRegionExclude(trimToNull(r.getRegionExclude()));
        c.setFirstOrderOnly(Boolean.TRUE.equals(r.getFirstOrderOnly()));
        c.setStackable(Boolean.TRUE.equals(r.getStackable()));
        c.setMaxUses(r.getMaxUses());
        c.setMaxUsesPerUser(r.getMaxUsesPerUser());
        c.setStartDate(r.getStartDate());
        c.setEndDate(r.getEndDate());
        c.setActive(r.getActive() != null ? r.getActive() : true);
    }

    private void saveScopes(Integer couponId, CouponRequest r) {
        if (r.getCategoryIds()!=null) r.getCategoryIds().stream().distinct()
            .forEach(catId -> catRepo.save(new CouponCategory(couponId, catId)));
        if (r.getBrandIds()!=null) r.getBrandIds().stream().distinct()
            .forEach(brandId -> brandRepo.save(new CouponBrand(couponId, brandId)));
        if (r.getProductIds()!=null) r.getProductIds().stream().distinct()
            .forEach(prodId -> prodRepo.save(new CouponProduct(couponId, prodId)));
    }

    private void clearScopes(Integer couponId) {
        catRepo.deleteByIdCouponId(couponId);
        brandRepo.deleteByIdCouponId(couponId);
        prodRepo.deleteByIdCouponId(couponId);
    }

    private CouponResponse toResWithScopes(Coupon c) {
        CouponResponse r = new CouponResponse();
        r.setId(c.getId());
        r.setCode(c.getCode());
        r.setDescription(c.getDescription());
        r.setDiscountType(c.getDiscountType().name());
        r.setDiscountValue(c.getDiscountValue());
        r.setMaxDiscountAmount(c.getMaxDiscountAmount());
        r.setMinOrderAmount(c.getMinOrderAmount());
        r.setExcludeDiscountedItems(c.getExcludeDiscountedItems());
        r.setApplicablePaymentMethods(c.getApplicablePaymentMethods());
        r.setApplicableRoles(c.getApplicableRoles());
        r.setRegionInclude(c.getRegionInclude());
        r.setRegionExclude(c.getRegionExclude());
        r.setFirstOrderOnly(c.getFirstOrderOnly());
        r.setStackable(c.getStackable());
        r.setMaxUses(c.getMaxUses());
        r.setUsedCount(c.getUsedCount());
        r.setMaxUsesPerUser(c.getMaxUsesPerUser());
        r.setStartDate(c.getStartDate());
        r.setEndDate(c.getEndDate());
        r.setActive(c.getActive());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());

        r.setCategoryIds(catRepo.findByIdCouponId(c.getId()).stream().map(e->e.getId().getCategoryId()).toList());
        r.setBrandIds(   brandRepo.findByIdCouponId(c.getId()).stream().map(e->e.getId().getBrandId()).toList());
        r.setProductIds( prodRepo.findByIdCouponId(c.getId()).stream().map(e->e.getId().getProductId()).toList());
        return r;
    }

    private void validateEligibility(Coupon c, ApplyCouponRequest req) {
        LocalDateTime now = LocalDateTime.now();
        if (Boolean.FALSE.equals(c.getActive())) throw new IllegalArgumentException("Mã giảm giá đang bị tắt");
        if (c.getStartDate()!=null && now.isBefore(c.getStartDate())) throw new IllegalArgumentException("Mã giảm giá chưa bắt đầu áp dụng");
        if (c.getEndDate()!=null && now.isAfter(c.getEndDate())) throw new IllegalArgumentException("Mã giảm giá đã hết hạn");
        if (c.getMaxUses()!=null && c.getUsedCount()!=null && c.getUsedCount() >= c.getMaxUses())
            throw new IllegalArgumentException("Mã giảm giá đã được sử dụng hết");
        if (c.getMinOrderAmount()!=null && req.getOrderTotal().compareTo(c.getMinOrderAmount())<0)
            throw new IllegalArgumentException("Chưa đạt giá trị đơn tối thiểu");

        if (notBlank(c.getApplicablePaymentMethods())) {
            if (!csvContains(c.getApplicablePaymentMethods(), req.getPaymentMethod()))
                throw new IllegalArgumentException("Phương thức thanh toán không phù hợp");
        }
        if (notBlank(c.getApplicableRoles())) {
            if (!csvContains(c.getApplicableRoles(), req.getUserRole()))
                throw new IllegalArgumentException("Vai trò tài khoản không phù hợp");
        }
        if (notBlank(c.getRegionInclude())) {
            if (!csvContains(c.getRegionInclude(), req.getRegion()))
                throw new IllegalArgumentException("Khu vực không nằm trong phạm vi áp dụng");
        }
        if (notBlank(c.getRegionExclude())) {
            if (csvContains(c.getRegionExclude(), req.getRegion()))
                throw new IllegalArgumentException("Khu vực thuộc danh sách loại trừ");
        }
        if (Boolean.TRUE.equals(c.getFirstOrderOnly())) {
            if (req.getIsFirstOrder()==null || !req.getIsFirstOrder())
                throw new IllegalArgumentException("Mã chỉ áp dụng cho đơn đầu tiên");
        }
        if (c.getMaxUsesPerUser()!=null && c.getMaxUsesPerUser()>0) {
            if (req.getUserId()==null) throw new IllegalArgumentException("Cần đăng nhập để sử dụng mã này");
            CouponUse.CouponUseId id = new CouponUse.CouponUseId(c.getId(), req.getUserId());
            CouponUse u = useRepo.findById(id).orElse(null);
            int usedByUser = (u!=null?u.getUsedCount():0);
            if (usedByUser >= c.getMaxUsesPerUser())
                throw new IllegalArgumentException("Bạn đã sử dụng mã này đạt giới hạn cho phép");
        }
    }

    private BigDecimal calcDiscount(Coupon c, BigDecimal base) {
        BigDecimal d;
        if (c.getDiscountType()== Coupon.DiscountType.percent) {
            d = base.multiply(c.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (c.getMaxDiscountAmount()!=null && d.compareTo(c.getMaxDiscountAmount())>0) d = c.getMaxDiscountAmount();
        } else {
            d = c.getDiscountValue().min(base);
        }
        return d.max(BigDecimal.ZERO);
    }

    private boolean isInScope(CartItemDTO it, Set<Integer> cats, Set<Integer> brands, Set<Integer> prods) {
        boolean anyScope = !cats.isEmpty() || !brands.isEmpty() || !prods.isEmpty();
        if (!anyScope) return true;
        if (!prods.isEmpty() && it.getProductId()!=null && prods.contains(it.getProductId())) return true;
        if (!cats.isEmpty()  && it.getCategoryId()!=null && cats.contains(it.getCategoryId())) return true;
        if (!brands.isEmpty()&& it.getBrandId()!=null && brands.contains(it.getBrandId())) return true;
        return false;
    }

    private boolean notBlank(String s){ return s!=null && !s.trim().isEmpty(); }
    private boolean csvContains(String csv, String probe){
        if (!notBlank(csv)) return true;
        if (probe==null) return false;
        String p = probe.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(csv.split(",")).map(String::trim).map(v->v.toLowerCase(Locale.ROOT)).anyMatch(v->v.equals(p));
    }
    private String trimToNull(String s){ if (s==null) return null; String t=s.trim(); return t.isEmpty()?null:t; }

    /* Hook: OrderService gọi khi đơn hoàn tất để cộng usage */
    public void consume(Integer couponId, Integer userId) {
        Coupon c = repo.findById(couponId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu giảm giá"));
        c.setUsedCount((c.getUsedCount()==null?0:c.getUsedCount())+1);
        repo.save(c);
        if (userId!=null) {
            CouponUse.CouponUseId id = new CouponUse.CouponUseId(couponId, userId);
            CouponUse u = useRepo.findById(id).orElse(null);
            if (u==null) { u=new CouponUse(); u.setId(id); u.setUsedCount(1); }
            else { u.setUsedCount(u.getUsedCount()+1); }
            useRepo.save(u);
        }
    }
}
