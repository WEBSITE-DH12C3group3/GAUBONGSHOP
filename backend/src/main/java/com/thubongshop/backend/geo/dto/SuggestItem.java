// src/main/java/com/thubongshop/backend/geo/dto/SuggestItem.java
package com.thubongshop.backend.geo.dto;

import java.math.BigDecimal;

public record SuggestItem(
    String label,         // hiển thị cho dropdown
    String fullAddress,
    String province,
    String district,
    String ward,
    String street,
    String postalCode,
    BigDecimal lat,
    BigDecimal lng
) {}
