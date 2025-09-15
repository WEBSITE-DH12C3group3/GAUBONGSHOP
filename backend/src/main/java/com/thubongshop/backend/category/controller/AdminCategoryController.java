package com.thubongshop.backend.category.controller;

import com.thubongshop.backend.category.Category;
import com.thubongshop.backend.category.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService service;

    // ✅ Lấy danh sách categories có phân trang + tìm kiếm
    @GetMapping
    public Page<Category> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean featuredOnly
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return service.getAll(keyword, featuredOnly, pageable);
    }

    // ✅ Lấy category theo id
    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) {
        return service.getById(id);
    }

    // ✅ Thêm category
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
