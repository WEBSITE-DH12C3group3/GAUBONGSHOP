package com.thubongshop.backend.permission;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "permissions",
    uniqueConstraints = @UniqueConstraint(name = "uq_permission_name", columnNames = "name")
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Permission {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;          // ví dụ: "livechat_admin", "product.manage"

  @Column(length = 255)
  private String description;   // mô tả (tùy chọn)
}
