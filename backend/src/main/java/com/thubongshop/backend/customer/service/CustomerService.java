package com.thubongshop.backend.customer.service;

import com.thubongshop.backend.customer.dto.*;
import com.thubongshop.backend.customer.CustomerStatus;
import com.thubongshop.backend.customer.CustomerTier;
import com.thubongshop.backend.user.User;
import com.thubongshop.backend.user.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class CustomerService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public CustomerService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    private CustomerDTO toDTO(User u){
        return new CustomerDTO(
                u.getId(), u.getUsername(), u.getEmail(), u.getPhone(), u.getAddress(),
                u.getStatus(), u.getTier(), u.getPoints(), u.getCreatedAt()
        );
    }

    public Page<CustomerDTO> search(CustomerFilterRequest f){
        int page = f.page() == null ? 0 : Math.max(0, f.page());
        int size = f.size() == null ? 10 : Math.min(100, Math.max(1, f.size()));

        Sort sort = Sort.by("createdAt").descending();
        if (f.sort()!=null && !f.sort().isBlank()) {
            String[] parts = f.sort().split(",");
            String prop = parts[0];
            boolean desc = parts.length > 1 && parts[1].equalsIgnoreCase("desc");
            sort = desc ? Sort.by(prop).descending() : Sort.by(prop).ascending();
        }
        Pageable pageable = PageRequest.of(page, size, sort);

        LocalDateTime fromAt = f.createdFrom()==null? null : f.createdFrom().atStartOfDay();
        LocalDateTime toAt   = f.createdTo()==null? null : f.createdTo().plusDays(1).atStartOfDay();

        return repo.search(f.q(), f.status(), f.tier(), fromAt, toAt, pageable)
                   .map(this::toDTO);
    }

    public CustomerDTO get(Long id){
        return repo.findById(id).map(this::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("Khách hàng không tồn tại"));
    }

    public CustomerDTO create(CustomerCreateRequest r){
        User u = new User();
        u.setUsername(r.username());
        u.setPassword(encoder.encode(r.password()));
        u.setEmail(r.email());
        u.setPhone(r.phone());
        u.setAddress(r.address());
        if (r.status()!=null) u.setStatus(r.status());
        if (r.tier()!=null)   u.setTier(r.tier());
        u.setPoints(0);
        return toDTO(repo.save(u));
    }

    public CustomerDTO update(Long id, CustomerUpdateRequest r){
        User u = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Khách hàng không tồn tại"));
        if (r.username()!=null) u.setUsername(r.username());
        if (r.password()!=null && !r.password().isBlank()) u.setPassword(encoder.encode(r.password()));
        if (r.email()!=null)   u.setEmail(r.email());
        if (r.phone()!=null)   u.setPhone(r.phone());
        if (r.address()!=null) u.setAddress(r.address());
        if (r.status()!=null)  u.setStatus(r.status());
        if (r.tier()!=null)    u.setTier(r.tier());
        if (r.points()!=null)  u.setPoints(Math.max(0, r.points()));
        return toDTO(repo.save(u));
    }

    public void delete(Long id){
        repo.deleteById(id);
    }

    public CustomerDTO setStatus(Long id, CustomerStatus status){
        User u = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Khách hàng không tồn tại"));
        u.setStatus(status);
        return toDTO(repo.save(u));
    }

    public CustomerDTO setTier(Long id, CustomerTier tier){
        User u = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Khách hàng không tồn tại"));
        u.setTier(tier);
        return toDTO(repo.save(u));
    }
}
