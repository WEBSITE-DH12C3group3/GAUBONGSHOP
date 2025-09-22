package com.thubongshop.backend.order;

import com.thubongshop.backend.order.dto.OrderResponse;
import com.thubongshop.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@AuthenticationPrincipal UserPrincipal me) {
        OrderResponse resp = service.checkout(me.getId());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> myOrders(@AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(service.myOrders(me.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> myOrderDetail(@AuthenticationPrincipal UserPrincipal me,
                                                       @PathVariable Integer id) {
        return ResponseEntity.ok(service.myOrderDetail(me.getId(), id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(@AuthenticationPrincipal UserPrincipal me,
                                                @PathVariable Integer id) {
        return ResponseEntity.ok(service.cancelMyOrder(me.getId(), id));
    }
}
