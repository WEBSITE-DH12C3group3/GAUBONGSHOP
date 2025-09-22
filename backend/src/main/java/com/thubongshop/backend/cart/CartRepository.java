package com.thubongshop.backend.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    List<Cart> findByUserId(Integer userId);
    Optional<Cart> findByUserIdAndProductId(Integer userId, Integer productId);
    void deleteByUserIdAndProductId(Integer userId, Integer productId);
    void deleteByUserId(Integer userId);

    @Modifying
    @Query("update Cart c set c.quantity = :quantity where c.userId = :userId and c.productId = :productId")
    int updateQuantity(Integer userId, Integer productId, Integer quantity);

    // NEW: chọn/bỏ chọn từng item
    @Modifying
    @Query("update Cart c set c.selected = :selected where c.userId = :userId and c.productId = :productId")
    int updateSelected(Integer userId, Integer productId, Boolean selected);

    // NEW: chọn/bỏ chọn tất cả
    @Modifying
    @Query("update Cart c set c.selected = :selected where c.userId = :userId")
    int updateAllSelectedByUser(Integer userId, Boolean selected);

    // NEW: đếm xem có item nào được chọn không
    @Query("select count(c) from Cart c where c.userId = :userId and c.selected = true")
    long countSelectedByUser(Integer userId);
}
