package com.institution.kingsrunner.repository;

import com.institution.kingsrunner.entity.AppUser;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    /**
     * Eagerly fetches the associated Institution in the same query.
     * This is REQUIRED by Spring Security: isEnabled() accesses institution.getInstitutionStatus(),
     * which cannot be lazy-loaded after the repository transaction closes.
     */
    @EntityGraph(attributePaths = {"institution"})
    Optional<AppUser> findByEmail(String email);

    List<AppUser> findByInstitutionId(Long institutionId);

    long countByInstitutionId(Long institutionId);

    Optional<AppUser> findByIdAndInstitutionId(Long id, Long institutionId);
}
