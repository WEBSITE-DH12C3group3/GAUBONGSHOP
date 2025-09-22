package com.thubongshop.backend.shipping.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RateRuleDTO {
  private Integer id;
  @NotNull private Integer serviceId;
  @NotNull private BigDecimal minKm;
  private BigDecimal maxKm;
  @NotNull private BigDecimal baseFee;
  @NotNull private BigDecimal perKmFee;
  private BigDecimal minFee;
  private BigDecimal freeKm;
  private BigDecimal codSurcharge;
  private BigDecimal areaSurcharge;
  private LocalDate activeFrom;
  private LocalDate activeTo;
  private Boolean active;
}
