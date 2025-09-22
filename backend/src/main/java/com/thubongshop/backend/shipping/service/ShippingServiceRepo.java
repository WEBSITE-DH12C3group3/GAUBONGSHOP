package com.thubongshop.backend.shipping.service;

import com.thubongshop.backend.shipping.carrier.ShippingCarrier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShippingServiceRepo extends JpaRepository<ShippingServiceEntity, Integer> {
  List<ShippingServiceEntity> findByCarrierIdOrderByCodeAsc(Integer carrierId);
  boolean existsByCarrierAndCodeIgnoreCase(ShippingCarrier carrier, String code);
}
