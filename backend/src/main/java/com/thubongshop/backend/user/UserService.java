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

    // Đăng ký user mới
    public String register(User user) {
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            return "Email đã tồn tại!";
        }

        // Mã hoá password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set role mặc định CUSTOMER
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Role defaultRole = roleRepository.findById(2L)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy role CUSTOMER"));
            user.setRoles(Set.of(defaultRole));
        }

        userRepository.save(user);
        return "Đăng ký thành công!";
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
