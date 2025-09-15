package com.thubongshop.backend.productattribute;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_attributes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAttribute {

    @EmbeddedId
    private ProductAttributeKey id;

    @Column(nullable = false)
    private String value;

    // tiện cho controller/service dễ dùng
    public Integer getProductId() {
        return id != null ? id.getProductId() : null;
    }

    public Integer getAttributeId() {
        return id != null ? id.getAttributeId() : null;
    }
}
