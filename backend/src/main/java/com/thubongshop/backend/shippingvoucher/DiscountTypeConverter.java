package com.thubongshop.backend.shippingvoucher;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class DiscountTypeConverter implements AttributeConverter<ShipVoucher.DiscountType, String> {

  @Override
  public String convertToDatabaseColumn(ShipVoucher.DiscountType attribute) {
    if (attribute == null) return null;
    return switch (attribute) {
      case FREE -> "free";
      case PERCENT -> "percent";
      case FIXED -> "fixed";
    };
  }

  @Override
  public ShipVoucher.DiscountType convertToEntityAttribute(String dbData) {
    if (dbData == null) return null;
    return switch (dbData.toLowerCase()) {
      case "free" -> ShipVoucher.DiscountType.FREE;
      case "percent" -> ShipVoucher.DiscountType.PERCENT;
      case "fixed" -> ShipVoucher.DiscountType.FIXED;
      default -> null;
    };
  }
}
