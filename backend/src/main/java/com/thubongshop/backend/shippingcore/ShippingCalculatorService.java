package com.thubongshop.backend.shippingcore;

import com.thubongshop.backend.shared.BusinessException;
import com.thubongshop.backend.shipping.ShippingRate;
import com.thubongshop.backend.shipping.ShippingRateRepo;
import com.thubongshop.backend.shippingcore.dto.ShippingQuote;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import com.thubongshop.backend.shippingvoucher.ShipVoucher;
import com.thubongshop.backend.shippingvoucher.ShipVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShippingCalculatorService {

  private final ShippingRateRepo shippingRateRepo;
  private final ShipVoucherService voucherService;

  /**
   * fee = baseFee + feePerKg * weightKg
   * - Nếu orderSubtotal >= freeThreshold ⇒ miễn phí
   * - Áp voucher (không cho âm)
   * Lưu ý: DTO hiện tại KHÔNG chứa distance/lat-lng ⇒ không tính theo km.
   */
  public ShippingQuote quote(ShippingQuoteRequest req) {
    if (req == null) throw new BusinessException("INVALID_REQUEST", "Thiếu dữ liệu tính phí.");

    BigDecimal orderSubtotal = nvl(req.orderSubtotal());
    BigDecimal weightKg      = maxZero(nvl(req.weightKg()));
    if (weightKg.compareTo(BigDecimal.ZERO) < 0) {
      throw new BusinessException("INVALID_WEIGHT", "Trọng lượng không hợp lệ.");
    }

    // Lấy rate đang active (ưu tiên carrier theo alphabet để deterministic)
    ShippingRate rate = pickActiveRate();

    // Tính phí trước giảm
    BigDecimal feeBeforeDiscount;
    if (rate.getFreeThreshold() != null
        && orderSubtotal.compareTo(nvl(rate.getFreeThreshold())) >= 0) {
      feeBeforeDiscount = BigDecimal.ZERO;
    } else {
      BigDecimal base  = nvl(rate.getBaseFee());
      BigDecimal perKg = nvl(rate.getFeePerKg());
      feeBeforeDiscount = base.add(perKg.multiply(weightKg));
    }
    feeBeforeDiscount = money(feeBeforeDiscount);

    // Áp voucher (nếu có)
    BigDecimal discount = BigDecimal.ZERO;
    String appliedVoucher = null;

    if (hasText(req.voucherCode())) {
      ShipVoucher v = voucherService.getActiveOrThrow(req.voucherCode().trim());
      discount = nvl(voucherService.calcShippingDiscount(v, feeBeforeDiscount, orderSubtotal));
      if (discount.compareTo(feeBeforeDiscount) > 0) discount = feeBeforeDiscount;
      appliedVoucher = v.getCode();
    }
    discount = money(discount);

    // Phí cuối
    BigDecimal finalFee = feeBeforeDiscount.subtract(discount);
    if (finalFee.compareTo(BigDecimal.ZERO) < 0) finalFee = BigDecimal.ZERO;
    finalFee = money(finalFee);

    // Giữ nguyên constructor 7 tham số bạn đang dùng
    return new ShippingQuote(
        rate.getCarrier(),
        money(nvl(rate.getBaseFee())),
        money(nvl(rate.getFeePerKg())),
        feeBeforeDiscount,
        discount,
        finalFee,
        appliedVoucher
    );
  }

  // -------------------- helpers --------------------

  private ShippingRate pickActiveRate() {
    List<ShippingRate> actives = shippingRateRepo.findByActiveTrue();
    if (actives == null || actives.isEmpty()) {
      throw new BusinessException("NO_RATE", "Chưa cấu hình ShippingRate nào.");
    }
    return actives.stream()
        .sorted(Comparator.comparing(r -> nvlStr(r.getCarrier())))
        .findFirst()
        .orElse(actives.get(0));
  }

  private static BigDecimal nvl(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
  private static BigDecimal maxZero(BigDecimal v) { return v.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : v; }
  private static BigDecimal money(BigDecimal v) { return nvl(v).setScale(0, RoundingMode.HALF_UP); }
  private static boolean hasText(String s) { return s != null && !s.trim().isEmpty(); }
  private static String nvlStr(String s) { return s != null ? s : ""; }
}
