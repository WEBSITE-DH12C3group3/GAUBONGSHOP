package com.thubongshop.backend.category;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;

    public Page<Category> getAll(String keyword, Pageable pageable) {
        return getAll(keyword, null, pageable);
    }

    // ✅ Overload method để hỗ trợ lọc theo trạng thái nổi bật
    public Page<Category> getAll(String keyword, Boolean featuredOnly, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            if (featuredOnly != null) {
                return featuredOnly ? 
                    repository.findByIsFeaturedTrue(pageable) : 
                    repository.findAll(pageable);
            }
            return repository.findAll(pageable);
        }
        
        if (featuredOnly != null) {
            return repository.searchCategories(keyword, featuredOnly, pageable);
        }
        
        return repository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            keyword, keyword, pageable);
    }

    // ✅ Lấy danh sách categories nổi bật
    public List<Category> getFeaturedCategories() {
        return repository.findByIsFeaturedTrue();
    }

    public Category getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category create(Category category) {
        if (repository.existsByNameIgnoreCase(category.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }
        // ✅ Đảm bảo isFeatured không null
        if (category.getIsFeatured() == null) {
            category.setIsFeatured(false);
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
        existing.setIsFeatured(category.getIsFeatured()); // ✅ Cập nhật trạng thái nổi bật
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}