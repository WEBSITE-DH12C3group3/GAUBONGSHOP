package com.thubongshop.backend.role;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleService service;

    // >>> Cái UI của bạn đang gọi endpoint này
    @GetMapping
    public List<Role> list() {
        return service.listAll();
    }

    @Data static class RoleReq { @NotBlank String name; }

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
}
