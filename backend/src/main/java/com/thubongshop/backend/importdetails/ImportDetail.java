package com.thubongshop.backend.importdetails;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.thubongshop.backend.imports.Import;
import com.thubongshop.backend.product.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "import_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ImportDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết với Import (cha)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_id", nullable = false)
    @JsonBackReference // con -> cha
    private Import importObj;

    // Liên kết với Product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "supplier" })
    private Product product;

    private Integer quantity;

    @Column(name = "unit_price")
    private Double unitPrice;
}
