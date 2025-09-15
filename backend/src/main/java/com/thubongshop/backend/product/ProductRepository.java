package com.thubongshop.backend.product;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.repository.query.Param;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("SELECT p FROM Product p " +
           "WHERE (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:categoryId IS NULL OR p.categoryId = :categoryId) " +
           "AND (:brandId IS NULL OR p.brandId = :brandId)")
    Page<Product> search(@Param("keyword") String keyword,
                         @Param("categoryId") Integer categoryId,
                         @Param("brandId") Integer brandId,
                         Pageable pageable);

    List<Product> findTopByCategoryIdAndIdNot(Integer categoryId, Integer excludeId, Pageable pageable);

    List<Product> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
