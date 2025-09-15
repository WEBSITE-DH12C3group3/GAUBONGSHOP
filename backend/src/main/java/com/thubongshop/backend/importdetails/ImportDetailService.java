package com.thubongshop.backend.importdetails;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ImportDetailService {

    private final ImportDetailRepository importDetailRepository;

    public List<ImportDetail> getAllDetails() {
        return importDetailRepository.findAll();
    }

    public Optional<ImportDetail> getDetailById(Long id) {
        return importDetailRepository.findById(id);
    }

    public List<ImportDetail> getDetailsByImportId(Long importId) {
        return importDetailRepository.findByImportId(importId);
    }

    public ImportDetail createDetail(ImportDetail detail) {
        return importDetailRepository.save(detail);
    }

    public ImportDetail updateDetail(Long id, ImportDetail detail) {
        return importDetailRepository.findById(id)
                .map(existing -> {
                    existing.setImportId(detail.getImportId());
                    existing.setProductId(detail.getProductId());
                    existing.setQuantity(detail.getQuantity());
                    existing.setUnitPrice(detail.getUnitPrice());
                    return importDetailRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("ImportDetail not found with id " + id));
    }

    public void deleteDetail(Long id) {
        importDetailRepository.deleteById(id);
    }
}
