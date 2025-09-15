package com.thubongshop.backend.productattribute.controller;

import com.thubongshop.backend.productattribute.ProductAttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/product-attributes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductAttributeController {

    private final ProductAttributeService service;

    // Lấy thuộc tính của 1 sản phẩm (client chỉ cần read)
    @GetMapping("/products/{productId}")
    public ResponseEntity<?> listForProduct(@PathVariable Integer productId) {
        return ResponseEntity.ok(Map.of("items", service.getAttributesForProduct(productId)));
    }
}
