package com.thubongshop.backend.shipping.rate;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarrierRateRuleRepo extends JpaRepository<CarrierRateRule, Integer> {
  List<CarrierRateRule> findByServiceIdOrderByMinKmAsc(Integer serviceId);
}
