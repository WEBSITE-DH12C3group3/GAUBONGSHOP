package com.thubongshop.backend.attribute;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttributeRepository extends JpaRepository<Attribute, Integer> {

    boolean existsByNameIgnoreCase(String name);

    // Admin dùng (có phân trang)
    Page<Attribute> findByNameContainingIgnoreCase(String q, Pageable pageable);

    // Client dùng (không phân trang)
    List<Attribute> findByNameContainingIgnoreCase(String q);
}
