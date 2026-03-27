package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.HrConfigurationDto;
import com.institution.kingsrunner.service.HrConfigurationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant/hr/config")
public class HrConfigurationController {

    private final HrConfigurationService service;

    public HrConfigurationController(HrConfigurationService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'HR_ADMIN', 'ROLE_HR_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<HrConfigurationDto> getConfig() {
        return ResponseEntity.ok(service.getConfig());
    }

    @PutMapping
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'HR_ADMIN', 'ROLE_HR_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<String> updateConfig(@RequestBody HrConfigurationDto dto) {
        service.saveOrUpdateConfig(dto);
        return ResponseEntity.ok("HR Configuration updated successfully.");
    }
}
