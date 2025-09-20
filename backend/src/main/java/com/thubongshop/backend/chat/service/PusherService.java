package com.thubongshop.backend.chat.service;

import com.pusher.rest.Pusher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PusherService {
  private final Pusher pusher; // có thể là null nếu không cấu hình bean

  public static String channelOf(Integer sessionId) {
    return "private-chat." + sessionId;
  }

  public void trigger(String channel, String event, Map<String, Object> data) {
    if (pusher == null) return; // no-op khi dev local chưa cấu hình key
    pusher.trigger(channel, event, data);
  }

  public String authenticate(String channel, String socketId) {
    if (pusher == null) throw new IllegalStateException("Pusher not configured");
    return pusher.authenticate(channel, socketId);
  }
}
