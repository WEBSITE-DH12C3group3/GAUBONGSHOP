package com.thubongshop.backend.attribute;

import com.thubongshop.backend.attribute.ProductAttribute.ProductAttributeKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductAttributeRepository
        extends JpaRepository<ProductAttribute, ProductAttributeKey> {

    List<ProductAttribute> findByIdProductId(Integer productId);

    Optional<ProductAttribute> findByIdProductIdAndIdAttributeId(Integer productId, Integer attributeId);

    void deleteByIdProductIdAndIdAttributeId(Integer productId, Integer attributeId);
}
