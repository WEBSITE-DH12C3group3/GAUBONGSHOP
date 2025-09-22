package com.thubongshop.backend.shipping.rate;

import com.thubongshop.backend.shipping.service.ShippingServiceEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "carrier_rate_rules")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CarrierRateRule {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(optional = false) @JoinColumn(name="service_id")
  private ShippingServiceEntity service;

  @Column(name="min_km", nullable = false) private BigDecimal minKm = BigDecimal.ZERO;
  @Column(name="max_km") private BigDecimal maxKm;             // null = vô hạn
  @Column(name="base_fee", nullable = false) private BigDecimal baseFee;
  @Column(name="per_km_fee", nullable = false) private BigDecimal perKmFee;
  @Column(name="min_fee") private BigDecimal minFee = BigDecimal.ZERO;
  @Column(name="free_km") private BigDecimal freeKm = BigDecimal.ZERO;
  @Column(name="cod_surcharge") private BigDecimal codSurcharge = BigDecimal.ZERO;
  @Column(name="area_surcharge") private BigDecimal areaSurcharge = BigDecimal.ZERO;
  @Column(name="active_from") private LocalDate activeFrom;
  @Column(name="active_to") private LocalDate activeTo;
  @Column(name="is_active", nullable = false) private Boolean active = true;
}
