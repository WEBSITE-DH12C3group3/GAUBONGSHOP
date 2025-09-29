package com.thubongshop.backend.orderv2.read;

import java.math.BigDecimal;

public interface OrderItemRow {
  Integer getProduct_id();
  String getProduct_name();
  BigDecimal getUnit_price();
  Integer getQuantity();
  BigDecimal getWeight_kg_per_item();
}
