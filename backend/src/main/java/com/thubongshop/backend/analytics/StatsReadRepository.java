package com.thubongshop.backend.analytics;

import com.thubongshop.backend.analytics.dto.*;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@Repository
public class StatsReadRepository {

  @PersistenceContext
  private EntityManager em;

  private String groupExpr(String groupBy, int tzOffsetMinutes) {
    // MariaDB/MySQL: order_date là TIMESTAMP. Cắt kỳ theo TZ bằng CONVERT_TZ và DATE_FORMAT.
    // period: DAY -> '%Y-%m-%d', WEEK -> '%x-W%v', MONTH -> '%Y-%m'
    String tz = String.format("%+03d:%02d", tzOffsetMinutes/60, Math.abs(tzOffsetMinutes%60));
    String base = "CONVERT_TZ(o.order_date, '+00:00', '" + tz + "')";
    switch (String.valueOf(groupBy).toUpperCase()) {
      case "WEEK":  return "DATE_FORMAT(" + base + ", '%x-W%v')";
      case "MONTH": return "DATE_FORMAT(" + base + ", '%Y-%m')";
      default:      return "DATE_FORMAT(" + base + ", '%Y-%m-%d')";
    }
  }

  // ----- SUMMARY -----
  @SuppressWarnings("unchecked")
  public SummaryDto summary(LocalDate start, LocalDate end) {
    // Ghi chú cột theo DB:
    // orders(id, user_id, order_date, status, total_amount), order_items(price, quantity), payments(status, amount, payment_method)
    // imports/import_details để tính avg cost/COGS; products(stock)
    // ship/coupon giảm giá có bảng order_coupons, order_shipping_vouchers (nếu bạn dùng) – có thể vắng dữ liệu thì coi như 0.
    // 1) core totals
    String sql = """
      SELECT
        COUNT(*)                                 AS orders,
        SUM(CASE WHEN p.status='paid' THEN 1 ELSE 0 END)              AS paid_orders,
        COUNT(DISTINCT o.user_id)               AS customers,
        COALESCE(SUM(oi.quantity),0)            AS items,
        COALESCE(SUM(oi.quantity * oi.price),0) AS gross_sales,
        COALESCE(SUM(o.shipping_fee_final),0)   AS shipping_fee,
        COALESCE(SUM(oc.discount_amount),0)     AS coupon_discount,
        COALESCE(SUM(osv.shipping_discount_amount),0) AS ship_discount,
        COALESCE(SUM(p.amount),0)               AS paid_amount
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN payments p ON p.order_id = o.id
      LEFT JOIN order_coupons oc ON oc.order_id = o.id
      LEFT JOIN order_shipping_vouchers osv ON osv.order_id = o.id
      WHERE o.order_date >= :start AND o.order_date < :endPlus1
    """;
    Object[] row = (Object[]) em.createNativeQuery(sql)
        .setParameter("start", Date.valueOf(start))
        .setParameter("endPlus1", Date.valueOf(end.plusDays(1)))
        .getSingleResult();

    long orders = ((Number)row[0]).longValue();
    long paidOrders = ((Number)row[1]).longValue();
    long customers = ((Number)row[2]).longValue();
    long items = ((Number)row[3]).longValue();
    BigDecimal grossSales = (BigDecimal) row[4];
    BigDecimal shippingFee = (BigDecimal) row[5];
    BigDecimal couponDiscount = (BigDecimal) row[6];
    BigDecimal shipDiscount = (BigDecimal) row[7];

    // Net revenue ~ tổng tiền hàng - giảm + phí ship (đơn giản). Nếu muốn chỉ tính paid, thay bằng SUM CASE p.status='paid'.
    BigDecimal netRevenue = grossSales
        .subtract(couponDiscount == null ? BigDecimal.ZERO : couponDiscount)
        .add(shippingFee == null ? BigDecimal.ZERO : shippingFee)
        .subtract(shipDiscount == null ? BigDecimal.ZERO : shipDiscount);

    // 2) COGS ước tính = sum(q * avgCost(product))
    String cogsSql = """
      SELECT COALESCE(SUM(oi.quantity * COALESCE(avg_cost.avg_cost,0)),0) AS cogs
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN (
         SELECT product_id, SUM(quantity * unit_price)/NULLIF(SUM(quantity),0) AS avg_cost
         FROM import_details
         GROUP BY product_id
      ) avg_cost ON avg_cost.product_id = oi.product_id
      WHERE o.order_date >= :start AND o.order_date < :endPlus1
    """;
    BigDecimal cogs = (BigDecimal) em.createNativeQuery(cogsSql)
        .setParameter("start", Date.valueOf(start))
        .setParameter("endPlus1", Date.valueOf(end.plusDays(1)))
        .getSingleResult();

    BigDecimal grossProfit = netRevenue.subtract(cogs == null ? BigDecimal.ZERO : cogs);
    BigDecimal aov = orders > 0 ? netRevenue.divide(BigDecimal.valueOf(orders), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
    BigDecimal arpu = customers > 0 ? netRevenue.divide(BigDecimal.valueOf(customers), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;

    // cancel
    String cancelSql = "SELECT COUNT(*) FROM orders o WHERE o.order_date >= :s AND o.order_date < :e AND o.status='cancelled'";
    long cancelled = ((Number) em.createNativeQuery(cancelSql)
        .setParameter("s", Date.valueOf(start))
        .setParameter("e", Date.valueOf(end.plusDays(1)))
        .getSingleResult()).longValue();

    return SummaryDto.builder()
        .orders(orders).paidOrders(paidOrders).customers(customers).items(items)
        .grossSales(nz(grossSales)).shippingFee(nz(shippingFee))
        .couponDiscount(nz(couponDiscount)).shipDiscount(nz(shipDiscount))
        .netRevenue(nz(netRevenue)).cogs(nz(cogs)).grossProfit(nz(grossProfit))
        .aov(nz(aov)).arpu(nz(arpu)).cancelledOrders(cancelled)
        .build();
  }

  // ----- TIME SERIES -----
  @SuppressWarnings("unchecked")
  public List<TimeSeriesPoint> salesSeries(LocalDate start, LocalDate end, String groupBy, int tzOffset) {
    String periodExpr = groupExpr(groupBy, tzOffset);
    String sql = """
      SELECT
        %s AS period,
        COUNT(DISTINCT o.id)                                     AS orders,
        COUNT(DISTINCT o.user_id)                                AS customers,
        COALESCE(SUM(oi.quantity),0)                             AS items,
        COALESCE(SUM(oi.quantity * oi.price),0)                  AS gross_sales,
        COALESCE(SUM(o.shipping_fee_final),0)                    AS shipping_fee,
        COALESCE(SUM(oc.discount_amount),0)                      AS coupon_discount,
        COALESCE(SUM(osv.shipping_discount_amount),0)            AS ship_discount
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN order_coupons oc ON oc.order_id = o.id
      LEFT JOIN order_shipping_vouchers osv ON osv.order_id = o.id
      WHERE o.order_date >= :start AND o.order_date < :endPlus1
      GROUP BY period
      ORDER BY period
    """.formatted(periodExpr);

    List<Object[]> rows = em.createNativeQuery(sql)
        .setParameter("start", Date.valueOf(start))
        .setParameter("endPlus1", Date.valueOf(end.plusDays(1)))
        .getResultList();

    // COGS theo kỳ
    String cogsSql = """
      SELECT %s AS period, COALESCE(SUM(oi.quantity * COALESCE(avg_cost.avg_cost,0)),0) AS cogs
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN (
        SELECT product_id, SUM(quantity * unit_price)/NULLIF(SUM(quantity),0) AS avg_cost
        FROM import_details GROUP BY product_id
      ) avg_cost ON avg_cost.product_id = oi.product_id
      WHERE o.order_date >= :start AND o.order_date < :endPlus1
      GROUP BY period
    """.formatted(periodExpr);
    Map<String, BigDecimal> cogsMap = new LinkedHashMap<>();
    for (Object[] r : (List<Object[]>) em.createNativeQuery(cogsSql)
        .setParameter("start", Date.valueOf(start))
        .setParameter("endPlus1", Date.valueOf(end.plusDays(1)))
        .getResultList()) {
      cogsMap.put((String) r[0], (BigDecimal) r[1]);
    }

    List<TimeSeriesPoint> out = new ArrayList<>();
    for (Object[] r : rows) {
      String period = (String) r[0];
      long orders = ((Number) r[1]).longValue();
      long customers = ((Number) r[2]).longValue();
      long items = ((Number) r[3]).longValue();
      BigDecimal gross = nz((BigDecimal) r[4]);
      BigDecimal ship = nz((BigDecimal) r[5]);
      BigDecimal coup = nz((BigDecimal) r[6]);
      BigDecimal shipDisc = nz((BigDecimal) r[7]);
      BigDecimal net = gross.subtract(coup).add(ship).subtract(shipDisc);
      BigDecimal cogs = nz(cogsMap.getOrDefault(period, BigDecimal.ZERO));
      BigDecimal gp = net.subtract(cogs);
      BigDecimal margin = net.signum()==0 ? BigDecimal.ZERO : gp.multiply(BigDecimal.valueOf(100)).divide(net, 2, BigDecimal.ROUND_HALF_UP);
      out.add(TimeSeriesPoint.builder()
          .period(period).orders(orders).customers(customers).items(items)
          .grossSales(gross).shippingFee(ship).couponDiscount(coup).shipDiscount(shipDisc)
          .netRevenue(net).cogs(cogs).grossProfit(gp).marginPct(margin)
          .build());
    }
    return out;
  }

  // ----- TOP PRODUCTS -----
  @SuppressWarnings("unchecked")
  public List<TopProductDto> topProducts(LocalDate start, LocalDate end, int limit) {
    String sql = """
      SELECT oi.product_id, p.name, SUM(oi.quantity) AS qty, SUM(oi.quantity * oi.price) AS sales
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.order_date >= :start AND o.order_date < :endPlus1
      GROUP BY oi.product_id, p.name
      ORDER BY sales DESC
      LIMIT :limit
    """;
    List<Object[]> rows = em.createNativeQuery(sql)
        .setParameter("start", Date.valueOf(start))
        .setParameter("endPlus1", Date.valueOf(end.plusDays(1)))
        .setParameter("limit", limit)
        .getResultList();
    List<TopProductDto> out = new ArrayList<>();
    for (Object[] r : rows) {
      out.add(TopProductDto.builder()
          .productId((Integer) r[0])
          .productName((String) r[1])
          .quantity(((Number) r[2]).longValue())
          .sales((BigDecimal) r[3])
          .build());
    }
    return out;
  }

  // ----- BY CATEGORY / BRAND -----
  public List<KeyValue> byCategory(LocalDate s, LocalDate e) {
    String sql = """
      SELECT c.name, COUNT(DISTINCT o.id) AS orders, COALESCE(SUM(oi.quantity*oi.price),0) AS sales
      FROM orders o
      JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN products p ON p.id=oi.product_id
      LEFT JOIN categories c ON c.id=p.category_id
      WHERE o.order_date >= :s AND o.order_date < :e
      GROUP BY c.name
      ORDER BY sales DESC
    """;
    return mapKeyValue(sql, s, e);
  }

  public List<KeyValue> byBrand(LocalDate s, LocalDate e) {
    String sql = """
      SELECT b.name, COUNT(DISTINCT o.id) AS orders, COALESCE(SUM(oi.quantity*oi.price),0) AS sales
      FROM orders o
      JOIN order_items oi ON oi.order_id=o.id
      LEFT JOIN products p ON p.id=oi.product_id
      LEFT JOIN brands b ON b.id=p.brand_id
      WHERE o.order_date >= :s AND o.order_date < :e
      GROUP BY b.name
      ORDER BY sales DESC
    """;
    return mapKeyValue(sql, s, e);
  }

  // ----- PAYMENTS -----
  public List<KeyValue> paymentByMethod(LocalDate s, LocalDate e) {
    String sql = """
      SELECT p.payment_method, COUNT(*), COALESCE(SUM(p.amount),0)
      FROM payments p
      JOIN orders o ON o.id=p.order_id
      WHERE o.order_date >= :s AND o.order_date < :e
      GROUP BY p.payment_method
    """;
    return mapKeyValue(sql, s, e);
  }

  // ----- SHIPPING -----
  public List<KeyValue> shippingByCarrier(LocalDate s, LocalDate e) {
    String sql = """
      SELECT sc.name, COUNT(*), COALESCE(SUM(s.fee),0)
      FROM shipping s
      LEFT JOIN shipping_carriers sc ON sc.id = s.carrier_id
      JOIN orders o ON o.id = s.order_id
      WHERE o.order_date >= :s AND o.order_date < :e
      GROUP BY sc.name
      ORDER BY 3 DESC
    """;
    return mapKeyValue(sql, s, e);
  }

  // ----- COUPON / SHIP-VOUCHER -----
  public List<KeyValue> coupons(LocalDate s, LocalDate e) {
    String sql = """
      SELECT c.code, COUNT(oc.order_id), COALESCE(SUM(oc.discount_amount),0)
      FROM order_coupons oc
      JOIN orders o ON o.id = oc.order_id
      JOIN coupons c ON c.id = oc.coupon_id
      WHERE o.order_date >= :s AND o.order_date < :e
      GROUP BY c.code ORDER BY 3 DESC
    """;
    return mapKeyValue(sql, s, e);
  }
  public List<KeyValue> shipVouchers(LocalDate s, LocalDate e) {
    String sql = """
      SELECT sv.code, COUNT(osv.order_id), COALESCE(SUM(osv.shipping_discount_amount),0)
      FROM order_shipping_vouchers osv
      JOIN orders o ON o.id = osv.order_id
      JOIN shipping_vouchers sv ON sv.id = osv.voucher_id
      WHERE o.order_date >= :s AND o.order_date < :e
      GROUP BY sv.code ORDER BY 3 DESC
    """;
    return mapKeyValue(sql, s, e);
  }

  // ----- CUSTOMERS -----
  public List<KeyValue> topCustomers(LocalDate s, LocalDate e, int limit) {
    String sql = """
      SELECT u.username, COUNT(DISTINCT o.id), COALESCE(SUM(oi.quantity*oi.price),0)
      FROM orders o
      JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      WHERE o.order_date >= :s AND o.order_date < :e
      GROUP BY u.username
      ORDER BY 3 DESC
      LIMIT :limit
    """;
    var q = em.createNativeQuery(sql)
        .setParameter("s", Date.valueOf(s))
        .setParameter("e", Date.valueOf(e))
        .setParameter("limit", limit);
    List<Object[]> rows = q.getResultList();
    List<KeyValue> out = new ArrayList<>();
    for (Object[] r : rows) out.add(KeyValue.builder()
        .key((String) r[0]).count(((Number) r[1]).longValue()).amount((BigDecimal) r[2]).build());
    return out;
  }

  // ---------- helpers ----------
  private List<KeyValue> mapKeyValue(String sql, LocalDate s, LocalDate e) {
    List<Object[]> rows = em.createNativeQuery(sql)
        .setParameter("s", java.sql.Date.valueOf(s))
        .setParameter("e", java.sql.Date.valueOf(e))
        .getResultList();
    List<KeyValue> out = new ArrayList<>();
    for (Object[] r : rows) {
      out.add(KeyValue.builder()
          .key((String) r[0])
          .count(((Number) r[1]).longValue())
          .amount((BigDecimal) r[2]).build());
    }
    return out;
  }

  private static BigDecimal nz(BigDecimal v) { return v==null? BigDecimal.ZERO : v; }
}
