package com.thubongshop.backend.chatbox;


import com.thubongshop.backend.chatbox.dto.ChatRequest;
import com.thubongshop.backend.chatbox.dto.ChatResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {
    @Qualifier("legacyChatService")
  private final ChatService chatService;

  @PostMapping
  public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest req) {
    ChatResponse res = chatService.answer(req.getMessage());
    return ResponseEntity.ok(res);
  }
}

