package com.thubongshop.backend.order;

import com.thubongshop.backend.order.ShippingRecord.ShipStatus;
import com.thubongshop.backend.order.dto.OrderResponse;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/shipping")
@RequiredArgsConstructor
public class OrderAdminController {
  private final OrderService orderService;

  public record UpdateShipRequest(
    @NotBlank String trackingCode,
    @NotBlank String status
  ) {}

  @PostMapping("/{orderId}/update")
  public ResponseEntity<OrderResponse> updateShip(@PathVariable Integer orderId, @RequestBody UpdateShipRequest req) {
    var newStatus = ShipStatus.valueOf(req.status());
    return ResponseEntity.ok(orderService.updateShipping(orderId, req.trackingCode(), newStatus));
  }
}
