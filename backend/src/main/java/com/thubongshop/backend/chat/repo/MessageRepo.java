package com.thubongshop.backend.chat.repo;

import com.thubongshop.backend.chat.entity.ChatSession;
import com.thubongshop.backend.chat.entity.Message;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface MessageRepo extends JpaRepository<Message, Integer>, JpaSpecificationExecutor<Message> {

  @Query("SELECT m FROM Message m WHERE m.session=:session ORDER BY m.id ASC")
  Page<Message> findBySession(@Param("session") ChatSession session, Pageable pageable);

  @Modifying
  @Query("""
    UPDATE Message m
    SET m.read = true
    WHERE m.session = :session
      AND m.senderId <> :viewerId
      AND m.read = false
  """)
  int markReadAll(@Param("session") ChatSession session, @Param("viewerId") Integer viewerId);

  @Query("SELECT COUNT(m) FROM Message m WHERE m.session=:session AND m.senderId<>:viewerId AND m.read=false")
  long countUnreadFor(@Param("session") ChatSession session, @Param("viewerId") Integer viewerId);

  @Query("SELECT m FROM Message m WHERE m.session=:session ORDER BY m.id DESC LIMIT 1")
  Message findLastMessage(@Param("session") ChatSession session);
}
