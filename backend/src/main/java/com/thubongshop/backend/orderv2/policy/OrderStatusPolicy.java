package com.thubongshop.backend.orderv2.policy;

import java.util.*;

public class OrderStatusPolicy {
  private static final Map<String, Set<String>> ALLOWED = Map.of(
    "PENDING_PAYMENT", Set.of("PAID", "CANCELED"),
    "PAID",            Set.of("PACKING", "CANCELED"),
    "PACKING",         Set.of("SHIPPED", "CANCELED"),
    "SHIPPED",         Set.of("DELIVERED", "CANCELED"),
    "DELIVERED",       Set.of(),          // kết thúc
    "CANCELED",        Set.of()           // kết thúc
  );

  public static void ensureTransitionAllowed(String from, String to) {
    if (Objects.equals(from, to)) return;
    Set<String> allowed = ALLOWED.getOrDefault(from, Set.of());
    if (!allowed.contains(to))
      throw new IllegalStateException("Không thể chuyển từ " + from + " sang " + to);
  }
}
