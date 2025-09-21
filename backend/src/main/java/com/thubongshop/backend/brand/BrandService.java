package com.thubongshop.backend.brand;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BrandService {

    private final BrandRepository repo;

    public BrandService(BrandRepository repo) {
        this.repo = repo;
    }

    public Page<BrandResponse> list(String q, Pageable pageable) {
        Page<Brand> page = (q == null || q.isBlank())
                ? repo.findAll(pageable)
                : repo.findByNameContainingIgnoreCase(q.trim(), pageable);
        return page.map(this::toResponse);
    }

    public BrandResponse get(Integer id) {
        Brand b = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));
        return toResponse(b);
    }

    // create: nếu tên đã tồn tại thì báo lỗi (đúng nghiệp vụ quản trị)
    public BrandResponse create(BrandRequest req) {
        String name = req.getName().trim();
        if (repo.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Brand name already exists");
        }
        Brand b = new Brand();
        b.setName(name);
        b.setDescription(req.getDescription());
        b.setLogoUrl(req.getLogoUrl());
        b.setWebsiteUrl(req.getWebsiteUrl());
        return toResponse(repo.save(b));
    }

    public BrandResponse update(Integer id, BrandRequest req) {
        Brand b = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        String newName = req.getName().trim();
        if (!b.getName().equalsIgnoreCase(newName) && repo.existsByNameIgnoreCase(newName)) {
            throw new IllegalArgumentException("Brand name already exists");
        }
        b.setName(newName);
        b.setDescription(req.getDescription());
        if (req.getLogoUrl() != null) b.setLogoUrl(req.getLogoUrl());
        b.setWebsiteUrl(req.getWebsiteUrl());
        return toResponse(repo.save(b));
    }

    public void delete(Integer id) {
        if (!repo.existsById(id)) {
            throw new IllegalArgumentException("Brand not found");
        }
        repo.deleteById(id);
    }

    private BrandResponse toResponse(Brand b) {
        BrandResponse r = new BrandResponse();
        r.setId(b.getId());
        r.setName(b.getName());
        r.setDescription(b.getDescription());
        r.setLogoUrl(b.getLogoUrl());
        r.setWebsiteUrl(b.getWebsiteUrl());
        r.setCreatedAt(b.getCreatedAt());
        return r;
    }
}
