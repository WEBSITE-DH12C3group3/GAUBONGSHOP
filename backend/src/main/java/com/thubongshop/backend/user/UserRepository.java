package com.thubongshop.backend.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.thubongshop.backend.customer.CustomerStatus;
import com.thubongshop.backend.customer.CustomerTier;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /* ===== Tra cứu theo email ===== */
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findFirstByRoles_NameIgnoreCase(String roleName);

    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);

    /* ===== Search chung + lọc theo roleId (dùng cho:
       - /api/admin/users (bảng Users phía trên)
       - /api/admin/roles/{id}/users (thành viên của 1 nhóm)
       Gắn EntityGraph để fetch kèm roles, tránh N+1 khi FE cần đọc roles. */
    @EntityGraph(attributePaths = "roles")
    @Query("""
        select distinct u from User u
        left join u.roles r
        where (:q is null or :q = ''
               or lower(u.username) like lower(concat('%', :q, '%'))
               or lower(u.email)    like lower(concat('%', :q, '%'))
               or lower(u.phone)    like lower(concat('%', :q, '%')))
          and (:roleId is null or r.id = :roleId)
        """)
    Page<User> searchUsers(@Param("q") String q,
                           @Param("roleId") Long roleId,
                           Pageable pageable);

    /* ===== Một số helper hay dùng (tuỳ bạn có cần hay không) ===== */

    // Liệt kê user theo roleId (đơn giản hoá cho trường hợp không cần keyword)
    @EntityGraph(attributePaths = "roles")
    Page<User> findByRoles_Id(Long roleId, Pageable pageable);

    // Tìm theo keyword đơn giản (không bắt buộc, để tái dùng ở nơi khác)
    @EntityGraph(attributePaths = "roles")
    @Query("""
        select u from User u
        where (:q is null or :q = ''
               or lower(u.username) like lower(concat('%', :q, '%'))
               or lower(u.email)    like lower(concat('%', :q, '%'))
               or lower(u.phone)    like lower(concat('%', :q, '%')))
        """)
    Page<User> searchKeywordOnly(@Param("q") String q, Pageable pageable);

    /* ===== ⭐ BỔ SUNG CHO MÀN QUẢN LÝ NHÓM ===== */

    // Lấy toàn bộ user kèm roles (dùng cho admin list nhanh, tránh N+1)
    @Query("""
      select distinct u from User u
      left join fetch u.roles r
    """)
    List<User> findAllWithRoles();

    // Lấy các user chưa có role nào (phục vụ "chọn từ user chưa có nhóm")
    @Query("""
      select u from User u
      left join u.roles r
      where r is null
    """)
    List<User> findUsersWithoutRole();

    User findFirstByEmail(String email);
    @Query("""
      SELECT u FROM User u
      WHERE (:q IS NULL OR lower(u.username) LIKE lower(CONCAT('%',:q,'%'))
      OR lower(u.email) LIKE lower(CONCAT('%',:q,'%'))
      OR lower(u.phone) LIKE lower(CONCAT('%',:q,'%')))
      AND (:status IS NULL OR u.status = :status)
      AND (:tier IS NULL OR u.tier = :tier)
      AND (:fromAt IS NULL OR u.createdAt >= :fromAt)
      AND (:toAt IS NULL OR u.createdAt < :toAt)
      """)
      Page<User> search(
      @Param("q") String q,
      @Param("status") CustomerStatus status,
      @Param("tier") CustomerTier tier,
      @Param("fromAt") LocalDateTime fromAt,
      @Param("toAt") LocalDateTime toAt,
      Pageable pageable
    );
}
