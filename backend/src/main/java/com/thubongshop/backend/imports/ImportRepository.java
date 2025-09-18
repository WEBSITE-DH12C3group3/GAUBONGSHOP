package com.thubongshop.backend.imports;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportRepository extends JpaRepository<Import, Integer > {
    List<Import> findByStatus(String status);
    List<Import> findBySupplierId(Integer  supplierId);
    
}
