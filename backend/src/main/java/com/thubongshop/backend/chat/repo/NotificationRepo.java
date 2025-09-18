package com.thubongshop.backend.chat.repo;

import com.thubongshop.backend.chat.entity.Notification;
import org.springframework.data.jpa.repository.*;

import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Integer> {
  List<Notification> findByUserIdAndReadFalse(Integer userId);

  @Modifying
  @Query("UPDATE Notification n SET n.read=true WHERE n.userId=:userId AND n.read=false")
  int markAllRead(Integer userId);
}
