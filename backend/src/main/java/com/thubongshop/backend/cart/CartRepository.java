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
}
