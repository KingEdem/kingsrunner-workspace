package com.institution.kingsrunner.repository;

import com.institution.kingsrunner.entity.ErpModuleType;
import com.institution.kingsrunner.entity.ModuleAccessRequest;
import com.institution.kingsrunner.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ModuleAccessRequestRepository extends JpaRepository<ModuleAccessRequest, Long> {

    List<ModuleAccessRequest> findByStatus(RequestStatus status);

    boolean existsByInstitutionIdAndRequestedModuleAndStatus(
            Long institutionId, ErpModuleType requestedModule, RequestStatus status);

    List<ModuleAccessRequest> findByInstitutionIdAndStatus(Long institutionId, RequestStatus status);

    @Transactional
    void deleteByInstitutionId(Long institutionId);

    @Transactional
    @Modifying
    @Query("DELETE FROM ModuleAccessRequest m WHERE m.status = com.institution.kingsrunner.entity.RequestStatus.PENDING")
    int deleteAllPendingRequests();
}
