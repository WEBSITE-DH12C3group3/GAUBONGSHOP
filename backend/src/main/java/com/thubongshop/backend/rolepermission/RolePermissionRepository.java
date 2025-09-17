package com.thubongshop.backend.rolepermission;

import com.thubongshop.backend.permission.Permission;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

  // Xóa tất cả permission của 1 role
  @Modifying
  @Query("delete from RolePermission rp where rp.role.id = :roleId")
  void deleteByRole_Id(@Param("roleId") Long roleId);

  // Kiểm tra tồn tại
  boolean existsByRole_IdAndPermission_Id(Long roleId, Long permissionId);

  // Xóa 1 permission khỏi 1 role
  @Modifying
  @Query("delete from RolePermission rp where rp.role.id = :roleId and rp.permission.id = :permId")
  void deleteByRole_IdAndPermission_Id(@Param("roleId") Long roleId, @Param("permId") Long permId);

  // Lấy danh sách Permission object của 1 role
  @Query("select rp.permission from RolePermission rp where rp.role.id = :roleId")
  List<Permission> findPermissionsOfRole(@Param("roleId") Long roleId);

  // Lấy các permission name theo nhiều role (dùng cho UserDetailsService)
  @Query("select p.name from RolePermission rp join rp.permission p where rp.role.id in :roleIds")
  List<String> findPermissionNamesOfRoles(@Param("roleIds") List<Long> roleIds);
}
