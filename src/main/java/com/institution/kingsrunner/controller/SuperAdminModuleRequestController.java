package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.service.ModuleAccessRequestService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/modules/requests")
public class SuperAdminModuleRequestController {

    private final ModuleAccessRequestService moduleAccessRequestService;

    public SuperAdminModuleRequestController(ModuleAccessRequestService moduleAccessRequestService) {
        this.moduleAccessRequestService = moduleAccessRequestService;
    }

    /**
     * Approves a pending module access request.
     * Sets request status to APPROVED and adds the module to the institution's active modules.
     */
    @PatchMapping(value = "/{id}/approve", consumes = MediaType.ALL_VALUE)
    @Transactional
    public ResponseEntity<?> approveRequest(@PathVariable String id) {
        System.out.println("\uD83D\uDE80 PATCH REACHED CONTROLLER FOR ID: " + id);
        try {
            Long parsedId = Long.parseLong(id);
            moduleAccessRequestService.approve(parsedId);
            return ResponseEntity.ok(Map.of("message", "Module request approved successfully."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    /**
     * Rejects a pending module access request.
     * Sets request status to REJECTED. The module is NOT added to the institution.
     */
    @PatchMapping(value = "/{id}/reject", consumes = MediaType.ALL_VALUE)
    @Transactional
    public ResponseEntity<?> rejectRequest(@PathVariable("id") String id) {
        System.out.println("\uD83D\uDED1 REJECT REACHED CONTROLLER FOR ID: " + id);
        try {
            Long parsedId = Long.parseLong(id);
            moduleAccessRequestService.reject(parsedId);
            return ResponseEntity.ok(Map.of("message", "Module request rejected."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
