package com.thubongshop.backend.chat.service;

import com.pusher.rest.Pusher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PusherService {
  private final ObjectProvider<Pusher> pusherProvider;

  public static String channelOf(Integer sessionId) {
    return "private-chat." + sessionId;
  }

  public void trigger(String channel, String event, Map<String, Object> data) {
    Pusher pusher = pusherProvider.getIfAvailable();
    if (pusher == null) return;
    pusher.trigger(channel, event, data);
  }

  public String authenticate(String channel, String socketId) {
    Pusher pusher = pusherProvider.getIfAvailable();
    if (pusher == null) throw new IllegalStateException("Pusher not configured");
    return pusher.authenticate(socketId, channel);
  }
}
