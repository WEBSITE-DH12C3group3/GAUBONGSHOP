package com.thubongshop.backend.chatbox;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thubongshop.backend.brand.BrandRepository;
import com.thubongshop.backend.category.Category;
import com.thubongshop.backend.category.CategoryRepository;
import com.thubongshop.backend.chatbox.dto.ChatResponse;
import com.thubongshop.backend.product.Product;
import com.thubongshop.backend.product.ProductRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

import static com.thubongshop.backend.chatbox.TextUtils.normalize;

@Slf4j
@Service("legacyChatService")
@RequiredArgsConstructor
public class ChatService {

  private final ObjectMapper mapper = new ObjectMapper();
  private final ProductRepository productRepository;
  private final CategoryRepository categoryRepository;
  private final BrandRepository brandRepository;
  private final RestTemplate http = new RestTemplate();

  private List<FaqItem> faq = new ArrayList<>();

  @Value("${ai.provider.enabled:false}")
  private boolean aiEnabled;

  @Value("${ai.provider.endpoint:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
  private String llmEndpoint;

  @Value("${ai.provider.apiKey:}")
  private String apiKey;

  @Value("${ai.provider.keywordThreshold:0.25}")
  private double keywordThreshold;

  @Value("${ai.provider.httpTimeoutMs:8000}")
  private int httpTimeoutMs;

  @Value("${ai.provider.model:llama-3.1-8b-instant}")
  private String llmModel;

  @PostConstruct
  public void loadFaq() {
    try (InputStream is = new ClassPathResource("faq.json").getInputStream()) {
      faq = mapper.readValue(is, new TypeReference<List<FaqItem>>() {});
      log.info("Loaded {} FAQ entries", faq.size());
    } catch (Exception e) {
      log.warn("Cannot load faq.json, fallback to empty list. {}", e.getMessage());
      faq = List.of();
    }

    try {
      var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
      factory.setConnectTimeout(httpTimeoutMs);
      factory.setReadTimeout(httpTimeoutMs);
      http.setRequestFactory(factory);
    } catch (Exception ignored) {
    }

    log.info("[AI cfg] enabled={}, endpoint={}, hasKey={}",
        aiEnabled, llmEndpoint, (apiKey != null && !apiKey.isBlank()));
  }

  public ChatResponse answer(String userMessage) {
    final String q = normalize(userMessage == null ? "" : userMessage);

    double bestScore = 0.0;
    String bestAnswer = null;

    for (FaqItem item : faq) {
      int hit = 0;
      for (String kw : item.getIntents()) {
        if (q.contains(normalize(kw))) hit++;
      }
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
      log.debug("AI disabled -> fallback FAQ only");
    } else if (apiKey == null || apiKey.isBlank()) {
      log.warn("AI_API_KEY is empty -> fallback FAQ");
    }

    if (aiEnabled && apiKey != null && !apiKey.isBlank()) {
      String ai = callLLM(userMessage, faq);
      return ChatResponse.builder()
          .answer(ai)
          .source("ai")
          .confidence(0.7)
          .build();
    }

    return ChatResponse.builder()
        .answer("Mình chưa chắc câu này. Bạn có thể mô tả cụ thể hơn (ví dụ mã đơn, sản phẩm, chủ đề đổi trả/ship/khuyến mãi)?")
        .source("faq")
        .confidence(0.0)
        .build();
  }

  private String callLLM(String userMessage, List<FaqItem> faq) {
    try {
      if (isGeminiEndpoint(llmEndpoint)) {
        return callGemini(userMessage, faq);
      }
      return callOpenAIStyle(userMessage, faq);
    } catch (Exception e) {
      log.warn("AI call failed: {}", e.toString());
      return fallbackMsg();
    }
  }

  private String callGemini(String userMessage, List<FaqItem> faq) {
    String url = llmEndpoint + "?key=" + apiKey;
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);

    String prompt = buildGroundedPrompt(userMessage, faq);
    Map<String, Object> body = Map.of(
        "contents", List.of(
            Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))
        ),
        "generationConfig", Map.of(
            "temperature", 0.35,
            "topK", 40,
            "topP", 0.9,
            "maxOutputTokens", 512
        )
    );

    HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
    ResponseEntity<Map> res = http.exchange(url, HttpMethod.POST, req, Map.class);

    Map bodyMap = res.getBody();
    if (bodyMap == null) return fallbackMsg();
    List candidates = (List) bodyMap.get("candidates");
    if (candidates == null || candidates.isEmpty()) return fallbackMsg();
    Map first = (Map) candidates.get(0);
    Map content = (Map) first.get("content");
    List parts = content == null ? null : (List) content.get("parts");
    if (parts == null || parts.isEmpty()) return fallbackMsg();
    Object text = ((Map) parts.get(0)).get("text");
    return text != null ? text.toString() : fallbackMsg();
  }

  private String callOpenAIStyle(String userMessage, List<FaqItem> faq) {
    String prompt = buildGroundedPrompt(userMessage, faq);
    Map<String, Object> body = new HashMap<>();
    body.put("model", llmModel);
    body.put("messages", List.of(
        Map.of("role", "user", "content", prompt)
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

  private String buildGroundedPrompt(String userMessage, List<FaqItem> faqList) {
    String faqContext = faqToBullets(faqList);
    String dataContext = buildStoreContext(userMessage);

    return """
Bạn là trợ lý CSKH cho GAUBONGSHOP.
Mục tiêu: trả lời tự nhiên, lịch sự, ngắn gọn và bám sát dữ liệu thật của shop.

QUY TẮC:
1) Ưu tiên dùng dữ liệu trong phần NGỮ CẢNH DỮ LIỆU và FAQ bên dưới.
2) Không bịa thông tin (giá, tồn kho, sản phẩm, chính sách).
3) Nếu thiếu dữ liệu để khẳng định, hãy nói rõ là chưa có đủ dữ liệu và đề nghị khách cung cấp thêm (mã đơn, tên sản phẩm...).
4) Trả lời bằng tiếng Việt.

NGỮ CẢNH DỮ LIỆU:
""" + dataContext + """

FAQ:
""" + faqContext + """

CÂU HỎI KHÁCH:
""" + (userMessage == null ? "" : userMessage);
  }

  private String buildStoreContext(String userMessage) {
    String keyword = userMessage == null ? "" : userMessage.trim();
    var pageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
    List<Product> products = productRepository.search(keyword, null, null, null, null, pageable).getContent();
    if (products.isEmpty()) {
      products = productRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    Map<Long, String> categoryMap = categoryRepository.findAll().stream()
        .collect(Collectors.toMap(Category::getId, Category::getName, (a, b) -> a));
    Map<Integer, String> brandMap = brandRepository.findAll().stream()
        .collect(Collectors.toMap(b -> b.getId(), b -> b.getName(), (a, b) -> a));

    String productLines = products.stream()
        .limit(5)
        .map(p -> String.format(
            "- [%d] %s | giá: %s | tồn: %s | danh mục: %s | thương hiệu: %s",
            p.getId(),
            nvl(p.getName()),
            p.getPrice() == null ? "chưa rõ" : String.format(Locale.US, "%,.0f", p.getPrice()),
            p.getStock() == null ? "chưa rõ" : p.getStock().toString(),
            categoryMap.getOrDefault(p.getCategoryId() == null ? null : p.getCategoryId().longValue(), "khác"),
            brandMap.getOrDefault(p.getBrandId(), "khác")
        ))
        .collect(Collectors.joining("\n"));

    String featuredCategories = categoryRepository.findByIsFeaturedTrue().stream()
        .limit(6)
        .map(Category::getName)
        .collect(Collectors.joining(", "));

    return "Sản phẩm liên quan:\n"
        + (productLines.isBlank() ? "- chưa có dữ liệu sản phẩm phù hợp\n" : productLines + "\n")
        + "Danh mục nổi bật: "
        + (featuredCategories.isBlank() ? "chưa có dữ liệu" : featuredCategories);
  }

  private String nvl(String s) {
    return (s == null || s.isBlank()) ? "(không tên)" : s;
  }

  private boolean isGeminiEndpoint(String endpoint) {
    return endpoint != null && endpoint.contains("generativelanguage.googleapis.com");
  }

  private String fallbackMsg() {
    return "Mình đang có chút trục trặc khi xử lý bằng AI. Bạn thử hỏi lại hoặc cho mình thêm thông tin (mã đơn/tên sản phẩm) nhé!";
  }

  private String faqToBullets(List<FaqItem> faqList) {
    if (faqList == null || faqList.isEmpty()) return "- (chưa có mục FAQ)\n";
    return faqList.stream()
        .map(f -> "- " + String.join(", ", f.getIntents()) + " -> " + f.getAnswer())
        .collect(Collectors.joining("\n")) + "\n";
  }

  private double round2(double v) {
    return Math.round(v * 100.0) / 100.0;
  }
}
