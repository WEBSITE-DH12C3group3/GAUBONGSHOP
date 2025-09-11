package com.thubongshop.backend.brand;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class BrandResponse {
    private Integer id;
    private String name;
    private String description;
    private String logoUrl;
    private String websiteUrl;
    private LocalDateTime createdAt;
}
