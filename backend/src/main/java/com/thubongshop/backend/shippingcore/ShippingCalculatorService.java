package com.thubongshop.backend.shippingcore;

import com.thubongshop.backend.shared.BusinessException;
import com.thubongshop.backend.shipping.ShippingRate;
import com.thubongshop.backend.shipping.ShippingRateRepo;
import com.thubongshop.backend.shippingcore.dto.ShippingQuote;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import com.thubongshop.backend.shippingvoucher.ShipVoucher;
import com.thubongshop.backend.shippingvoucher.ShipVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
  private final DistanceService distanceService;

  @Value("${shipping.perKm:0}")
  private BigDecimal perKm; // VND/km

  @Value("${shop.origin.lat:0}")
  private double shopLat;
  @Value("${shop.origin.lng:0}")
  private double shopLng;

  public ShippingQuote quote(ShippingQuoteRequest req) {
    if (req == null) throw new BusinessException("INVALID", "Thiếu dữ liệu báo giá");

    BigDecimal orderSubtotal = nvl(req.orderSubtotal());
    BigDecimal weightKg      = nvl(req.weightKg());

    // ===== Tính khoảng cách (nếu chưa có) =====
    Double distanceKm = req.distanceKm();
    if (distanceKm == null && req.address() != null
        && req.address().lat() != null && req.address().lng() != null) {
      distanceKm = distanceService.haversineKm(
          shopLat, shopLng, req.address().lat(), req.address().lng());
    }

    // Lấy rate đang active
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
      if (perKm != null && perKm.compareTo(BigDecimal.ZERO) > 0 && distanceKm != null) {
        feeBeforeDiscount = feeBeforeDiscount.add(
            perKm.multiply(BigDecimal.valueOf(distanceKm)));
      }
    }

    // ===== Áp voucher (đÃ sửa tên hàm & tham số) =====
    BigDecimal discount = BigDecimal.ZERO;
    if (req.voucherCode() != null && !req.voucherCode().isBlank()) {
      ShipVoucher v = voucherService.getActiveOrThrow(req.voucherCode());
      discount = voucherService.calcShippingDiscount(
          v, feeBeforeDiscount, orderSubtotal);
    }

    BigDecimal finalFee = maxZero(feeBeforeDiscount.subtract(discount));

    return new ShippingQuote(
        nvlStr(rate.getCarrier()),
        money(nvl(rate.getBaseFee())),
        money(nvl(rate.getFeePerKg())),
        money(feeBeforeDiscount),
        money(discount),
        money(finalFee),
        (req.voucherCode() != null && !req.voucherCode().isBlank()) ? req.voucherCode() : null
    );
  }

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
  private static String nvlStr(String s) { return s != null ? s : ""; }
}
