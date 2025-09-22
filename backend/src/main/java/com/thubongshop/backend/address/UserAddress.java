package com.thubongshop.backend.address;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;

@Entity @Table(name="user_addresses")
@Getter @Setter
public class UserAddress {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name="user_id", nullable=false) private Integer userId;
  private String label;
  @Column(name="receiver_name", nullable=false) private String receiverName;
  @Column(nullable=false) private String phone;

  @Column(name="province_code", nullable=false) private String provinceCode;
  @Column(name="district_code", nullable=false) private String districtCode;
  @Column(name="ward_code", nullable=false) private String wardCode;
  @Column(name="address_line", nullable=false) private String addressLine;

  private Double latitude;  private Double longitude;
  @Column(name="is_default", nullable=false) private Boolean isDefault = false;
}
