package com.thubongshop.backend.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserIdOrderByIdDesc(Integer userId);
    Page<Order> findAllByOrderByIdDesc(Pageable pageable);
    Page<Order> findByStatusOrderByIdDesc(OrderStatus status, Pageable pageable);
}
