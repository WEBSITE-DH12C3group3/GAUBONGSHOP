// src/main/java/com/thubongshop/backend/permission/PermissionController.java
package com.thubongshop.backend.permission;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // chỉ admin mới gọi được, tuỳ bạn
public class PermissionController {

  private final PermissionRepository repo;

  // Lấy toàn bộ quyền (FE sẽ dùng API này để render checkbox)
  @GetMapping
  public List<Permission> list() {
    return repo.findAll(Sort.by("id")); // hoặc Sort.by("name")
  }

  // (Tuỳ chọn) CRUD nếu bạn muốn quản trị quyền từ UI
  @PostMapping
  public Permission create(@RequestBody Permission req) {
    req.setId(null);
    return repo.save(req);
  }

  @PutMapping("/{id}")
  public Permission update(@PathVariable Long id, @RequestBody Permission req) {
    var p = repo.findById(id).orElseThrow();
    p.setName(req.getName());
    p.setDescription(req.getDescription());
    return repo.save(p);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    repo.deleteById(id);
  }
}
