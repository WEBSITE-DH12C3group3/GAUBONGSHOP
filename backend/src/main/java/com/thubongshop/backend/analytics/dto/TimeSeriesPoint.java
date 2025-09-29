package com.thubongshop.backend.analytics.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TimeSeriesPoint {
  private String period;        // YYYY-MM-DD | YYYY-Www | YYYY-MM
  private long orders;
  private long customers;
  private long items;
  private BigDecimal grossSales;
  private BigDecimal shippingFee;
  private BigDecimal couponDiscount;
  private BigDecimal shipDiscount;
  private BigDecimal netRevenue;
  private BigDecimal cogs;
  private BigDecimal grossProfit;
  private BigDecimal marginPct;
}
