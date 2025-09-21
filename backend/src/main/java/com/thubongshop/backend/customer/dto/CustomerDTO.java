package com.thubongshop.backend.customer.dto;

import com.thubongshop.backend.customer.CustomerStatus;
import com.thubongshop.backend.customer.CustomerTier;
import java.time.LocalDateTime;

public record CustomerDTO(
        Long id,
        String username,
        String email,
        String phone,
        String address,
        CustomerStatus status,
        CustomerTier tier,
        Integer points,
        LocalDateTime createdAt
) {}
