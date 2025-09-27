package com.thubongshop.backend.product;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

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
}
