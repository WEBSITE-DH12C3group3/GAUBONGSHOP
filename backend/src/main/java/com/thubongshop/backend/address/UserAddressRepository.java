package com.thubongshop.backend.address;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserAddressRepository extends JpaRepository<UserAddress, Integer> {
  List<UserAddress> findByUserIdOrderByIdDesc(Integer userId);
  default UserAddress require(Integer id) {
    return findById(id).orElseThrow(() -> new IllegalArgumentException("Address not found"));
  }
}
