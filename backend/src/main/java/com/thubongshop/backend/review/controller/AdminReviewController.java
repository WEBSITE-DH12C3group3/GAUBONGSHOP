package com.thubongshop.backend.review.controller;

import com.thubongshop.backend.review.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminReviewController {

    private final ReviewService service;

    // Admin có thể xóa review không hợp lệ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().body("Deleted");
    }
}
