package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.AiChatRequest;
import com.institution.kingsrunner.dto.AiChatResponse;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.service.GeminiAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiAiService geminiAiService;

    public AiController(GeminiAiService geminiAiService) {
        this.geminiAiService = geminiAiService;
    }

    /**
     * POST /api/ai/chat
     *
     * Accepts a user prompt, binds it to the requesting user's institution,
     * and returns a tenant-scoped AI response. The institution ID is never
     * trusted from the client — it is always sourced from the verified JWT
     * security context to guarantee tenant isolation.
     */
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'WORKER', 'ROLE_WORKER')")
    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {

        // Guard: reject blank prompts before hitting the external API
        if (request.getPrompt() == null || request.getPrompt().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new AiChatResponse("Prompt cannot be empty.", null));
        }

        // Resolve the authenticated user from the JWT-populated security context.
        // This is the ONLY trusted source of the institution ID — never the request body.
        AppUser currentUser = (AppUser) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        // Derive the institution ID. SUPER_ADMIN has no institution; grant platform-wide scope.
        String institutionId = (currentUser.getInstitution() != null)
                ? currentUser.getInstitution().getId().toString()
                : "PLATFORM";

        String reply = geminiAiService.chat(request.getPrompt(), institutionId);

        return ResponseEntity.ok(new AiChatResponse(reply, institutionId));
    }

    /**
     * POST /api/ai/parse-command
     *
     * Super Admin only. Accepts raw natural-language input or a misspelled command
     * and returns the single most likely valid terminal command in the format:
     * "COMMAND_NAME - Brief explanation and required arguments."
     *
     * The institution ID is still sourced from the JWT so the service layer
     * knows it is running in a SUPER_ADMIN (PLATFORM) context.
     */
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PostMapping("/parse-command")
    public ResponseEntity<AiChatResponse> parseCommand(@RequestBody AiChatRequest request) {

        if (request.getPrompt() == null || request.getPrompt().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new AiChatResponse("Prompt cannot be empty.", null));
        }

        String suggestion = geminiAiService.parseCommand(request.getPrompt());
        return ResponseEntity.ok(new AiChatResponse(suggestion, "PLATFORM"));
    }
}
