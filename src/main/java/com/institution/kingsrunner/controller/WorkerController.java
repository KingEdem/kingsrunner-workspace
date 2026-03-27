package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.Role;
import com.institution.kingsrunner.entity.Worker;
import com.institution.kingsrunner.repository.WorkerRepository;
import com.institution.kingsrunner.service.GeminiAiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerRepository workerRepository;
    private final GeminiAiService geminiAiService;

    public WorkerController(WorkerRepository workerRepository, GeminiAiService geminiAiService) {
        this.workerRepository = workerRepository;
        this.geminiAiService = geminiAiService;
    }

    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<Worker> createWorker(@RequestBody Worker worker) {
        Worker saved = workerRepository.save(worker);

        // Re-fetch to ensure full object graph is loaded for the AI prompt
        Worker fullWorker = workerRepository.findById(saved.getId()).orElse(saved);
        String onboardingPlan = geminiAiService.generateOnboardingPlan(fullWorker);
        System.out.println("\n===== AI ONBOARDING PLAN FOR: " + saved.getFullName() + " =====");
        System.out.println(onboardingPlan);
        System.out.println("================================================================\n");

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'WORKER', 'ROLE_WORKER')")
    @GetMapping
    public ResponseEntity<List<Worker>> getAllWorkers() {
        AppUser currentUser = (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            return ResponseEntity.ok(workerRepository.findAll());
        }

        if (currentUser.getInstitution() == null) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                workerRepository.findByDepartmentInstitutionId(currentUser.getInstitution().getId())
        );
    }

    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Worker> updateWorker(@PathVariable Long id,
                                               @RequestBody Worker updatedWorker) {
        return workerRepository.findById(id)
                .map(existing -> {
                    existing.setFullName(updatedWorker.getFullName());
                    existing.setEmail(updatedWorker.getEmail());
                    existing.setJobTitle(updatedWorker.getJobTitle());
                    existing.setDepartment(updatedWorker.getDepartment());
                    Worker saved = workerRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorker(@PathVariable Long id) {
        if (!workerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        workerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
