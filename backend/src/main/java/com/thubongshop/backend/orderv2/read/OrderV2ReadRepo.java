package com.thubongshop.backend.orderv2.read;

import com.thubongshop.backend.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderV2ReadRepo extends JpaRepository<Order, Integer> {

  /* ========= CLIENT ========= */

  /** Phân trang đơn theo user_id (native query tự ORDER BY o.order_date DESC) */
  @Query(
    value = """
      SELECT o.id, o.status, o.items_total, o.shipping_fee, o.shipping_discount, o.grand_total,
             o.receiver_name, o.phone, o.address_line, o.province, o.order_date
      FROM orders o
      WHERE o.user_id = :uid
      ORDER BY o.order_date DESC
    """,
    countQuery = "SELECT COUNT(*) FROM orders o WHERE o.user_id = :uid",
    nativeQuery = true
  )
  Page<OrderListRow> pageByUser(@Param("uid") Integer userId, Pageable pageable);


  /* ========= DETAIL & ITEMS ========= */

  /** Chi tiết 1 đơn (join carrier/service + ưu tiên shipping_records) */
  @Query(
    value = """
      SELECT o.*,
             sc.code  AS carrier_code, sc.name  AS carrier_name,
             ss.code  AS service_code, ss.label AS service_label,
             sr.tracking_code   AS sr_tracking_code,
             sr.status          AS sr_status,
             sh.tracking_number AS ship_tracking_number,
             sh.status          AS ship_status
      FROM orders o
      LEFT JOIN shipping_carriers sc ON sc.id = o.shipping_carrier_id
      LEFT JOIN shipping_services ss ON ss.id = o.shipping_service_id
      LEFT JOIN shipping_records  sr ON sr.order_id = o.id
      LEFT JOIN shipping          sh ON sh.order_id = o.id
      WHERE o.id = :oid
      LIMIT 1
    """,
    nativeQuery = true
  )
  OrderDetailRow findDetail(@Param("oid") Integer orderId);

  /** Danh sách item của 1 đơn */
  @Query(
    value = """
      SELECT oi.product_id, oi.product_name, oi.unit_price, oi.quantity, oi.weight_kg_per_item
      FROM order_items oi
      WHERE oi.order_id = :oid
      ORDER BY oi.id
    """,
    nativeQuery = true
  )
  java.util.List<OrderItemRow> findItems(@Param("oid") Integer orderId);


  /* ========= ADMIN: LIST ========= */

  /** Phân trang tất cả đơn (ORDER BY o.order_date DESC) */
  @Query(
    value = """
      SELECT o.id, o.status, o.items_total, o.shipping_fee, o.shipping_discount, o.grand_total,
             o.receiver_name, o.phone, o.address_line, o.province, o.order_date
      FROM orders o
      ORDER BY o.order_date DESC
    """,
    countQuery = "SELECT COUNT(*) FROM orders o",
    nativeQuery = true
  )
  Page<OrderListRow> pageAll(Pageable pageable);

  /** Phân trang theo trạng thái (ORDER BY o.order_date DESC) */
  @Query(
    value = """
      SELECT o.id, o.status, o.items_total, o.shipping_fee, o.shipping_discount, o.grand_total,
             o.receiver_name, o.phone, o.address_line, o.province, o.order_date
      FROM orders o
      WHERE o.status = :status
      ORDER BY o.order_date DESC
    """,
    countQuery = "SELECT COUNT(*) FROM orders o WHERE o.status = :status",
    nativeQuery = true
  )
  Page<OrderListRow> pageByStatus(@Param("status") String status, Pageable pageable);


  /* ========= ADMIN: SEARCH ADVANCED ========= */

  /**
   * Tìm kiếm nâng cao theo: status, province, carrierCode, q (receiver/phone/address),
   * từ ngày/đến ngày (yyyy-MM-dd), min/max grand_total. ORDER BY order_date DESC.
   */
  @Query(
    value = """
      SELECT o.id, o.status, o.items_total, o.shipping_fee, o.shipping_discount, o.grand_total,
             o.receiver_name, o.phone, o.address_line, o.province, o.order_date
      FROM orders o
      LEFT JOIN shipping_carriers sc ON sc.id = o.shipping_carrier_id
      WHERE ( :status      IS NULL OR o.status = :status )
        AND ( :province    IS NULL OR o.province LIKE CONCAT('%', :province, '%') )
        AND ( :carrierCode IS NULL OR sc.code = :carrierCode )
        AND ( :q           IS NULL OR (o.receiver_name LIKE CONCAT('%', :q, '%')
                                   OR  o.phone         LIKE CONCAT('%', :q, '%')
                                   OR  o.address_line  LIKE CONCAT('%', :q, '%')) )
        AND ( :dateFrom    IS NULL OR o.order_date >= STR_TO_DATE(:dateFrom, '%Y-%m-%d') )
        AND ( :dateTo      IS NULL OR o.order_date <  DATE_ADD(STR_TO_DATE(:dateTo, '%Y-%m-%d'), INTERVAL 1 DAY) )
        AND ( :minTotal    IS NULL OR o.grand_total >= :minTotal )
        AND ( :maxTotal    IS NULL OR o.grand_total <= :maxTotal )
      ORDER BY o.order_date DESC
    """,
    countQuery = """
      SELECT COUNT(*)
      FROM orders o
      LEFT JOIN shipping_carriers sc ON sc.id = o.shipping_carrier_id
      WHERE ( :status      IS NULL OR o.status = :status )
        AND ( :province    IS NULL OR o.province LIKE CONCAT('%', :province, '%') )
        AND ( :carrierCode IS NULL OR sc.code = :carrierCode )
        AND ( :q           IS NULL OR (o.receiver_name LIKE CONCAT('%', :q, '%')
                                   OR  o.phone         LIKE CONCAT('%', :q, '%')
                                   OR  o.address_line  LIKE CONCAT('%', :q, '%')) )
        AND ( :dateFrom    IS NULL OR o.order_date >= STR_TO_DATE(:dateFrom, '%Y-%m-%d') )
        AND ( :dateTo      IS NULL OR o.order_date <  DATE_ADD(STR_TO_DATE(:dateTo, '%Y-%m-%d'), INTERVAL 1 DAY) )
        AND ( :minTotal    IS NULL OR o.grand_total >= :minTotal )
        AND ( :maxTotal    IS NULL OR o.grand_total <= :maxTotal )
    """,
    nativeQuery = true
  )
  Page<OrderListRow> searchAdmin(
      @Param("status") String status,
      @Param("province") String province,
      @Param("carrierCode") String carrierCode,
      @Param("q") String q,
      @Param("dateFrom") String dateFrom,
      @Param("dateTo") String dateTo,
      @Param("minTotal") Long minTotal,
      @Param("maxTotal") Long maxTotal,
      Pageable pageable
  );


  /* ========= MUTATIONS ========= */

  /** Cập nhật trạng thái đơn (client hủy / admin đổi trạng thái) */
  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Query(value = "UPDATE orders SET status = :status WHERE id = :oid", nativeQuery = true)
  int updateStatus(@Param("oid") Integer orderId, @Param("status") String status);
}
