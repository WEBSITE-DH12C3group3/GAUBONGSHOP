package com.thubongshop.backend.order;

import com.thubongshop.backend.order.dto.ApplyVoucherPreviewRequest;
import com.thubongshop.backend.order.dto.CreateOrderRequest;
import com.thubongshop.backend.order.dto.OrderResponse;
import com.thubongshop.backend.shippingcore.ShippingCalculatorService;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client/orders")
@RequiredArgsConstructor
public class OrderClientController {

  private final OrderService orderService;
  private final ShippingCalculatorService shippingCalc;

  @PostMapping
  public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req) {
    return ResponseEntity.ok(orderService.createOrder(req));
  }

  @GetMapping
  public Page<OrderResponse> myOrders(
      @RequestParam Integer userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return orderService.findMyOrders(userId, PageRequest.of(page, size, Sort.by("id").descending()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<OrderResponse> getOne(@PathVariable Integer id, @RequestParam Integer userId) {
    return ResponseEntity.ok(orderService.getById(id, userId));
  }

  @PostMapping("/{id}/pay")
  public ResponseEntity<OrderResponse> markPaid(@PathVariable Integer id, @RequestParam Integer userId) {
    return ResponseEntity.ok(orderService.markPaid(id, userId));
  }

  @PostMapping("/{id}/cancel")
  public ResponseEntity<OrderResponse> cancel(@PathVariable Integer id, @RequestParam Integer userId) {
    return ResponseEntity.ok(orderService.cancel(id, userId));
  }

  @PostMapping("/preview-shipping")
  public ResponseEntity<?> preview(@Valid @RequestBody ApplyVoucherPreviewRequest req) {
    var q = shippingCalc.quote(new ShippingQuoteRequest(
      req.orderSubtotal(), req.weightKg(), null, req.voucherCode()
    ));
    return ResponseEntity.ok(q);
  }
}
