package com.thubongshop.backend.cart.controller;

import com.thubongshop.backend.cart.CartService;
import com.thubongshop.backend.cart.dto.CartSummaryResponse;
import com.thubongshop.backend.cart.dto.MergeCartRequest;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

/**
 * REST Controller cho giỏ hàng người dùng.
 * Base path: /api/cart
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final HttpServletRequest httpRequest;

    // ===== Helper: Lấy userId hiện tại =====
    private Integer currentUserId() {
        // 1) Nếu bạn dùng Spring Security với Principal có getId()
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                Object principal = auth.getPrincipal();
                if (principal != null) {
                    try {
                        var m = principal.getClass().getMethod("getId");
                        Object id = m.invoke(principal);
                        if (id != null) return Integer.valueOf(Objects.toString(id));
                    } catch (Exception ignore) {}
                }
            }
        } catch (Exception ignore) {}

        // 2) Dev/test: cho phép lấy tạm từ header "X-USER-ID"
        String raw = httpRequest.getHeader("X-USER-ID");
        if (raw != null && !raw.isBlank()) {
            try { return Integer.valueOf(raw.trim()); } catch (Exception ignore) {}
        }

        // 3) Không xác định được userId
        throw new RuntimeException("Không xác định được userId. Hãy đăng nhập hoặc cung cấp header X-USER-ID.");
    }

    // ====== LẤY GIỎ HÀNG ======
    @GetMapping
    public ResponseEntity<CartSummaryResponse> getMyCart() {
        Integer userId = currentUserId();
        CartSummaryResponse resp = cartService.getMyCart(userId);
        return ResponseEntity.ok(resp);
    }

    // ====== THÊM SẢN PHẨM ======
    @PostMapping("/add")
    public ResponseEntity<CartSummaryResponse> add(@RequestBody AddCartRequest req) {
        Integer userId = currentUserId();
        if (req == null || req.getProductId() == null) {
            throw new IllegalArgumentException("Thiếu productId");
        }
        int qty = (req.getQuantity() == null || req.getQuantity() <= 0) ? 1 : req.getQuantity();
        CartSummaryResponse resp = cartService.add(userId, req.getProductId(), qty);
        return ResponseEntity.ok(resp);
    }

    // DTO nhỏ cho /add
    public static class AddCartRequest {
        private Integer productId;
        private Integer quantity;
        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    // ====== CẬP NHẬT SỐ LƯỢNG ======
    @PatchMapping("/item/{productId}")
    public ResponseEntity<CartSummaryResponse> updateQuantity(
            @PathVariable Integer productId,
            @RequestBody UpdateQtyRequest req
    ) {
        Integer userId = currentUserId();
        if (req == null || req.getQuantity() == null) {
            throw new IllegalArgumentException("Thiếu quantity");
        }
        CartSummaryResponse resp = cartService.updateQuantity(userId, productId, req.getQuantity());
        return ResponseEntity.ok(resp);
    }

    public static class UpdateQtyRequest {
        private Integer quantity;
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    // ====== XÓA MỘT ITEM ======
    @DeleteMapping("/item/{productId}")
    public ResponseEntity<CartSummaryResponse> removeItem(@PathVariable Integer productId) {
        Integer userId = currentUserId();
        CartSummaryResponse resp = cartService.remove(userId, productId);
        return ResponseEntity.ok(resp);
    }

    // ====== XÓA TOÀN BỘ GIỎ ======
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        Integer userId = currentUserId();
        cartService.clear(userId);
        return ResponseEntity.noContent().build();
    }

    // ====== CHỌN/BỎ CHỌN 1 ITEM ======
    @PatchMapping("/item/{productId}/select")
    public ResponseEntity<CartSummaryResponse> setSelected(
            @PathVariable Integer productId,
            @RequestBody SelectOneRequest req
    ) {
        Integer userId = currentUserId();
        boolean selected = req != null && Boolean.TRUE.equals(req.getSelected());
        CartSummaryResponse resp = cartService.setSelected(userId, productId, selected);
        return ResponseEntity.ok(resp);
    }

    public static class SelectOneRequest {
        private Boolean selected;
        public Boolean getSelected() { return selected; }
        public void setSelected(Boolean selected) { this.selected = selected; }
    }

    // ====== CHỌN/BỎ CHỌN TẤT CẢ ======
    @PatchMapping("/select-all")
    public ResponseEntity<CartSummaryResponse> setAllSelected(
            @RequestParam(defaultValue = "true") boolean selected
    ) {
        Integer userId = currentUserId();
        CartSummaryResponse resp = cartService.setAllSelected(userId, selected);
        return ResponseEntity.ok(resp);
    }

    // ====== LẤY TẬP DÙNG ĐỂ CHECKOUT ======
    @GetMapping("/checkout-items")
    public ResponseEntity<CartSummaryResponse> checkoutItems() {
        Integer userId = currentUserId();
        CartSummaryResponse resp = cartService.getCheckoutSet(userId);
        return ResponseEntity.ok(resp);
    }

    // ====== ⭐ MERGE GIỎ KHÁCH VÃNG LAI VÀO DB KHI ĐĂNG NHẬP ======
    @PostMapping("/merge")
    public ResponseEntity<CartSummaryResponse> merge(@RequestBody MergeCartRequest req) {
        Integer userId = currentUserId();
        CartSummaryResponse resp = cartService.mergeGuestCart(userId,
                (req != null) ? req.getItems() : null);
        return ResponseEntity.ok(resp);
    }
}
