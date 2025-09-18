package com.thubongshop.backend.importdetails;

import com.thubongshop.backend.imports.Import;
import com.thubongshop.backend.imports.ImportRepository;
import com.thubongshop.backend.product.Product;
import com.thubongshop.backend.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImportDetailService {

    private final ImportDetailRepository importDetailRepository;
    private final ImportRepository importRepository;
    private final ProductRepository productRepository;

    public List<ImportDetail> getAll() {
        return importDetailRepository.findAll();
    }

    public List<ImportDetail> getByImportId(Integer  importId) {
        return importDetailRepository.findByImportObj_Id(importId);
    }

    public ImportDetail getById(Integer  id) {
        return importDetailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ImportDetail not found with id " + id));
    }

    public ImportDetail create(Integer  importId, Integer  productId, ImportDetail detail) {
        Import importObj = importRepository.findById(importId)
                .orElseThrow(() -> new RuntimeException("Import not found"));
        Product product = productRepository.findById(productId.intValue())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        detail.setImportObj(importObj);
        detail.setProduct(product);

        return importDetailRepository.save(detail);
    }

    public ImportDetail update(Integer  id, ImportDetail detail, Integer  productId) {
        return importDetailRepository.findById(id).map(existing -> {
            if (productId != null) {
                Product product = productRepository.findById(productId.intValue())
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                existing.setProduct(product);
            }
            existing.setQuantity(detail.getQuantity());
            existing.setUnitPrice(detail.getUnitPrice());
            return importDetailRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("ImportDetail not found with id " + id));
    }

    public void delete(Integer  id) {
        importDetailRepository.deleteById(id);
    }
}
