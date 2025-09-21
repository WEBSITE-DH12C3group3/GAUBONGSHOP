package com.thubongshop.backend.customer.dto;

import com.thubongshop.backend.customer.CustomerStatus;
import com.thubongshop.backend.customer.CustomerTier;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

public record CustomerFilterRequest(
        String q, // tìm theo username/email/phone
        CustomerStatus status,
        CustomerTier tier,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdFrom,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdTo,
        Integer page,
        Integer size,
        String sort // ví dụ: createdAt,desc
) {}
