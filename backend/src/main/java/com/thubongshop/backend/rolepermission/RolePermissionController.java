package com.thubongshop.backend.rolepermission;

import com.thubongshop.backend.permission.Permission;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RolePermissionController {

  private final RolePermissionService service;

  // ✅ Chỉ còn MỘT GET duy nhất cho permissions của role
  @GetMapping("/{roleId}/permissions")
  public List<Permission> list(@PathVariable Long roleId) {
    // Chọn 1 trong 2 service call dưới đây tuỳ bạn muốn dùng hàm nào.
    // return service.listOfRole(roleId);
    return service.getPermissionsOfRole(roleId);
  }

  @PutMapping("/{roleId}/permissions")
  public ResponseEntity<List<Permission>> setAll(@PathVariable Long roleId,
                                                 @RequestBody(required = false) List<Long> ids) {
    service.setForRole(roleId, (ids == null) ? List.of() : ids);
    // Trả lại danh sách hiện tại sau khi set (giữ nguyên hành vi cũ)
    return ResponseEntity.ok(service.getPermissionsOfRole(roleId));
  }

  @PostMapping("/{roleId}/permissions/{permId}")
  public ResponseEntity<Void> addOne(@PathVariable Long roleId, @PathVariable Long permId) {
    service.addOne(roleId, permId);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{roleId}/permissions/{permId}")
  public ResponseEntity<Void> removeOne(@PathVariable Long roleId, @PathVariable Long permId) {
    service.removeOne(roleId, permId);
    return ResponseEntity.noContent().build();
  }
}
