package com.thubongshop.backend.imports;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "imports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Import {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime importDate;

    private Double totalCost;

    private String status;   // pending, completed, canceled

    private String notes;

    private LocalDateTime createdAt;

    @Column(name = "supplier_id")
    private Long supplierId;
}
