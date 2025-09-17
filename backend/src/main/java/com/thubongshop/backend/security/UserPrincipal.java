package com.thubongshop.backend.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {
  private final Integer id;
  private final String username;
  private final List<SimpleGrantedAuthority> authorities;
  private final String password; // <-- giữ hash (BCrypt)

  // Giữ constructor cũ cho nơi nào đã dùng
  public UserPrincipal(Integer id, String username, List<SimpleGrantedAuthority> authorities) {
    this(id, username, authorities, null);
  }
  // Constructor đầy đủ
  public UserPrincipal(Integer id, String username, List<SimpleGrantedAuthority> authorities, String password) {
    this.id = id;
    this.username = username;
    this.authorities = authorities;
    this.password = password;
  }

  // Factory cũ (không có password)
  public static UserPrincipal of(Integer id, String username, List<SimpleGrantedAuthority> auths) {
    return new UserPrincipal(id, username, auths, null);
  }
  // Factory mới (có password hash)
  public static UserPrincipal of(Integer id, String username, String passwordHash, List<SimpleGrantedAuthority> auths) {
    return new UserPrincipal(id, username, auths, passwordHash);
  }

  @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
  @Override public String getPassword() { return password; } // <-- RẤT QUAN TRỌNG
  @Override public String getUsername() { return username; }
  @Override public boolean isAccountNonExpired() { return true; }
  @Override public boolean isAccountNonLocked() { return true; }
  @Override public boolean isCredentialsNonExpired() { return true; }
  @Override public boolean isEnabled() { return true; }
}
