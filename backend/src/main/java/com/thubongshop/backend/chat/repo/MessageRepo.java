package com.thubongshop.backend.chat.repo;

import com.thubongshop.backend.chat.entity.Message;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;

public interface MessageRepo extends JpaRepository<Message, Integer> {
  Page<Message> findByChatSessionIdOrderByIdAsc(Integer sessionId, Pageable pageable);
  Message findTop1ByChatSessionIdOrderByIdDesc(Integer sessionId);
  long countByChatSessionIdAndSenderIdNotAndIsReadFalse(Integer sessionId, Integer notSenderId);

  @Modifying
  @Query("update Message m set m.isRead=true where m.chatSessionId=:sid and m.senderId<>:readerId and m.isRead=false")
  int markReadForSession(Integer sid, Integer readerId);
}
