package com.thubongshop.backend.shippingvoucher;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ShipVoucherRequest {
  public String code;
  public String description;
  public String discountType;
  public BigDecimal discountValue;
  public BigDecimal maxDiscountAmount;
  public BigDecimal minOrderAmount;
  public BigDecimal minShippingFee;
  public String applicableCarriers;
  public String regionInclude;
  public String regionExclude;
  public Integer maxUses;
  public Integer usedCount;
  public Integer maxUsesPerUser;
  public LocalDateTime startDate;
  public LocalDateTime endDate;
  public Boolean active;
}
