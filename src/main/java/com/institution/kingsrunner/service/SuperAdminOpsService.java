package com.institution.kingsrunner.service;

import com.institution.kingsrunner.dto.*;
import com.institution.kingsrunner.entity.*;
import com.institution.kingsrunner.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SuperAdminOpsService {

    private static final long START_TIME_MS = System.currentTimeMillis();

    private final InstitutionRepository institutionRepository;
    private final AppUserRepository appUserRepository;
    private final WorkerRepository workerRepository;
    private final DepartmentRepository departmentRepository;
    private final ModuleAccessRequestRepository moduleAccessRequestRepository;
    private final DataSource dataSource;

    public SuperAdminOpsService(InstitutionRepository institutionRepository,
                                AppUserRepository appUserRepository,
                                WorkerRepository workerRepository,
                                DepartmentRepository departmentRepository,
                                ModuleAccessRequestRepository moduleAccessRequestRepository,
                                DataSource dataSource) {
        this.institutionRepository = institutionRepository;
        this.appUserRepository = appUserRepository;
        this.workerRepository = workerRepository;
        this.departmentRepository = departmentRepository;
        this.moduleAccessRequestRepository = moduleAccessRequestRepository;
        this.dataSource = dataSource;
    }

    // ── SYSTEM_HEALTH ───────────────────────────────────────────────────────

    public SystemHealthResponse getSystemHealth() {
        Runtime rt = Runtime.getRuntime();
        long total = rt.totalMemory();
        long free  = rt.freeMemory();
        long used  = total - free;
        long max   = rt.maxMemory();
        long uptime = ManagementFactory.getRuntimeMXBean().getUptime();

        String dbStatus;
        try (Connection conn = dataSource.getConnection()) {
            dbStatus = conn.isValid(2) ? "UP" : "UNREACHABLE";
        } catch (Exception e) {
            dbStatus = "ERROR: " + e.getMessage();
        }

        return new SystemHealthResponse(total, used, free, max, dbStatus, uptime);
    }

    // ── CLEAR_TENANT_CACHE ──────────────────────────────────────────────────

    /**
     * Stub — evict all cache entries for the given tenant.
     * Wire in a CacheManager bean and call cacheManager.getCache("tenants").evict(institutionId)
     * to get real eviction when Spring Cache is configured.
     */
    public Map<String, Object> clearTenantCache(Long institutionId) {
        // Real implementation example (uncomment when Spring Cache is configured):
        // Cache cache = cacheManager.getCache("tenants");
        // if (cache != null) cache.evict(institutionId);
        return Map.of(
                "institutionId", institutionId,
                "status", "CACHE_CLEARED",
                "note", "Stub response. Wire CacheManager for real eviction."
        );
    }

    // ── SET_RATE_LIMIT ──────────────────────────────────────────────────────

    @Transactional
    public Institution setRateLimit(Long institutionId, int rateLimit) {
        if (rateLimit < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "rateLimit must be a non-negative integer");
        }
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Institution not found: " + institutionId));
        institution.setRateLimit(rateLimit);
        return institutionRepository.save(institution);
    }

    // ── EXPORT_TENANT_AUDIT ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TenantAuditExportResponse exportTenantAudit(Long institutionId) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Institution not found: " + institutionId));

        List<AppUser> appUsers = appUserRepository.findByInstitutionId(institutionId);
        List<TenantAuditExportResponse.AuditUser> auditUsers = appUsers.stream()
                .map(u -> new TenantAuditExportResponse.AuditUser(
                        u.getId(),
                        u.getEmail(),
                        u.getFullName(),
                        u.getRole(),
                        u.isForcePasswordReset()
                ))
                .toList();

        long workerCount = workerRepository.findByDepartmentInstitutionId(institutionId).size();

        return new TenantAuditExportResponse(
                institution.getId(),
                institution.getName(),
                institution.getSector(),
                institution.getInstitutionStatus(),
                institution.getActiveModules(),
                auditUsers,
                workerCount
        );
    }

    // ── ANONYMIZE_DROPPED_WORKERS ───────────────────────────────────────────

    /**
     * Finds all soft-deleted workers for the given institution and overwrites
     * their PII with ANONYMIZED_ + id to comply with GDPR right-to-erasure.
     * Workers must be marked deleted=true (soft-delete) to be eligible.
     */
    @Transactional
    public Map<String, Object> anonymizeDroppedWorkers(Long institutionId) {
        List<Worker> dropped = workerRepository
                .findByDeletedTrueAndDepartmentInstitutionId(institutionId);

        for (Worker w : dropped) {
            w.setFullName("ANONYMIZED_" + w.getId());
            w.setEmail("anonymized_" + w.getId() + "@redacted.tir");
            w.setJobTitle("REDACTED");
        }
        workerRepository.saveAll(dropped);

        return Map.of(
                "institutionId", institutionId,
                "workersAnonymized", dropped.size(),
                "status", dropped.isEmpty() ? "NO_ELIGIBLE_WORKERS" : "SUCCESS"
        );
    }

    // ── SEED_MOCK_DATA ──────────────────────────────────────────────────────

    private static final String[] MOCK_TITLES = {
            "Analyst", "Engineer", "Manager", "Coordinator", "Specialist",
            "Director", "Consultant", "Technician", "Supervisor", "Executive"
    };

    @Transactional
    public SeedMockDataResponse seedMockData(Long institutionId) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Institution not found: " + institutionId));

        // Ensure at least one department exists to attach workers to
        List<Department> departments = departmentRepository.findByInstitutionId(institutionId);
        if (departments.isEmpty()) {
            Department seed = new Department();
            seed.setName("General");
            seed.setDescription("Auto-created for mock data seeding");
            seed.setInstitution(institution);
            departments = List.of(departmentRepository.save(seed));
        }

        List<Worker> workers = new ArrayList<>();
        long timestamp = System.currentTimeMillis();

        for (int i = 0; i < 10; i++) {
            Department dept = departments.get(i % departments.size());
            Worker w = new Worker();
            w.setFullName("Mock Worker " + (i + 1) + " [" + timestamp + "]");
            w.setEmail("mock.worker." + timestamp + "." + i + "@institution-" + institutionId + ".tir");
            w.setJobTitle(MOCK_TITLES[i]);
            w.setDepartment(dept);
            workers.add(w);
        }
        workerRepository.saveAll(workers);

        return new SeedMockDataResponse(10, institutionId,
                "10 mock workers seeded successfully.");
    }

    // ── NUKE_ALL_PENDING_REQUESTS ───────────────────────────────────────────

    @Transactional
    public Map<String, Object> nukeAllPendingRequests() {
        int deleted = moduleAccessRequestRepository.deleteAllPendingRequests();
        return Map.of(
                "deletedCount", deleted,
                "status", "SUCCESS",
                "message", deleted + " PENDING module access request(s) permanently deleted."
        );
    }
}
