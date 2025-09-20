package com.thubongshop.backend.chat.repo;

import com.thubongshop.backend.chat.entity.Notification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface NotificationRepo extends JpaRepository<Notification, Integer> {

  @Modifying
  @Query("""
    UPDATE Notification n
    SET n.read = true
    WHERE n.userId = :uid
      AND n.read = false
      AND n.message.session.id = :sid
  """)
  int markReadBySession(@Param("uid") Integer userId, @Param("sid") Integer sessionId);
}
