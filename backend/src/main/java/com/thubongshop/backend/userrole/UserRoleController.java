package com.thubongshop.backend.userrole;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/user-roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserRoleController {

  private final UserRoleService service;

  // POST /api/admin/user-roles?userId=36&roleId=1
  @PostMapping
  public ResponseEntity<Void> add(
      @RequestParam Long userId,
      @RequestParam Long roleId
  ) {
    service.addUserToRole(userId, roleId);
    return ResponseEntity.ok().build();
  }

  // DELETE /api/admin/user-roles?userId=36&roleId=1
  @DeleteMapping
  public ResponseEntity<Void> remove(
      @RequestParam Long userId,
      @RequestParam Long roleId
  ) {
    service.removeUserFromRole(userId, roleId);
    return ResponseEntity.noContent().build();
  }

  // PUT /api/admin/user-roles/{userId}  (body: [1,2,3])
  @PutMapping("/{userId}")
  public ResponseEntity<Void> setRoles(
      @PathVariable Long userId,
      @RequestBody java.util.Set<Long> roleIds
  ) {
    service.setRolesForUser(userId, roleIds);
    return ResponseEntity.ok().build();
  }
}
