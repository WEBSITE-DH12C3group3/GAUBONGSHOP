package com.thubongshop.backend.chat.dto;

import lombok.*;
import java.time.Instant;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class ChatMessageResponse {
  private Integer id;
  private Integer sessionId;
  private Integer senderId;
  private String content;
  private Boolean isRead;
  private Instant createdAt;
}
