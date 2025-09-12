package com.thubongshop.backend.supplier;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    Page<Supplier> findByNameContainingIgnoreCase(String q, Pageable pageable);
    boolean existsByNameIgnoreCase(String name);
    Optional<Supplier> findByNameIgnoreCase(String name);
}