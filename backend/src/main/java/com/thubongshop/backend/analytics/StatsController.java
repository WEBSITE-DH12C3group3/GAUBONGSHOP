package com.thubongshop.backend.analytics;

import com.thubongshop.backend.analytics.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('view_reports','manage_orders','manage_products')") // tùy hệ phân quyền của bạn
public class StatsController {

  private final StatsService service;

  // tiện: nếu không gửi filter => mặc định 30 ngày gần nhất, groupBy=DAY, tz=+07:00
  private StatsFilter normalize(StatsFilter f) {
    if (f == null) f = new StatsFilter();
    if (f.getEnd()==null) f.setEnd(LocalDate.now());
    if (f.getStart()==null) f.setStart(f.getEnd().minusDays(29));
    if (f.getGroupBy()==null) f.setGroupBy("DAY");
    if (f.getTzOffsetMinutes()==null) f.setTzOffsetMinutes(420);
    return f;
  }

  @PostMapping("/summary")
  public SummaryDto summary(@RequestBody(required=false) StatsFilter f) {
    return service.summary(normalize(f));
  }

  @PostMapping("/series")
  public List<TimeSeriesPoint> series(@RequestBody(required=false) StatsFilter f) {
    return service.series(normalize(f));
  }

  @PostMapping("/top-products")
  public List<TopProductDto> topProducts(@RequestBody(required=false) StatsFilter f) {
    return service.topProducts(normalize(f));
  }

  @PostMapping("/by-category")
  public List<KeyValue> byCategory(@RequestBody(required=false) StatsFilter f) {
    return service.byCategory(normalize(f));
  }

  @PostMapping("/by-brand")
  public List<KeyValue> byBrand(@RequestBody(required=false) StatsFilter f) {
    return service.byBrand(normalize(f));
  }

  @PostMapping("/payments")
  public List<KeyValue> payments(@RequestBody(required=false) StatsFilter f) {
    return service.paymentByMethod(normalize(f));
  }

  @PostMapping("/shipping")
  public List<KeyValue> shipping(@RequestBody(required=false) StatsFilter f) {
    return service.shippingByCarrier(normalize(f));
  }

  @PostMapping("/coupons")
  public List<KeyValue> coupons(@RequestBody(required=false) StatsFilter f) {
    return service.coupons(normalize(f));
  }

  @PostMapping("/ship-vouchers")
  public List<KeyValue> shipVouchers(@RequestBody(required=false) StatsFilter f) {
    return service.shipVouchers(normalize(f));
  }

  @PostMapping("/top-customers")
  public List<KeyValue> topCustomers(@RequestBody(required=false) StatsFilter f) {
    return service.topCustomers(normalize(f));
  }
}
