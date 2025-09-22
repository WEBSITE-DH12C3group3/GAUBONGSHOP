package com.thubongshop.backend.order.controller;

import com.thubongshop.backend.order.OrderService;
import com.thubongshop.backend.order.OrderStatus;
import com.thubongshop.backend.order.dto.OrderResponse;
import com.thubongshop.backend.order.dto.UpdateOrderStatusRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService service;

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.adminList(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> detail(@PathVariable Integer id) {
        return ResponseEntity.ok(service.adminDetail(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Integer id,
                                                      @RequestBody UpdateOrderStatusRequest req) {
        return ResponseEntity.ok(service.adminUpdateStatus(id, req.getStatus()));
    }
}
