package com.thubongshop.backend.chat.controller;

import com.thubongshop.backend.chat.dto.*;
import com.thubongshop.backend.chat.service.ChatService;
import com.thubongshop.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client/chat")
@RequiredArgsConstructor
public class ChatClientController {
  private final ChatService chat;

  @PostMapping("/sessions/with-admin")
  public ResponseEntity<ChatSessionResponse> openWithAdmin(@AuthenticationPrincipal UserPrincipal me) {
    var s = chat.openWithAdmin(me.getId());
    var dto = chat.sessionsOfUser(me.getId(), PageRequest.of(0, 1))
      .stream().filter(x -> x.getId().equals(s.getId())).findFirst().orElse(null);
    return ResponseEntity.ok(dto);
  }

  @GetMapping("/sessions")
  public Page<ChatSessionResponse> mySessions(@AuthenticationPrincipal UserPrincipal me,
      @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
    return chat.sessionsOfUser(me.getId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC,"updatedAt")));
  }

  @GetMapping("/sessions/{id}/messages")
  public Page<ChatMessageResponse> messages(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal me,
      @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="50") int size) {
    return chat.listMessages(id, PageRequest.of(page, size), me.getId());
  }

  @PostMapping("/sessions/{id}/messages")
  public ChatMessageResponse send(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal me,
      @Valid @RequestBody ChatMessageRequest body) {
    return chat.send(id, me.getId(), body.getContent());
  }

  @PostMapping("/sessions/{id}/read")
  public ResponseEntity<?> read(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal me) {
    return ResponseEntity.ok(chat.markRead(id, me.getId()));
  }
}
