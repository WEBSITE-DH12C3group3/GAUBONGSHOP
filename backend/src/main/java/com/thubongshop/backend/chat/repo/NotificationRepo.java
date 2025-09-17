package com.thubongshop.backend.chat.repo;

import com.thubongshop.backend.chat.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Integer> {
  List<Notification> findByUserIdAndIsReadFalse(Integer userId);
  long countByUserIdAndIsReadFalse(Integer userId);
}
