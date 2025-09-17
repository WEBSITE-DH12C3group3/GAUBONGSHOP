package com.thubongshop.backend.rolepermission;

import com.thubongshop.backend.role.Role;
import com.thubongshop.backend.permission.Permission;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
  name = "role_permissions",
  uniqueConstraints = @UniqueConstraint(name = "uk_role_perm", columnNames = {"role_id","permission_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermission {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "role_id", nullable = false)
  private Role role;

  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "permission_id", nullable = false)
  private Permission permission;
}
