package com.thubongshop.backend.analytics;

import com.thubongshop.backend.analytics.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsService {
  private final StatsReadRepository repo;

  public SummaryDto summary(StatsFilter f) {
    LocalDate s = f.getStart();
    LocalDate e = f.getEnd();
    return repo.summary(s, e);
  }

  public List<TimeSeriesPoint> series(StatsFilter f) {
    return repo.salesSeries(f.getStart(), f.getEnd(),
        f.getGroupBy()==null? "DAY" : f.getGroupBy(),
        f.getTzOffsetMinutes()==null? 420 : f.getTzOffsetMinutes());
  }

  public List<TopProductDto> topProducts(StatsFilter f) {
    return repo.topProducts(f.getStart(), f.getEnd(), f.getLimit()==null? 10 : f.getLimit());
  }

  public List<KeyValue> byCategory(StatsFilter f) { return repo.byCategory(f.getStart(), f.getEnd()); }
  public List<KeyValue> byBrand(StatsFilter f)    { return repo.byBrand(f.getStart(), f.getEnd()); }
  public List<KeyValue> paymentByMethod(StatsFilter f){ return repo.paymentByMethod(f.getStart(), f.getEnd()); }
  public List<KeyValue> shippingByCarrier(StatsFilter f){ return repo.shippingByCarrier(f.getStart(), f.getEnd()); }
  public List<KeyValue> coupons(StatsFilter f){ return repo.coupons(f.getStart(), f.getEnd()); }
  public List<KeyValue> shipVouchers(StatsFilter f){ return repo.shipVouchers(f.getStart(), f.getEnd()); }
  public List<KeyValue> topCustomers(StatsFilter f){ return repo.topCustomers(f.getStart(), f.getEnd(), f.getLimit()==null? 10 : f.getLimit()); }
}
