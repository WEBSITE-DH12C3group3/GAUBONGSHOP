package com.thubongshop.backend.orderv2;

import com.thubongshop.backend.orderv2.dto.OrderV2Dtos.OrderListItemDto;
import com.thubongshop.backend.orderv2.read.OrderV2ReadRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/admin/orders/search")
@RequiredArgsConstructor
public class OrderV2AdminSearchController {

  private final OrderV2ReadRepo repo;
  private final OrderV2Service service; // tái dùng mapList qua pageAdmin

  @GetMapping
  public ResponseEntity<Page<OrderListItemDto>> search(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String province,
      @RequestParam(required = false) String carrierCode,
      @RequestParam(required = false) String q,            // tìm theo receiver/phone/address
      @RequestParam(required = false) String dateFrom,     // yyyy-MM-dd
      @RequestParam(required = false) String dateTo,       // yyyy-MM-dd
      @RequestParam(required = false) Long minTotal,
      @RequestParam(required = false) Long maxTotal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size
  ){
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(repo.searchAdmin(status, province, carrierCode, q, dateFrom, dateTo, minTotal, maxTotal, pageable)
        .map(service::mapListForController)); // expose mapper cho controller
  }
}
