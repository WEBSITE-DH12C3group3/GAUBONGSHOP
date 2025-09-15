package com.thubongshop.backend.attribute.controller;

import com.thubongshop.backend.attribute.Attribute;
import com.thubongshop.backend.attribute.AttributeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/attributes")
@CrossOrigin(origins = "*")
public class AttributeController {

    private final AttributeService service;

    public AttributeController(AttributeService service) {
        this.service = service;
    }

    // Lấy chi tiết 1 attribute
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Integer id) {
        Attribute att = service.get(id);
        return ResponseEntity.ok(Map.of("attribute", att));
    }

    // Client thường chỉ cần list attribute (không phân trang phức tạp)
    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String q) {
        var items = (q == null || q.isBlank())
                ? service.listAll()
                : service.listByKeyword(q);
        return ResponseEntity.ok(Map.of("items", items));
    }
}
