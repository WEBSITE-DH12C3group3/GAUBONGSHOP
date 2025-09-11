package com.thubongshop.backend.brand;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Integer> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Brand> findByNameIgnoreCase(String name);
    Page<Brand> findByNameContainingIgnoreCase(String q, Pageable pageable);
}
