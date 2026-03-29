package com.institution.kingsrunner.service;

import com.institution.kingsrunner.dto.CreateInstAdminRequest;
import com.institution.kingsrunner.dto.CreateInstAdminResponse;
import com.institution.kingsrunner.dto.GlobalFindUserResponse;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.entity.Institution;
import com.institution.kingsrunner.entity.Role;
import com.institution.kingsrunner.repository.AppUserRepository;
import com.institution.kingsrunner.repository.InstitutionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class SuperAdminIdentityService {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminIdentityService.class);

    private static final String PASSWORD_CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
    private static final int TEMP_PASSWORD_LENGTH = 12;

    // In-memory epoch stub — in production, back this with Redis or a DB counter
    private final AtomicLong sessionEpoch = new AtomicLong(0);

    private final AppUserRepository appUserRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminIdentityService(AppUserRepository appUserRepository,
                                     InstitutionRepository institutionRepository,
                                     PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.institutionRepository = institutionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CreateInstAdminResponse createInstAdmin(CreateInstAdminRequest request) {
        Institution institution = institutionRepository.findById(request.getInstitutionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Institution not found: " + request.getInstitutionId()));

        if (appUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with email '" + request.getEmail() + "' already exists");
        }

        String plainPassword = generateTemporaryPassword();
        // Encode exactly once here. The entity setter is a plain field assignment;
        // there are no @PrePersist hooks that could re-encode.
        String encodedPassword = passwordEncoder.encode(plainPassword);
        log.debug("createInstAdmin: rawPassword.length={}, encodedHash.length={}, hashPrefix={}",
                plainPassword.length(), encodedPassword.length(),
                encodedPassword.length() >= 7 ? encodedPassword.substring(0, 7) : encodedPassword);

        AppUser admin = new AppUser();
        admin.setEmail(request.getEmail());
        admin.setFullName(request.getFullName());
        admin.setPassword(encodedPassword);
        admin.setRole(Role.INSTITUTION_ADMIN);
        admin.setInstitution(institution);
        admin.setForcePasswordReset(true);
        admin.setRequiresPasswordReset(true); // Force password change on first login

        // Generate institution-scoped user code: initials + 2-digit ordinal.
        // Count includes all users (any role) already linked to this institution.
        long existingCount = appUserRepository.countByInstitutionId(request.getInstitutionId());
        String userCode = generateUserCode(institution.getName(), existingCount);
        admin.setUserCode(userCode);
        log.debug("createInstAdmin: institutionId={}, existingUsers={}, assignedUserCode={}",
                request.getInstitutionId(), existingCount, userCode);

        AppUser saved = appUserRepository.save(admin);
        log.debug("createInstAdmin: saved userId={}, storedHash.length={}",
                saved.getId(), saved.getPassword().length());

        return new CreateInstAdminResponse(
                saved.getId(),
                saved.getUserCode(),
                saved.getEmail(),
                saved.getFullName(),
                institution.getId(),
                plainPassword  // returned once — store or communicate securely
        );
    }

    public GlobalFindUserResponse globalFindUser(String email) {
        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No user found with email: " + email));

        Long institutionId = user.getInstitution() != null
                ? user.getInstitution().getId()
                : null;

        return new GlobalFindUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                institutionId
        );
    }

    @Transactional
    public void forcePasswordReset(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "User not found: " + userId));
        user.setForcePasswordReset(true);
        appUserRepository.save(user);
    }

    /**
     * Stub: increments a global session invalidation epoch.
     * Clients should re-authenticate if their token epoch is behind the current epoch.
     * In production: persist this value in Redis or a DB table and validate it in JwtAuthenticationFilter.
     */
    public Map<String, Object> revokeAllSessions() {
        long newEpoch = sessionEpoch.incrementAndGet();
        return Map.of(
                "sessionEpoch", newEpoch,
                "message", "All sessions invalidated. Clients must re-authenticate.",
                "note", "Epoch is in-memory only. Wire to JwtAuthenticationFilter for enforcement."
        );
    }

    // ── Helpers ──

    /**
     * Derives a human-readable user code from the institution name.
     * Strategy: extract the first letter of each word (uppercase), then append a
     * zero-padded ordinal based on how many users already belong to that institution.
     * Examples:
     *   "Greenfield University",  0 existing users  →  "GU01"
     *   "Apex Health",            2 existing users  →  "AH03"
     *   "MIT",                    9 existing users  →  "MIT10"
     */
    private String generateUserCode(String institutionName, long existingUserCount) {
        String initials = Arrays.stream(institutionName.trim().split("\\s+"))
                .filter(w -> !w.isEmpty())
                .map(w -> String.valueOf(w.charAt(0)).toUpperCase())
                .collect(Collectors.joining());
        // Pad to at least 2 digits; auto-widens if count exceeds 99.
        int ordinal = (int) (existingUserCount + 1);
        String suffix = ordinal < 10 ? "0" + ordinal : String.valueOf(ordinal);
        return initials + suffix;
    }

    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(TEMP_PASSWORD_LENGTH);
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            sb.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    public void createInstAdmin(Long institutionId, String email, String password) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        AppUser admin = new AppUser();
        admin.setFullName("Administrator");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(Role.INSTITUTION_ADMIN);
        admin.setInstitution(institution);
        admin.setRequiresPasswordReset(true); // Force password change on first login

        appUserRepository.save(admin);
    }
}
