package com.thubongshop.backend.product;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Getter
@Setter
public class ProductRequest {
    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 10_000)
    private String description;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal price;

    @Size(max = 255)
    private String imageUrl;

    private Integer categoryId;
    private Integer brandId;

    @NotNull
    @Min(0)
    private Integer stock;
}
