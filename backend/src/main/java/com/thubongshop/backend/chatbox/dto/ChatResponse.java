package com.thubongshop.backend.chatbox.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponse {
  private String answer;
  private String source; // "faq" | "ai"
  private double confidence; // 0..1
}
