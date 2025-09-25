// src/main/java/com/thubongshop/backend/geo/dto/ReverseReq.java
package com.thubongshop.backend.geo.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ReverseReq(
    @NotNull BigDecimal lat,
    @NotNull BigDecimal lng
) {}
