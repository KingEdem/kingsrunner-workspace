package com.institution.kingsrunner.service;

import com.institution.kingsrunner.dto.HrConfigurationDto;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.HrConfiguration;
import com.institution.kingsrunner.repository.HrConfigurationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HrConfigurationService {

    private final HrConfigurationRepository repository;

    public HrConfigurationService(HrConfigurationRepository repository) {
        this.repository = repository;
    }

    private Long getAuthenticatedInstitutionId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AppUser user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (user.getInstitution() == null || user.getInstitution().getId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Institution context is required");
        }
        return user.getInstitution().getId();
    }

    public HrConfigurationDto getConfig() {
        Long instId = getAuthenticatedInstitutionId();
        HrConfiguration config = repository.findByInstitutionId(instId)
                .orElse(new HrConfiguration());

        HrConfigurationDto dto = new HrConfigurationDto();
        dto.setDefaultWorkingHours(config.getDefaultWorkingHours());
        dto.setLeavePolicy(config.getLeavePolicy());
        dto.setPayrollCycle(config.getPayrollCycle());
        dto.setProbationPeriodMonths(config.getProbationPeriodMonths());
        return dto;
    }

    @Transactional
    public void saveOrUpdateConfig(HrConfigurationDto dto) {
        Long instId = getAuthenticatedInstitutionId();
        HrConfiguration config = repository.findByInstitutionId(instId)
                .orElse(new HrConfiguration());

        config.setInstitutionId(instId); // Strict Tenant Shield
        config.setDefaultWorkingHours(dto.getDefaultWorkingHours());
        config.setLeavePolicy(dto.getLeavePolicy());
        config.setPayrollCycle(dto.getPayrollCycle());
        config.setProbationPeriodMonths(dto.getProbationPeriodMonths());

        repository.save(config);
    }
}
