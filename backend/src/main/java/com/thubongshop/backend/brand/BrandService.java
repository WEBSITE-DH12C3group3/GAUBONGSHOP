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

    // create kiểu “upsert theo name” để dễ test:
    public BrandResponse create(BrandRequest req) {
        String name = req.getName().trim();
        Brand b = repo.findByNameIgnoreCase(name).orElseGet(Brand::new);
        b.setName(name);
        b.setDescription(req.getDescription());
        b.setLogoUrl(req.getLogoUrl());
        b.setWebsiteUrl(req.getWebsiteUrl());
        return toResponse(repo.save(b));
    }
    // Nếu bạn muốn STRICT (trùng tên báo lỗi), thay create() bằng:
    // if (repo.existsByNameIgnoreCase(name)) throw new IllegalArgumentException("Brand name already exists");

    public BrandResponse update(Integer id, BrandRequest req) {
        Brand b = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));
        String name = req.getName().trim();
        // không cho trùng tên với brand khác
        repo.findByNameIgnoreCase(name).ifPresent(ex -> {
            if (!ex.getId().equals(id)) {
                throw new IllegalArgumentException("Brand name already exists");
            }
        });
        b.setName(name);
        b.setDescription(req.getDescription());
        b.setLogoUrl(req.getLogoUrl());
        b.setWebsiteUrl(req.getWebsiteUrl());
        return toResponse(repo.save(b));
    }

    public void delete(Integer id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Brand not found");
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
