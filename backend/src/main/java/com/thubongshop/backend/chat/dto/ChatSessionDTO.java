package com.thubongshop.backend.chat.dto;

import com.thubongshop.backend.chat.entity.ChatSession;
import lombok.*;

import java.sql.Timestamp;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class ChatSessionDTO {
  private Integer id;
  private Integer participant1Id;
  private Integer participant2Id;
  private String status;
  private Timestamp createdAt;
  private Timestamp updatedAt;
  private long unreadForViewer;
  private String lastMessageSnippet;

  public static ChatSessionDTO of(ChatSession s, Integer viewerId, long unread, String lastSnippet) {
    return ChatSessionDTO.builder()
      .id(s.getId())
      .participant1Id(s.getParticipant1Id())
      .participant2Id(s.getParticipant2Id())
      .status(s.getStatus().name())
      .createdAt(s.getCreatedAt())
      .updatedAt(s.getUpdatedAt())
      .unreadForViewer(unread)
      .lastMessageSnippet(lastSnippet)
      .build();
  }
}
