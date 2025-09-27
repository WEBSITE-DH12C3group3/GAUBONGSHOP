package com.thubongshop.backend.chatbox.dto;

import lombok.Data;

@Data
public class ChatRequest {
  private String message;
  private String sessionId; // tuỳ ý, dùng để gom hội thoại
}
