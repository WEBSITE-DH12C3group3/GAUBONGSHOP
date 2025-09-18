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

    // ✅ Lấy tất cả phiếu nhập (bao gồm chi tiết)
    @GetMapping
    public ResponseEntity<List<Import>> getAllImports() {
        List<Import> imports = importService.getAllImports();
        return ResponseEntity.ok(imports);
    }

    // ✅ Lấy phiếu nhập theo ID (bao gồm chi tiết)
    @GetMapping("/{id}")
    public ResponseEntity<Import> getImportById(@PathVariable Integer id) {
        return importService.getImportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Thêm mới phiếu nhập
@PostMapping
public ResponseEntity<Import> createImport(@RequestBody Import req) {
    Import saved = importService.createImport(req);
    return ResponseEntity.ok(saved);
}



    // ✅ Cập nhật phiếu nhập
    @PutMapping("/{id}")
    public ResponseEntity<Import> updateImport(@PathVariable Integer id, @RequestBody Import importData) {
        return ResponseEntity.ok(importService.updateImport(id, importData));
    }

    // ✅ Xóa phiếu nhập
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImport(@PathVariable Integer id) {
        importService.deleteImport(id);
        return ResponseEntity.noContent().build();
    }
}
