package com.thubongshop.backend.analytics.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KeyValue {
  private String key;
  private long count;
  private BigDecimal amount;
}
