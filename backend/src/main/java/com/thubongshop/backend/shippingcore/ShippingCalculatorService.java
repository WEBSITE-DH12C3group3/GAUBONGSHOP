package com.thubongshop.backend.shippingcore;

import com.thubongshop.backend.shipping.carrier.ShippingCarrier;
import com.thubongshop.backend.shipping.carrier.ShippingCarrierRepo;
import com.thubongshop.backend.shipping.rate.CarrierRateRule;
import com.thubongshop.backend.shipping.rate.CarrierRateRuleRepo;
import com.thubongshop.backend.shipping.service.ShippingServiceEntity;
import com.thubongshop.backend.shipping.service.ShippingServiceRepo;
import com.thubongshop.backend.shippingcore.dto.ShippingQuote;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import com.thubongshop.backend.shippingvoucher.ShipVoucher;
import com.thubongshop.backend.shippingvoucher.ShipVoucherService;
import com.thubongshop.backend.warehouse.Warehouse;
import com.thubongshop.backend.warehouse.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShippingCalculatorService {

  private final ShippingCarrierRepo carrierRepo;
  private final ShippingServiceRepo serviceRepo;
  private final ShipVoucherService shipVoucherService;  // ✅ giữ lại 1 cái thôi
  private final CarrierRateRuleRepo rateRepo;
  private final WarehouseRepository warehouseRepository;

  @Qualifier("shippingCoreDistanceService")
  private final DistanceService distanceService;

  public ShippingQuote quote(ShippingQuoteRequest req) {
    // 1) Lấy kho active (điểm của shop/admin)
    Warehouse wh = warehouseRepository.findFirstByIsActiveTrue()
        .orElseThrow(() -> new IllegalStateException("No active warehouse configured"));

    if (req.destLat() == null || req.destLng() == null) {
      throw new IllegalArgumentException("Destination lat/lng is required");
    }

    // 2) Tính khoảng cách
    BigDecimal distanceKm = BigDecimal.valueOf(
        distanceService.haversineKm(
            wh.getLatitude().doubleValue(), wh.getLongitude().doubleValue(),
            req.destLat().doubleValue(), req.destLng().doubleValue()
        )
    ).setScale(2, RoundingMode.HALF_UP);

    // 3) Carrier + Service mặc định
    String carrierCode = (req.carrierCode() == null || req.carrierCode().isBlank()) ? "INTERNAL" : req.carrierCode();
    String serviceCode = (req.serviceCode() == null || req.serviceCode().isBlank()) ? "STD" : req.serviceCode();

    ShippingCarrier carrier = carrierRepo.findByCodeAndActiveTrue(carrierCode);
    if (carrier == null) {
      throw new IllegalStateException("Carrier not found or inactive: " + carrierCode);
    }

    ShippingServiceEntity service = serviceRepo.findByCarrier_IdAndCodeAndActiveTrue(carrier.getId(), serviceCode)
        .orElseThrow(() -> new IllegalStateException("Service not found or inactive: " + serviceCode));

    // 4) Chọn rate rule phù hợp theo distance
    List<CarrierRateRule> rules = null;
    try {
      rules = rateRepo.findMatchingRules(service.getId(), distanceKm);
    } catch (Throwable ignore) { /* repo có thể chưa có method này */ }
    if (rules == null || rules.isEmpty()) {
      try {
        rules = rateRepo.findByServiceIdOrderByMinKmAsc(service.getId());
      } catch (Throwable ignore) {}
    }

    CarrierRateRule rule = null;
    if (rules != null) {
      for (CarrierRateRule r : rules) {
        var min = r.getMinKm() == null ? BigDecimal.ZERO : r.getMinKm();
        var max = r.getMaxKm(); // null = vô cực
        boolean ok = distanceKm.compareTo(min) >= 0 && (max == null || distanceKm.compareTo(max) <= 0);
        if (ok) { rule = r; break; }
      }
      if (rule == null && !rules.isEmpty()) rule = rules.get(0);
    }
    if (rule == null) {
      throw new IllegalStateException("No carrier rate rule matched for distance " + distanceKm + "km");
    }

    // 5) Tính phí gốc
    BigDecimal base = nz(rule.getBaseFee());
    BigDecimal perKm = nz(rule.getPerKmFee());
    BigDecimal freeKm = nz(rule.getFreeKm());
    BigDecimal minFee = rule.getMinFee();

    BigDecimal billKm = distanceKm.subtract(freeKm);
    if (billKm.signum() < 0) billKm = BigDecimal.ZERO;

    BigDecimal fee = base.add(perKm.multiply(billKm));
    if (minFee != null && fee.compareTo(minFee) < 0) fee = minFee;
    fee = fee.setScale(0, RoundingMode.UP);

    // 6️⃣ Áp dụng voucher (nếu có)
    BigDecimal finalFee = fee;
    BigDecimal discount = BigDecimal.ZERO;

    if (req.voucherCode() != null && !req.voucherCode().isBlank()) {
      try {
        ShipVoucher voucher = shipVoucherService.getActiveOrThrow(req.voucherCode().trim());
        // Nếu bạn có hàm tính giảm cụ thể, gọi nó
        BigDecimal orderSubtotal = req.orderSubtotal() != null ? req.orderSubtotal() : BigDecimal.ZERO;

        // Áp dụng theo loại voucher
        switch (voucher.getDiscountType()) {
          case FREE -> {
            discount = fee;
          }
          case FIXED -> {
            discount = nz(voucher.getDiscountValue());
          }
          case PERCENT -> {
            discount = fee.multiply(voucher.getDiscountValue().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
          }
        }

        // Giới hạn giảm tối đa (nếu có)
        if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
          discount = voucher.getMaxDiscountAmount();
        }

        finalFee = fee.subtract(discount);
        if (finalFee.signum() < 0) finalFee = BigDecimal.ZERO;
      } catch (IllegalArgumentException ex) {
        // Mã không hợp lệ → bỏ qua
        // System.out.println("Voucher not applicable: " + ex.getMessage());
      }
    }

    // 7️⃣ Trả kết quả
    return new ShippingQuote(
        distanceKm,
        fee,        // feeBeforeVoucher
        finalFee,   // feeAfterVoucher
        service.getBaseDaysMin(),
        service.getBaseDaysMax(),
        carrierCode,
        serviceCode
    );
  }

  private static BigDecimal nz(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v;
  }
}
