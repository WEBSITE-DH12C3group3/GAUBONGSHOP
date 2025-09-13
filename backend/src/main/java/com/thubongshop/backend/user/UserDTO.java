package com.thubongshop.backend.user;

import com.thubongshop.backend.role.Role;
import java.time.LocalDateTime;
import java.util.Set;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String address;

    private Set<Role> roles;
    private LocalDateTime createdAt; // 👈 ngày tạo user

    // Constructor nhận từ Entity User
    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.address = user.getAddress();
        this.roles = user.getRoles();
        this.createdAt = user.getCreatedAt();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

}
