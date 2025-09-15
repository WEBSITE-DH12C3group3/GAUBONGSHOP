package com.thubongshop.backend.category.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.thubongshop.backend.category.Category;
import com.thubongshop.backend.category.CategoryService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService service;

    // Lấy danh sách category (phân trang, tìm kiếm, lọc)
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean featured) {

        String[] sortParams = sort.split(",");
        Pageable pageable = PageRequest.of(
                page, size, Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0])
        );

        Page<Category> data = service.getAll(keyword, featured, pageable);

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", data.getContent());
        resp.put("page", data.getNumber());
        resp.put("size", data.getSize());
        resp.put("totalPages", data.getTotalPages());
        resp.put("totalElements", data.getTotalElements());

        return ResponseEntity.ok(resp);
    }

    // Lấy chi tiết category
    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // Tạo category
    @PostMapping
    public Category create(@RequestBody Category category) {
        return service.create(category);
    }

    // Cập nhật category
    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody Category category) {
        return service.update(id, category);
    }

    // Xóa category
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
