package com.thubongshop.backend.shippingvoucher;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ShipVoucherRepo extends JpaRepository<ShipVoucher, Integer>, JpaSpecificationExecutor<ShipVoucher> {
  Optional<ShipVoucher> findByCodeIgnoreCase(String code);
}
