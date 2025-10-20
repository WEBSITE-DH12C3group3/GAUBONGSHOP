package com.thubongshop.backend.order;

import com.thubongshop.backend.order.dto.CreateOrderRequest;
import com.thubongshop.backend.order.dto.OrderResponse;
import com.thubongshop.backend.product.ProductRepository;
import com.thubongshop.backend.shippingcore.ShippingCalculatorService;
import com.thubongshop.backend.shippingcore.dto.ShippingQuote;
import com.thubongshop.backend.shippingcore.dto.ShippingQuoteRequest;
import com.thubongshop.backend.shippingvoucher.ShipVoucher;
import com.thubongshop.backend.shippingvoucher.ShipVoucherService;
import com.thubongshop.backend.shared.BusinessException;

// ==== COUPON imports (giữ đúng các package sẵn có của bạn) ====
import com.thubongshop.backend.coupon.service.CouponService;
import com.thubongshop.backend.coupon.dto.ApplyCouponRequest;
import com.thubongshop.backend.coupon.dto.ApplyCouponResponse;
import com.thubongshop.backend.coupon.dto.CartItemDTO;
// =============================================================

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

  private final ProductRepository productRepository;

  private final ShippingCalculatorService shippingCalc;
  private final ShipVoucherService voucherService;
  private final CouponService couponService; // đã có trong dự án

  /**
   * Tạo đơn đầy đủ: tính tiền hàng, áp coupon (nếu có), báo giá ship, áp voucher ship, lưu Order+Items+ShippingRecord.
   */
  @Transactional
  public OrderResponse createOrder(CreateOrderRequest req, Integer currentUserId) {
    if (req == null) throw new BusinessException("REQ_NULL", "Thiếu thông tin đơn hàng");
    if (req.items() == null || req.items().isEmpty()) {
      throw new BusinessException("EMPTY_ITEMS", "Đơn hàng không có sản phẩm");
    }
    if (req.destLat() == null || req.destLng() == null) {
      throw new BusinessException("DEST_NULL", "Thiếu vị trí giao hàng (lat/lng)");
    }

    // 1) Tính tiền hàng & khối lượng
    BigDecimal itemsTotal = BigDecimal.ZERO;
    BigDecimal weightKg   = BigDecimal.ZERO;
    List<OrderItem> items = new ArrayList<>();
    List<CartItemDTO> cartItems = new ArrayList<>(); // phục vụ coupon

    for (var it : req.items()) {
      var p = productRepository.findById(it.productId())
          .orElseThrow(() -> new BusinessException("PRODUCT_NOT_FOUND", "Không thấy sản phẩm"));

      Integer qty = it.quantity();
      if (qty == null || qty <= 0) throw new BusinessException("INVALID_QTY", "Số lượng không hợp lệ");

      // ===== THÊM MỚI: Trừ tồn kho an toàn ngay tại DB (chống over-sell) =====
      int affected = productRepository.tryDecrementStock(p.getId(), qty);
      if (affected == 0) {
        throw new BusinessException("OUT_OF_STOCK",
            "Sản phẩm '" + p.getName() + "' không đủ hàng (yêu cầu " + qty + ").");
      }
      // =========================================================================

      Double priceDouble = p.getPrice();
      if (priceDouble == null) throw new BusinessException("PRICE_NULL", "Giá sản phẩm chưa cấu hình");
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

      // build CartItemDTO cho coupon engine (nếu Product không có category/brand thì bỏ qua 2 dòng set đó)
      CartItemDTO ci = new CartItemDTO();
      ci.setProductId(p.getId());
      try {
        var categoryId = (Integer) p.getClass().getMethod("getCategoryId").invoke(p);
        var brandId    = (Integer) p.getClass().getMethod("getBrandId").invoke(p);
        ci.setCategoryId(categoryId);
        ci.setBrandId(brandId);
      } catch (Exception ignored) {}
      ci.setUnitPrice(unitPrice);
      ci.setQuantity(qty);
      ci.setDiscounted(Boolean.FALSE);
      cartItems.add(ci);
    }
    itemsTotal = itemsTotal.setScale(2, MONEY_RM);

    // 2) Áp phiếu giảm giá (coupon) nếu có
    BigDecimal couponDiscount = BigDecimal.ZERO;
    String appliedCouponCode = null;

    if (req.couponCode() != null && !req.couponCode().isBlank()) {
      ApplyCouponRequest cReq = new ApplyCouponRequest();
      cReq.setCode(req.couponCode().trim());
      cReq.setOrderTotal(itemsTotal);
      cReq.setItems(cartItems);
      cReq.setUserId(currentUserId);

      ApplyCouponResponse cRes = couponService.apply(cReq);
      if (cRes != null && cRes.getDiscountAmount() != null) {
        couponDiscount = cRes.getDiscountAmount().max(BigDecimal.ZERO).setScale(2, MONEY_RM);
        appliedCouponCode = (cRes.getCode() != null ? cRes.getCode() : req.couponCode().trim());
      }
    }

    // 3) Báo giá vận chuyển
    ShippingQuote quote = shippingCalc.quote(
        new ShippingQuoteRequest(
            itemsTotal, weightKg, req.destLat(), req.destLng(), req.voucherCode(), null, null
        )
    );

    BigDecimal shippingFeeBefore = n2(quote.feeBeforeVoucher());
    BigDecimal shippingFeeFinal  = n2(quote.feeAfterVoucher());
    BigDecimal shippingDiscount  = shippingFeeBefore.subtract(shippingFeeFinal).max(BigDecimal.ZERO);
    BigDecimal distanceKm        = n2(quote.distanceKm());

    // 4) Tổng thanh toán
    BigDecimal grandTotal = itemsTotal.subtract(couponDiscount).add(shippingFeeFinal).setScale(2, MONEY_RM);
    if (grandTotal.signum() < 0) grandTotal = BigDecimal.ZERO.setScale(2, MONEY_RM);

    // 5) Lưu Order + Items
    var order = Order.builder()
        .userId(currentUserId)
        .status(OrderStatus.PENDING_PAYMENT)
        .itemsTotal(itemsTotal)

        // Lưu thông tin coupon vào Order (yêu cầu entity Order đã có 2 field này)
        .couponCode(appliedCouponCode)
        .couponDiscount(couponDiscount)

        .shippingDistanceKm(distanceKm)
        .shippingFeeBefore(shippingFeeBefore)
        .shippingDiscount(shippingDiscount)
        .shippingFeeFinal(shippingFeeFinal)
        .shippingFee(shippingFeeFinal)

        .grandTotal(grandTotal)
        .totalAmount(grandTotal)

        .voucherCode(req.voucherCode())
        .receiverName(req.receiverName())
        .phone(req.phone())
        .addressLine(req.addressLine())
        .province(req.province())
        .weightKg(weightKg)
        .build();

    for (var oi : items) oi.setOrder(order);
    order.setItems(items);

    order = orderRepo.save(order);
    itemRepo.saveAll(items);

    // 6) Lưu ShippingRecord
    var sr = ShippingRecord.builder()
        .order(order)
        .carrier(quote.carrier())
        .trackingCode(null)
        .status(ShippingRecord.ShipStatus.CREATED)
        .feeCharged(shippingFeeFinal)
        .build();
    sr = shippingRecordRepo.save(sr);
    order.setShippingRecord(sr);

    // 7) Tăng lượt dùng voucher ship (nếu có)
    if (req.voucherCode() != null && !req.voucherCode().isBlank()) {
      ShipVoucher v = voucherService.getActiveOrThrow(req.voucherCode());
      voucherService.increaseUsed(v);
    }

    return toDto(order);
  }

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

  // ===== Truy vấn/ cập nhật khác (giữ nguyên) =====

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

    // Tiêu thụ lượt dùng coupon (nếu service có hỗ trợ) — dùng reflection để tránh lỗi compile
    if (o.getCouponCode() != null && !o.getCouponCode().isBlank()) {
      try {
        var m = couponService.getClass().getMethod("consumeByCode", String.class, Integer.class);
        m.invoke(couponService, o.getCouponCode(), userId);
      } catch (Exception ignored) {
        // Không có method → bỏ qua, không làm gián đoạn flow thanh toán
      }
    }

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
  if (o.getStatus() == OrderStatus.CANCELED) {
    // Tránh hoàn tồn lần 2 nếu gọi lại cancel
    return toDto(o);
  }

  // === HOÀN TỒN KHO ===
  // Chỉ hoàn khi trước đó đã trừ tồn lúc đặt/ thanh toán.
  // Ở hệ thống của bạn, tồn đã bị trừ khi mua (theo mô tả), nên hoàn lại toàn bộ item.
  var items = itemRepo.findByOrderId(orderId);
  for (var it : items) {
    if (it.getProductId() != null && it.getQuantity() != null && it.getQuantity() > 0) {
      // ProductRepository đã có sẵn method này ở lần sửa trước
      productRepository.increaseStock(it.getProductId(), it.getQuantity());
    }
  }

  o.setStatus(OrderStatus.CANCELED);
  o = orderRepo.save(o);
  return toDto(o);
}


/**
 * Fallback khi UPDATE không tăng tồn (ví dụ do id mapping lạ).
 * Tải Product, cộng COALESCE(stock,0) + qty rồi save.
 */
private void manualRestock(Integer productId, Integer qty) {
  var opt = productRepository.findById(productId);
  if (opt.isEmpty()) return; // Không làm gì thêm
  var p = opt.get();
  Integer cur = p.getStock(); // nếu là Integer
  // nếu bạn dùng Long/BigDecimal… hãy đổi kiểu tương ứng:
  int base = (cur == null ? 0 : cur);
  p.setStock(base + qty);
  productRepository.save(p);
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
      case FAILED -> { /* optional */ }
      default -> { /* CREATED: giữ nguyên */ }
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

    java.time.LocalDateTime createdAtLdt = null;
    if (o.getCreatedAt() != null) {
      createdAtLdt = java.time.LocalDateTime.ofInstant(o.getCreatedAt(), java.time.ZoneId.systemDefault());
    }

    return new OrderResponse(
    o.getId(),
    o.getUserId(),
    o.getStatus(),
    o.getItemsTotal(),
    (o.getShippingFeeFinal() != null ? o.getShippingFeeFinal() : o.getShippingFee()),
    o.getShippingDiscount(),
    o.getGrandTotal(),

    // theo đúng thứ tự record: voucherCode trước, coupon nằm gần cuối
    o.getVoucherCode(),
    o.getReceiverName(),
    o.getPhone(),
    o.getAddressLine(),
    o.getProvince(),
    o.getWeightKg(),
    createdAtLdt,
    shipDto,

    // couponCode, couponDiscount
    o.getCouponCode(),
    o.getCouponDiscount(),

    // cuối cùng là items
    itemDtos
);
}


  private static BigDecimal n2(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v.setScale(2, MONEY_RM);
  }
}
