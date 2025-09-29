package com.thubongshop.backend.orderv2;

import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.*;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/admin/orders")
@RequiredArgsConstructor
public class OrderV2AdminController {
  private final OrderV2Service service;

  @GetMapping
  public ResponseEntity<Page<OrderListItemDto>> list(
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) int size
  ) {
    return ResponseEntity.ok(service.pageAdmin(status, page, size));
  }

  @GetMapping("/{id}")
  public ResponseEntity<OrderDetailDto> detail(@PathVariable Integer id) {
    var d = service.detail(id);
    return d == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(d);
  }

  @PostMapping("/{id}/status")
  public ResponseEntity<OrderDetailDto> updateStatus(@PathVariable Integer id,
                                                     @RequestBody AdminStatusUpdateRequest req) {
    return ResponseEntity.ok(service.adminSetStatus(id, req.status()));
  }

  @PostMapping("/{id}/cancel")
  public ResponseEntity<OrderDetailDto> cancel(@PathVariable Integer id) {
    return ResponseEntity.ok(service.adminSetStatus(id, OrderStatus.CANCELED.name()));
  }
}
