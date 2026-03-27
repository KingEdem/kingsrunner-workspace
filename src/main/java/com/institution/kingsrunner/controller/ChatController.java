package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.ChatMessageDto;
import com.institution.kingsrunner.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenant/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<ChatMessageDto>> getConversation(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getConversation(userId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<String> sendMessage(@PathVariable Long userId, @RequestBody String content) {
        chatService.sendMessage(userId, content);
        return ResponseEntity.ok("Message sent.");
    }
}
