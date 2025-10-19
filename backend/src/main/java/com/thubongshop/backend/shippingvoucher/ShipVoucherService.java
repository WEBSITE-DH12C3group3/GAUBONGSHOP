package com.thubongshop.backend.shippingvoucher;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Locale;
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

  // ======================================================================
  // ===================== PHẦN BỔ SUNG CHO SHIPPING =======================
  // ======================================================================

  /**
   * Áp dụng voucher vào phí vận chuyển.
   * @param code           mã voucher người dùng nhập
   * @param baseShipping   phí ship gốc (chưa giảm)
   * @param orderSubtotal  tiền hàng (để kiểm tra min_order_amount)
   * @param carrier        hãng vận chuyển (để lọc applicable_carriers), có thể null
   * @return kết quả áp dụng: feeBefore/discount/final/voucherCode
   * @throws IllegalArgumentException nếu voucher không hợp lệ / không áp dụng được
   */
  @Transactional(readOnly = true)
  public ApplyResult applyToShippingOrThrow(
      String code,
      BigDecimal baseShipping,
      BigDecimal orderSubtotal,
      String carrier
  ) {
    ShipVoucher v = getActiveOrThrow(code); // đã trim & validate cơ bản
    // kiểm tra các điều kiện áp dụng tuỳ thuộc cài đặt trong DB
    validateBusinessRulesOrThrow(v, baseShipping, orderSubtotal, carrier);

    BigDecimal discount = calcDiscount(v, baseShipping);
    // không cho giảm quá baseShipping
    if (discount.compareTo(baseShipping) > 0) discount = baseShipping;

    BigDecimal finalFee = baseShipping.subtract(discount);
    if (finalFee.compareTo(BigDecimal.ZERO) < 0) finalFee = BigDecimal.ZERO;

    // làm tròn tiền (0 số lẻ: VND)
    discount = discount.setScale(0, RoundingMode.HALF_UP);
    finalFee = finalFee.setScale(0, RoundingMode.HALF_UP);

    return new ApplyResult(
        baseShipping.setScale(0, RoundingMode.HALF_UP),
        discount,
        finalFee,
        v.getCode()
    );
  }

  /** Kiểm tra các rule nghiệp vụ trước khi tính giảm: min order, min ship fee, applicable carriers. */
  private void validateBusinessRulesOrThrow(
      ShipVoucher v,
      BigDecimal baseShipping,
      BigDecimal orderSubtotal,
      String carrier
  ) {
    // min_order_amount
    if (v.getMinOrderAmount() != null && orderSubtotal != null) {
      if (orderSubtotal.compareTo(v.getMinOrderAmount()) < 0) {
        throw new IllegalArgumentException("Order subtotal is below voucher's minimum requirement");
      }
    }

    // min_shipping_fee
    if (v.getMinShippingFee() != null && baseShipping != null) {
      if (baseShipping.compareTo(v.getMinShippingFee()) < 0) {
        throw new IllegalArgumentException("Shipping fee is below voucher's minimum requirement");
      }
    }

    // applicable_carriers (csv, không phân biệt hoa/thường)
    if (v.getApplicableCarriers() != null && !v.getApplicableCarriers().isBlank()) {
      if (carrier == null || carrier.isBlank()) {
        throw new IllegalArgumentException("Carrier is not eligible for this voucher");
      }
      if (!carrierAllowed(v.getApplicableCarriers(), carrier)) {
        throw new IllegalArgumentException("Carrier is not eligible for this voucher");
      }
    }

    // (Optional) region include/exclude có thể thêm tuỳ nhu cầu
    // String regionInclude = v.getRegionInclude();
    // String regionExclude = v.getRegionExclude();
  }

  /** Tính số tiền giảm dựa trên discountType/value và maxDiscountAmount. */
  private BigDecimal calcDiscount(ShipVoucher v, BigDecimal baseShipping) {
    BigDecimal discount = BigDecimal.ZERO;
    if (v.getDiscountType() == null) return BigDecimal.ZERO;

    switch (v.getDiscountType()) {
      case FREE -> discount = baseShipping; // miễn phí ship
      case PERCENT -> {
        BigDecimal percent = v.getDiscountValue() != null ? v.getDiscountValue() : BigDecimal.ZERO;
        // percent = 10 => giảm 10% phí ship
        discount = baseShipping.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
      }
      case FIXED -> {
        discount = v.getDiscountValue() != null ? v.getDiscountValue() : BigDecimal.ZERO;
      }
      default -> discount = BigDecimal.ZERO;
    }

    // max_discount_amount
    if (v.getMaxDiscountAmount() != null && v.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
      if (discount.compareTo(v.getMaxDiscountAmount()) > 0) {
        discount = v.getMaxDiscountAmount();
      }
    }

    return discount.max(BigDecimal.ZERO);
  }

  /** kiểm tra carrier có nằm trong danh sách được phép (csv) */
  private boolean carrierAllowed(String carriersCsv, String carrier) {
    String normCarrier = carrier.trim().toLowerCase(Locale.ROOT);
    return Arrays.stream(carriersCsv.split(","))
        .map(s -> s.trim().toLowerCase(Locale.ROOT))
        .filter(s -> !s.isBlank())
        .anyMatch(s -> s.equals(normCarrier));
  }

  /** Kết quả áp dụng cho preview/tạo đơn. */
  public record ApplyResult(
      BigDecimal feeBefore,
      BigDecimal discount,
      BigDecimal finalFee,
      String voucherCode
  ) {}
}
