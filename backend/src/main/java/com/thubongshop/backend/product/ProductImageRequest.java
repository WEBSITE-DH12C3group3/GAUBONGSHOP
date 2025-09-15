package com.thubongshop.backend.product;

import jakarta.validation.constraints.NotBlank;

public record ProductImageRequest(
        @NotBlank String url,
        String alt
) {}
