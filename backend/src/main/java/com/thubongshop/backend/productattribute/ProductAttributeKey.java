package com.thubongshop.backend.productattribute;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ProductAttributeKey implements Serializable {
    private Integer productId;
    private Integer attributeId;
}
