package com.thubongshop.backend.attribute;

import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/attributes")
@CrossOrigin(origins = "*")
public class AttributeController {

    private final AttributeService service;

    public AttributeController(AttributeService service) {
        this.service = service;
    }

    // ---------- CRUD Attribute ----------

    // List + search + paging
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<Attribute> data = service.list(q, pageable);
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
        return ResponseEntity.ok(Map.of("attribute", service.get(id)));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Attribute req) {
        return ResponseEntity.ok(Map.of("attribute", service.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Attribute req) {
        return ResponseEntity.ok(Map.of("attribute", service.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // ---------- Product_Attributes ----------

    // Lấy danh sách thuộc tính (kèm value) của 1 sản phẩm
    @GetMapping("/products/{productId}")
    public ResponseEntity<?> listForProduct(@PathVariable Integer productId) {
        // build response gồm attributeId, attributeName, value
        var items = service.listForProduct(productId)
                .stream()
                .map(pa -> Map.of(
                        "productId", pa.getProductId(),
                        "attributeId", pa.getAttributeId(),
                        "value", pa.getValue()
                )).toList();
        return ResponseEntity.ok(Map.of("items", items));
    }

    // Upsert 1 thuộc tính cho sản phẩm
    @PostMapping("/products/{productId}/{attributeId}")
    public ResponseEntity<?> upsertOne(@PathVariable Integer productId,
                                       @PathVariable Integer attributeId,
                                       @RequestBody Map<String, String> body) {
        String value = body.get("value");
        return ResponseEntity.ok(Map.of("item",
                service.upsertOne(productId, attributeId, value)));
    }

    // Thay thế/bổ sung hàng loạt thuộc tính cho sản phẩm
    @PostMapping("/products/{productId}")
    public ResponseEntity<?> replaceAll(@PathVariable Integer productId,
                                        @RequestBody List<Map<String, Object>> body) {
        // body: [{ "attributeId": 1, "value": "Đỏ" }, ...]
        List<AttributeService.AttrValue> items = new ArrayList<>();
        for (Map<String, Object> m : body) {
            Integer attId = (m.get("attributeId") == null) ? null :
                    (m.get("attributeId") instanceof Number
                        ? ((Number) m.get("attributeId")).intValue()
                        : Integer.parseInt(m.get("attributeId").toString()));
            String val = Objects.toString(m.get("value"), "");
            items.add(new AttributeService.AttrValue(attId, val));
        }
        var saved = service.replaceAll(productId, items);
        return ResponseEntity.ok(Map.of("items", saved));
    }

    // Xóa 1 thuộc tính của sản phẩm
    @DeleteMapping("/products/{productId}/{attributeId}")
    public ResponseEntity<?> deleteOne(@PathVariable Integer productId,
                                       @PathVariable Integer attributeId) {
        service.deleteOne(productId, attributeId);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // ---- helper
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
