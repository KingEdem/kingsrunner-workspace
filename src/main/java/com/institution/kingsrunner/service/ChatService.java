package com.institution.kingsrunner.service;

import com.institution.kingsrunner.dto.ChatMessageDto;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.ChatMessage;
import com.institution.kingsrunner.repository.AppUserRepository;
import com.institution.kingsrunner.repository.ChatMessageRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatRepository;
    private final AppUserRepository userRepository;

    public ChatService(ChatMessageRepository chatRepository, AppUserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    private AppUser getAuthenticatedUser() {
        return (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public List<ChatMessageDto> getConversation(Long otherUserId) {
        AppUser currentUser = getAuthenticatedUser();
        return chatRepository.findConversation(currentUser.getInstitution().getId(), currentUser.getId(), otherUserId)
                .stream().map(msg -> {
                    ChatMessageDto dto = new ChatMessageDto();
                    dto.setId(msg.getId());
                    dto.setSenderId(msg.getSender().getId());
                    dto.setSenderName(msg.getSender().getFullName());
                    dto.setContent(msg.getContent());
                    dto.setMine(msg.getSender().getId().equals(currentUser.getId()));
                    dto.setCreatedAt(msg.getCreatedAt());
                    return dto;
                }).collect(Collectors.toList());
    }

    public void sendMessage(Long recipientId, String content) {
        AppUser sender = getAuthenticatedUser();
        AppUser recipient = userRepository.findByIdAndInstitutionId(recipientId, sender.getInstitution().getId())
                .orElseThrow(() -> new RuntimeException("Recipient not found in your institution."));

        ChatMessage message = new ChatMessage();
        message.setInstitutionId(sender.getInstitution().getId());
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);
        chatRepository.save(message);
    }
}
