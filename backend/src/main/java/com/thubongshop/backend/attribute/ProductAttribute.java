package com.thubongshop.backend.attribute;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "product_attributes")
public class ProductAttribute {

    @EmbeddedId
    private ProductAttributeKey id = new ProductAttributeKey();

    @Column(nullable = false, length = 100)
    private String value;

    // convenience getters/setters cho gọn
    public Integer getProductId() { return id.getProductId(); }
    public void setProductId(Integer productId) { this.id.setProductId(productId); }
    public Integer getAttributeId() { return id.getAttributeId(); }
    public void setAttributeId(Integer attributeId) { this.id.setAttributeId(attributeId); }

    public ProductAttributeKey getId() { return id; }
    public void setId(ProductAttributeKey id) { this.id = id; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    // ====== Embedded Key (nằm cùng file để không phải tạo file mới)
    @Embeddable
    public static class ProductAttributeKey implements Serializable {
        @Column(name = "product_id")
        private Integer productId;

        @Column(name = "attribute_id")
        private Integer attributeId;

        public ProductAttributeKey() {}
        public ProductAttributeKey(Integer productId, Integer attributeId) {
            this.productId = productId;
            this.attributeId = attributeId;
        }

        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }
        public Integer getAttributeId() { return attributeId; }
        public void setAttributeId(Integer attributeId) { this.attributeId = attributeId; }

        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ProductAttributeKey that)) return false;
            return Objects.equals(productId, that.productId) &&
                   Objects.equals(attributeId, that.attributeId);
        }
        @Override public int hashCode() { return Objects.hash(productId, attributeId); }
    }
}
