package com.thubongshop.backend.cart;

import com.thubongshop.backend.cart.dto.*;
import com.thubongshop.backend.product.Product;
import com.thubongshop.backend.product.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;

    public CartSummaryResponse getMyCart(Integer userId) {
        List<Cart> rows = cartRepo.findByUserId(userId);
        Map<Integer, Product> products = productRepo.findAllById(
                rows.stream().map(Cart::getProductId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(Product::getId, p -> p));

        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        int totalQty = 0;

        for (Cart c : rows) {
            Product p = products.get(c.getProductId());
            if (p == null) continue; // product đã xóa
            BigDecimal unit = BigDecimal.valueOf(Optional.ofNullable(p.getPrice()).orElse(0.0));
            BigDecimal line = unit.multiply(BigDecimal.valueOf(c.getQuantity()));

            CartItemResponse dto = new CartItemResponse();
            dto.setProductId(p.getId());
            dto.setProductName(p.getName());
            dto.setImageUrl(p.getImageUrl());
            dto.setAvailableStock(Optional.ofNullable(p.getStock()).orElse(0));
            dto.setQuantity(c.getQuantity());
            dto.setUnitPrice(unit);
            dto.setLineTotal(line);

            items.add(dto);
            total = total.add(line);
            totalQty += c.getQuantity();
        }

        CartSummaryResponse resp = new CartSummaryResponse();
        resp.setItems(items);
        resp.setTotalAmount(total);
        resp.setTotalQuantity(totalQty);
        return resp;
    }

    @Transactional
    public CartSummaryResponse add(Integer userId, Integer productId, int quantity) {
        Product p = productRepo.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại"));

        if (quantity < 1) quantity = 1;
        int stock = Optional.ofNullable(p.getStock()).orElse(0);
        if (stock < quantity) throw new IllegalArgumentException("Số lượng vượt tồn kho");

        Cart row = cartRepo.findByUserIdAndProductId(userId, productId)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUserId(userId);
                    c.setProductId(productId);
                    c.setQuantity(0);
                    return c;
                });

        int newQty = row.getQuantity() + quantity;
        if (newQty > stock) newQty = stock; // clamp to stock
        row.setQuantity(newQty);
        cartRepo.save(row);

        return getMyCart(userId);
    }

    @Transactional
    public CartSummaryResponse updateQty(Integer userId, Integer productId, int quantity) {
        if (quantity <= 0) {
            cartRepo.deleteByUserIdAndProductId(userId, productId);
            return getMyCart(userId);
        }
        Product p = productRepo.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại"));
        int stock = Optional.ofNullable(p.getStock()).orElse(0);
        if (quantity > stock) quantity = stock;

        Cart row = cartRepo.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new NoSuchElementException("Mục giỏ hàng không tồn tại"));
        row.setQuantity(quantity);
        cartRepo.save(row);
        return getMyCart(userId);
    }

    @Transactional
    public CartSummaryResponse remove(Integer userId, Integer productId) {
        cartRepo.deleteByUserIdAndProductId(userId, productId);
        return getMyCart(userId);
    }

    @Transactional
    public void clear(Integer userId) {
        cartRepo.deleteByUserId(userId);
    }

    // Dùng nội bộ khi checkout
    public List<Cart> getCartRows(Integer userId) {
        return cartRepo.findByUserId(userId);
    }
}
