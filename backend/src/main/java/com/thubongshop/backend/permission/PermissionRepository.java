package com.thubongshop.backend.permission;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
  Optional<Permission> findByName(String name);
  List<Permission> findByNameIn(Collection<String> names);
}
