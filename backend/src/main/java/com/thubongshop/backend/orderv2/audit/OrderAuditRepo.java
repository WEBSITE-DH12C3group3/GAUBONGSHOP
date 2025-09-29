package com.thubongshop.backend.orderv2.audit;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderAuditRepo extends JpaRepository<OrderAudit, Integer> { }
