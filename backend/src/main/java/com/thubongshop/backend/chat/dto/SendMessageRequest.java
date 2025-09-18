package com.thubongshop.backend.chat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
public class SendMessageRequest {
  @NotBlank
  private String content;
}
