package com.thubongshop.backend.imports;

import com.thubongshop.backend.importdetails.ImportDetail;
import com.thubongshop.backend.importdetails.ImportDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ImportService {
    private final ImportRepository importRepository;
    private final ImportDetailRepository importDetailRepository;

    public List<Import> getAllImports() {
        return importRepository.findAll();
    }

    public Optional<Import> getImportById(Integer id) {
        // gọi repo fetch join thay vì findById
        return importRepository.findByIdWithDetails(id);
    }

    public Import createImport(Import importData) {
        importData.setId(null);
        importData.setImportDate(LocalDateTime.now());

        double total = 0.0;

        // gắn lại quan hệ cha – con
        if (importData.getDetails() != null) {
            for (ImportDetail d : importData.getDetails()) {
                if (d.getProduct() != null && d.getProduct().getId() != null) {
                    d.setId(null); // để Hibernate tự sinh
                    d.setImportObj(importData);
                    total += d.getQuantity() * d.getUnitPrice();
                }
            }
        }
        importData.setTotalCost(total);
        return importRepository.save(importData);
    }

public Import updateImport(Integer id, Import importData) {
    return importRepository.findById(id)
            .map(existing -> {
                existing.setImportDate(LocalDateTime.now());
                existing.setStatus(importData.getStatus());
                existing.setNotes(importData.getNotes());

                // Xóa chi tiết cũ
                existing.getDetails().clear();

                double total = 0.0;

                // Thêm chi tiết mới
                if (importData.getDetails() != null) {
                    for (ImportDetail d : importData.getDetails()) {
                        d.setId(null); // để Hibernate tự sinh
                        d.setImportObj(existing); // gắn cha
                        total += d.getQuantity() * d.getUnitPrice();
                        existing.getDetails().add(d);
                    }
                }

                existing.setTotalCost(total);
                return importRepository.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("Import not found"));
}


    public void deleteImport(Integer id) {
        importRepository.deleteById(id);
    }
}
