package com.thubongshop.backend.shipping.service;

import com.thubongshop.backend.shipping.carrier.ShippingCarrier;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "shipping_services",
  uniqueConstraints = @UniqueConstraint(name="uk_carrier_service", columnNames = {"carrier_id","code"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ShippingServiceEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(optional = false) @JoinColumn(name="carrier_id")
  private ShippingCarrier carrier;

  @Column(nullable = false, length = 50)
  private String code;                 // STD, FAST...
  @Column(nullable = false, length = 120)
  private String label;                // “Tiêu chuẩn (2–4 ngày)”
  @Column(name="is_active", nullable = false)
  private Boolean active = true;
  @Column(name="base_days_min") private Integer baseDaysMin = 2;
  @Column(name="base_days_max") private Integer baseDaysMax = 4;
}
