package com.thubongshop.backend.category;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;

    public Page<Category> getAll(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return repository.findAll(pageable);
        }
        return repository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword, pageable);
    }

    public Category getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category create(Category category) {
        if (repository.existsByNameIgnoreCase(category.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }
        return repository.save(category);
    }

    public Category update(Long id, Category category) {
        Category existing = getById(id);
        if (!existing.getName().equalsIgnoreCase(category.getName())
                && repository.existsByNameIgnoreCase(category.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
