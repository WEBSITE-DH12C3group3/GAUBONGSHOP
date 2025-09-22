package com.thubongshop.backend.warehouse;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;

@Entity @Table(name="warehouses")
@Getter @Setter
public class Warehouse {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
  @Column(nullable=false) private String name;
  @Column(name="address_line", nullable=false) private String addressLine;
  @Column(name="province_code", nullable=false) private String provinceCode;
  @Column(name="district_code", nullable=false) private String districtCode;
  @Column(name="ward_code", nullable=false) private String wardCode;
  @Column(nullable=false) private Double latitude;
  @Column(nullable=false) private Double longitude;
  @Column(name="is_active", nullable=false) private Boolean isActive = true;
}
