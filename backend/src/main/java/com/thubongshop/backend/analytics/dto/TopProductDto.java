package com.thubongshop.backend.analytics.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TopProductDto {
  private Integer productId;
  private String productName;
  private long quantity;
  private BigDecimal sales; // sum(quantity * price)
}
