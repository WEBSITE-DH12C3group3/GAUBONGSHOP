package com.thubongshop.backend.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderItemRepo extends JpaRepository<OrderItem, Integer> {

    // Lấy toàn bộ item của 1 đơn
    List<OrderItem> findByOrderId(Integer orderId);

    // (tuỳ chọn) kiểm tra có item nào của đơn hay không
    @Query("SELECT COUNT(oi.id) > 0 FROM OrderItem oi WHERE oi.order.id = :orderId")
    boolean existsByOrderId(@Param("orderId") Integer orderId);
}
