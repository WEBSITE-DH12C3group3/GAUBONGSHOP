package com.thubongshop.backend.orderv2.read;

import java.math.BigDecimal;
import java.sql.Timestamp; // 👈 đổi từ OffsetDateTime

public interface OrderListRow {
  Integer getId();
  String getStatus();
  BigDecimal getItems_total();
  BigDecimal getShipping_fee();
  BigDecimal getShipping_discount();
  BigDecimal getGrand_total();
  String getReceiver_name();
  String getPhone();
  String getAddress_line();
  String getProvince();
  Timestamp getOrder_date();
}
