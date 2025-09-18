package com.thubongshop.backend.product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import com.thubongshop.backend.supplier.Supplier;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double price;
    private String imageUrl;
    private Integer categoryId;
    private Integer brandId;
    private Integer stock;

    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", insertable = false, updatable = false)
    private Supplier supplier;

    @Column(name = "supplier_id")
    private Long supplierId;

}
