package com.thubongshop.backend.order;

import com.thubongshop.backend.order.dto.CreateOrderRequest;
import com.thubongshop.backend.order.dto.OrderResponse;
import com.thubongshop.backend.product.ProductRepository;           // dùng đúng repo
import com.thubongshop.backend.shippingcore.ShippingCalculatorService;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import com.thubongshop.backend.shippingvoucher.ShipVoucher;
import com.thubongshop.backend.shippingvoucher.ShipVoucherService;
import com.thubongshop.backend.shared.BusinessException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

  private static final RoundingMode MONEY_RM = RoundingMode.HALF_UP;

  private final OrderRepo orderRepo;
  private final OrderItemRepo itemRepo;
  private final ShippingRecordRepo shippingRecordRepo;

  private final ProductRepository productRepository;     // ✅ khớp với repo của bạn

  private final ShippingCalculatorService shippingCalc;
  private final ShipVoucherService voucherService;

  @Transactional
  public OrderResponse createOrder(CreateOrderRequest req, Integer currentUserId) {
    if (req.items() == null || req.items().isEmpty()) {
      throw new BusinessException("EMPTY_ITEMS", "Đơn hàng không có sản phẩm");
    }

    BigDecimal itemsTotal = BigDecimal.ZERO;
    BigDecimal weightKg   = BigDecimal.ZERO;

    List<OrderItem> items = new ArrayList<>();
    for (var it : req.items()) {
      var p = productRepository.findById(it.productId())
          .orElseThrow(() -> new BusinessException("PRODUCT_NOT_FOUND", "Không thấy sản phẩm"));

      Integer qty = it.quantity();
      if (qty == null || qty <= 0) {
        throw new BusinessException("INVALID_QTY", "Số lượng không hợp lệ");
      }

      // 🔒 Product.price hiện là Double → ép an toàn sang BigDecimal
      Double priceDouble = p.getPrice();
      if (priceDouble == null) {
        throw new BusinessException("PRICE_NULL", "Giá sản phẩm chưa được cấu hình");
      }
      BigDecimal unitPrice = BigDecimal.valueOf(priceDouble).setScale(2, MONEY_RM);

      String productName = p.getName();
      BigDecimal perItemWeight = it.weightKgPerItem() == null ? BigDecimal.ZERO : it.weightKgPerItem();

      var oi = OrderItem.builder()
          .productId(p.getId())
          .productName(productName)
          .unitPrice(unitPrice)
          .quantity(qty)
          .weightKgPerItem(perItemWeight)
          .build();

      items.add(oi);

      itemsTotal = itemsTotal.add(unitPrice.multiply(BigDecimal.valueOf(qty)));
      weightKg   = weightKg.add(perItemWeight.multiply(BigDecimal.valueOf(qty)));
    }

    itemsTotal = itemsTotal.setScale(2, MONEY_RM);

    // Báo giá vận chuyển
    var quote = shippingCalc.quote(
        new ShippingQuoteRequest(itemsTotal, weightKg, req.province(), req.voucherCode(), null, null, null)
    );

    BigDecimal shippingFee   = quote.finalFee()   == null ? BigDecimal.ZERO : quote.finalFee().setScale(2, MONEY_RM);
    BigDecimal shippingDisc  = quote.discount()   == null ? BigDecimal.ZERO : quote.discount().setScale(2, MONEY_RM);
    BigDecimal grandTotal    = itemsTotal.add(shippingFee).setScale(2, MONEY_RM);

    // Tạo order
    var order = Order.builder()
        .userId(currentUserId)
        .status(OrderStatus.PENDING_PAYMENT)
        .itemsTotal(itemsTotal)
        .shippingFee(shippingFee)
        .shippingDiscount(shippingDisc)
        .grandTotal(grandTotal)
        .voucherCode(quote.appliedVoucher())
        .receiverName(req.receiverName())
        .phone(req.phone())
        .addressLine(req.addressLine())
        .province(req.province())
        .weightKg(weightKg)
        .build();

    // Gắn 2 chiều & lưu
    for (var oi : items) oi.setOrder(order);
    order.setItems(items);

    order = orderRepo.save(order);
    // nếu Order.items chưa cascade ALL thì lưu rõ ràng:
    itemRepo.saveAll(items);

    // Shipping record
    var sr = ShippingRecord.builder()
        .order(order)
        .carrier(quote.carrier())
        .trackingCode(null)
        .status(ShippingRecord.ShipStatus.CREATED)
        .feeCharged(shippingFee)
        .build();
    sr = shippingRecordRepo.save(sr);
    order.setShippingRecord(sr);  // nhất quán bộ nhớ

    // Lượt dùng voucher
    if (quote.appliedVoucher() != null) {
      ShipVoucher v = voucherService.getActiveOrThrow(quote.appliedVoucher());
      voucherService.increaseUsed(v);
    }

    return toDto(order);
  }

  public Page<OrderResponse> findMyOrders(Integer userId, Pageable pageable) {
    return orderRepo.findByUserId(userId, pageable).map(this::toDto);
  }

  public OrderResponse getById(Integer id, Integer userId) {
    var o = orderRepo.findById(id)
        .orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không thấy đơn hàng"));
    if (!o.getUserId().equals(userId)) {
      throw new BusinessException("FORBIDDEN", "Bạn không có quyền xem đơn hàng này");
    }
    return toDto(o);
  }

  @Transactional
  public OrderResponse markPaid(Integer orderId, Integer userId) {
    var o = orderRepo.findById(orderId)
        .orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không thấy đơn hàng"));
    if (!o.getUserId().equals(userId)) {
      throw new BusinessException("FORBIDDEN", "Bạn không có quyền cập nhật đơn này");
    }
    if (o.getStatus() != OrderStatus.PENDING_PAYMENT) {
      throw new BusinessException("INVALID_STATE", "Trạng thái đơn không hợp lệ để thanh toán");
    }

    o.setStatus(OrderStatus.PAID);
    o = orderRepo.save(o);
    return toDto(o);
  }

  @Transactional
  public OrderResponse cancel(Integer orderId, Integer userId) {
    var o = orderRepo.findById(orderId)
        .orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không thấy đơn hàng"));
    if (!o.getUserId().equals(userId)) {
      throw new BusinessException("FORBIDDEN", "Bạn không có quyền hủy đơn này");
    }
    if (o.getStatus() == OrderStatus.SHIPPED || o.getStatus() == OrderStatus.DELIVERED) {
      throw new BusinessException("INVALID_STATE", "Đơn đã giao cho hãng, không thể hủy");
    }

    o.setStatus(OrderStatus.CANCELED);
    o = orderRepo.save(o);
    return toDto(o);
  }

  @Transactional
  public OrderResponse updateShipping(Integer orderId, String trackingCode, ShippingRecord.ShipStatus status) {
    var o = orderRepo.findById(orderId)
        .orElseThrow(() -> new BusinessException("ORDER_NOT_FOUND", "Không thấy đơn hàng"));
    var sr = shippingRecordRepo.findByOrderId(orderId)
        .orElseThrow(() -> new BusinessException("SHIP_RECORD_NOT_FOUND", "Không thấy ShippingRecord"));

    if (trackingCode != null && !trackingCode.isBlank()) {
      sr.setTrackingCode(trackingCode);
    }
    sr.setStatus(status);
    shippingRecordRepo.save(sr);

    switch (status) {
      case PICKED, IN_TRANSIT -> o.setStatus(OrderStatus.SHIPPED); // đã bàn giao hãng
      case DELIVERED -> o.setStatus(OrderStatus.DELIVERED);
      case FAILED -> { /* xử lý riêng nếu cần */ }
      default -> { /* CREATED -> giữ nguyên */ }
    }
    o = orderRepo.save(o);
    o.setShippingRecord(sr);

    return toDto(o);
  }

  // -------------------- DTO mapping --------------------
  private OrderResponse toDto(Order o) {
    var itemDtos = o.getItems().stream()
        .map(it -> new OrderResponse.Item(
            it.getProductId(),
            it.getProductName(),
            it.getUnitPrice(),
            it.getQuantity(),
            it.getWeightKgPerItem()
        ))
        .toList();

    OrderResponse.Shipping shipDto = null;
    if (o.getShippingRecord() != null) {
      var s = o.getShippingRecord();
      shipDto = new OrderResponse.Shipping(
          s.getCarrier(),
          s.getTrackingCode(),
          s.getStatus().name(),
          s.getFeeCharged()
      );
    }

    return new OrderResponse(
        o.getId(),
        o.getUserId(),
        o.getStatus(),
        o.getItemsTotal(),
        o.getShippingFee(),
        o.getShippingDiscount(),
        o.getGrandTotal(),
        o.getVoucherCode(),
        o.getReceiverName(),
        o.getPhone(),
        o.getAddressLine(),
        o.getProvince(),
        o.getWeightKg(),
        o.getCreatedAt(),
        shipDto,
        itemDtos
    );
  }
}
