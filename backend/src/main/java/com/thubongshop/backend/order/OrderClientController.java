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

    BigDecimal feeBefore = nz(quote.feeBeforeVoucher());
    BigDecimal feeAfter  = nz(quote.feeAfterVoucher());
    BigDecimal discount  = feeBefore.subtract(feeAfter).max(BigDecimal.ZERO);

    var body = new ShippingPreviewResponse(
        quote.carrier(),
        quote.service(),
        quote.distanceKm(),
        feeBefore,
        discount,
        feeAfter,
        quote.etaDaysMin(),
        quote.etaDaysMax()
    );
    return ResponseEntity.ok(body);
  }

  // ===== DTO trả về cho preview (dùng để hiển thị) =====
  public record ShippingPreviewResponse(
      String carrier,
      String service,
      BigDecimal distanceKm,
      BigDecimal feeBeforeDiscount,
      BigDecimal discount,
      BigDecimal finalFee,
      Integer etaDaysMin,
      Integer etaDaysMax
  ) {}

  private static BigDecimal nz(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v;
  }
}
