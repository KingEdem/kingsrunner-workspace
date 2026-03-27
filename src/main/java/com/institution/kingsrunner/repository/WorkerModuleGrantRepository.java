package com.institution.kingsrunner.repository;

import com.institution.kingsrunner.entity.WorkerModuleGrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerModuleGrantRepository extends JpaRepository<WorkerModuleGrant, Long> {

    List<WorkerModuleGrant> findByWorkerId(Long workerId);

    Optional<WorkerModuleGrant> findByWorkerIdAndModuleKey(Long workerId, String moduleKey);

    void deleteByWorkerIdAndModuleKey(Long workerId, String moduleKey);

    long countByInstitutionIdAndModuleKeyAndGrantedTrue(Long institutionId, String moduleKey);
}
