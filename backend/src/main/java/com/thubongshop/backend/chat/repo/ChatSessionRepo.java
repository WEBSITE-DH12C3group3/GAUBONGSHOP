package com.thubongshop.backend.chat.repo;

import com.thubongshop.backend.chat.entity.ChatSession;
import com.thubongshop.backend.chat.entity.ChatSession.Status;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatSessionRepo extends JpaRepository<ChatSession, Integer> {
  @Query("""
    select s from ChatSession s
     where (s.participant1Id=:u1 and s.participant2Id=:u2)
        or (s.participant1Id=:u2 and s.participant2Id=:u1)
  """)
  Optional<ChatSession> findBetween(@Param("u1") Integer u1, @Param("u2") Integer u2);

  Page<ChatSession> findByParticipant1IdOrParticipant2Id(Integer p1, Integer p2, Pageable pageable);
  Page<ChatSession> findByStatus(Status status, Pageable pageable);
}
