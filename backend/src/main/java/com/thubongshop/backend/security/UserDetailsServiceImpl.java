package com.thubongshop.backend.security;

import com.thubongshop.backend.user.User;
import com.thubongshop.backend.user.UserRepository;
import com.thubongshop.backend.rolepermission.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

  private final UserRepository userRepo;
  private final RolePermissionRepository rolePermRepo; // <- để load permission theo role

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    User user = userRepo.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

    // Authorities unique + có thứ tự ổn định
    Set<SimpleGrantedAuthority> authorities = new LinkedHashSet<>();

    // 1) Roles -> ROLE_*
    List<Long> roleIds = new ArrayList<>();
    if (user.getRoles() != null) {
      user.getRoles().forEach(r -> {
        if (r == null) return;
        roleIds.add(r.getId());
        String name = r.getName();
        String role = (name != null && name.startsWith("ROLE_"))
            ? name
            : "ROLE_" + (name == null ? "" : name.toUpperCase());
        authorities.add(new SimpleGrantedAuthority(role));
      });
    }

    // 2) Permissions theo các role của user (không prefix)
    if (!roleIds.isEmpty()) {
      List<String> permNames = rolePermRepo.findPermissionNamesOfRoles(roleIds);
      if (permNames != null) {
        permNames.stream()
            .filter(p -> p != null && !p.isBlank())
            .map(SimpleGrantedAuthority::new)
            .forEach(authorities::add);
      }
    }

    Integer id = (user.getId() == null) ? null : Math.toIntExact(user.getId()); // Long -> Integer nếu cần
    return UserPrincipal.of(id, user.getEmail(), user.getPassword(), new ArrayList<>(authorities));
  }
}
