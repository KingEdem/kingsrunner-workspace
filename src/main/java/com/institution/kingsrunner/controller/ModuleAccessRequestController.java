package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.ModuleAccessRequestBody;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.ModuleAccessRequest;
import com.institution.kingsrunner.entity.RequestStatus;
import com.institution.kingsrunner.service.ModuleAccessRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/module-requests")
public class ModuleAccessRequestController {

    private final ModuleAccessRequestService service;

    public ModuleAccessRequestController(ModuleAccessRequestService service) {
        this.service = service;
    }

    /**
     * INSTITUTION_ADMIN or WORKER submits a request for their institution.
     * Institution ID is derived from the JWT principal — never trusted from the request body.
     */
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'WORKER', 'ROLE_WORKER', 'SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<ModuleAccessRequest> submitRequest(
            @RequestBody ModuleAccessRequestBody body) {

        AppUser principal = (AppUser) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        if (principal.getInstitution() == null) {
            return ResponseEntity.badRequest().build();
        }

        Long institutionId = principal.getInstitution().getId();
        ModuleAccessRequest saved = service.submitRequest(institutionId, body.getRequestedModule());
        return ResponseEntity.ok(saved);
    }

    /**
     * INSTITUTION_ADMIN fetches their own institution's PENDING module requests.
     * Used by the frontend on mount to persist the Pending badge state across sessions.
     */
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'WORKER', 'ROLE_WORKER', 'SUPER_ADMIN')")
    @GetMapping("/mine")
    public ResponseEntity<List<ModuleAccessRequest>> getMyPendingRequests() {
        AppUser principal = (AppUser) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        if (principal.getInstitution() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<ModuleAccessRequest> results =
                service.getPendingForInstitution(principal.getInstitution().getId());
        return ResponseEntity.ok(results);
    }

    /**
     * SUPER_ADMIN lists requests, optionally filtered by status.
     * e.g. GET /api/module-requests?status=PENDING
     */
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @GetMapping
    public ResponseEntity<List<ModuleAccessRequest>> listRequests(
            @RequestParam(required = false) RequestStatus status) {

        List<ModuleAccessRequest> results = (status != null)
                ? service.getRequestsByStatus(status)
                : service.getAllRequests();
        return ResponseEntity.ok(results);
    }

    /**
     * SUPER_ADMIN approves a request — activates the module on the institution.
     */
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ModuleAccessRequest> approve(@PathVariable Long id) {
        return ResponseEntity.ok(service.approve(id));
    }

    /**
     * SUPER_ADMIN rejects a request.
     */
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ModuleAccessRequest> reject(@PathVariable Long id) {
        return ResponseEntity.ok(service.reject(id));
    }
}
