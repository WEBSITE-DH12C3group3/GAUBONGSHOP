package com.thubongshop.backend.imports;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ImportService {
    private final ImportRepository importRepository;

    public List<Import> getAllImports() {
        return importRepository.findAll();
    }

    public Optional<Import> getImportById(Long id) {
        return importRepository.findById(id);
    }

    public Import createImport(Import importData) {
        return importRepository.save(importData);
    }

    public Import updateImport(Long id, Import importData) {
        return importRepository.findById(id)
                .map(existing -> {
                    existing.setImportDate(importData.getImportDate());
                    existing.setTotalCost(importData.getTotalCost());
                    existing.setStatus(importData.getStatus());
                    existing.setNotes(importData.getNotes());
                    existing.setSupplierId(importData.getSupplierId());
                    return importRepository.save(existing);
                }).orElseThrow(() -> new RuntimeException("Import not found"));
    }

    public void deleteImport(Long id) {
        importRepository.deleteById(id);
    }
}
