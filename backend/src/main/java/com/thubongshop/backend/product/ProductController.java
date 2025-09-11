package com.thubongshop.backend.product;

import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<ProductResponse> data = service.list(q, categoryId, brandId, pageable);

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", data.getContent());
        resp.put("page", data.getNumber());
        resp.put("size", data.getSize());
        resp.put("totalPages", data.getTotalPages());
        resp.put("totalElements", data.getTotalElements());

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return ResponseEntity.ok(Map.of("product", service.get(id)));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(Map.of("product", service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(Map.of("product", service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // Helper build Pageable
    private Pageable buildPageable(int page, int size, String sort) {
        try {
            String[] sp = sort.split(",");
            String field = sp[0];
            Sort.Direction dir = (sp.length > 1) ? Sort.Direction.fromString(sp[1]) : Sort.Direction.DESC;
            return PageRequest.of(page, size, Sort.by(dir, field));
        } catch (Exception e) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        }
    }
}
