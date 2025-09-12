package com.thubongshop.backend.user;

import com.thubongshop.backend.role.Role;
import com.thubongshop.backend.role.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Đăng ký user mới từ DTO
     */
    public User registerUser(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email đã tồn tại!");
        }

        // Tạo user mới
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAddress(request.getAddress());
        user.setPhone(request.getPhone());

        // Gán role mặc định CUSTOMER (id = 2 hoặc name = "Customer")
        Role defaultRole = roleRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role CUSTOMER"));
        user.setRoles(Set.of(defaultRole));

        // Lưu user
        return userRepository.save(user);
    }

    /**
     * Tìm user theo email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
