package com.thubongshop.backend.chat.repo;

import com.thubongshop.backend.chat.entity.ChatSession;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatSessionRepo extends JpaRepository<ChatSession, Integer>, JpaSpecificationExecutor<ChatSession> {

  @Query("""
    SELECT s FROM ChatSession s
    WHERE s.participant1Id = :u AND s.participant2Id = :a
  """)
  Optional<ChatSession> findBetween(@Param("u") Integer userId, @Param("a") Integer adminId);

  @Query("""
    SELECT s FROM ChatSession s
    WHERE s.participant1Id=:uid OR s.participant2Id=:uid
    ORDER BY s.updatedAt DESC NULLS LAST
  """)
  Page<ChatSession> findAllOfUser(@Param("uid") Integer uid, Pageable pageable);

  Page<ChatSession> findByStatusOrderByUpdatedAtDesc(ChatSession.Status status, Pageable pageable);
}
