package com.institution.kingsrunner.repository;

import com.institution.kingsrunner.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {

    List<Worker> findByDepartmentInstitutionId(Long institutionId);

    List<Worker> findByDeletedTrueAndDepartmentInstitutionId(Long institutionId);
}
