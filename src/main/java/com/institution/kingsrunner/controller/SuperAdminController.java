package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.*;
import com.institution.kingsrunner.entity.Institution;
import com.institution.kingsrunner.entity.ModuleAccessRequest;
import com.institution.kingsrunner.service.ModuleAccessRequestService;
import com.institution.kingsrunner.service.SuperAdminIdentityService;
import com.institution.kingsrunner.service.SuperAdminOpsService;
import com.institution.kingsrunner.service.SuperAdminTenantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final SuperAdminTenantService tenantService;
    private final SuperAdminIdentityService identityService;
    private final ModuleAccessRequestService moduleRequestService;
    private final SuperAdminOpsService opsService;

    public SuperAdminController(SuperAdminTenantService tenantService,
                                SuperAdminIdentityService identityService,
                                ModuleAccessRequestService moduleRequestService,
                                SuperAdminOpsService opsService) {
        this.tenantService = tenantService;
        this.identityService = identityService;
        this.moduleRequestService = moduleRequestService;
        this.opsService = opsService;
    }

    // ── Tenant Management ───────────────────────────────────────────────────

    @PostMapping("/tenant/provision")
    public ResponseEntity<Institution> provisionInstitution(@RequestBody ProvisionTenantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tenantService.provisionInstitution(request.getName(), request.getDomain()));
    }

    @GetMapping("/tenant/all")
    public ResponseEntity<List<TenantMetricsResponse>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenantMetrics());
    }

    @PatchMapping("/tenant/{id}/suspend")
    public ResponseEntity<Institution> suspendInstitution(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.suspendInstitution(id));
    }

    @PatchMapping("/tenant/{id}/activate")
    public ResponseEntity<Institution> activateInstitution(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.activateInstitution(id));
    }

    @DeleteMapping("/tenant/{id}")
    public ResponseEntity<Void> deleteInstitution(@PathVariable Long id) {
        tenantService.deleteInstitution(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tenant/{id}/metrics")
    public ResponseEntity<TenantMetricsResponse> getTenantMetrics(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.getTenantMetrics(id));
    }

    // ── Global Identity Management ──────────────────────────────────────────

    /** CREATE_INST_ADMIN — creates an INSTITUTION_ADMIN with a one-time temp password */
    @PostMapping("/identity/create-admin")
    public ResponseEntity<CreateInstAdminResponse> createInstAdmin(
            @RequestBody CreateInstAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(identityService.createInstAdmin(request));
    }

    /** GLOBAL_FIND_USER — locate any user by email, returns id + role + institutionId */
    @GetMapping("/identity/find-user")
    public ResponseEntity<GlobalFindUserResponse> globalFindUser(
            @RequestParam String email) {
        return ResponseEntity.ok(identityService.globalFindUser(email));
    }

    /** FORCE_PASSWORD_RESET — flags the user's account for mandatory password change */
    @PatchMapping("/identity/{userId}/force-password-reset")
    public ResponseEntity<Void> forcePasswordReset(@PathVariable Long userId) {
        identityService.forcePasswordReset(userId);
        return ResponseEntity.noContent().build();
    }

    /** REVOKE_ALL_SESSIONS — increments the global session epoch (stub) */
    @PostMapping("/identity/revoke-all-sessions")
    public ResponseEntity<Map<String, Object>> revokeAllSessions() {
        return ResponseEntity.ok(identityService.revokeAllSessions());
    }

    // ── ERP Module Pipeline ─────────────────────────────────────────────────

    /** APPROVE_MODULE_REQUEST — approves the request and adds module to institution.activeModules */
    @PatchMapping("/modules/requests/{requestId}/approve")
    public ResponseEntity<ModuleAccessRequest> approveModuleRequest(
            @PathVariable Long requestId) {
        return ResponseEntity.ok(moduleRequestService.approve(requestId));
    }

    /** REJECT_MODULE_REQUEST — rejects the request without modifying activeModules */
    @PatchMapping("/modules/requests/{requestId}/reject")
    public ResponseEntity<ModuleAccessRequest> rejectModuleRequest(
            @PathVariable Long requestId) {
        return ResponseEntity.ok(moduleRequestService.reject(requestId));
    }

    /** FORCE_ENABLE_MODULE — bypasses the request pipeline and directly activates a module */
    @PostMapping("/modules/{institutionId}/force-enable")
    public ResponseEntity<Institution> forceEnableModule(
            @PathVariable Long institutionId,
            @RequestBody ForceEnableModuleRequest request) {
        return ResponseEntity.ok(tenantService.forceEnableModule(institutionId, request.getModule()));
    }

    // ── System Health & Optimization ────────────────────────────────────────

    /** SYSTEM_HEALTH — JVM memory stats + DB connection status */
    @GetMapping("/ops/health")
    public ResponseEntity<SystemHealthResponse> systemHealth() {
        return ResponseEntity.ok(opsService.getSystemHealth());
    }

    /** CLEAR_TENANT_CACHE — evicts cached data for a specific institution */
    @PostMapping("/ops/clear-cache/{institutionId}")
    public ResponseEntity<Map<String, Object>> clearTenantCache(
            @PathVariable Long institutionId) {
        return ResponseEntity.ok(opsService.clearTenantCache(institutionId));
    }

    /** SET_RATE_LIMIT — updates the rateLimit field on the institution */
    @PatchMapping("/tenant/{institutionId}/rate-limit")
    public ResponseEntity<Institution> setRateLimit(
            @PathVariable Long institutionId,
            @RequestBody SetRateLimitRequest request) {
        return ResponseEntity.ok(opsService.setRateLimit(institutionId, request.getRateLimit()));
    }

    // ── Data Compliance ──────────────────────────────────────────────────────

    /** EXPORT_TENANT_AUDIT — structured JSON snapshot of all users + module state */
    @GetMapping("/compliance/{institutionId}/audit-export")
    public ResponseEntity<TenantAuditExportResponse> exportTenantAudit(
            @PathVariable Long institutionId) {
        return ResponseEntity.ok(opsService.exportTenantAudit(institutionId));
    }

    /** ANONYMIZE_DROPPED_WORKERS — GDPR-compliant PII redaction for soft-deleted workers */
    @PostMapping("/compliance/{institutionId}/anonymize-workers")
    public ResponseEntity<Map<String, Object>> anonymizeDroppedWorkers(
            @PathVariable Long institutionId) {
        return ResponseEntity.ok(opsService.anonymizeDroppedWorkers(institutionId));
    }

    // ── Dev God Mode ─────────────────────────────────────────────────────────

    /** SEED_MOCK_DATA — generates 10 dummy workers for the given institution */
    @PostMapping("/dev/{institutionId}/seed")
    public ResponseEntity<SeedMockDataResponse> seedMockData(
            @PathVariable Long institutionId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(opsService.seedMockData(institutionId));
    }

    /** NUKE_ALL_PENDING_REQUESTS — permanently deletes all PENDING module access requests */
    @DeleteMapping("/dev/nuke-pending-requests")
    public ResponseEntity<Map<String, Object>> nukeAllPendingRequests() {
        return ResponseEntity.ok(opsService.nukeAllPendingRequests());
    }
}

