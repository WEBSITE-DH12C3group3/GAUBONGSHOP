package com.thubongshop.backend.shipping;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShippingRateRepo extends JpaRepository<ShippingRate, Integer> {
  List<ShippingRate> findByActiveTrue();
}
