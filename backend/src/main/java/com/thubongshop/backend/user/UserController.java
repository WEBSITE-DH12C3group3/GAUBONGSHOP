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
@CrossOrigin(origins = "*")
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

    // Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        String result = userService.register(user);
        return ResponseEntity.ok(result);
    }

    // Đăng nhập
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
            UserDTO userDTO = new UserDTO(user);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userDTO);
            System.out.println("Login successful for email: " + request.getEmail());
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            System.out.println("Authentication failed for email: " + request.getEmail() + ", error: " + e.getMessage());
            return ResponseEntity.status(401).body("Sai email hoặc mật khẩu: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Unexpected error for email: " + request.getEmail() + ", error: " + e.getMessage());
            return ResponseEntity.status(500).body("Lỗi server khi tạo token: " + e.getMessage());
        }
    }

    // Lấy thông tin user hiện tại từ token
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            return userService.findByEmail(userDetails.getUsername())
                    .map(user -> ResponseEntity.ok(new UserDTO(user)))
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.status(401).body("Chưa đăng nhập");
    }
}
