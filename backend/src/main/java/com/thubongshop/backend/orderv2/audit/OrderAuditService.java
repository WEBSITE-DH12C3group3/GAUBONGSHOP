package com.thubongshop.backend.orderv2.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OrderAuditService {
  private final OrderAuditRepo repo;

  public void log(Integer orderId, String action, String oldStatus, String newStatus,
                  Integer byUserId, String note) {
    OrderAudit a = OrderAudit.builder()
        .orderId(orderId)
        .action(action)
        .oldStatus(oldStatus)
        .newStatus(newStatus)
        .byUserId(byUserId)
        .note(note)
        .createdAt(Timestamp.from(Instant.now()))
        .build();
    repo.save(a);
  }
}
