package com.thubongshop.backend.order;

import com.thubongshop.backend.cart.Cart;
import com.thubongshop.backend.cart.CartService;
import com.thubongshop.backend.order.dto.OrderItemResponse;
import com.thubongshop.backend.order.dto.OrderResponse;
import com.thubongshop.backend.product.Product;
import com.thubongshop.backend.product.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final CartService cartService;

    @Transactional
    public OrderResponse checkout(Integer userId) {
        List<Cart> cart = cartService.getCartRows(userId);
        if (cart.isEmpty()) throw new IllegalStateException("Giỏ hàng trống");

        // Load products
        Map<Integer, Product> products = productRepo.findAllById(
            cart.stream().map(Cart::getProductId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(Product::getId, p -> p));

        // Validate stock & total
        BigDecimal total = BigDecimal.ZERO;
        for (Cart c : cart) {
            Product p = Optional.ofNullable(products.get(c.getProductId()))
                    .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại: " + c.getProductId()));
            int stock = Optional.ofNullable(p.getStock()).orElse(0);
            if (c.getQuantity() > stock) {
                throw new IllegalStateException("Tồn kho không đủ cho sản phẩm: " + p.getName());
            }
            BigDecimal unit = BigDecimal.valueOf(Optional.ofNullable(p.getPrice()).orElse(0.0));
            total = total.add(unit.multiply(BigDecimal.valueOf(c.getQuantity())));
        }

        // Tạo order
        Order order = new Order();
        order.setUserId(userId);
        order.setStatus(OrderStatus.pending);
        order.setTotalAmount(total);
        order = orderRepo.save(order);

        // Tạo order items + trừ kho
        for (Cart c : cart) {
            Product p = products.get(c.getProductId());
            BigDecimal unit = BigDecimal.valueOf(Optional.ofNullable(p.getPrice()).orElse(0.0));

            OrderItem oi = new OrderItem();
            oi.setOrderId(order.getId());
            oi.setProductId(p.getId());
            oi.setQuantity(c.getQuantity());
            oi.setPrice(unit);
            itemRepo.save(oi);

            int stock = Optional.ofNullable(p.getStock()).orElse(0);
            p.setStock(Math.max(0, stock - c.getQuantity()));
            productRepo.save(p);
        }

        // Xoá giỏ
        cartService.clear(userId);

        return mapOrder(order);
    }

    public List<OrderResponse> myOrders(Integer userId) {
        List<Order> rows = orderRepo.findByUserIdOrderByIdDesc(userId);
        return rows.stream().map(this::mapOrderWithItems).toList();
    }

    public OrderResponse myOrderDetail(Integer userId, Integer orderId) {
        Order o = orderRepo.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        if (!Objects.equals(o.getUserId(), userId))
            throw new SecurityException("Không có quyền truy cập đơn hàng này");

        return mapOrderWithItems(o);
    }

    @Transactional
    public OrderResponse cancelMyOrder(Integer userId, Integer orderId) {
        Order o = orderRepo.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        if (!Objects.equals(o.getUserId(), userId))
            throw new SecurityException("Không có quyền");

        if (o.getStatus() == OrderStatus.cancelled || o.getStatus() == OrderStatus.delivered)
            throw new IllegalStateException("Đơn hàng không thể hủy ở trạng thái hiện tại");

        o.setStatus(OrderStatus.cancelled);
        orderRepo.save(o);
        // (Tùy chọn) hoàn kho nếu cần
        return mapOrderWithItems(o);
    }

    /* ========= Admin ========= */

    public Page<OrderResponse> adminList(String status, Pageable pageable) {
        if (status == null || status.isBlank()) {
            return orderRepo.findAllByOrderByIdDesc(pageable).map(this::mapOrder);
        } else {
            OrderStatus st = OrderStatus.from(status);
            return orderRepo.findByStatusOrderByIdDesc(st, pageable).map(this::mapOrder);
        }
    }

    public OrderResponse adminDetail(Integer orderId) {
        Order o = orderRepo.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        return mapOrderWithItems(o);
    }

    @Transactional
    public OrderResponse adminUpdateStatus(Integer orderId, OrderStatus status) {
        Order o = orderRepo.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        o.setStatus(status);
        orderRepo.save(o);
        return mapOrderWithItems(o);
    }

    /* ===== Mapping helpers ===== */

    private OrderResponse mapOrder(Order o) {
        OrderResponse resp = new OrderResponse();
        resp.setId(o.getId());
        resp.setOrderDate(o.getOrderDate());
        resp.setStatus(o.getStatus());
        resp.setTotalAmount(o.getTotalAmount());
        return resp;
    }

    private OrderResponse mapOrderWithItems(Order o) {
        List<OrderItem> items = itemRepo.findByOrderId(o.getId());

        Map<Integer, Product> products = productRepo.findAllById(
            items.stream().map(OrderItem::getProductId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(Product::getId, p -> p));

        List<OrderItemResponse> list = items.stream().map(oi -> {
            Product p = products.get(oi.getProductId());
            OrderItemResponse dto = new OrderItemResponse();
            dto.setProductId(oi.getProductId());
            dto.setQuantity(oi.getQuantity());
            dto.setUnitPrice(oi.getPrice());
            dto.setLineTotal(oi.getPrice().multiply(BigDecimal.valueOf(oi.getQuantity())));
            if (p != null) {
                dto.setProductName(p.getName());
                dto.setImageUrl(p.getImageUrl());
            }
            return dto;
        }).toList();

        OrderResponse resp = mapOrder(o);
        resp.setItems(list);
        return resp;
    }
}
