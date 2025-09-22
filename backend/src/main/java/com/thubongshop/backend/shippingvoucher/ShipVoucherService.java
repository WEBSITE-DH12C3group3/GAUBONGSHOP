package com.thubongshop.backend.shippingvoucher;

import com.thubongshop.backend.shared.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ShipVoucherService {
  private final ShipVoucherRepo repo;

  public ShipVoucher getActiveOrThrow(String code) {
    var v = repo.findByCodeIgnoreCase(code)
      .orElseThrow(() -> new BusinessException("VOUCHER_NOT_FOUND", "Mã voucher không tồn tại"));
    validateUsable(v);
    return v;
  }

  public void validateUsable(ShipVoucher v) {
    var now = LocalDateTime.now();
    if (Boolean.FALSE.equals(v.getActive())) {
      throw new BusinessException("VOUCHER_INACTIVE", "Voucher đã bị vô hiệu hóa");
    }
    if (v.getStartAt() != null && now.isBefore(v.getStartAt()))
      throw new BusinessException("VOUCHER_NOT_STARTED", "Voucher chưa bắt đầu");
    if (v.getEndAt() != null && now.isAfter(v.getEndAt()))
      throw new BusinessException("VOUCHER_EXPIRED", "Voucher đã hết hạn");
    if (v.getUsageLimit() != null && v.getUsedCount() != null
        && v.getUsedCount() >= v.getUsageLimit())
      throw new BusinessException("VOUCHER_OUT_OF_STOCK", "Voucher đã hết lượt sử dụng");
  }

  public BigDecimal calcShippingDiscount(ShipVoucher v, BigDecimal feeBeforeDiscount, BigDecimal orderSubtotal) {
    if (v.getMinOrderAmount() != null && orderSubtotal != null
        && orderSubtotal.compareTo(v.getMinOrderAmount()) < 0) {
      throw new BusinessException("VOUCHER_MIN_ORDER", "Chưa đạt giá trị tối thiểu để dùng voucher");
    }

    BigDecimal discount = BigDecimal.ZERO;
    switch (v.getDiscountType()) {
      case free -> discount = feeBeforeDiscount;
      case percent -> {
        var raw = feeBeforeDiscount.multiply(v.getDiscountValue()).divide(new BigDecimal("100"));
        discount = capByMax(raw, v.getMaxDiscountAmount());
      }
      case fixed -> discount = capByMax(v.getDiscountValue(), v.getMaxDiscountAmount());
    }
    return discount;
  }

  public void increaseUsed(ShipVoucher v) {
    v.setUsedCount((v.getUsedCount() == null ? 0 : v.getUsedCount()) + 1);
    repo.save(v);
  }

  private BigDecimal capByMax(BigDecimal discount, BigDecimal max) {
    if (discount == null) discount = BigDecimal.ZERO;
    if (max == null || max.compareTo(BigDecimal.ZERO) <= 0) return discount;
    return discount.min(max);
  }
}
