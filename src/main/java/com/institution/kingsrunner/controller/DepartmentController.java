package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.Department;
import com.institution.kingsrunner.entity.Role;
import com.institution.kingsrunner.repository.DepartmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        Department saved = departmentRepository.save(department);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'WORKER', 'ROLE_WORKER')")
    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        AppUser currentUser = (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            return ResponseEntity.ok(departmentRepository.findAll());
        }

        if (currentUser.getInstitution() == null) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                departmentRepository.findByInstitutionId(currentUser.getInstitution().getId())
        );
    }

    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id,
                                                       @RequestBody Department updatedDepartment) {
        return departmentRepository.findById(id)
                .map(existing -> {
                    existing.setName(updatedDepartment.getName());
                    existing.setDescription(updatedDepartment.getDescription());
                    Department saved = departmentRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        if (!departmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        departmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
