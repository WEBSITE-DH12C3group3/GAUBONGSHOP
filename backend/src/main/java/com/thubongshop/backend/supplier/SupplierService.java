package com.thubongshop.backend.supplier;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SupplierService {

    private final SupplierRepository repo;

    public SupplierService(SupplierRepository repo) {
        this.repo = repo;
    }

    public Page<SupplierResponse> list(String q, Pageable pageable) {
        Page<Supplier> page = (q == null || q.isBlank())
                ? repo.findAll(pageable)
                : repo.findByNameContainingIgnoreCase(q.trim(), pageable);
        return page.map(this::toResponse);
    }

    public SupplierResponse get(Integer id) {
        Supplier s = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        return toResponse(s);
    }

    public SupplierResponse create(SupplierRequest req) {
        String name = req.getName().trim();
        if (repo.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Supplier name already exists");
        }
        Supplier s = new Supplier();
        apply(s, req);
        s.setName(name);
        return toResponse(repo.save(s));
    }

    public SupplierResponse update(Integer id, SupplierRequest req) {
        Supplier s = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        String name = req.getName().trim();
        repo.findByNameIgnoreCase(name).ifPresent(ex -> {
            if (!ex.getId().equals(id)) throw new IllegalArgumentException("Supplier name already exists");
        });
        apply(s, req);
        s.setName(name);
        return toResponse(repo.save(s));
    }

    public void delete(Integer id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Supplier not found");
        // FK imports.supplier_id ON DELETE SET NULL trong DB của bạn ⇒ xoá an toàn
        repo.deleteById(id);
    }

    private void apply(Supplier s, SupplierRequest r) {
        s.setContactPerson(r.getContactPerson());
        s.setPhone(r.getPhone());
        s.setEmail(r.getEmail());
        s.setAddress(r.getAddress());
    }

    private SupplierResponse toResponse(Supplier s) {
        SupplierResponse r = new SupplierResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setContactPerson(s.getContactPerson());
        r.setPhone(s.getPhone());
        r.setEmail(s.getEmail());
        r.setAddress(s.getAddress());
        r.setCreatedAt(s.getCreatedAt());
        r.setUpdatedAt(s.getUpdatedAt());
        return r;
    }
}
