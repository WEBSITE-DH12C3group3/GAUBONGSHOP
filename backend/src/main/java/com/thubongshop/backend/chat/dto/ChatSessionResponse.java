package com.thubongshop.backend.chat.dto;

import com.thubongshop.backend.chat.entity.ChatSession.Status;
import lombok.*;

import java.time.Instant;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class ChatSessionResponse {
  private Integer id;
  private Integer meId;
  private Integer peerId;
  private Status status;
  private Instant createdAt;
  private Instant updatedAt;
  private String lastMessage;
  private Long unreadCount;
}
