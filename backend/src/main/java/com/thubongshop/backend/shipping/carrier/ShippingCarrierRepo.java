package com.thubongshop.backend.shipping.carrier;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShippingCarrierRepo extends JpaRepository<ShippingCarrier, Integer> {
  boolean existsByCodeIgnoreCase(String code);
  Optional<ShippingCarrier> findByCodeIgnoreCase(String code);
}
