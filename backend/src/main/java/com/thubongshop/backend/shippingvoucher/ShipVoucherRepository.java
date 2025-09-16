package com.thubongshop.backend.shippingvoucher;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShipVoucherRepository extends JpaRepository<ShipVoucher, Integer> {
    Page<ShipVoucher> findByCodeContainingIgnoreCase(String q, Pageable pageable);
    Optional<ShipVoucher> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
}
