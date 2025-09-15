package com.thubongshop.backend.importdetails;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImportDetailRepository extends JpaRepository<ImportDetail, Long> {
    List<ImportDetail> findByImportId(Long importId);
}
