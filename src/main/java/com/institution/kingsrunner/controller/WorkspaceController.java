package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.AnnouncementDto;
import com.institution.kingsrunner.dto.WorkerDirectoryDto;
import com.institution.kingsrunner.entity.Announcement;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.repository.AnnouncementRepository;
import com.institution.kingsrunner.repository.AppUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tenant/workspace")
public class WorkspaceController {

    private final AppUserRepository userRepository;
    private final AnnouncementRepository announcementRepository;

    public WorkspaceController(AppUserRepository userRepository, AnnouncementRepository announcementRepository) {
        this.userRepository = userRepository;
        this.announcementRepository = announcementRepository;
    }

    /**
     * Retrieves the currently authenticated user from SecurityContextHolder.
     * Used to enforce row-level tenant isolation.
     */
    private AppUser getAuthenticatedUser() {
        return (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    /**
     * GET /api/tenant/workspace/directory
     * Returns a list of all users belonging to the same institution as the authenticated user.
     * Enforces strict row-level tenant isolation.
     */
    @GetMapping("/directory")
    public ResponseEntity<List<WorkerDirectoryDto>> getDirectory() {
        AppUser currentUser = getAuthenticatedUser();
        Long institutionId = currentUser.getInstitution().getId();

        List<WorkerDirectoryDto> directory = userRepository.findAll().stream()
                .filter(u -> u.getInstitution() != null && u.getInstitution().getId().equals(institutionId))
                .map(u -> {
                    WorkerDirectoryDto dto = new WorkerDirectoryDto();
                    dto.setId(u.getId());
                    dto.setFullName(u.getFullName());
                    dto.setEmail(u.getEmail());
                    dto.setRole(u.getRole() != null ? u.getRole().name() : "WORKER");
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(directory);
    }

    /**
     * GET /api/tenant/workspace/announcements
     * Returns all announcements for the authenticated user's institution, ordered by creation date descending.
     * Enforces strict row-level tenant isolation.
     */
    @GetMapping("/announcements")
    public ResponseEntity<List<AnnouncementDto>> getAnnouncements() {
        Long institutionId = getAuthenticatedUser().getInstitution().getId();

        List<AnnouncementDto> dtos = announcementRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId).stream()
                .map(a -> {
                    AnnouncementDto dto = new AnnouncementDto();
                    dto.setId(a.getId());
                    dto.setTitle(a.getTitle());
                    dto.setContent(a.getContent());
                    dto.setPriority(a.getPriority());
                    dto.setCreatedAt(a.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    /**
     * POST /api/tenant/workspace/announcements
     * Creates a new announcement for the authenticated admin's institution.
     * Only INSTITUTION_ADMIN, ROLE_INSTITUTION_ADMIN, or SUPER_ADMIN can post announcements.
     * Enforces strict row-level tenant isolation.
     */
    @PostMapping("/announcements")
    @PreAuthorize("hasAnyAuthority('INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<String> createAnnouncement(@RequestBody AnnouncementDto request) {
        AppUser admin = getAuthenticatedUser();

        Announcement announcement = new Announcement();
        announcement.setInstitutionId(admin.getInstitution().getId());
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setPriority(request.getPriority() != null ? request.getPriority() : "NORMAL");

        announcementRepository.save(announcement);

        return ResponseEntity.ok("Announcement posted.");
    }
}
