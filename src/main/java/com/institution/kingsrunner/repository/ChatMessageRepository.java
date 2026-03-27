package com.institution.kingsrunner.repository;

import com.institution.kingsrunner.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Fetch the conversation history between two users, locked to their institution
    @Query("SELECT m FROM ChatMessage m WHERE m.institutionId = :institutionId AND " +
           "((m.sender.id = :user1Id AND m.recipient.id = :user2Id) OR " +
           "(m.sender.id = :user2Id AND m.recipient.id = :user1Id)) " +
           "ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversation(
            @Param("institutionId") Long institutionId,
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id
    );
}
