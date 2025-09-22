package com.thubongshop.backend.shippingvoucher;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ShipVoucherRepo extends JpaRepository<ShipVoucher, Integer> {
  Optional<ShipVoucher> findByCodeIgnoreCase(String code);
}
