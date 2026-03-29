package com.institution.kingsrunner.service;

import com.institution.kingsrunner.dto.TenantMetricsResponse;
import com.institution.kingsrunner.entity.ErpModuleType;
import com.institution.kingsrunner.entity.Institution;
import com.institution.kingsrunner.entity.InstitutionStatus;
import com.institution.kingsrunner.repository.AppUserRepository;
import com.institution.kingsrunner.repository.InstitutionRepository;
import com.institution.kingsrunner.repository.ModuleAccessRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SuperAdminTenantService {

    private final InstitutionRepository institutionRepository;
    private final AppUserRepository appUserRepository;
    private final ModuleAccessRequestRepository moduleAccessRequestRepository;

    public SuperAdminTenantService(InstitutionRepository institutionRepository,
                                   AppUserRepository appUserRepository,
                                   ModuleAccessRequestRepository moduleAccessRequestRepository) {
        this.institutionRepository = institutionRepository;
        this.appUserRepository = appUserRepository;
        this.moduleAccessRequestRepository = moduleAccessRequestRepository;
    }

    @Transactional
    public Institution provisionInstitution(String name, String domain) {
        Institution institution = new Institution();
        institution.setName(name);
        institution.setDomain(domain);
        institution.setInstitutionStatus(InstitutionStatus.ACTIVE);
        // Default rate limit or theme can be set here if needed
        return institutionRepository.save(institution);
    }

    @Transactional(readOnly = true)
    public List<TenantMetricsResponse> getAllTenantMetrics() {
        return institutionRepository.findAll().stream()
                .map(institution -> {
                    long userCount = appUserRepository.findByInstitutionId(institution.getId()).size();
                    return new TenantMetricsResponse(
                        institution.getId(),
                        institution.getName(),
                        institution.getInstitutionStatus(),
                        institution.getDomain(),
                        userCount,
                        0, // Placeholder for active logins
                        institution.getActiveModules().stream().map(Enum::name).collect(Collectors.toList())
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Institution suspendInstitution(Long id) {
        Institution institution = institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found: " + id));
        institution.setInstitutionStatus(InstitutionStatus.SUSPENDED);
        return institutionRepository.save(institution);
    }

    @Transactional
    public Institution activateInstitution(Long id) {
        Institution institution = institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found: " + id));
        institution.setInstitutionStatus(InstitutionStatus.ACTIVE);
        return institutionRepository.save(institution);
    }

    @Transactional
    public void deleteInstitution(Long id) {
        Institution institution = institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found: " + id));

        // 1. Delete module access requests (FK constraint — no cascade from institution)
        moduleAccessRequestRepository.deleteByInstitutionId(id);

        // 2. Delete app users linked to this institution (no cascade from institution)
        appUserRepository.deleteAll(appUserRepository.findByInstitutionId(id));

        // 3. Delete institution — JPA cascades to departments → workers
        institutionRepository.delete(institution);
    }

    @Transactional
    public Institution forceEnableModule(Long institutionId, ErpModuleType module) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found: " + institutionId));
        institution.getActiveModules().add(module);
        return institutionRepository.save(institution);
    }

    @Transactional(readOnly = true)
    public TenantMetricsResponse getTenantMetrics(Long id) {
        Institution institution = institutionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institution not found: " + id));

        long userCount = appUserRepository.findByInstitutionId(id).size();
        int activeModuleCount = institution.getActiveModules() != null
                ? institution.getActiveModules().size()
                : 0;

        return new TenantMetricsResponse(
                institution.getId(),
                institution.getName(),
                institution.getInstitutionStatus(),
                institution.getDomain(),
                userCount,
                activeModuleCount,
                institution.getUiTheme(),
                institution.getRateLimit() != null ? institution.getRateLimit() : 1000
        );
    }
}
