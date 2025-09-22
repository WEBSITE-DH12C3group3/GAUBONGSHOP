package com.thubongshop.backend.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceDTO {
  private Integer id;
  @NotNull private Integer carrierId;
  @NotBlank private String code;
  @NotBlank private String label;
  private Boolean active;
  private Integer baseDaysMin;
  private Integer baseDaysMax;
}
