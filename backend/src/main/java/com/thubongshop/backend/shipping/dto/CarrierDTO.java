package com.thubongshop.backend.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CarrierDTO {
  private Integer id;
  @NotBlank private String code;
  @NotBlank private String name;
  private Boolean active;
}
