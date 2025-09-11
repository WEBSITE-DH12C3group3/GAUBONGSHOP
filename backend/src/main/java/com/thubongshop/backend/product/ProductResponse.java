package com.thubongshop.backend.product;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ProductResponse {
    private Integer id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Integer categoryId;
    private Integer brandId;
    private Integer stock;
    private LocalDateTime createdAt;
}
