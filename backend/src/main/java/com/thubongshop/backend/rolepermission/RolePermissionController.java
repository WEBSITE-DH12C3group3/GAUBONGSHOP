package com.thubongshop.backend.rolepermission;

import com.thubongshop.backend.permission.Permission;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonCreator.Mode;
import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RolePermissionController {

  private final RolePermissionService service;

  @GetMapping("/{roleId}/permissions")
  public List<Permission> list(@PathVariable Long roleId) {
    return service.listOfRole(roleId);
  }

  @PutMapping("/{roleId}/permissions")
  public ResponseEntity<List<Permission>> setAll(@PathVariable Long roleId,
                                                 @RequestBody(required = false) List<Long> ids) {
    service.setForRole(roleId, ids == null ? List.of() : ids);
    return ResponseEntity.ok(service.listOfRole(roleId));
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


