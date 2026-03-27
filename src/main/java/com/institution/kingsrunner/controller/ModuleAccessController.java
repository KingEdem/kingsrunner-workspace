package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.Worker;
import com.institution.kingsrunner.entity.WorkerModuleGrant;
import com.institution.kingsrunner.repository.WorkerModuleGrantRepository;
import com.institution.kingsrunner.repository.WorkerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tenant/modules/access")
public class ModuleAccessController {

    private final WorkerRepository workerRepository;
    private final WorkerModuleGrantRepository grantRepository;

    public ModuleAccessController(WorkerRepository workerRepository, WorkerModuleGrantRepository grantRepository) {
        this.workerRepository = workerRepository;
        this.grantRepository = grantRepository;
    }

    @PostMapping("/{workerId}/grant/{moduleKey}")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN')")
    @Transactional
    public ResponseEntity<?> grantAccess(@PathVariable Long workerId, @PathVariable String moduleKey) {

        AppUser admin = (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long adminInstId = admin.getInstitution().getId();

        Worker worker = workerRepository.findById(workerId).orElse(null);
        if (worker == null || !worker.getDepartment().getInstitution().getId().equals(adminInstId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Security Violation: Worker not found or belongs to another tenant."));
        }

        if (grantRepository.findByWorkerIdAndModuleKey(workerId, moduleKey.toUpperCase()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Worker already has access to this module."));
        }

        WorkerModuleGrant grant = new WorkerModuleGrant(worker, moduleKey.toUpperCase());
        grant.setInstitutionId(adminInstId);
        grantRepository.save(grant);

        return ResponseEntity.ok(Map.of(
                "message", "Access granted.",
                "worker", worker.getFullName(),
                "module", moduleKey.toUpperCase()
        ));
    }

    @DeleteMapping("/{workerId}/revoke/{moduleKey}")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN')")
    @Transactional
    public ResponseEntity<?> revokeAccess(@PathVariable Long workerId, @PathVariable String moduleKey) {

        AppUser admin = (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long adminInstId = admin.getInstitution().getId();

        Worker worker = workerRepository.findById(workerId).orElse(null);
        if (worker == null || !worker.getDepartment().getInstitution().getId().equals(adminInstId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Security Violation: Access Denied."));
        }

        grantRepository.deleteByWorkerIdAndModuleKey(workerId, moduleKey.toUpperCase());
        return ResponseEntity.ok(Map.of("message", "Access safely revoked."));
    }
}
