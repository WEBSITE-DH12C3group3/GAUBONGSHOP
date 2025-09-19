package com.thubongshop.backend.importdetails;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/import-details")
@RequiredArgsConstructor
public class ImportDetailController {

    private final ImportDetailService importDetailService;

    @GetMapping
    public ResponseEntity<List<ImportDetail>> getAll() {
        return ResponseEntity.ok(importDetailService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImportDetail> getById(@PathVariable Integer  id) {
        return ResponseEntity.ok(importDetailService.getById(id));
    }

    @GetMapping("/imports/{importId}/details")
public ResponseEntity<List<ImportDetail>> getByImportId(@PathVariable Integer importId) {
    return ResponseEntity.ok(importDetailService.getByImportId(importId));
}


    @PostMapping
    public ResponseEntity<ImportDetail> create(
            @RequestParam Integer  importId,
            @RequestParam Integer  productId,
            @RequestBody ImportDetail detail
    ) {
        return ResponseEntity.ok(importDetailService.create(importId, productId, detail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImportDetail> update(
            @PathVariable Integer  id,
            @RequestParam(required = false) Integer  productId,
            @RequestBody ImportDetail detail
    ) {
        return ResponseEntity.ok(importDetailService.update(id, detail, productId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer  id) {
        importDetailService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
