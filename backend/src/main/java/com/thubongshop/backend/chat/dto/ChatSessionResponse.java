package com.thubongshop.backend.chat.dto;

import com.thubongshop.backend.chat.entity.ChatSession;
import lombok.*;

import java.time.Instant;

@Getter @Setter @Builder
@AllArgsConstructor @NoArgsConstructor
public class ChatSessionResponse {
  private Integer id;
  private Integer participant1Id;
  private Integer participant2Id;
  private String status;
  private Instant createdAt;
  private Instant updatedAt;

  // meta hiển thị
  private String lastMessageSnippet;
  private Integer unreadForViewer;

  public static ChatSessionResponse of(ChatSession s, Integer viewerId,
                                       String lastSnippet, int unread) {
    return ChatSessionResponse.builder()
        .id(s.getId())
        .participant1Id(s.getParticipant1Id())
        .participant2Id(s.getParticipant2Id())
        .status(s.getStatus().name())
        .createdAt(s.getCreatedAt())
        .updatedAt(s.getUpdatedAt())
        .lastMessageSnippet(lastSnippet)
        .unreadForViewer(unread)
        .build();
  }
}
