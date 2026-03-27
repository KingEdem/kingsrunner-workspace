package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.Institution;
import com.institution.kingsrunner.entity.Role;
import com.institution.kingsrunner.repository.InstitutionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/institutions")
public class InstitutionController {

    private final InstitutionRepository institutionRepository;

    public InstitutionController(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }

    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'WORKER', 'ROLE_WORKER')")
    @GetMapping
    public ResponseEntity<List<Institution>> getAllInstitutions() {
        AppUser currentUser = (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            return ResponseEntity.ok(institutionRepository.findAll());
        }

        if (currentUser.getInstitution() == null) {
            return ResponseEntity.status(403).build();
        }

        return institutionRepository.findById(currentUser.getInstitution().getId())
                .map(institution -> ResponseEntity.ok(Collections.singletonList(institution)))
                .orElse(ResponseEntity.status(403).build());
    }

    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<Institution> createInstitution(@RequestBody Institution institution) {
        Institution saved = institutionRepository.save(institution);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Institution> updateInstitution(@PathVariable Long id,
                                                          @RequestBody Institution updatedInstitution) {
        return institutionRepository.findById(id)
                .map(existing -> {
                    existing.setName(updatedInstitution.getName());
                    existing.setSector(updatedInstitution.getSector());
                    Institution saved = institutionRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstitution(@PathVariable Long id) {
        if (!institutionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        institutionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
