package com.thubongshop.backend.shipping.carrier;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity @Table(name = "shipping_carriers")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ShippingCarrier {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable = false, unique = true, length = 50)
  private String code;                  // ví dụ: INTERNAL, GHN
  @Column(nullable = false, length = 120)
  private String name;                  // “Giao nội bộ”, “Giao nhanh GHN”
  @Column(name = "is_active", nullable = false)
  private Boolean active = true;        // map is_active
  @Column(name = "created_at", updatable = false, insertable = false)
  private Instant createdAt;            // DB default CURRENT_TIMESTAMP
}
