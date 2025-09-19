package com.thubongshop.backend.imports;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.thubongshop.backend.supplier.Supplier;
import com.thubongshop.backend.supplier.SupplierRepository;
import com.thubongshop.backend.importdetails.ImportDetailService;
import com.thubongshop.backend.importdetails.ImportDetail;

import java.util.List;

@RestController
@RequestMapping("/api/admin/imports")
@RequiredArgsConstructor
public class ImportController {
    private final ImportService importService;
private final ImportRepository importRepository;
    private final SupplierRepository supplierRepository;

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
    public ResponseEntity<?> updateImport(@PathVariable Integer id, @RequestBody Import dto) {
        return importRepository.findById(id).map(existing -> {
            existing.setNotes(dto.getNotes());
            existing.setStatus(dto.getStatus());
            existing.setTotalCost(dto.getTotalCost());
            existing.setImportDate(dto.getImportDate());

            // ✅ xử lý supplier cho phép null
            if (dto.getSupplier() != null && dto.getSupplier().getId() != null) {
                Supplier supplier = supplierRepository
                        .findById(dto.getSupplier().getId())
                        .orElseThrow(() -> new RuntimeException("Supplier not found"));
                existing.setSupplier(supplier);
            } else {
                existing.setSupplier(null); // nếu frontend gửi null
            }

            // cập nhật details
            existing.getDetails().clear();
            dto.getDetails().forEach(d -> {
                ImportDetail detail = new ImportDetail();
                detail.setImportObj(existing);
                detail.setProduct(d.getProduct());
                detail.setQuantity(d.getQuantity());
                detail.setUnitPrice(d.getUnitPrice());
                existing.getDetails().add(detail);
            });

            return ResponseEntity.ok(importRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Xóa phiếu nhập
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImport(@PathVariable Integer id) {
        importService.deleteImport(id);
        return ResponseEntity.noContent().build();
    }
}
