package com.institution.kingsrunner.repository;

import com.institution.kingsrunner.entity.HrConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HrConfigurationRepository extends JpaRepository<HrConfiguration, Long> {

    // The ONLY way we should fetch HR configs. Never use findAll().
    Optional<HrConfiguration> findByInstitutionId(Long institutionId);
}
