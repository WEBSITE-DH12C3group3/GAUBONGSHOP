package com.thubongshop.backend.chat.service;

import com.pusher.rest.Pusher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PusherService {
  private final Pusher pusher;

  public void trigger(String channel, String event, Map<String, Object> data) {
    pusher.trigger(channel, event, data);
  }

  // ✅ authenticate trả về JSON String
  public String auth(String channel, String socketId) {
    return pusher.authenticate(channel, socketId);
  }

  public static String channelOf(Integer sessionId) {
    return "private-chat-" + sessionId;
  }
}
