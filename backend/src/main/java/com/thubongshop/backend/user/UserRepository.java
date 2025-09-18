package com.thubongshop.backend.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
