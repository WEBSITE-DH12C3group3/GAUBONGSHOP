package com.thubongshop.backend.user.reset;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {

  Optional<PasswordResetCode>
  findTopByEmailAndCodeAndUsedIsFalseOrderByIdDesc(String email, String code);

  @Modifying(clearAutomatically = true, flushAutomatically = true)
  @Transactional
  long deleteByEmailAndExpiresAtBefore(String email, LocalDateTime time);
}

