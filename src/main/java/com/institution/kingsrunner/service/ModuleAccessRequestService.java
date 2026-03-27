package com.institution.kingsrunner.service;

import com.institution.kingsrunner.entity.*;
import com.institution.kingsrunner.repository.InstitutionRepository;
import com.institution.kingsrunner.repository.ModuleAccessRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ModuleAccessRequestService {

    private final ModuleAccessRequestRepository requestRepository;
    private final InstitutionRepository institutionRepository;

    public ModuleAccessRequestService(ModuleAccessRequestRepository requestRepository,
                                      InstitutionRepository institutionRepository) {
        this.requestRepository = requestRepository;
        this.institutionRepository = institutionRepository;
    }

    @Transactional
    public ModuleAccessRequest submitRequest(Long institutionId, ErpModuleType module) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Institution not found"));

        // Prevent duplicate PENDING requests for the same module
        if (requestRepository.existsByInstitutionIdAndRequestedModuleAndStatus(
                institutionId, module, RequestStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A pending request for this module already exists");
        }

        // If module is already active, no need to request
        if (institution.getActiveModules().contains(module)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Module is already active for this institution");
        }

        ModuleAccessRequest request = new ModuleAccessRequest(institution, module);
        return requestRepository.save(request);
    }

    public List<ModuleAccessRequest> getRequestsByStatus(RequestStatus status) {
        return requestRepository.findByStatus(status);
    }

    public List<ModuleAccessRequest> getPendingForInstitution(Long institutionId) {
        return requestRepository.findByInstitutionIdAndStatus(institutionId, RequestStatus.PENDING);
    }

    public List<ModuleAccessRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    @Transactional
    public ModuleAccessRequest approve(Long id) {
        ModuleAccessRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        request.setStatus(RequestStatus.APPROVED);

        Institution institution = request.getInstitution();
        institution.getActiveModules().add(request.getRequestedModule());
        institutionRepository.save(institution);

        return requestRepository.save(request);
    }

    @Transactional
    public ModuleAccessRequest reject(Long id) {
        ModuleAccessRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        request.setStatus(RequestStatus.REJECTED);
        return requestRepository.save(request);
    }
}
