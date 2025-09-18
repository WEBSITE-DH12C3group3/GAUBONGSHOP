// src/main/java/com/thubongshop/backend/userrole/UserRoleRepository.java
package com.thubongshop.backend.userrole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    /* ====== Kiểm tra/quản lý quan hệ User–Role ====== */

    // User có thuộc Role không?
    boolean existsByUser_IdAndRole_Id(Long userId, Long roleId);

    // Lấy tất cả quan hệ của 1 user / 1 role
    List<UserRole> findByUser_Id(Long userId);
    List<UserRole> findByRole_Id(Long roleId);

    // Đếm nhanh số member trong 1 role, hoặc số role của 1 user
    long countByRole_Id(Long roleId);
    long countByUser_Id(Long userId);

    // Xoá 1 quan hệ cụ thể (gỡ user khỏi 1 role)
    void deleteByUser_IdAndRole_Id(Long userId, Long roleId);

    // Xoá tất cả quan hệ theo user / theo role
    void deleteByUser_Id(Long userId);
    void deleteByRole_Id(Long roleId);

    // Xoá nhiều role của 1 user trong 1 lần
    void deleteByUser_IdAndRole_IdIn(Long userId, Collection<Long> roleIds);

    /* ====== Một số tiện ích truy vấn JPQL (tuỳ nhu cầu) ====== */

    // Lấy danh sách userId thuộc 1 role (hữu ích cho màn đếm/hiển thị nhẹ)
    @Query("select ur.user.id from UserRole ur where ur.role.id = :roleId")
    List<Long> findUserIdsByRoleId(@Param("roleId") Long roleId);

    // Lấy danh sách roleId của 1 user (hữu ích khi map DTO)
    @Query("select ur.role.id from UserRole ur where ur.user.id = :userId")
    List<Long> findRoleIdsByUserId(@Param("userId") Long userId);
}
