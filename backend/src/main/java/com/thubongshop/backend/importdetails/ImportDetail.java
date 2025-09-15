package com.thubongshop.backend.importdetails;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "import_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "import_id", nullable = false)
    private Long importId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    private Integer quantity;

    private Double unitPrice;
}
