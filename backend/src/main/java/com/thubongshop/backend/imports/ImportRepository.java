package com.thubongshop.backend.imports;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface ImportRepository extends JpaRepository<Import, Integer> {
    List<Import> findByStatus(String status);

    List<Import> findBySupplierId(Integer supplierId);

    @Query("SELECT i FROM Import i " +
            "LEFT JOIN FETCH i.details d " +
            "LEFT JOIN FETCH d.product " +
            "WHERE i.id = :id")
    Optional<Import> findByIdWithDetails(@Param("id") Integer id);

}
