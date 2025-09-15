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
    public ResponseEntity<List<ImportDetail>> getAllDetails() {
        return ResponseEntity.ok(importDetailService.getAllDetails());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImportDetail> getDetailById(@PathVariable Long id) {
        return importDetailService.getDetailById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/import/{importId}")
    public ResponseEntity<List<ImportDetail>> getDetailsByImportId(@PathVariable Long importId) {
        return ResponseEntity.ok(importDetailService.getDetailsByImportId(importId));
    }

    @PostMapping
    public ResponseEntity<ImportDetail> createDetail(@RequestBody ImportDetail detail) {
        return ResponseEntity.ok(importDetailService.createDetail(detail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImportDetail> updateDetail(@PathVariable Long id, @RequestBody ImportDetail detail) {
        return ResponseEntity.ok(importDetailService.updateDetail(id, detail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetail(@PathVariable Long id) {
        importDetailService.deleteDetail(id);
        return ResponseEntity.noContent().build();
    }
}
