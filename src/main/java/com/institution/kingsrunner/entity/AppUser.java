package com.institution.kingsrunner.entity;

import jakarta.persistence.*;
import org.hibernate.Hibernate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "app_users")
public class AppUser implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // EAGER is intentional: Spring Security's auth filter chain runs before
    // open-in-view, so the Hibernate session is already closed when isEnabled()
    // is evaluated. Eager loading makes this unconditionally safe.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    private String fullName;

    @Column(nullable = false)
    private boolean forcePasswordReset = false;

    /**
     * Auto-generated human-readable identifier derived from institution name initials + ordinal.
     * Example: "Greenfield University" owning its 1st admin → "GU01".
     * Stored as a plain non-PK column; the primary key remains the auto-generated Long id.
     */
    @Column(name = "user_code", unique = true)
    private String userCode;

    public AppUser() {
    }

    public AppUser(Long id, String email, String password, Role role, Institution institution, String fullName) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.institution = institution;
        this.fullName = fullName;
    }

    // --- UserDetails implementation ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // institution is null for SUPER_ADMIN — always permitted.
        // institutionStatus may be null on rows migrated by ddl-auto=update before the column was added;
        // treat null status as ACTIVE so existing accounts are not accidentally locked.
        // The try/catch guards against any unexpected proxy / session issue;
        // fail-open (true) so a transient infra problem never silently locks out users.
        try {
            if (institution != null
                    && Hibernate.isInitialized(institution)
                    && InstitutionStatus.SUSPENDED.equals(institution.getInstitutionStatus())) {
                return false;
            }
        } catch (Exception ignored) {
            // If the proxy cannot be inspected, assume ACTIVE and let the request proceed.
        }
        return true;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(Institution institution) {
        this.institution = institution;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public boolean isForcePasswordReset() {
        return forcePasswordReset;
    }

    public void setForcePasswordReset(boolean forcePasswordReset) {
        this.forcePasswordReset = forcePasswordReset;
    }

    public String getUserCode() {
        return userCode;
    }

    public void setUserCode(String userCode) {
        this.userCode = userCode;
    }
}
