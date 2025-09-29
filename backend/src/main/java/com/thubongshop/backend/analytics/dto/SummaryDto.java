package com.thubongshop.backend.analytics.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SummaryDto {
  private long orders;                // số đơn
  private long paidOrders;            // số đơn đã thanh toán
  private long customers;             // khách hàng duy nhất
  private long items;                 // tổng SP bán ra
  private BigDecimal grossSales;      // tổng tiền hàng (chưa trừ giảm giá/ship)
  private BigDecimal shippingFee;     // tổng phí ship (thu của KH)
  private BigDecimal couponDiscount;  // giảm giá từ coupon
  private BigDecimal shipDiscount;    // giảm phí ship bằng ship-voucher
  private BigDecimal netRevenue;      // doanh thu ròng (sau giảm giá + cộng phí ship)
  private BigDecimal cogs;            // giá vốn (ước tính theo average unit_price nhập)
  private BigDecimal grossProfit;     // lợi nhuận gộp = netRevenue - COGS
  private BigDecimal aov;             // Average Order Value
  private BigDecimal arpu;            // Revenue per user (khách)
  private long cancelledOrders;       // số đơn hủy
}
