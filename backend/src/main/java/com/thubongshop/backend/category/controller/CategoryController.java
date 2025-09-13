package com.thubongshop.backend.category.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import com.thubongshop.backend.category.Category;
import com.thubongshop.backend.category.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    // Lấy danh sách category (phân trang, tìm kiếm, lọc)
    @GetMapping
    public Page<Category> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean featured) {

        String[] sortParams = sort.split(",");
        Pageable pageable = PageRequest.of(
                page, size, Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0])
        );

        return service.getAll(keyword, featured, pageable);
    }

    // API lấy danh sách categories nổi bật
    @GetMapping("/featured")
    public List<Category> getFeaturedCategories() {
        return service.getFeaturedCategories();
    }

    // Lấy chi tiết 1 category
    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
