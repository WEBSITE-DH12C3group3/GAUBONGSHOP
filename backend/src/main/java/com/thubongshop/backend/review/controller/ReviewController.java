package com.thubongshop.backend.review.controller;

import com.thubongshop.backend.review.Review;
import com.thubongshop.backend.review.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService service;

    // Lấy danh sách review theo product
    @GetMapping("/products/{productId}")
    public ResponseEntity<?> listByProduct(
            @PathVariable Integer productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("reviewDate").descending());
        Page<Review> data = service.listByProduct(productId, pageable);

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", data.getContent());
        resp.put("page", data.getNumber());
        resp.put("size", data.getSize());
        resp.put("totalPages", data.getTotalPages());
        resp.put("totalElements", data.getTotalElements());
        return ResponseEntity.ok(resp);
    }

    // Người dùng thêm review
    @PostMapping("/products/{productId}")
    public ResponseEntity<?> create(@PathVariable Long productId, @RequestBody Review req) {
        req.setProductId(productId);
        Review saved = service.create(req);
        return ResponseEntity.ok(Map.of("review", saved));
    }
}
