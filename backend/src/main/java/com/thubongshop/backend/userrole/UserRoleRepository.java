// src/main/java/com/thubongshop/backend/userrole/UserRoleRepository.java
package com.thubongshop.backend.userrole;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
  boolean existsByUser_IdAndRole_Id(Long userId, Long roleId);
  void deleteByUser_IdAndRole_Id(Long userId, Long roleId);
  void deleteByUser_Id(Long userId);
}

