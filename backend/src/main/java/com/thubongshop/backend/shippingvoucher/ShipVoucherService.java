package com.thubongshop.backend.shippingvoucher;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ShipVoucherService {
  private final ShipVoucherRepo repo;

  public ShipVoucherService(ShipVoucherRepo repo) {
    this.repo = repo;
  }

  public ShipVoucher create(ShipVoucherRequest req) {
    ShipVoucher v = new ShipVoucher();
    apply(v, req);
    return repo.save(v);
  }

  public ShipVoucher update(Integer id, ShipVoucherRequest req) {
    Optional<ShipVoucher> existing = repo.findById(id);
    if (existing.isEmpty()) return null;
    ShipVoucher v = existing.get();
    apply(v, req);
    return repo.save(v);
  }

  public ShipVoucher setActive(Integer id, boolean active) {
    Optional<ShipVoucher> opt = repo.findById(id);
    if (opt.isEmpty()) return null;
    ShipVoucher v = opt.get();
    v.setActive(active);
    return repo.save(v);
  }

  public ShipVoucherResponse toResponse(ShipVoucher v) {
    return new ShipVoucherResponse(
        v.getId(),
        v.getCode(),
        v.getDescription(),
        v.getDiscountType() != null ? v.getDiscountType().name() : null,
        v.getDiscountValue(),
        v.getMaxDiscountAmount(),
        v.getMinOrderAmount(),
        v.getMinShippingFee(),
        v.getApplicableCarriers(),
        v.getRegionInclude(),
        v.getRegionExclude(),
        v.getMaxUses(),
        v.getUsedCount(),
        v.getMaxUsesPerUser(),
        v.getStartDate(),
        v.getEndDate(),
        v.getActive(),
        v.getCreatedAt(),
        v.getUpdatedAt()
    );
  }

  private void apply(ShipVoucher v, ShipVoucherRequest r) {
    v.setCode(r.code.trim());
    v.setDescription(r.description);
    if (r.discountType != null) {
      v.setDiscountType(ShipVoucher.DiscountType.valueOf(r.discountType.trim().toUpperCase()));
    }
    v.setDiscountValue(r.discountValue);
    v.setMaxDiscountAmount(r.maxDiscountAmount);
    v.setMinOrderAmount(r.minOrderAmount);
    v.setMinShippingFee(r.minShippingFee);
    v.setApplicableCarriers(r.applicableCarriers);
    v.setRegionInclude(r.regionInclude);
    v.setRegionExclude(r.regionExclude);
    v.setMaxUses(r.maxUses);
    v.setUsedCount(r.usedCount != null ? r.usedCount : 0);
    v.setMaxUsesPerUser(r.maxUsesPerUser);
    v.setStartDate(r.startDate);
    v.setEndDate(r.endDate);
    v.setActive(r.active != null ? r.active : Boolean.TRUE);
  }

  /* ---------- BỔ SUNG: các hàm đang bị gọi từ nơi khác ---------- */

  /** Lấy voucher theo code và kiểm tra “đang dùng được”. Nếu không hợp lệ -> throw IllegalArgumentException. */
  @Transactional(readOnly = true)
  public ShipVoucher getActiveOrThrow(String code) {
    if (code == null || code.isBlank()) {
      throw new IllegalArgumentException("Voucher code is empty");
    }
    ShipVoucher v = repo.findByCodeIgnoreCase(code.trim())
        .orElseThrow(() -> new IllegalArgumentException("Shipping voucher not found: " + code));

    validateOrThrow(v);
    return v;
  }

  /** Tăng bộ đếm số lần sử dụng (used_count) và lưu lại. */
  @Transactional
  public ShipVoucher increaseUsed(ShipVoucher v) {
    if (v == null || v.getId() == null) {
      throw new IllegalArgumentException("Voucher is null");
    }
    int current = v.getUsedCount() != null ? v.getUsedCount() : 0;
    v.setUsedCount(current + 1);
    return repo.save(v);
  }

  /** Kiểm tra voucher có thể dùng (true/false) — vẫn giữ để nơi khác có thể dùng. */
  public boolean validateUsable(ShipVoucher v) {
    try {
      validateOrThrow(v);
      return true;
    } catch (IllegalArgumentException ex) {
      return false;
    }
  }

  /* ---------- Helpers ---------- */

  private void validateOrThrow(ShipVoucher v) {
    if (v == null) throw new IllegalArgumentException("Voucher is null");
    if (v.getActive() == null || !v.getActive()) {
      throw new IllegalArgumentException("Voucher is not active");
    }

    LocalDateTime now = LocalDateTime.now();
    if (v.getStartDate() != null && now.isBefore(v.getStartDate())) {
      throw new IllegalArgumentException("Voucher is not started yet");
    }
    if (v.getEndDate() != null && now.isAfter(v.getEndDate())) {
      throw new IllegalArgumentException("Voucher is expired");
    }

    // Giới hạn tổng số lượt
    if (v.getMaxUses() != null) {
      int used = v.getUsedCount() != null ? v.getUsedCount() : 0;
      if (used >= v.getMaxUses()) {
        throw new IllegalArgumentException("Voucher usage limit reached");
      }
    }
    // (Nếu cần, có thể bổ sung kiểm tra maxUsesPerUser ở service khác, vì cần userId)
  }
}
