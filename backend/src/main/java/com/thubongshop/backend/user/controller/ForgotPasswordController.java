package com.thubongshop.backend.user.controller;

import com.thubongshop.backend.user.reset.PasswordResetService;
import com.thubongshop.backend.user.reset.dto.ForgotPasswordRequest;
import com.thubongshop.backend.user.reset.dto.ResetPasswordRequest;
import com.thubongshop.backend.user.reset.dto.VerifyCodeRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/forgot-password")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final PasswordResetService resetService;

    /** POST /api/users/forgot-password/request  { email } */
    @PostMapping("/request")
    public ResponseEntity<?> request(@Valid @RequestBody ForgotPasswordRequest req) {
        try {
            resetService.createAndSendCode(req.getEmail());
            return ResponseEntity.ok(Map.of("message", "Đã gửi mã xác thực tới email"));
        } catch (IllegalArgumentException e) {
            // Tránh lộ email tồn tại hay không? Tuỳ bạn.
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    /** POST /api/users/forgot-password/verify  { email, code } */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@Valid @RequestBody VerifyCodeRequest req) {
        try {
            resetService.verifyCode(req.getEmail(), req.getCode());
            return ResponseEntity.ok(Map.of("message", "Mã hợp lệ"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    /** POST /api/users/forgot-password/reset  { email, code, newPassword } */
    @PostMapping("/reset")
    public ResponseEntity<?> reset(@Valid @RequestBody ResetPasswordRequest req) {
        try {
            resetService.resetPassword(req.getEmail(), req.getCode(), req.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }
}
