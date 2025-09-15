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
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService service;

    // ✅ Lấy danh sách category (phân trang, tìm kiếm, lọc, sort)
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean featuredOnly) {

        // Xử lý sort: "id,desc" -> ["id", "desc"]
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1
                ? Sort.Direction.fromString(sortParams[1])
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        Page<Category> data = service.getAll(keyword, featuredOnly, pageable);

        // Chuẩn hóa response
        Map<String, Object> resp = new HashMap<>();
        resp.put("items", data.getContent());
        resp.put("page", data.getNumber());
        resp.put("size", data.getSize());
        resp.put("totalPages", data.getTotalPages());
        resp.put("totalElements", data.getTotalElements());

        return ResponseEntity.ok(resp);
    }

    // ✅ Lấy category theo id
    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // ✅ Tạo mới category
    @PostMapping
    public Category create(@RequestBody Category category) {
        return service.create(category);
    }

    // ✅ Sửa category
    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody Category category) {
        return service.update(id, category);
    }

    // ✅ Xóa category
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
