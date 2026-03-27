package com.institution.kingsrunner.service;

import com.institution.kingsrunner.dto.ModuleMetricsDto;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.repository.WorkerModuleGrantRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class ModuleMetricsService {

    private final WorkerModuleGrantRepository grantRepository;

    public ModuleMetricsService(WorkerModuleGrantRepository grantRepository) {
        this.grantRepository = grantRepository;
    }

    private Long getAuthenticatedInstitutionId() {
        AppUser user = (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getInstitution().getId();
    }

    public ModuleMetricsDto getMetricsForModule(String moduleType) {
        Long instId = getAuthenticatedInstitutionId();

        // 1. Calculate REAL active users from the database
        long activeUsers = grantRepository.countByInstitutionIdAndModuleKeyAndGrantedTrue(instId, moduleType);

        // 2. Build the DTO (Mocking infrastructure metrics until we build the File/Job systems)
        ModuleMetricsDto dto = new ModuleMetricsDto();
        dto.setActiveUsers(activeUsers);
        dto.setStorageUsed("450 MB"); // Placeholder for future S3 integration
        dto.setLastSync("Just now");  // Placeholder for future Job Scheduler
        dto.setUptime("99.9%");       // Placeholder for future Health check ping

        return dto;
    }
}
