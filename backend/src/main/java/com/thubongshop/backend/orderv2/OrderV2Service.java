package com.thubongshop.backend.orderv2;

import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.AdminStatusUpdateRequest; // nếu chưa dùng có thể xoá
import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.ItemDto;
import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.OrderDetailDto;
import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.OrderListItemDto;
import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.OrderStatus;
import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.ShippingDto;

import com.thubongshop.backend.orderv2.read.OrderV2ReadRepo;
import com.thubongshop.backend.orderv2.read.OrderListRow;
import com.thubongshop.backend.orderv2.read.OrderDetailRow;
import com.thubongshop.backend.orderv2.read.OrderItemRow;

import com.thubongshop.backend.orderv2.audit.OrderAuditService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderV2Service {

  private final OrderV2ReadRepo repo;

  /** Client: phân trang đơn của chính user */
  public Page<OrderListItemDto> pageClient(Integer userId, int page, int size) {
    // KHÔNG truyền Sort để tránh JPA chèn "orderDate" (camelCase) vào native query
    Pageable pageable = PageRequest.of(page, size);
    return repo.pageByUser(userId, pageable).map(this::mapList);
  }

  /** Admin: phân trang tất cả / theo status */
  public Page<OrderListItemDto> pageAdmin(String status, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    return (status == null || status.isBlank())
        ? repo.pageAll(pageable).map(this::mapList)
        : repo.pageByStatus(status, pageable).map(this::mapList);
  }

  /** Lấy chi tiết một đơn */
  public OrderDetailDto detail(Integer orderId) {
    OrderDetailRow row = repo.findDetail(orderId);
    if (row == null) return null;

    ShippingDto ship = new ShippingDto(
        // carrier/service: lấy code, fallback name/label
        row.getCarrier_code() != null ? row.getCarrier_code() : row.getCarrier_name(),
        row.getService_code() != null ? row.getService_code() : row.getService_label(),
        // tracking/status: ưu tiên shipping_records, fallback shipping
        row.getSr_tracking_code() != null ? row.getSr_tracking_code() : row.getShip_tracking_number(),
        row.getSr_status() != null ? row.getSr_status() : row.getShip_status(),
        row.getShipping_eta_min(),
        row.getShipping_eta_max(),
        toBD(row.getShipping_distance_km()),
        toBD(row.getShipping_fee_before()),
        toBD(row.getShipping_discount()),
        toBD(row.getShipping_fee_final())
    );

    List<ItemDto> items = repo.findItems(orderId).stream()
        .map(i -> new ItemDto(
            i.getProduct_id(),
            i.getProduct_name(),
            toBD(i.getUnit_price()),
            i.getQuantity(),
            toBD(i.getWeight_kg_per_item())
        ))
        .toList();

    return new OrderDetailDto(
        row.getId(),
        row.getUser_id(),
        OrderStatus.valueOf(row.getStatus()),
        toBD(row.getItems_total()),
        toBD(row.getShipping_fee()),
        toBD(row.getShipping_discount()),
        toBD(row.getGrand_total()),
        row.getVoucher_code(),
        row.getReceiver_name(),
        row.getPhone(),
        row.getAddress_line(),
        row.getProvince(),
        toBD(row.getWeight_kg()),
        toOffset(row.getOrder_date()),
        ship,
        items
    );
  }

  /** Client tự hủy: chỉ cho phép khi PENDING_PAYMENT */
  @Transactional
  public OrderDetailDto clientCancel(Integer userId, Integer orderId) {
    OrderDetailDto d = detail(orderId);
    if (d == null || !d.userId().equals(userId)) throw new RuntimeException("Forbidden");
    if (d.status() != OrderStatus.PENDING_PAYMENT) {
      throw new IllegalStateException("Chỉ hủy khi còn PENDING_PAYMENT");
    }
    repo.updateStatus(orderId, OrderStatus.CANCELED.name());
    audit.log(orderId, "CLIENT_CANCEL", d.status().name(), "CANCELED", userId, "Khách tự hủy");
    return detail(orderId);
  }

  /** Admin cập nhật trạng thái */
  @Transactional
  public OrderDetailDto adminSetStatus(Integer orderId, String status) {
    repo.updateStatus(orderId, status);
    OrderDetailDto before = detail(orderId);
    audit.log(orderId, "STATUS_CHANGE", before == null ? null : before.status().name(), status, null, null);
    String from = before == null ? null : before.status().name();
    if (from != null) com.thubongshop.backend.orderv2.policy.OrderStatusPolicy.ensureTransitionAllowed(from, status);
    repo.updateStatus(orderId, status);
    return detail(orderId);
  }

   @Transactional
  public OrderDetailDto clientConfirmReceived(Integer userId, Integer orderId) {
    var d = detail(orderId);
    if (d == null || !d.userId().equals(userId)) {
      throw new RuntimeException("Forbidden");
    }
    if (d.status() != OrderStatus.DELIVERED) {
      throw new IllegalStateException("Chỉ xác nhận khi đơn đang ở trạng thái ĐÃ GIAO (DELIVERED)");
    }
    repo.updateStatus(orderId, OrderStatus.PAID.name());
    return detail(orderId);
  }

  /** Map 1 row list → DTO list-item */
  private OrderListItemDto mapList(OrderListRow r) {
    return new OrderListItemDto(
        r.getId(),
        OrderStatus.valueOf(r.getStatus()),
        toBD(r.getItems_total()),
        toBD(r.getShipping_fee()),
        toBD(r.getShipping_discount()),
        toBD(r.getGrand_total()),
        r.getReceiver_name(),
        r.getPhone(),
        r.getAddress_line(),
        r.getProvince(),
        toOffset(r.getOrder_date())
    );
  }

  /** Helper số học: null → 0 */
  private BigDecimal toBD(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }

  /** Convert SQL Timestamp → OffsetDateTime (theo system default zone) */
  private OffsetDateTime toOffset(Timestamp ts) {
    return ts == null ? null : ts.toInstant().atZone(ZoneId.systemDefault()).toOffsetDateTime();
  }

  private final OrderAuditService audit;

  public OrderListItemDto mapListForController(com.thubongshop.backend.orderv2.read.OrderListRow r) {
  return mapList(r);
}

  
}
