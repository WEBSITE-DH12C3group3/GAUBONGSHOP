package com.thubongshop.backend.attribute;

import com.thubongshop.backend.attribute.ProductAttribute.ProductAttributeKey;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class AttributeService {

    private final AttributeRepository attRepo;
    private final ProductAttributeRepository paRepo;

    public AttributeService(AttributeRepository attRepo,
                            ProductAttributeRepository paRepo) {
        this.attRepo = attRepo;
        this.paRepo = paRepo;
    }

    // -------- Attributes (danh mục thuộc tính)

    public Page<Attribute> list(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return attRepo.findAll(pageable);
        }
        return attRepo.findByNameContainingIgnoreCase(q.trim(), pageable);
    }

    public Attribute get(Integer id) {
        return attRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attribute not found"));
    }

    public Attribute create(Attribute req) {
        if (attRepo.existsByNameIgnoreCase(req.getName())) {
            throw new IllegalArgumentException("Attribute name already exists");
        }
        Attribute a = new Attribute();
        a.setName(req.getName());
        a.setDescription(req.getDescription());
        return attRepo.save(a);
    }

    public Attribute update(Integer id, Attribute req) {
        Attribute a = get(id);
        if (!a.getName().equalsIgnoreCase(req.getName())
            && attRepo.existsByNameIgnoreCase(req.getName())) {
            throw new IllegalArgumentException("Attribute name already exists");
        }
        a.setName(req.getName());
        a.setDescription(req.getDescription());
        return attRepo.save(a);
    }

    public void delete(Integer id) {
        if (!attRepo.existsById(id)) throw new IllegalArgumentException("Attribute not found");
        attRepo.deleteById(id);
    }

    // -------- Product_Attributes (gán giá trị thuộc tính cho sản phẩm)

    public List<ProductAttribute> listForProduct(Integer productId) {
        return paRepo.findByIdProductId(productId);
    }

    public ProductAttribute upsertOne(Integer productId, Integer attributeId, String value) {
        // kiểm tra tồn tại attribute
        if (!attRepo.existsById(attributeId)) {
            throw new IllegalArgumentException("Attribute not found: " + attributeId);
        }
        ProductAttribute pa = paRepo.findByIdProductIdAndIdAttributeId(productId, attributeId)
                .orElseGet(() -> {
                    ProductAttribute x = new ProductAttribute();
                    x.setId(new ProductAttributeKey(productId, attributeId));
                    return x;
                });
        pa.setValue(value);
        return paRepo.save(pa);
    }

    public List<ProductAttribute> replaceAll(Integer productId, List<AttrValue> items) {
        // upsert theo danh sách truyền vào
        List<ProductAttribute> saved = new ArrayList<>();
        for (AttrValue it : items) {
            saved.add(upsertOne(productId, it.attributeId(), it.value()));
        }
        return saved;
    }

    public void deleteOne(Integer productId, Integer attributeId) {
        if (paRepo.findByIdProductIdAndIdAttributeId(productId, attributeId).isEmpty()) {
            throw new IllegalArgumentException("Product attribute not found");
        }
        paRepo.deleteByIdProductIdAndIdAttributeId(productId, attributeId);
    }

    // ---- DTO nhỏ (record) dùng riêng cho service/controller
    public record AttrValue(Integer attributeId, String value) {}
}
