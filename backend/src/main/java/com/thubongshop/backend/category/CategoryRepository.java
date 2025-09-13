package com.thubongshop.backend.category;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Page<Category> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String name, String description, Pageable pageable);
    
    boolean existsByNameIgnoreCase(String name);
    
    // ✅ Thêm method tìm categories nổi bật
    List<Category> findByIsFeaturedTrue();
    
    // ✅ Thêm method tìm categories nổi bật với phân trang
    Page<Category> findByIsFeaturedTrue(Pageable pageable);
    
    // ✅ Tìm kiếm kết hợp với nổi bật
    @Query("SELECT c FROM Category c WHERE " +
           "(c.name LIKE %:keyword% OR c.description LIKE %:keyword%) " +
           "AND (:featuredOnly IS NULL OR c.isFeatured = :featuredOnly)")
    Page<Category> searchCategories(
            @Param("keyword") String keyword,
            @Param("featuredOnly") Boolean featuredOnly,
            Pageable pageable);
}