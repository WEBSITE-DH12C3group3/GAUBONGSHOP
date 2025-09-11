package com.thubongshop.backend.product;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public Page<ProductResponse> list(String q, Integer categoryId, Integer brandId, Pageable pageable) {
        String keyword = (q == null || q.isBlank()) ? null : q.trim();
        return repo.search(keyword, categoryId, brandId, pageable).map(this::toResponse);
    }

    public ProductResponse get(Integer id) {
        Product p = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return toResponse(p);
    }

    public ProductResponse create(ProductRequest req) {
        Product p = new Product();
        apply(p, req);
        return toResponse(repo.save(p));
    }

    public ProductResponse update(Integer id, ProductRequest req) {
        Product p = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        apply(p, req);
        return toResponse(repo.save(p));
    }

    public void delete(Integer id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Product not found");
        repo.deleteById(id);
    }

    // Mapping
    private void apply(Product p, ProductRequest r) {
        p.setName(r.getName());
        p.setDescription(r.getDescription());
        p.setPrice(r.getPrice());
        p.setImageUrl(r.getImageUrl());
        p.setCategoryId(r.getCategoryId());
        p.setBrandId(r.getBrandId());
        p.setStock(r.getStock());
    }

    private ProductResponse toResponse(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setPrice(p.getPrice());
        r.setImageUrl(p.getImageUrl());
        r.setCategoryId(p.getCategoryId());
        r.setBrandId(p.getBrandId());
        r.setStock(p.getStock());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }
}
