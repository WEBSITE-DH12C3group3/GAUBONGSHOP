package com.thubongshop.backend.orderv2.read;

import java.math.BigDecimal;
import java.sql.Timestamp;

public interface OrderDetailRow extends OrderListRow {
  Integer getUser_id();
  String getVoucher_code();
  BigDecimal getWeight_kg();

  // shipping via orders + joins
  Integer getShipping_carrier_id();
  Integer getShipping_service_id();
  BigDecimal getShipping_distance_km();
  BigDecimal getShipping_fee_before();
  BigDecimal getShipping_fee_final();
  Integer getShipping_eta_min();
  Integer getShipping_eta_max();

  // from shipping_records (prefer) or shipping (fallback)
  String getSr_tracking_code();
  String getSr_status();
  String getShip_tracking_number();
  String getShip_status();

  // joined labels
  String getCarrier_code();
  String getCarrier_name();
  String getService_code();
  String getService_label();

  @Override
  Timestamp getOrder_date();
}
