package com.institution.kingsrunner.dto;

import com.institution.kingsrunner.entity.Role;

public class GlobalFindUserResponse {

    private Long userId;
    private String email;
    private String fullName;
    private Role role;
    private Long institutionId;

    public GlobalFindUserResponse() {}

    public GlobalFindUserResponse(Long userId, String email, String fullName,
                                   Role role, Long institutionId) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.institutionId = institutionId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
}
