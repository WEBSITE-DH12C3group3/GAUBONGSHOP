package com.thubongshop.backend.coupon.controller;

import com.thubongshop.backend.coupon.dto.ApplyCouponRequest;
import com.thubongshop.backend.coupon.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// ==== thêm import để lấy user từ SecurityContext & xử lý role ====
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;


import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins="*")
public class CouponController {

    private final CouponService service;
    public CouponController(CouponService service){ this.service = service; }

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@Valid @RequestBody ApplyCouponRequest req) {
        try {
            // ===== LẤY THÔNG TIN ĐĂNG NHẬP TỪ SECURITY CONTEXT (nếu có) =====
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                Object principal = auth.getPrincipal();

                // userId: nếu FE chưa set thì tự nạp từ principal (nếu có getId())
                if (req.getUserId() == null && principal != null) {
                    try {
                        var m = principal.getClass().getMethod("getId");
                        Object id = m.invoke(principal);
                        if (id instanceof Integer i) {
                            req.setUserId(i);
                        } else if (id instanceof Number n) {
                            req.setUserId(n.intValue());
                        }
                    } catch (Exception ignored) {
                        // Nếu principal không có getId(), có thể nạp qua userService theo username (tùy dự án)
                        // Ví dụ: userService.findIdByUsername(auth.getName());
                    }
                }

                // userRole: nếu FE chưa set thì lấy role đầu tiên trong authorities (nếu có)
                if (req.getUserRole() == null && auth.getAuthorities() != null) {
                    for (GrantedAuthority ga : auth.getAuthorities()) {
                        if (ga != null && ga.getAuthority() != null && !ga.getAuthority().isBlank()) {
                            req.setUserRole(ga.getAuthority());
                            break;
                        }
                    }
                }
            }
            // =================================================================

            return ResponseEntity.ok(service.apply(req));

        } catch (IllegalArgumentException ex) {
            // Trả lỗi nghiệp vụ tiếng Việt (HTTP 400) cho FE hiển thị
            return ResponseEntity.badRequest().body(Map.of(
                "error", ex.getMessage()
            ));
        } catch (Exception ex) {
            // Lỗi không lường trước (HTTP 500) — không lộ chi tiết nội bộ
            return ResponseEntity.status(500).body(Map.of(
                "error", "Có lỗi xảy ra khi áp dụng mã giảm giá"
            ));
        }
    }
}
