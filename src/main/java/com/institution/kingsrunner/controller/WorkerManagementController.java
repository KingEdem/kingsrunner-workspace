package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.HireWorkerRequest;
import com.institution.kingsrunner.dto.HireWorkerResponse;
import com.institution.kingsrunner.service.WorkerManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant/workers")
public class WorkerManagementController {

    private final WorkerManagementService workerManagementService;

    public WorkerManagementController(WorkerManagementService workerManagementService) {
        this.workerManagementService = workerManagementService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<HireWorkerResponse> hireWorker(@RequestBody HireWorkerRequest request) {
        HireWorkerResponse response = workerManagementService.hireWorker(request);
        return ResponseEntity.ok(response);
    }
}
