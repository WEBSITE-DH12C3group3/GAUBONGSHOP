package com.thubongshop.backend.favorite;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "favorites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long productId;

    private LocalDateTime createdAt = LocalDateTime.now();
}
