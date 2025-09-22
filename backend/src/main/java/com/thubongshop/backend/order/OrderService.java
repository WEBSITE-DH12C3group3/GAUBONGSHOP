package com.thubongshop.backend.order;

import com.thubongshop.backend.order.dto.CreateOrderRequest;
import com.thubongshop.backend.order.dto.OrderResponse;
import com.thubongshop.backend.shippingcore.ShippingCalculatorService;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import com.thubongshop.backend.shippingvoucher.ShipVoucher;
import com.thubongshop.backend.shippingvoucher.ShipVoucherService;
import com.thubongshop.backend.shared.BusinessException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
  private final OrderRepo orderRepo;
  private final OrderItemRepo itemRepo;
  private final ShippingRecordRepo shippingRecordRepo;

  private final ShippingCalculatorService shippingCalc;
  private final ShipVoucherService voucherService;

  @Transactional
  public OrderResponse createOrder(CreateOrderRequest req) {
    if (req.items() == null || req.items().isEmpty())
      throw new BusinessException("EMPTY_ITEMS", "Đơn hàng không có sản phẩm");

    BigDecimal itemsTotal = BigDecimal.ZERO;
    BigDecimal weightKg = BigDecimal.ZERO;
    for (var it : req.items()) {
      itemsTotal = itemsTotal.add(it.unitPrice().multiply(new BigDecimal(it.quantity())));
      weightKg = weightKg.add(it.weightKgPerItem().multiply(new BigDecimal(it.quantity())));
    }

    var quote = shippingCalc.quote(new ShippingQuoteRequest(
      itemsTotal, weightKg, req.province(), req.voucherCode()
    ));

    Order o = Order.builder()
      .userId(req.userId())
      .status(OrderStatus.PENDING_PAYMENT)
      .itemsTotal(itemsTotal)
      .shippingFee(quote.finalFee())
      .shippingDiscount(quote.discount())
      .grandTotal(itemsTotal.add(quote.finalFee()))
      .voucherCode(quote.appliedVoucher())
      .receiverName(req.receiverName())
      .phone(req.phone())
      .addressLine(req.addressLine())
      .province(req.province())
      .weightKg(weightKg)
      .build();
    o = orderRepo.save(o);

    for (var it : req.items()) {
      var e = OrderItem.builder()
        .order(o)
        .productId(it.productId())
        .productName(it.productName())
        .unitPrice(it.unitPrice())
        .quantity(it.quantity())
        .weightKgPerItem(it.weightKgPerItem())
        .build();
      itemRepo.save(e);
    }

    var sr = ShippingRecord.builder()
      .order(o)
      .carrier(quote.carrier())
      .trackingCode(null)
      .status(ShippingRecord.ShipStatus.CREATED)
      .feeCharged(quote.finalFee())
      .build();
    shippingRecordRepo.save(sr);

    if (quote.appliedVoucher() != null) {
      ShipVoucher v = voucherService.getActiveOrThrow(quote.appliedVoucher());
      voucherService.increaseUsed(v);
    }

    return toDto(o);
  }

  public Page<OrderResponse> findMyOrders(Integer userId, Pageable pageable) {
    return orderRepo.findByUserId(userId, pageable).map(this::toDto);
  }

  public OrderResponse getById(Integer id, Integer userId) {
    var o = orderRepo.findById(id).orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không thấy đơn hàng"));
    if (!o.getUserId().equals(userId))
      throw new BusinessException("FORBIDDEN", "Bạn không có quyền xem đơn hàng này");
    return toDto(o);
  }

  @Transactional
  public OrderResponse markPaid(Integer orderId, Integer userId) {
    var o = orderRepo.findById(orderId).orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không thấy đơn hàng"));
    if (!o.getUserId().equals(userId))
      throw new BusinessException("FORBIDDEN", "Bạn không có quyền cập nhật đơn này");
    if (o.getStatus() != OrderStatus.PENDING_PAYMENT)
      throw new BusinessException("INVALID_STATE", "Trạng thái đơn không hợp lệ để thanh toán");

    o.setStatus(OrderStatus.PAID);
    o = orderRepo.save(o);
    return toDto(o);
  }

  @Transactional
  public OrderResponse cancel(Integer orderId, Integer userId) {
    var o = orderRepo.findById(orderId).orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không thấy đơn hàng"));
    if (!o.getUserId().equals(userId))
      throw new BusinessException("FORBIDDEN", "Bạn không có quyền hủy đơn này");
    if (o.getStatus() == OrderStatus.SHIPPED || o.getStatus() == OrderStatus.DELIVERED)
      throw new BusinessException("INVALID_STATE", "Đơn đã giao cho hãng, không thể hủy");

    o.setStatus(OrderStatus.CANCELED);
    o = orderRepo.save(o);
    return toDto(o);
  }

  @Transactional
  public OrderResponse updateShipping(Integer orderId, String trackingCode, ShippingRecord.ShipStatus status) {
    var o = orderRepo.findById(orderId).orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không thấy đơn hàng"));
    var sr = shippingRecordRepo.findByOrderId(orderId)
      .orElseThrow(() -> new BusinessException("SHIP_RECORD_NOT_FOUND", "Không thấy ShippingRecord"));

    if (trackingCode != null && !trackingCode.isBlank())
      sr.setTrackingCode(trackingCode);

    sr.setStatus(status);
    shippingRecordRepo.save(sr);

    switch (status) {
      case PICKED, IN_TRANSIT -> o.setStatus(OrderStatus.PACKING);
      case DELIVERED -> o.setStatus(OrderStatus.DELIVERED);
      case FAILED -> { }
      default -> {}
    }
    orderRepo.save(o);

    return toDto(o);
  }

  private OrderResponse toDto(Order o) {
    var itemDtos = o.getItems().stream().map(
      it -> new OrderResponse.Item(it.getProductId(), it.getProductName(), it.getUnitPrice(), it.getQuantity(), it.getWeightKgPerItem())
    ).toList();

    OrderResponse.Shipping shipDto = null;
    if (o.getShippingRecord() != null) {
      var s = o.getShippingRecord();
      shipDto = new OrderResponse.Shipping(s.getCarrier(), s.getTrackingCode(),
        s.getStatus().name(), s.getFeeCharged());
    }

    return new OrderResponse(
      o.getId(), o.getUserId(), o.getStatus(),
      o.getItemsTotal(), o.getShippingFee(), o.getShippingDiscount(), o.getGrandTotal(),
      o.getVoucherCode(), o.getReceiverName(), o.getPhone(), o.getAddressLine(), o.getProvince(),
      o.getWeightKg(), o.getCreatedAt(), shipDto, itemDtos
    );
  }
}
