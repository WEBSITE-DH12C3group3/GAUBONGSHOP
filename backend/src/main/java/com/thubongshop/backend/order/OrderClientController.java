package com.thubongshop.backend.order;

import com.thubongshop.backend.order.dto.ApplyVoucherPreviewRequest;
import com.thubongshop.backend.order.dto.CreateOrderRequest;
import com.thubongshop.backend.order.dto.OrderResponse;
import com.thubongshop.backend.security.UserPrincipal;
import com.thubongshop.backend.shippingcore.ShippingCalculatorService;
import com.thubongshop.backend.shippingcore.dto.ShippingQuote;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/client/orders")
@RequiredArgsConstructor
public class OrderClientController {

  private final OrderService orderService;
  private final ShippingCalculatorService shippingCalc;

  // ========== CREATE ORDER ==========
  // Body: CreateOrderRequest (đã có destLat/destLng)
  @PostMapping
  public ResponseEntity<OrderResponse> create(
      @AuthenticationPrincipal UserPrincipal me,
      @Valid @RequestBody CreateOrderRequest req
  ) {
    return ResponseEntity.ok(orderService.createOrder(req, me.getId()));
  }

  // ========== MY ORDERS (PAGED) ==========
  @GetMapping
  public Page<OrderResponse> myOrders(
      @AuthenticationPrincipal UserPrincipal me,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
    return orderService.findMyOrders(me.getId(), pageable);
  }

  // ========== GET ONE ==========
  @GetMapping("/{id}")
  public ResponseEntity<OrderResponse> getOne(
      @PathVariable Integer id,
      @AuthenticationPrincipal UserPrincipal me
  ) {
    return ResponseEntity.ok(orderService.getById(id, me.getId()));
  }

  // ========== PAY ==========
  @PostMapping("/{id}/pay")
  public ResponseEntity<OrderResponse> markPaid(
      @PathVariable Integer id,
      @AuthenticationPrincipal UserPrincipal me
  ) {
    return ResponseEntity.ok(orderService.markPaid(id, me.getId()));
  }

  // ========== CANCEL ==========
  @PostMapping("/{id}/cancel")
  public ResponseEntity<OrderResponse> cancel(
      @PathVariable Integer id,
      @AuthenticationPrincipal UserPrincipal me
  ) {
    return ResponseEntity.ok(orderService.cancel(id, me.getId()));
  }

  // ========== PREVIEW SHIPPING (không tạo đơn) ==========
  // Body: ApplyVoucherPreviewRequest (đã chuyển sang dùng destLat/destLng)
  @PostMapping("/preview-shipping")
  public ResponseEntity<ShippingPreviewResponse> previewShipping(
      @Valid @RequestBody ApplyVoucherPreviewRequest req
  ) {
    // 1) Tính báo giá ship (base + áp voucher ở tầng service nếu có)
    ShippingQuote quote = shippingCalc.quote(
        new ShippingQuoteRequest(
            req.orderSubtotal(),         // BigDecimal
            req.weightKg(),              // BigDecimal
            req.destLat(),               // BigDecimal
            req.destLng(),               // BigDecimal
            req.voucherCode(),           // String (optional)
            req.carrierCode(),           // String (optional, null = INTERNAL)
            req.serviceCode()            // String (optional, null = STD)
        )
    );

    // 2) Chuẩn hoá số liệu
    BigDecimal feeBefore = nz(quote.feeBeforeVoucher());
    BigDecimal feeAfter  = nz(quote.feeAfterVoucher());
    BigDecimal discount  = feeBefore.subtract(feeAfter).max(BigDecimal.ZERO);

    // 3) Xây response:
    //    - Trả cả "field mới" (shippingFeeBefore / shippingDiscount / shippingFeeFinal / voucherCode / etaMin / etaMax)
    //    - Giữ "field cũ" (feeBeforeDiscount / discount / finalFee / etaDaysMin / etaDaysMax) để FE cũ không vỡ
    var body = new ShippingPreviewResponse(
        quote.carrier(),
        quote.service(),
        quote.distanceKm(),

        // ===== legacy =====
        feeBefore,          // feeBeforeDiscount
        discount,           // discount
        feeAfter,           // finalFee
        quote.etaDaysMin(), // etaDaysMin
        quote.etaDaysMax(), // etaDaysMax

        // ===== new (khớp DB & FE hiện tại) =====
        feeBefore,          // shippingFeeBefore
        discount,           // shippingDiscount
        feeAfter,           // shippingFeeFinal
        req.voucherCode(), // voucherCode (nếu service đã áp)
        // map eta về tên mới (nếu FE đọc tên mới)
        quote.etaDaysMin(), // etaMin
        quote.etaDaysMax()  // etaMax
    );

    return ResponseEntity.ok(body);
  }

  // ===== DTO trả về cho preview (dùng để hiển thị) =====
  public record ShippingPreviewResponse(
      // ------ chung ------
      String carrier,
      String service,
      BigDecimal distanceKm,

      // ------ legacy fields (giữ nguyên để tương thích) ------
      BigDecimal feeBeforeDiscount,
      BigDecimal discount,
      BigDecimal finalFee,
      Integer etaDaysMin,
      Integer etaDaysMax,

      // ------ fields mới (khớp DB/FE đã sửa) ------
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
