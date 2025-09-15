package com.thubongshop.backend.productattribute.controller;

import com.thubongshop.backend.productattribute.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/product-attributes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminProductAttributeController {

    private final ProductAttributeService service;

    // Lấy toàn bộ attribute của sản phẩm
    @GetMapping("/products/{productId}")
    public ResponseEntity<?> listForProduct(@PathVariable Integer productId) {
        return ResponseEntity.ok(Map.of("items", service.getAttributesForProduct(productId)));
    }

    // Gán / update 1 attribute cho sản phẩm
    @PostMapping("/products/{productId}/{attributeId}")
    public ResponseEntity<?> upsertOne(@PathVariable Integer productId,
                                       @PathVariable Integer attributeId,
                                       @RequestBody Map<String, String> body) {
        String value = body.get("value");
        return ResponseEntity.ok(Map.of("item", service.upsertOne(productId, attributeId, value)));
    }

    // Thay thế toàn bộ thuộc tính của sản phẩm
    @PostMapping("/products/{productId}")
    public ResponseEntity<?> replaceAll(@PathVariable Integer productId,
                                        @RequestBody List<Map<String, Object>> body) {
        List<ProductAttribute> attrs = new ArrayList<>();
        for (Map<String, Object> m : body) {
            Integer attId = ((Number) m.get("attributeId")).intValue();
            String val = Objects.toString(m.get("value"), "");
            ProductAttribute pa = new ProductAttribute();
            pa.setId(new ProductAttributeKey(productId, attId));
            pa.setValue(val);
            attrs.add(pa);
        }
        return ResponseEntity.ok(Map.of("items", service.replaceAll(productId, attrs)));
    }

    // Xóa 1 attribute khỏi sản phẩm
    @DeleteMapping("/products/{productId}/{attributeId}")
    public ResponseEntity<?> deleteOne(@PathVariable Integer productId,
                                       @PathVariable Integer attributeId) {
        service.deleteOne(productId, attributeId);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
