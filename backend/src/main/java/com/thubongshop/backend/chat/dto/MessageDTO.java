package com.thubongshop.backend.chat.dto;

import com.thubongshop.backend.chat.entity.Message;
import lombok.*;

import java.sql.Timestamp;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class MessageDTO {
  private Integer id;
  private Integer sessionId;
  private Integer senderId;
  private String content;
  private boolean read;
  private Timestamp createdAt;

  public static MessageDTO of(Message m) {
    return MessageDTO.builder()
      .id(m.getId())
      .sessionId(m.getSession().getId())
      .senderId(m.getSenderId())
      .content(m.getContent())
      .read(m.isRead())
      .createdAt(m.getCreatedAt())
      .build();
  }
}
