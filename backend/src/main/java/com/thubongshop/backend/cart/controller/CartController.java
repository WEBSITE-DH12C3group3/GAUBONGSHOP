package com.thubongshop.backend.cart.controller;

import com.thubongshop.backend.cart.CartService;
import com.thubongshop.backend.cart.dto.*;
import com.thubongshop.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CartController {

    private final CartService service;

    @GetMapping
    public ResponseEntity<?> getMyCart(@AuthenticationPrincipal UserPrincipal me) {
        var resp = service.getMyCart(me.getId());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@AuthenticationPrincipal UserPrincipal me,
                                 @RequestBody AddCartRequest req) {
        var resp = service.add(me.getId(), req.getProductId(), req.getQuantity());
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/item")
    public ResponseEntity<?> update(@AuthenticationPrincipal UserPrincipal me,
                                    @RequestBody UpdateCartRequest req) {
        var resp = service.updateQty(me.getId(), req.getProductId(), req.getQuantity());
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/item/{productId}")
    public ResponseEntity<?> remove(@AuthenticationPrincipal UserPrincipal me,
                                    @PathVariable Integer productId) {
        var resp = service.remove(me.getId(), productId);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clear(@AuthenticationPrincipal UserPrincipal me) {
        service.clear(me.getId());
        return ResponseEntity.noContent().build();
    }
}
