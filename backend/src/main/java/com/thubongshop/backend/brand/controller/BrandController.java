package com.thubongshop.backend.brand.controller;

import com.thubongshop.backend.brand.BrandResponse;
import com.thubongshop.backend.brand.BrandService;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/brands")
@CrossOrigin(origins = "*")
public class BrandController {

    private final BrandService service;

    public BrandController(BrandService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name,asc") String sort,
            @RequestParam(required = false) String q
    ) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<BrandResponse> data = service.list(q, pageable);
        return ResponseEntity.ok(Map.of(
                "content", data.getContent(),
                "number", data.getNumber(),
                "size", data.getSize(),
                "totalElements", data.getTotalElements(),
                "totalPages", data.getTotalPages()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        return ResponseEntity.ok(Map.of("brand", service.get(id)));
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
