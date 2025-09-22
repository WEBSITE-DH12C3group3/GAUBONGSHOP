package com.thubongshop.backend.order;

public enum OrderStatus {
    pending, processing, shipped, delivered, cancelled;

    public static OrderStatus from(String s) {
        if (s == null) return pending;
        return OrderStatus.valueOf(s.toLowerCase());
    }
}
