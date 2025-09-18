package com.thubongshop.backend.importdetails;
import com.thubongshop.backend.imports.Import;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ImportDetailRepository extends JpaRepository<ImportDetail, Integer > {
    List<ImportDetail> findByImportObj_Id(Integer  importId);
    void deleteAllByImportObj(Import importObj);
    
}
