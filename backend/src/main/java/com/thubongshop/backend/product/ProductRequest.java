package com.thubongshop.backend.product;

import com.thubongshop.backend.productattribute.ProductAttributeRequest;
import jakarta.validation.constraints.*;

import java.util.List;

public record ProductRequest(
        @NotBlank String name,
        String description,
        @NotNull Double price,
        String imageUrl,
        @NotNull Integer categoryId,
        @NotNull Integer brandId,
        @NotNull Integer stock,

        // Thuộc tính sản phẩm
        List<ProductAttributeRequest> attributes,

        // Danh sách ảnh sản phẩm
        List<ProductImageRequest> images
) {}
