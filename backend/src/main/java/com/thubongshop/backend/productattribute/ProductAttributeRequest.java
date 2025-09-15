package com.thubongshop.backend.productattribute;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public record ProductAttributeRequest(
        @NotNull Long attributeId,
        @NotBlank String value
) {}
