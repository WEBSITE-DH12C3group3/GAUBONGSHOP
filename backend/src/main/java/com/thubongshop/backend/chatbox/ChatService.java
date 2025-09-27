package com.thubongshop.backend.chatbox;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thubongshop.backend.chatbox.dto.ChatResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

import static com.thubongshop.backend.chatbox.TextUtils.normalize;

@Slf4j
@Service("legacyChatService")
@RequiredArgsConstructor
public class ChatService {

  private final ObjectMapper mapper = new ObjectMapper();
  private List<FaqItem> faq = new ArrayList<>();

  /** Bật/tắt AI fallback */
  @Value("${ai.provider.enabled:false}")
  private boolean aiEnabled;

  /** Endpoint mô hình (Gemini hoặc OpenAI-compatible) */
  @Value("${ai.provider.endpoint:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
  private String llmEndpoint;

  /** API key lấy từ biến môi trường */
  @Value("${ai.provider.apiKey:}")
  private String apiKey;

  /** Ngưỡng match từ-khóa FAQ (0..1) */
  @Value("${ai.provider.keywordThreshold:0.25}")
  private double keywordThreshold;

  /** Timeout gọi HTTP ra ngoài (ms) */
  @Value("${ai.provider.httpTimeoutMs:8000}")
  private int httpTimeoutMs;

  private final RestTemplate http = new RestTemplate();

  @PostConstruct
  public void loadFaq() {
    try (InputStream is = new ClassPathResource("faq.json").getInputStream()) {
      faq = mapper.readValue(is, new TypeReference<List<FaqItem>>() {});
      log.info("Loaded {} FAQ entries", faq.size());
      log.info("[AI cfg] enabled={}, endpoint={}, hasKey={}",
         aiEnabled, llmEndpoint, (apiKey != null && !apiKey.isBlank()));

    } catch (Exception e) {
      log.warn("Cannot load faq.json, fallback to empty list. {}", e.getMessage());
      faq = List.of();
    }
    // thiết lập timeout đơn giản cho RestTemplate (nếu bạn có HttpComponents, có thể set advanced)
    try {
      var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
      factory.setConnectTimeout(httpTimeoutMs);
      factory.setReadTimeout(httpTimeoutMs);
      http.setRequestFactory(factory);
    } catch (Exception ignored) {}
  }

  public ChatResponse answer(String userMessage) {
    final String q = normalize(userMessage == null ? "" : userMessage);

    // 1) Match từ-khóa
    double bestScore = 0.0;
    String bestAnswer = null;

    for (FaqItem item : faq) {
      int hit = 0;
      for (String kw : item.getIntents()) {
        if (q.contains(normalize(kw))) hit++;
      }
      // điểm rất nhẹ nhàng, ưu tiên nhiều từ-khóa
      double score = (double) hit / (1.0 + item.getIntents().size());
      if (score > bestScore) {
        bestScore = score;
        bestAnswer = item.getAnswer();
      }
    }

    if (bestScore >= keywordThreshold && bestAnswer != null) {
      return ChatResponse.builder()
          .answer(bestAnswer)
          .source("faq")
          .confidence(round2(bestScore))
          .build();
    }
        if (!aiEnabled) {
    log.debug("AI disabled → fallback FAQ only");
    } else if (apiKey == null || apiKey.isBlank()) {
    log.warn("AI_API_KEY is empty → fallback FAQ");
    }

    // 2) Fallback AI
    if (aiEnabled && apiKey != null && !apiKey.isBlank()) {
      String ai = callLLM(userMessage, faq);
      return ChatResponse.builder()
          .answer(ai)
          .source("ai")
          .confidence(0.6) // tuỳ chọn
          .build();
    }

    // 3) Trả lời lịch sự khi không có AI
    return ChatResponse.builder()
        .answer("Mình chưa chắc câu này. Bạn có thể mô tả cụ thể hơn (ví dụ mã đơn, sản phẩm, hoặc chủ đề: đổi hàng/ship/khuyến mãi…)?")
        .source("faq")
        .confidence(0.0)
        .build();
  }

  /** Gọi LLM — tự nhận diện payload theo endpoint */
  private String callLLM(String userMessage, List<FaqItem> faq) {
    try {
      if (isGeminiEndpoint(llmEndpoint)) {
        return callGemini(userMessage, faq);
      } else {
        return callOpenAIStyle(userMessage, faq);
      }
    } catch (Exception e) {
      log.warn("AI call failed: {}", e.toString());
      return fallbackMsg();
    }
  }

 /** Gemini (Google) – v1/v1beta: gộp system vào user, kèm xử lý lỗi rõ ràng */
private String callGemini(String userMessage, List<FaqItem> faq) {
  String url = llmEndpoint + "?key=" + apiKey;
  HttpHeaders headers = new HttpHeaders();
  headers.setContentType(MediaType.APPLICATION_JSON);

  String system = """
Bạn là trợ lý hỗ trợ cho shop gấu bông. Trả lời ngắn gọn...
FAQ:
""" + faqToBullets(faq);

  Map<String,Object> body = Map.of(
      "contents", List.of(
          Map.of("role","user",
                 "parts", List.of(Map.of("text", system + "\n\nCâu hỏi: " + (userMessage==null?"":userMessage))))
      ),
      "generationConfig", Map.of("temperature",0.4,"topK",40,"topP",0.9,"maxOutputTokens",512)
  );

  HttpEntity<Map<String,Object>> req = new HttpEntity<>(body, headers);

  int attempts = 0;
  long[] backoff = {500, 1000, 2000}; // ms
  while (true) {
    attempts++;
    try {
      ResponseEntity<Map> res = http.exchange(url, HttpMethod.POST, req, Map.class);
      Map bodyMap = res.getBody();
      if (bodyMap == null) return fallbackMsg();
      List candidates = (List) bodyMap.get("candidates");
      if (candidates == null || candidates.isEmpty()) return fallbackMsg();
      Map first = (Map) candidates.get(0);
      Map content = (Map) first.get("content");
      List parts = (List) content.get("parts");
      Object text = ((Map) parts.get(0)).get("text");
      return text != null ? text.toString() : fallbackMsg();
    } catch (org.springframework.web.client.HttpServerErrorException e) {
      // 5xx → thử lại
      if (attempts <= backoff.length) {
        try { Thread.sleep(backoff[attempts-1]); } catch (InterruptedException ignored) {}
        continue;
      }
      log.warn("Gemini 5xx after retries: {}", e.getResponseBodyAsString());
      return "AI đang bận (lỗi máy chủ). Bạn thử lại sau giúp mình nhé!";
    } catch (Exception e) {
      log.warn("Gemini call failed: {}", e.toString());
      return fallbackMsg();
    }
  }
}


  /** OpenAI-compatible (OpenAI/Groq/OpenRouter ...) */
  private String callOpenAIStyle(String userMessage, List<FaqItem> faq) {
    String system = """
You are a helpful support assistant for a plush-toy store. Keep answers concise.
Prefer information from this FAQ:
""" + faqToBullets(faq);

    Map<String, Object> body = new HashMap<>();
    body.put("model", "gpt-4o-mini"); // hoặc model tương thích ở nhà cung cấp của bạn
    body.put("messages", List.of(
        Map.of("role", "system", "content", system),
        Map.of("role", "user", "content", userMessage)
    ));

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(apiKey);

    HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
    ResponseEntity<Map> res = http.exchange(llmEndpoint, HttpMethod.POST, req, Map.class);

    Map bodyMap = res.getBody();
    if (bodyMap == null) return fallbackMsg();
    List choices = (List) bodyMap.get("choices");
    if (choices == null || choices.isEmpty()) return fallbackMsg();
    Map first = (Map) choices.get(0);
    Map message = (Map) first.get("message");
    Object content = message != null ? message.get("content") : null;
    return content != null ? content.toString() : fallbackMsg();
  }

  private boolean isGeminiEndpoint(String endpoint) {
    return endpoint != null && endpoint.contains("generativelanguage.googleapis.com");
  }

  private String fallbackMsg() {
    return "Mình đang có chút trục trặc khi xử lý bằng AI. Bạn thử hỏi lại theo cách khác giúp mình nhé!";
  }

  private String faqToBullets(List<FaqItem> faq) {
    if (faq == null || faq.isEmpty()) return "- (chưa có mục FAQ)\n";
    return faq.stream()
        .map(f -> "• " + String.join(", ", f.getIntents()) + " → " + f.getAnswer())
        .collect(Collectors.joining("\n")) + "\n";
  }

  private double round2(double v) {
    return Math.round(v * 100.0) / 100.0;
  }
}
