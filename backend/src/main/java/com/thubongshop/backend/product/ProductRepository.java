package com.thubongshop.backend.product;

import org.springframework.data.domain.*;
// <-- THÊM
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;   // <-- THÊM

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("SELECT p FROM Product p " +
           "WHERE (:keyword IS NULL OR " +
           "       LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:categoryId IS NULL OR p.categoryId = :categoryId) " +
           "AND (:brandId IS NULL OR p.brandId = :brandId) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> search(@Param("keyword") String keyword,
                         @Param("categoryId") Integer categoryId,
                         @Param("brandId") Integer brandId,
                         @Param("minPrice") Double minPrice,
                         @Param("maxPrice") Double maxPrice,
                         Pageable pageable);

    List<Product> findByCategoryIdAndIdNot(Integer categoryId, Integer id, Pageable pageable);
    List<Product> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Product> findByIdIn(List<Long> ids);

    // ================== THÊM CÁC HÀM LIÊN QUAN TỒN KHO ==================

    /**
     * Giảm tồn kho nếu còn đủ hàng (an toàn khi nhiều người mua cùng lúc).
     * Dùng COALESCE để tránh stock NULL và điều kiện >= qty để chống over-sell.
     * Trả về số dòng bị ảnh hưởng:
     *  - 1: trừ thành công
     *  - 0: không đủ hàng / không tìm thấy / stock null
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE Product p SET p.stock = COALESCE(p.stock, 0) - :qty " +
           "WHERE p.id = :productId AND COALESCE(p.stock, 0) >= :qty")
    int tryDecrementStock(@Param("productId") Integer productId, @Param("qty") Integer qty);

    /**
     * Tăng lại tồn kho (dùng khi huỷ/hoàn đơn).
     * Dùng COALESCE để tránh stock NULL.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE Product p SET p.stock = COALESCE(p.stock, 0) + :qty WHERE p.id = :productId")
    int increaseStock(@Param("productId") Integer productId, @Param("qty") Integer qty);
}
