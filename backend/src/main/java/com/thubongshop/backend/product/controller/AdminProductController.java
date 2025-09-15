package com.thubongshop.backend.product.controller;

import com.thubongshop.backend.product.*;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "*")
public class AdminProductController {

    private final ProductService service;

    public AdminProductController(ProductService service) {
        this.service = service;
    }

    // Danh sách sản phẩm cho admin (quản lý)
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ProductResponse> data = service.listPaged(keyword, categoryId, brandId, pageable);

        return ResponseEntity.ok(Map.of(
                "items", data.getContent(),
                "page", data.getNumber(),
                "size", data.getSize(),
                "totalPages", data.getTotalPages(),
                "totalElements", data.getTotalElements()
        ));
    }

    // Chi tiết 1 sản phẩm
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getDetail(id));
    }

    // Tạo sản phẩm đơn giản
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductRequest req) {
        return ResponseEntity.ok(Map.of("product", service.create(req)));
    }

    // Tạo sản phẩm đầy đủ (có attributes + images)
    @PostMapping("/full")
    public ResponseEntity<?> createFull(@RequestBody ProductRequest req) {
        return ResponseEntity.ok(Map.of("product", service.createFull(req)));
    }

    // Cập nhật sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody ProductRequest req) {
        return ResponseEntity.ok(Map.of("product", service.update(id, req)));
    }

    // Xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
