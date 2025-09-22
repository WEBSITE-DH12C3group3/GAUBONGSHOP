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

    // Lấy giỏ + tổng (cả giỏ + theo lựa chọn)
    @Transactional
    public CartSummaryResponse getMyCart(Integer userId) {
        List<Cart> rows = cartRepo.findByUserId(userId);
        return buildSummary(rows);
    }

    private CartSummaryResponse buildSummary(List<Cart> rows) {
        List<CartItemResponse> items = new ArrayList<>();

        BigDecimal cartTotal = BigDecimal.ZERO;
        int cartQty = 0;

        BigDecimal selTotal = BigDecimal.ZERO;
        int selQty = 0;
        boolean hasAnySelected = rows.stream().anyMatch(Cart::getSelected);

        for (Cart c : rows) {
            Product p = productRepo.findById(c.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại"));

            // ===== FIX: p.getPrice() trả về Double -> lấy ra Double rồi convert sang BigDecimal
            Double priceDouble = Optional.ofNullable(p.getPrice()).orElse(0.0);
            BigDecimal unit = BigDecimal.valueOf(priceDouble);

            BigDecimal line = unit.multiply(BigDecimal.valueOf(c.getQuantity()));

            CartItemResponse dto = new CartItemResponse();
            dto.setProductId(p.getId());
            dto.setProductName(p.getName());
            dto.setImageUrl(p.getImageUrl());
            dto.setAvailableStock(Optional.ofNullable(p.getStock()).orElse(0));
            dto.setQuantity(c.getQuantity());
            dto.setUnitPrice(unit);
            dto.setLineTotal(line);
            dto.setSelected(Boolean.TRUE.equals(c.getSelected()));

            items.add(dto);

            // tổng cả giỏ
            cartTotal = cartTotal.add(line);
            cartQty += c.getQuantity();

            // tổng theo lựa chọn (nếu có chọn)
            if (Boolean.TRUE.equals(c.getSelected())) {
                selTotal = selTotal.add(line);
                selQty += c.getQuantity();
            }
        }

        // Nếu KHÔNG chọn cái nào => mặc định thanh toán tất cả
        if (!hasAnySelected) {
            selTotal = cartTotal;
            selQty = cartQty;
        }

        CartSummaryResponse resp = new CartSummaryResponse();
        resp.setItems(items);
        resp.setTotalQuantity(cartQty);
        resp.setTotalAmount(cartTotal);
        resp.setHasAnySelected(hasAnySelected);
        resp.setSelectedQuantity(selQty);
        resp.setSelectedAmount(selTotal);
        return resp;
    }

    @Transactional
    public CartSummaryResponse add(Integer userId, Integer productId, Integer quantity) {
        Product p = productRepo.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại"));
        int stock = Optional.ofNullable(p.getStock()).orElse(0);
        if (quantity > stock) quantity = stock;

        Cart row = cartRepo.findByUserIdAndProductId(userId, productId)
                .orElseGet(() -> {
                    Cart n = new Cart();
                    n.setUserId(userId);
                    n.setProductId(productId);
                    n.setQuantity(0);
                    n.setSelected(true); // mặc định chọn
                    return n;
                });

        row.setQuantity(Math.max(1, row.getQuantity() + quantity));
        cartRepo.save(row);
        return getMyCart(userId);
    }

    @Transactional
    public CartSummaryResponse updateQuantity(Integer userId, Integer productId, Integer quantity) {
        Product p = productRepo.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại"));
        int stock = Optional.ofNullable(p.getStock()).orElse(0);
        if (quantity > stock) quantity = stock;

        Cart row = cartRepo.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new NoSuchElementException("Mục giỏ hàng không tồn tại"));

        if (quantity <= 0) {
            cartRepo.deleteByUserIdAndProductId(userId, productId);
        } else {
            row.setQuantity(quantity);
            cartRepo.save(row);
        }
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

    // NEW: chọn/bỏ chọn 1 item
    @Transactional
    public CartSummaryResponse setSelected(Integer userId, Integer productId, boolean selected) {
        Cart row = cartRepo.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new NoSuchElementException("Mục giỏ hàng không tồn tại"));
        row.setSelected(selected);
        cartRepo.save(row);
        return getMyCart(userId);
    }

    // NEW: chọn/bỏ chọn tất cả
    @Transactional
    public CartSummaryResponse setAllSelected(Integer userId, boolean selected) {
        cartRepo.updateAllSelectedByUser(userId, selected);
        return getMyCart(userId);
    }

    // NEW: Tập “dùng để thanh toán” theo quy tắc:
    // - nếu có item được chọn => dùng các item đó
    // - nếu không có item nào được chọn => dùng toàn bộ giỏ
    @Transactional
    public CartSummaryResponse getCheckoutSet(Integer userId) {
        List<Cart> rows = cartRepo.findByUserId(userId);
        boolean hasAnySelected = rows.stream().anyMatch(Cart::getSelected);

        List<Cart> chosen = hasAnySelected
                ? rows.stream().filter(Cart::getSelected).collect(Collectors.toList())
                : rows;

        return buildSummary(chosen); // buildSummary sẽ tự fill total/selected dựa theo danh sách truyền vào
    }

    // Dùng nội bộ khi checkout (nếu chỗ khác cần raw rows)
    public List<Cart> getCartRows(Integer userId) {
        return cartRepo.findByUserId(userId);
    }

    // ====== (Nếu bạn đã thêm merge guest cart trước đó giữ nguyên tại đây) ======
    @Transactional
    public CartSummaryResponse mergeGuestCart(Integer userId, List<MergeCartItem> items) {
        if (items == null || items.isEmpty()) {
            return getMyCart(userId);
        }
        for (MergeCartItem it : items) {
            if (it == null || it.getProductId() == null) continue;

            Product p = productRepo.findById(it.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại"));
            int stock = Optional.ofNullable(p.getStock()).orElse(0);
            int inc = Math.max(1, Optional.ofNullable(it.getQuantity()).orElse(1));
            inc = Math.min(inc, stock);

            Cart row = cartRepo.findByUserIdAndProductId(userId, it.getProductId())
                    .orElseGet(() -> {
                        Cart n = new Cart();
                        n.setUserId(userId);
                        n.setProductId(it.getProductId());
                        n.setQuantity(0);
                        n.setSelected(Boolean.TRUE.equals(it.getSelected()));
                        return n;
                    });

            int newQty = Math.min(stock, row.getQuantity() + inc);
            row.setQuantity(newQty);
            if (Boolean.TRUE.equals(it.getSelected())) row.setSelected(true);

            cartRepo.save(row);
        }
        return getMyCart(userId);
    }
}
