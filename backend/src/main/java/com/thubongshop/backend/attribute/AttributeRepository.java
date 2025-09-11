package com.thubongshop.backend.attribute;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttributeRepository extends JpaRepository<Attribute, Integer> {
    boolean existsByNameIgnoreCase(String name);
    Page<Attribute> findByNameContainingIgnoreCase(String q, Pageable pageable);
}
