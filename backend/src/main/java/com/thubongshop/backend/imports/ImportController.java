package com.thubongshop.backend.imports;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/imports")
@RequiredArgsConstructor
public class ImportController {
    private final ImportService importService;

    @GetMapping
    public ResponseEntity<List<Import>> getAllImports() {
        return ResponseEntity.ok(importService.getAllImports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Import> getImportById(@PathVariable Long id) {
        return importService.getImportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Import> createImport(@RequestBody Import importData) {
        return ResponseEntity.ok(importService.createImport(importData));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Import> updateImport(@PathVariable Long id, @RequestBody Import importData) {
        return ResponseEntity.ok(importService.updateImport(id, importData));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImport(@PathVariable Long id) {
        importService.deleteImport(id);
        return ResponseEntity.noContent().build();
    }
}
