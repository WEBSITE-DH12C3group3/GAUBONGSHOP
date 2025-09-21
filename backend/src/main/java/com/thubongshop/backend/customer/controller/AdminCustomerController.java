package com.thubongshop.backend.customer.controller;

import com.thubongshop.backend.customer.dto.*;
import com.thubongshop.backend.customer.CustomerStatus;
import com.thubongshop.backend.customer.CustomerTier;
import com.thubongshop.backend.customer.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
public class AdminCustomerController {

    private final CustomerService service;

    public AdminCustomerController(CustomerService service) {
        this.service = service;
    }

    // GET /api/admin/customers?q=&status=&tier=&createdFrom=2025-01-01&createdTo=2025-12-31&page=0&size=10&sort=createdAt,desc
    @GetMapping
    public Page<CustomerDTO> search(CustomerFilterRequest filter){
        return service.search(filter);
    }

    @GetMapping("/{id}")
    public CustomerDTO get(@PathVariable Long id){
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<CustomerDTO> create(@Valid @RequestBody CustomerCreateRequest req){
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public CustomerDTO update(@PathVariable Long id, @Valid @RequestBody CustomerUpdateRequest req){
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Quản lý trạng thái
    @PatchMapping("/{id}/status")
    public CustomerDTO setStatus(@PathVariable Long id, @RequestParam CustomerStatus status){
        return service.setStatus(id, status);
    }

    // Quản lý hạng
    @PatchMapping("/{id}/tier")
    public CustomerDTO setTier(@PathVariable Long id, @RequestParam CustomerTier tier){
        return service.setTier(id, tier);
    }
}
