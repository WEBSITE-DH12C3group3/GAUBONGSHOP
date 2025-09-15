package com.thubongshop.backend.productattribute;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductAttributeService {

    private final ProductAttributeRepository repo;

    // Lấy danh sách attribute của 1 sản phẩm
    public List<ProductAttribute> getAttributesForProduct(Integer productId) {
        return repo.findByIdProductId(productId);
    }

    // Thêm mới hoặc cập nhật 1 attribute cho sản phẩm
    public ProductAttribute upsertOne(Integer productId, Integer attributeId, String value) {
        ProductAttributeKey key = new ProductAttributeKey(productId, attributeId);

        ProductAttribute pa = repo.findById(key).orElseGet(() -> {
            ProductAttribute newPa = new ProductAttribute();
            newPa.setId(key);
            return newPa;
        });

        pa.setValue(value);
        return repo.save(pa);
    }

    // Thay thế toàn bộ attributes của 1 sản phẩm
    public List<ProductAttribute> replaceAll(Integer productId, List<ProductAttribute> attrs) {
        // Xoá tất cả trước
        repo.findByIdProductId(productId)
            .forEach(attr -> repo.deleteById(attr.getId()));

        // Gán productId cho từng attr trước khi save
        attrs.forEach(attr -> attr.setId(new ProductAttributeKey(productId, attr.getId().getAttributeId())));

        return repo.saveAll(attrs);
    }

    // Xoá 1 attribute khỏi sản phẩm
    public void deleteOne(Integer productId, Integer attributeId) {
        repo.deleteByIdProductIdAndIdAttributeId(productId, attributeId);
    }
}
