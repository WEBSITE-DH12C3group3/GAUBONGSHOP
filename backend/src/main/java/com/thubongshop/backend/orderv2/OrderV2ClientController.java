package com.thubongshop.backend.orderv2;

import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.CancelRequest;
import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.OrderDetailDto;
import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.OrderListItemDto;
import com.thubongshop.backend.security.UserPrincipal;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/client/orders")
@RequiredArgsConstructor
public class OrderV2ClientController {

  private final OrderV2Service service;

  /** Danh sách đơn của tôi (client) */
  @GetMapping
  public ResponseEntity<Page<OrderListItemDto>> myOrders(
      @AuthenticationPrincipal UserPrincipal user,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "10") @Min(1) int size
  ) {
    return ResponseEntity.ok(service.pageClient(user.getId(), page, size));
  }

  /** Chi tiết đơn (chỉ xem được đơn của chính mình) */
  @GetMapping("/{id}")
  public ResponseEntity<OrderDetailDto> detail(
      @AuthenticationPrincipal UserPrincipal user,
      @PathVariable Integer id
  ) {
    var d = service.detail(id);
    if (d == null || !d.userId().equals(user.getId())) {
      return ResponseEntity.status(403).build();
    }
    return ResponseEntity.ok(d);
  }

  /** Khách hủy đơn: chỉ cho phép khi đang PENDING_PAYMENT */
  @PostMapping("/{id}/cancel")
  public ResponseEntity<OrderDetailDto> cancel(
      @AuthenticationPrincipal UserPrincipal user,
      @PathVariable Integer id,
      @RequestBody(required = false) CancelRequest body
  ) {
    // body.reason nếu cần có thể log hoặc lưu lịch sử ở tầng service/repo
    return ResponseEntity.ok(service.clientCancel(user.getId(), id));
  }

  /** Khách xác nhận đã nhận hàng -> chuyển trạng thái sang PAID (chỉ khi đang DELIVERED) */
  @PostMapping("/{id}/confirm-received")
  public ResponseEntity<OrderDetailDto> confirmReceived(
      @AuthenticationPrincipal UserPrincipal user,
      @PathVariable("id") Integer orderId
  ) {
    return ResponseEntity.ok(service.clientConfirmReceived(user.getId(), orderId));
  }
}
