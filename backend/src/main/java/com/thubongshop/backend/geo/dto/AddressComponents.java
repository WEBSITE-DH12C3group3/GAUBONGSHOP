// src/main/java/com/thubongshop/backend/geo/dto/AddressComponents.java
package com.thubongshop.backend.geo.dto;

import java.math.BigDecimal;

public record AddressComponents(
    String fullAddress,
    String province,
    String district,
    String ward,
    String street,
    String postalCode,
    BigDecimal lat,
    BigDecimal lng
) {}
