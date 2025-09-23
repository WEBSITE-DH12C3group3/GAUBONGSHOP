package com.thubongshop.backend.user.controller;

import com.thubongshop.backend.rolepermission.RolePermissionRepository;
import com.thubongshop.backend.security.JwtUtil;
import com.thubongshop.backend.user.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.thubongshop.backend.role.Role;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;
    private final RolePermissionRepository rolePermRepo;

    // ----------------------------
    // Đăng ký
    // ----------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            userService.registerUser(request);
            var user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user sau khi đăng ký"));

            UserDetails userDetails = org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .authorities("ROLE_CUSTOMER") // mặc định khách hàng
                    .build();

            String token = jwtUtil.generateToken(userDetails);

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
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 👉 Lấy roleId duy nhất (1 user – 1 role)
            Long roleId = user.getRoles().stream()
                    .findFirst()
                    .map(Role::getId)
                    .orElse(null);

            // 👉 Lấy permissions từ role
            List<String> permissions = (roleId == null)
                    ? List.of()
                    : rolePermRepo.findPermissionNamesOfRoles(List.of(roleId));

            // 👉 Trả về đầy đủ
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", new UserDTO(user));
            response.put("permissions", permissions);

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Sai email hoặc mật khẩu"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi server khi tạo token: " + e.getMessage()));
        }
    }

    // ----------------------------
    // Lấy user hiện tại
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
    // Hồ sơ đầy đủ (user + roles + permissions)
    // ----------------------------
    @GetMapping("/me/profile")
    public ResponseEntity<?> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Chưa đăng nhập"));
        }

        User user = userService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Long roleId = user.getRoles().stream()
                .findFirst()
                .map(Role::getId)
                .orElse(null);

        // 👉 lấy permission có cả description
        // 👉 lấy permission có cả description
        // 👉 lấy permission có cả description
        List<Map<String, Object>> permissions = (roleId == null)
                ? List.of()
                : rolePermRepo.findPermissionsOfRoles(List.of(roleId))
                        .stream()
                        .map(p -> {
                            Map<String, Object> m = new HashMap<>();
                            m.put("id", p.getId());
                            m.put("name", p.getName());
                            m.put("description", p.getDescription());
                            return m;
                        })
                        .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("user", new UserDTO(user));
        response.put("roles", user.getRoles());
        response.put("permissions", permissions);

        return ResponseEntity.ok(response);
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
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails userDetails,
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
