package com.thubongshop.backend.imports;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.thubongshop.backend.importdetails.ImportDetail;
import com.thubongshop.backend.supplier.Supplier;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "imports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Import {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "import_date")
    private LocalDateTime importDate;

    private String status;

    private String notes;

    @Column(name = "total_cost")
    private Double totalCost;

    // Liên kết với Supplier
    @ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "supplier_id", nullable = true)  // ✅ cho phép null    
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "products" })
    private Supplier supplier;

    // Liên kết với ImportDetail
    @OneToMany(mappedBy = "importObj", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // cha -> con
private List<ImportDetail> details = new ArrayList<>();}
