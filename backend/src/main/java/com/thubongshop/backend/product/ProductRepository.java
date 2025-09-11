package com.thubongshop.backend.product;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("""
       SELECT p FROM Product p
       WHERE (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')))
         AND (:categoryId IS NULL OR p.categoryId = :categoryId)
         AND (:brandId IS NULL OR p.brandId = :brandId)
    """)
    Page<Product> search(@Param("q") String q,
                         @Param("categoryId") Integer categoryId,
                         @Param("brandId") Integer brandId,
                         Pageable pageable);
}
