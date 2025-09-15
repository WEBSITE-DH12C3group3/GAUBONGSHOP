package com.thubongshop.backend.review;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository repo;

    public Page<Review> listByProduct(Integer productId, Pageable pageable) {
        return repo.findByProductId(productId, pageable);
    }

    public Review create(Review review) {
        return repo.save(review);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public double getAverageRating(Integer productId) {
        var reviews = repo.findByProductId(productId, Pageable.unpaged()).getContent();
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0);
    }

    public long getReviewCount(Integer productId) {
        return repo.findByProductId(productId, Pageable.unpaged()).getTotalElements();
    }
}
