// src/main/java/com/thubongshop/backend/common/EmailService.java
package com.thubongshop.backend.common;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;

  // cấu hình trong application.properties: app.mail.from=GAUBONGSHOP <your@gmail.com>
  @Value("${app.mail.from:}")
  private String from;

  /** Gửi email text thuần */
  public void sendPlainText(String to, String subject, String content) {
    try {
      MimeMessage msg = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
      if (from != null && !from.isBlank()) helper.setFrom(from);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(content, false);
      mailSender.send(msg);
    } catch (MessagingException e) {
      throw new RuntimeException("Gửi email thất bại: " + e.getMessage(), e);
    }
  }
}
