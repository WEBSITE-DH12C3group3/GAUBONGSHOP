package com.thubongshop.backend.chatbox;
import lombok.Data;
import java.util.List;

@Data
public class FaqItem {
  private List<String> intents;
  private String answer;
}
