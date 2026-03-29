package com.institution.kingsrunner.controller;

import com.institution.kingsrunner.dto.AuthRequest;
import com.institution.kingsrunner.dto.AuthResponse;
import com.institution.kingsrunner.entity.AppUser;
import com.institution.kingsrunner.repository.AppUserRepository;
import com.institution.kingsrunner.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          AppUserRepository appUserRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String password = request.getPassword().trim();

        // 1. MASTER BYPASS: Super Admin Check
        if (email.equals("novor@kingsrunner.tech")) {
            if (password.equals("admin@123")) {
                // MUST have "ROLE_" prefix for Spring Security @PreAuthorize
                String token = jwtService.generateToken("novor@kingsrunner.tech", "ROLE_SUPER_ADMIN", "SYSTEM");
                return ResponseEntity.ok(new AuthResponse(token, "Novor", "ROLE_SUPER_ADMIN", "SYSTEM", false));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Super Admin credentials.");
            }
        }

        // 2. MULTI-TENANT DOMAIN EXTRACTION
        String[] emailParts = email.split("@");
        if (emailParts.length != 2) {
            return ResponseEntity.badRequest().body("Invalid email format.");
        }
        String domain = emailParts[1];

        // 3. TENANT VALIDATION & AUTHENTICATION
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            if (!user.getInstitution().getDomain().equalsIgnoreCase(domain)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Domain mismatch. Contact support.");
            }

            // CRITICAL: Ensure regular user tokens also have the ROLE_ prefix
            String roleName = "ROLE_" + user.getRole().name();
            
            String token = jwtService.generateToken(user.getEmail(), roleName, user.getInstitution().getId().toString());
            
            return ResponseEntity.ok(new AuthResponse(token, user.getFullName(), roleName, user.getInstitution().getId().toString(), user.isRequiresPasswordReset()));
            
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
        }
    }

    @PostMapping("/change-initial-password")
    public ResponseEntity<?> changeInitialPassword(@RequestBody Map<String, String> request, Principal principal) {
        String newPassword = request.get("newPassword");
        AppUser user = appUserRepository.findByEmail(principal.getName()).orElseThrow();
        // NOTE: Inject PasswordEncoder if not already present
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setRequiresPasswordReset(false);
        appUserRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
