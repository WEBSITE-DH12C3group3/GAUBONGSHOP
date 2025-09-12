package com.thubongshop.backend.supplier;

import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService service;

    public SupplierController(SupplierService service) {
        this.service = service;
    }

    // GET /api/suppliers?q=&page=0&size=10&sort=id,desc
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<SupplierResponse> data = service.list(q, pageable);
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
        return ResponseEntity.ok(Map.of("supplier", service.get(id)));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody SupplierRequest req) {
        return ResponseEntity.ok(Map.of("supplier", service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody SupplierRequest req) {
        return ResponseEntity.ok(Map.of("supplier", service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

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
