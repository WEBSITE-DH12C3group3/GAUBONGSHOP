package com.thubongshop.backend.chat.config;

import com.pusher.rest.Pusher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PusherConfig {
  @Value("${pusher.app-id}") private String appId;
  @Value("${pusher.key}") private String key;
  @Value("${pusher.secret}") private String secret;
  @Value("${pusher.cluster}") private String cluster;
  @Value("${pusher.use-tls:true}") private boolean useTLS;

  @Bean
  public Pusher pusher() {
    Pusher p = new Pusher(appId, key, secret);
    p.setCluster(cluster);
    p.setEncrypted(useTLS);
    return p;
  }
}
