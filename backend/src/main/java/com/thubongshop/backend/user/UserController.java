package com.thubongshop.backend.user;

import com.thubongshop.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200") // FE Angular chạy ở 4200
public class UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    // ----------------------------
    // Đăng ký
    // ----------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            userService.registerUser(request);

            // Nếu muốn trả token luôn sau khi đăng ký:
            var user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user sau khi đăng ký"));
            UserDetails userDetails = org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .authorities("ROLE_USER") // hoặc map roles từ DB
                    .build();

            String token = jwtUtil.generateToken(userDetails); // ✅ đúng

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đăng ký thành công");
            response.put("token", token);
            response.put("user", new UserDTO(user));

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // ----------------------------
    // Đăng nhập
    // ----------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("Login attempt for email: " + request.getEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", new UserDTO(user));

            System.out.println("Login successful for email: " + request.getEmail());
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            System.out.println("Authentication failed for email: " + request.getEmail() + ", error: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", "Sai email hoặc mật khẩu"));
        } catch (Exception e) {
            System.out.println("Unexpected error for email: " + request.getEmail() + ", error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi server khi tạo token"));
        }
    }

    // ----------------------------
    // Lấy user hiện tại (dựa vào token)
    // ----------------------------
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            return userService.findByEmail(userDetails.getUsername())
                    .map(user -> ResponseEntity.ok(new UserDTO(user)))
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));
    }

    // ----------------------------
    // Cập nhật hồ sơ
    // ----------------------------
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                        @RequestBody UpdateProfileRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));
        }

        try {
            User updatedUser = userService.updateUserProfile(userDetails.getUsername(), request);
            return ResponseEntity.ok(new UserDTO(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi cập nhật hồ sơ: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(userDetails.getUsername(),
                                    request.getCurrentPassword(),
                                    request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }


}
