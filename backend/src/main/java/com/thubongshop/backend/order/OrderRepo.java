package com.thubongshop.backend.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepo extends JpaRepository<Order, Integer> {

  // ✅ Lấy danh sách đơn theo user
  Page<Order> findByUserId(Integer userId, Pageable pageable);

  @EntityGraph(attributePaths = { "items" })
  Optional<Order> findByOrderCode(String orderCode);
  @Query("SELECT u.id FROM User u WHERE lower(u.email) = lower(:username) OR lower(u.username) = lower(:username)")
Integer findUserIdByEmailOrUsername(@Param("username") String username);


}
