package com.thubongshop.backend.shippingcore;

import com.thubongshop.backend.shippingcore.dto.ShippingQuote;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/public/shipping")
@RequiredArgsConstructor
public class PublicShippingController {

  private final ShippingCalculatorService calculator;

  /**
   * Trả báo giá vận chuyển công khai.
   * Giữ field cũ (legacy) và bổ sung field mới cho FE/DB.
   */
  @PostMapping("/quotes")
  public ResponseEntity<PublicQuoteResponse> quotes(@RequestBody ShippingQuoteRequest req) {
    ShippingQuote q = calculator.quote(req);

    BigDecimal feeBefore = nz(q.feeBeforeVoucher());
    BigDecimal feeAfter  = nz(q.feeAfterVoucher());
    BigDecimal discount  = feeBefore.subtract(feeAfter).max(BigDecimal.ZERO);

    // 🔹 Bổ sung: khai báo biến trước khi dùng
    String appliedVoucher = (req.voucherCode() != null && !req.voucherCode().isBlank())
        ? req.voucherCode().trim()
        : null;

    var body = new PublicQuoteResponse(
        q.carrier(),
        q.service(),
        q.distanceKm(),

        // ===== legacy =====
        feeBefore,
        discount,
        feeAfter,
        q.etaDaysMin(),
        q.etaDaysMax(),

        // ===== new fields =====
        feeBefore,
        discount,
        feeAfter,
        appliedVoucher,       // ✅ không còn lỗi, biến có sẵn
        q.etaDaysMin(),
        q.etaDaysMax()
    );

    return ResponseEntity.ok(body);
  }

  // ===== DTO phản hồi chuẩn hoá =====
  public record PublicQuoteResponse(
      String carrier,
      String service,
      BigDecimal distanceKm,

      // legacy
      BigDecimal feeBeforeDiscount,
      BigDecimal discount,
      BigDecimal finalFee,
      Integer etaDaysMin,
      Integer etaDaysMax,

      // new fields
      BigDecimal shippingFeeBefore,
      BigDecimal shippingDiscount,
      BigDecimal shippingFeeFinal,
      String voucherCode,
      Integer etaMin,
      Integer etaMax
  ) {}

  private static BigDecimal nz(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v;
  }
}
