package com.thubongshop.backend.rolepermission;

import com.thubongshop.backend.permission.Permission;
import com.thubongshop.backend.permission.PermissionRepository;
import com.thubongshop.backend.role.Role;
import com.thubongshop.backend.role.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RolePermissionService {

  private final RoleRepository roleRepo;
  private final PermissionRepository permRepo;
  private final RolePermissionRepository rpRepo;

  @Transactional(readOnly = true)
  public List<Permission> listOfRole(Long roleId) {
    return rpRepo.findPermissionsOfRole(roleId);
  }

  @Transactional
  public void setForRole(Long roleId, List<Long> permissionIds) {
    Role role = roleRepo.findById(roleId).orElseThrow();
    // cách nhanh: xoá hết rồi ghi lại
    rpRepo.deleteByRole_Id(roleId);
    if (permissionIds == null || permissionIds.isEmpty()) return;

    List<Permission> perms = permRepo.findAllById(permissionIds);
    List<RolePermission> links = new ArrayList<>();
    for (Permission p : perms) {
      links.add(RolePermission.builder().role(role).permission(p).build());
    }
    rpRepo.saveAll(links);
  }

  @Transactional
  public RolePermission addOne(Long roleId, Long permId) {
    Role role = roleRepo.findById(roleId).orElseThrow();
    Permission perm = permRepo.findById(permId).orElseThrow();
    if (rpRepo.existsByRole_IdAndPermission_Id(roleId, permId)) return null;
    return rpRepo.save(RolePermission.builder().role(role).permission(perm).build());
  }

  @Transactional
  public void removeOne(Long roleId, Long permId) {
    rpRepo.deleteByRole_IdAndPermission_Id(roleId, permId);
  }
}
