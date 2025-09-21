package com.thubongshop.backend.customer.dto;

import com.thubongshop.backend.customer.CustomerStatus;
import com.thubongshop.backend.customer.CustomerTier;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerCreateRequest(
        @NotBlank String username,
        @NotBlank @Size(min=6) String password,
        @Email String email,
        String phone,
        String address,
        CustomerStatus status,
        CustomerTier tier
) {}
