package com.institution.kingsrunner.service;

import com.institution.kingsrunner.dto.HireWorkerRequest;
import com.institution.kingsrunner.dto.HireWorkerResponse;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.Role;
import com.institution.kingsrunner.repository.AppUserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
public class WorkerManagementService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    // Secure random string generator for temporary passwords
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    private static final int PASSWORD_LENGTH = 10;
    private final SecureRandom random = new SecureRandom();

    public WorkerManagementService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private AppUser getAuthenticatedAdmin() {
        return (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private String generateRandomPassword() {
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    @Transactional
    public HireWorkerResponse hireWorker(HireWorkerRequest request) {
        AppUser admin = getAuthenticatedAdmin();

        // 1. Prevent duplicate emails globally
        if (appUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("A user with this email already exists.");
        }

        // 2. Generate the temporary password
        String rawTempPassword = generateRandomPassword();

        // 3. Create the AppUser
        AppUser newWorker = new AppUser();
        newWorker.setFullName(request.getFullName());
        newWorker.setEmail(request.getEmail());
        newWorker.setPassword(passwordEncoder.encode(rawTempPassword)); // Hash it securely!
        newWorker.setRole(Role.WORKER);
        newWorker.setInstitution(admin.getInstitution());

        // 4. Force password reset on next login
        newWorker.setForcePasswordReset(true);

        // 5. Save to database
        appUserRepository.save(newWorker);

        // 6. Return response containing the RAW password so the Admin can copy it
        HireWorkerResponse response = new HireWorkerResponse();
        response.setEmail(newWorker.getEmail());
        response.setTemporaryPassword(rawTempPassword);
        response.setMessage("Worker created successfully. Please copy the temporary password securely.");

        return response;
    }
}
