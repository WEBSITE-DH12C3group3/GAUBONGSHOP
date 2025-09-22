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

@Service
@RequiredArgsConstructor
public class ShippingCalculatorService {
  private final ShippingRateRepo shippingRateRepo;
  private final ShipVoucherService voucherService;

  public ShippingQuote quote(ShippingQuoteRequest req) {
    var rates = shippingRateRepo.findByActiveTrue();
    if (rates.isEmpty()) throw new BusinessException("NO_RATE", "Chưa cấu hình ShippingRate nào");

    ShippingRate rate = rates.get(0);

    BigDecimal feeBeforeDiscount;
    if (rate.getFreeThreshold() != null
        && req.orderSubtotal().compareTo(rate.getFreeThreshold()) >= 0) {
      feeBeforeDiscount = BigDecimal.ZERO;
    } else {
      feeBeforeDiscount = rate.getBaseFee()
        .add(rate.getFeePerKg().multiply(req.weightKg()));
    }

    BigDecimal discount = BigDecimal.ZERO;
    String appliedVoucher = null;
    if (req.voucherCode() != null && !req.voucherCode().isBlank()) {
      ShipVoucher v = voucherService.getActiveOrThrow(req.voucherCode());
      discount = voucherService.calcShippingDiscount(v, feeBeforeDiscount, req.orderSubtotal());
      if (discount.compareTo(feeBeforeDiscount) > 0) discount = feeBeforeDiscount;
      appliedVoucher = v.getCode();
    }

    BigDecimal finalFee = feeBeforeDiscount.subtract(discount);

    return new ShippingQuote(rate.getCarrier(), rate.getBaseFee(), rate.getFeePerKg(),
      feeBeforeDiscount, discount, finalFee, appliedVoucher);
  }
}
