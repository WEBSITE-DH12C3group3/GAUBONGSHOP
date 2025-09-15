package com.thubongshop.backend.product.controller;

import com.thubongshop.backend.product.*;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

 // Danh sách sản phẩm (phân trang, tìm kiếm, lọc)
@GetMapping
public ResponseEntity<?> list(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false, name = "q") String q,   // alias cho keyword (nếu FE gửi q)
        @RequestParam(required = false) Integer categoryId,
        @RequestParam(required = false) Integer brandId,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size
) {
    // Ưu tiên keyword, nếu rỗng thì dùng q
    String kw = (keyword != null && !keyword.isBlank())
            ? keyword
            : (q != null && !q.isBlank() ? q : null);

    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<ProductResponse> data = service.search(kw, categoryId, brandId, minPrice, maxPrice, pageable);

    return ResponseEntity.ok(Map.of(
            "items", data.getContent(),
            "page", data.getNumber(),
            "size", data.getSize(),
            "totalPages", data.getTotalPages(),
            "totalElements", data.getTotalElements()
    ));
}


    // Chi tiết sản phẩm (bao gồm attributes + reviews)
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getFullDetail(id));
    }

    // Lấy sản phẩm mới nhất
    @GetMapping("/latest")
    public ResponseEntity<?> getLatest(@RequestParam(defaultValue = "5") int limit) {
        List<ProductResponse> items = service.getLatest(limit);
        return ResponseEntity.ok(Map.of("items", items));
    }

    // Lấy sản phẩm liên quan cùng danh mục
    @GetMapping("/{id}/related")
    public ResponseEntity<?> getRelated(@PathVariable Integer id,
                                        @RequestParam(defaultValue = "4") int limit) {
        List<ProductResponse> items = service.getRelated(id, limit);
        return ResponseEntity.ok(Map.of("items", items));
    }
}
