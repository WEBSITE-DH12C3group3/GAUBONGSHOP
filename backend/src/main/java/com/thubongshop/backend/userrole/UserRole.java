// src/main/java/com/thubongshop/backend/userrole/UserRole.java
package com.thubongshop.backend.userrole;

import com.thubongshop.backend.role.Role;
import com.thubongshop.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
  name = "user_roles",
  uniqueConstraints = {
    @UniqueConstraint(name = "uq_user_roles_user", columnNames = {"user_id"}),              // 1 user = 1 role
    @UniqueConstraint(name = "uq_user_roles_user_role", columnNames = {"user_id","role_id"}) // chống trùng cặp
  }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserRole {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "role_id", nullable = false)
  private Role role;
}
