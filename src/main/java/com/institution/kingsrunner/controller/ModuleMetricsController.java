package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.ModuleMetricsDto;
import com.institution.kingsrunner.service.ModuleMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant/metrics")
public class ModuleMetricsController {

    private final ModuleMetricsService service;

    public ModuleMetricsController(ModuleMetricsService service) {
        this.service = service;
    }

    @GetMapping("/{moduleType}")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ModuleMetricsDto> getModuleMetrics(@PathVariable String moduleType) {
        return ResponseEntity.ok(service.getMetricsForModule(moduleType));
    }
}
