package com.thubongshop.backend.product;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class ProductResponse {
    private Integer id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private Integer stock;
    private LocalDateTime createdAt;

    private String brandName;
    private String categoryName;

    // bổ sung chi tiết
    private Double avgRating;
    private Long totalReviews;
    private List<AttributeDTO> attributes;

    @Getter @Setter @AllArgsConstructor
    public static class AttributeDTO {
        private Integer attributeId;
        private String attributeName;
        private String value;
    }
}
