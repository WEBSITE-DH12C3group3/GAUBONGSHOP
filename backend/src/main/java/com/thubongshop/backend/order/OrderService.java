package com.thubongshop.backend.order;

import com.thubongshop.backend.order.dto.CreateOrderRequest;
import com.thubongshop.backend.order.dto.OrderResponse;
import com.thubongshop.backend.product.ProductRepository;           // dùng đúng repo sản phẩm của bạn
import com.thubongshop.backend.shippingcore.ShippingCalculatorService;
import com.thubongshop.backend.shippingcore.dto.ShippingQuote;
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
import java.util.Map;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.Instant;


@Service
@RequiredArgsConstructor
public class OrderService {

  private static final RoundingMode MONEY_RM = RoundingMode.HALF_UP;

  private final OrderRepo orderRepo;
  private final OrderItemRepo itemRepo;
  private final ShippingRecordRepo shippingRecordRepo;

  private final ProductRepository productRepository; // ✅ repo hiện có của bạn

  private final ShippingCalculatorService shippingCalc;
  private final ShipVoucherService voucherService;

  /**
   * Tạo đơn hàng đầy đủ:
   * - Tính tiền hàng & tổng khối lượng dựa trên danh sách items.
   * - Xin báo giá vận chuyển từ ShippingCalculatorService (dựa vào lat/lng người nhận).
   * - Áp voucher vận chuyển (nếu có) theo logic trong shippingvoucher service.
   * - Lưu Order + OrderItems + ShippingRecord.
   */
  @Transactional
  public OrderResponse createOrder(CreateOrderRequest req, Integer currentUserId) {
    if (req == null) {
      throw new BusinessException("REQ_NULL", "Thiếu thông tin đơn hàng");
    }
    if (req.items() == null || req.items().isEmpty()) {
      throw new BusinessException("EMPTY_ITEMS", "Đơn hàng không có sản phẩm");
    }
    if (req.destLat() == null || req.destLng() == null) {
      throw new BusinessException("DEST_NULL", "Thiếu vị trí giao hàng (lat/lng)");
    }

    // --- 1) Cộng tiền hàng & khối lượng ---
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

      // Giá sản phẩm trong entity hiện là Double → ép sang BigDecimal an toàn
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

    // --- 2) Báo giá vận chuyển (dựa theo lat/lng + subtotal + khối lượng + voucher) ---
      ShippingQuote quote = shippingCalc.quote(
          new ShippingQuoteRequest(
              itemsTotal, weightKg, req.destLat(), req.destLng(), req.voucherCode(), null, null
          )
      );


    // ShippingQuote mới trả về:
    // - distanceKm
    // - feeBeforeVoucher
    // - feeAfterVoucher
    // - etaDaysMin/Max
    // - carrier/service
    BigDecimal shippingFeeBefore = n2(quote.feeBeforeVoucher());
    BigDecimal shippingFeeFinal  = n2(quote.feeAfterVoucher());
    BigDecimal shippingDiscount  = shippingFeeBefore.subtract(shippingFeeFinal).max(BigDecimal.ZERO);
    BigDecimal distanceKm        = n2(quote.distanceKm());

    // --- 3) Tổng tiền phải trả ---
    BigDecimal grandTotal = itemsTotal.add(shippingFeeFinal).setScale(2, MONEY_RM);

    // --- 4) Lưu Order + Items ---
    var order = Order.builder()
        .userId(currentUserId)
        .status(OrderStatus.PENDING_PAYMENT)
        .itemsTotal(itemsTotal)
        // các trường shipping chi tiết (đã có trong DB của bạn)
        .shippingDistanceKm(distanceKm)
        .shippingFeeBefore(shippingFeeBefore)
        .shippingDiscount(shippingDiscount)
        .shippingFeeFinal(shippingFeeFinal)
        .shippingFee(shippingFeeFinal)
        // order tổng
        .grandTotal(grandTotal)
        .totalAmount(grandTotal)
        // voucher ship (nếu bạn muốn lưu mã)
        .voucherCode(req.voucherCode())
        // thông tin nhận hàng
        .receiverName(req.receiverName())
        .phone(req.phone())
        .addressLine(req.addressLine())
        .province(req.province())
        // trọng lượng
        .weightKg(weightKg)
        .build();

    for (var oi : items) oi.setOrder(order);
    order.setItems(items);

    order = orderRepo.save(order);
    // đề phòng cascade chưa full:
    itemRepo.saveAll(items);

    // --- 5) Lưu ShippingRecord ---
    var sr = ShippingRecord.builder()
        .order(order)
        .carrier(quote.carrier())
        .trackingCode(null)
        .status(ShippingRecord.ShipStatus.CREATED)
        .feeCharged(shippingFeeFinal)
        .build();
    sr = shippingRecordRepo.save(sr);
    order.setShippingRecord(sr); // đồng bộ trong bộ nhớ

    // --- 6) Tăng lượt dùng voucher vận chuyển (nếu có) ---
    if (req.voucherCode() != null && !req.voucherCode().isBlank()) {
      ShipVoucher v = voucherService.getActiveOrThrow(req.voucherCode());
      // Nếu bạn muốn trừ theo mức giảm thực tế, có thể bổ sung tham số.
      voucherService.increaseUsed(v);
    }

    return toDto(order);
  }

  /**
   * API bổ sung (đã báo bạn trước đó): cho phép tạo đơn nếu phía ngoài
   * đã có sẵn các con số phí vận chuyển.
   * Không xóa bỏ, chỉ thêm để các luồng khác có thể tái sử dụng.
   */
  @Transactional
  public Order createOrderWithShipping(
      Integer userId,
      String receiverName,
      String phone,
      String addressLine,
      String province,
      BigDecimal itemsTotal,
      BigDecimal shippingDistanceKm,
      BigDecimal shippingFeeBefore,
      BigDecimal shippingDiscount,
      BigDecimal shippingFeeFinal,
      BigDecimal weightKg
  ) {
    Order o = new Order();
    o.setUserId(userId);
    o.setReceiverName(receiverName);
    o.setPhone(phone);
    o.setAddressLine(addressLine);
    o.setProvince(province);

    o.setItemsTotal(n2(itemsTotal));
    o.setShippingDistanceKm(n2(shippingDistanceKm));
    o.setShippingFeeBefore(n2(shippingFeeBefore));
    o.setShippingDiscount(n2(shippingDiscount));
    o.setShippingFeeFinal(n2(shippingFeeFinal));
    o.setWeightKg(n2(weightKg));

    BigDecimal grand = n2(itemsTotal).add(n2(shippingFeeFinal));
    o.setGrandTotal(grand);
    o.setTotalAmount(grand);

    if (o.getStatus() == null) o.setStatus(OrderStatus.PENDING_PAYMENT);

    return orderRepo.save(o);
  }

  // ================== Các API tra cứu/ cập nhật khác (giữ nguyên) ==================

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
      case PICKED, IN_TRANSIT -> o.setStatus(OrderStatus.SHIPPED);
      case DELIVERED -> o.setStatus(OrderStatus.DELIVERED);
      case FAILED -> { /* có thể set trạng thái riêng nếu bạn muốn */ }
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
        .toList(); // nếu dự án dùng Java <16 thì đổi thành .collect(java.util.stream.Collectors.toList())

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

    // Convert Instant -> LocalDateTime theo timezone hệ thống (hoặc ZoneId.of("Asia/Ho_Chi_Minh"))
    java.time.LocalDateTime createdAtLdt = null;
    if (o.getCreatedAt() != null) {
      createdAtLdt = java.time.LocalDateTime.ofInstant(o.getCreatedAt(), java.time.ZoneId.systemDefault());
    }

    return new OrderResponse(
        o.getId(),
        o.getUserId(),
        o.getStatus(),
        o.getItemsTotal(),
        // hiển thị phí ship: ưu tiên feeFinal, fallback fee cũ nếu có
        o.getShippingFeeFinal() != null ? o.getShippingFeeFinal() : o.getShippingFee(),
        o.getShippingDiscount(),
        o.getGrandTotal(),
        o.getVoucherCode(),
        o.getReceiverName(),
        o.getPhone(),
        o.getAddressLine(),
        o.getProvince(),
        o.getWeightKg(),
        createdAtLdt,     // <- LocalDateTime, khớp DTO của bạn
        shipDto,
        itemDtos
    );
  }


  private static BigDecimal n2(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v.setScale(2, MONEY_RM);
  }
}
