package com.thubongshop.backend.warehouse;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {
  Optional<Warehouse> findFirstByIsActiveTrue();
}
