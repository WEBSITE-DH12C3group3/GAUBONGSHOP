package com.thubongshop.backend.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Lấy danh sách review theo productId (phân trang)
    Page<Review> findByProductId(Integer productId, Pageable pageable);

    // Lấy trung bình rating và tổng số đánh giá
    @Query("SELECT AVG(r.rating) as avgRating, COUNT(r.id) as totalReviews " +
           "FROM Review r WHERE r.productId = :productId")
    ReviewStats getStatsByProduct(@Param("productId") Integer productId);
}
