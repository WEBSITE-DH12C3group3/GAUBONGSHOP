package com.thubongshop.backend.role;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.thubongshop.backend.user.User;
import com.thubongshop.backend.user.UserRepository;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleService service;
    private final UserRepository userRepo;   // ✅ THÊM DÒNG NÀY

    @GetMapping
    public List<Role> list() {
        return service.listAll();
    }

    @Data
    static class RoleReq { @NotBlank String name; }

    @PostMapping
    public ResponseEntity<Role> create(@RequestBody RoleReq body) {
        Role saved = service.create(body.getName());
        return ResponseEntity.created(URI.create("/api/admin/roles/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public Role rename(@PathVariable Long id, @RequestBody RoleReq body) {
        return service.rename(id, body.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/admin/roles/{id}/users?page=0&size=10&q=abc
    @GetMapping("/{id}/users")
    public Page<User> usersOfRole(
            @PathVariable("id") Long roleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return userRepo.searchUsers(q, roleId, pageable); // ✅ dùng repo
    }
}
