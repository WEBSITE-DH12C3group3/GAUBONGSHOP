package com.thubongshop.backend.shipping.rate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface CarrierRateRuleRepo extends JpaRepository<CarrierRateRule, Integer> {

  List<CarrierRateRule> findByServiceIdOrderByMinKmAsc(Integer serviceId);

  @Query("""
    SELECT r FROM CarrierRateRule r
     WHERE r.service.id = :serviceId AND r.active = true
       AND (r.activeFrom IS NULL OR r.activeFrom <= CURRENT_DATE)
       AND (r.activeTo   IS NULL OR r.activeTo   >= CURRENT_DATE)
       AND r.minKm <= :distance
       AND (r.maxKm IS NULL OR r.maxKm >= :distance)
     ORDER BY r.minKm ASC
  """)
  List<CarrierRateRule> findMatchingRules(Integer serviceId, BigDecimal distance);
}
