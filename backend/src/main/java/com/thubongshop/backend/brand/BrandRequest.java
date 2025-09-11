package com.thubongshop.backend.brand;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Getter
@Setter
public class BrandRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 10_000)
    private String description;

    @Size(max = 255)
    private String logoUrl;

    @Size(max = 255)
    private String websiteUrl;
}
