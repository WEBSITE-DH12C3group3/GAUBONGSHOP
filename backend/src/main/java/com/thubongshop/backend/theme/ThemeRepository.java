package com.thubongshop.backend.theme;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ThemeRepository extends JpaRepository<Theme, Long> {
  Optional<Theme> findBySlug(String slug);
  boolean existsByName(String name);
  boolean existsBySlug(String slug);
  List<Theme> findAllByOrderByNameAsc();
}
