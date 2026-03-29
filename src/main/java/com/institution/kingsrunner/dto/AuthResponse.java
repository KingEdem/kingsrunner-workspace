package com.institution.kingsrunner.dto;

public class AuthResponse {

    private String token;
    private String fullName;
    private String role;
    private String tenantId;
    private boolean requiresPasswordReset;

    public AuthResponse() {
    }

    public AuthResponse(String token, String fullName, String role) {
        this.token = token;
        this.fullName = fullName;
        this.role = role;
    }

    public AuthResponse(String token, String fullName, String role, String tenantId) {
        this.token = token;
        this.fullName = fullName;
        this.role = role;
        this.tenantId = tenantId;
    }

    public AuthResponse(String token, String fullName, String role, String tenantId, boolean requiresPasswordReset) {
        this.token = token;
        this.fullName = fullName;
        this.role = role;
        this.tenantId = tenantId;
        this.requiresPasswordReset = requiresPasswordReset;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public boolean isRequiresPasswordReset() {
        return requiresPasswordReset;
    }

    public void setRequiresPasswordReset(boolean requiresPasswordReset) {
        this.requiresPasswordReset = requiresPasswordReset;
    }
}
