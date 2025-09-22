package com.thubongshop.backend.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShippingRecordRepo extends JpaRepository<ShippingRecord, Integer> {
  Optional<ShippingRecord> findByOrderId(Integer orderId);
}
