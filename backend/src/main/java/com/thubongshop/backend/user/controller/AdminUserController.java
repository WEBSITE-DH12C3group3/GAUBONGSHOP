// src/main/java/com/thubongshop/backend/user/controller/AdminUserController.java
package com.thubongshop.backend.user.controller;

import com.thubongshop.backend.role.Role;
import com.thubongshop.backend.role.RoleRepository;
import com.thubongshop.backend.user.User;
import com.thubongshop.backend.user.UserRepository;
import com.thubongshop.backend.userrole.UserRole;
import com.thubongshop.backend.userrole.UserRoleRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final UserRoleRepository userRoleRepo;
    private final PasswordEncoder passwordEncoder;

    /* =========================
     * GET /api/admin/users
     * ?q=&roleId=&excludeRoles=ADMIN,CUSTOMER&page=0&size=10
     * ========================= */
    @GetMapping
    public Page<User> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false, defaultValue = "") String excludeRoles,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<User> p = userRepo.searchUsers(q, roleId, pageable);

        // Loại trừ theo tên role (client yêu cầu)
        Set<String> excludes = Arrays.stream(excludeRoles.split(","))
                .map(String::trim).filter(s -> !s.isEmpty())
                .map(String::toUpperCase).collect(Collectors.toSet());

        if (excludes.isEmpty()) return p;

        List<User> filtered = p.getContent().stream()
                .filter(u -> u.getRoles() == null || u.getRoles().stream()
                        .map(Role::getName)
                        .map(n -> n == null ? "" : n.toUpperCase())
                        .noneMatch(excludes::contains))
                .toList();

        // Giữ totalElements gốc để phân trang ổn định
        return new PageImpl<>(filtered, pageable, p.getTotalElements());
    }

    /* =========================
     * POST /api/admin/users
     * Tạo tài khoản mới + gán role nếu có
     * ========================= */
    @PostMapping
    @Transactional
    public ResponseEntity<User> create(@RequestBody CreateUserReq body) {
      if (userRepo.existsByEmailIgnoreCase(body.getEmail())) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã tồn tại");
      }

      User u = new User();
      u.setUsername(body.getUsername());
      u.setPhone(body.getPhone());
      u.setEmail(body.getEmail());
      u.setPassword(passwordEncoder.encode(body.getPassword()));
      u = userRepo.save(u);

      // Nếu FE vẫn gửi mảng roleIds, lấy phần tử đầu (nếu có)
      Long roleId = null;
      if (body.getRoleId() != null) {
        roleId = body.getRoleId();
      } else if (body.getRoleIds() != null && !body.getRoleIds().isEmpty()) {
        roleId = body.getRoleIds().get(0);
      }

      if (roleId != null) {
        doAssign(u.getId(), roleId);
      }

      URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
          .path("/{id}").buildAndExpand(u.getId()).toUri();
      return ResponseEntity.created(uri).body(u);
    }


    /* =========================
     * PUT /api/admin/users/{userId}/roles/{roleId}
     * (alias cũ) POST /api/admin/users/assign?userId=&roleId=
     * ========================= */
    @PutMapping("/{userId}/roles/{roleId}")
    @Transactional
    public ResponseEntity<Void> addToRolePath(
            @PathVariable Long userId, @PathVariable Long roleId) {
        doAssign(userId, roleId);
        return ResponseEntity.ok().build();
    }

    
    @PostMapping(path = "/assign", params = {"userId","roleId"})
    public ResponseEntity<Void> addToRole(@RequestParam Long userId, @RequestParam Long roleId) {
      doAssign(userId, roleId);  // move luôn
      return ResponseEntity.ok().build();
    }


    /* =========================
     * DELETE /api/admin/users/{userId}/roles/{roleId}
     * (alias cũ) DELETE /api/admin/users/assign?userId=&roleId=
     * ========================= */
    @DeleteMapping(path = "/assign", params = {"userId","roleId"})
    public ResponseEntity<Void> removeFromRole(@RequestParam Long userId, @RequestParam Long roleId) {
      userRoleRepo.deleteByUser_IdAndRole_Id(userId, roleId);
      return ResponseEntity.noContent().build();
    }


    // @DeleteMapping(path = "/assign", params = {"userId","roleId"})
    // @Transactional
    // public ResponseEntity<Void> removeFromRoleQuery(
    //         @RequestParam Long userId, @RequestParam Long roleId) {
    //     userRoleRepo.deleteByUser_IdAndRole_Id(userId, roleId);
    //     return ResponseEntity.noContent().build();
    // }

    /* ===== Helper ===== */
    @Transactional
    private void doAssign(Long userId, Long roleId) {
      // Nếu đã cùng role thì bỏ qua
      if (userRoleRepo.existsByUser_IdAndRole_Id(userId, roleId)) return;

      // Xoá mọi role cũ của user để đảm bảo chỉ còn 1
      userRoleRepo.deleteByUser_Id(userId);

      User u = userRepo.findById(userId)
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User không tồn tại"));
      Role r = roleRepo.findById(roleId)
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role không tồn tại"));
      UserRole ur = UserRole.builder()
          .user(u)
          .role(r)
          .build();
      userRoleRepo.save(ur);

    }



    /* ===== DTO ===== */
    @Data
    public static class CreateUserReq {
      private String username;
      private String phone;
      @NotBlank @Email private String email;
      @NotBlank @Size(min = 6) private String password;

      private Long roleId;            // MỚI: 1 role duy nhất
      private List<Long> roleIds;     // CŨ: vẫn cho phép, nhưng chỉ lấy phần tử đầu nếu có
    }

}
