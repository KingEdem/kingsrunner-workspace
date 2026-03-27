package com.institution.kingsrunner.dto;

import com.institution.kingsrunner.entity.ErpModuleType;
import com.institution.kingsrunner.entity.InstitutionStatus;
import com.institution.kingsrunner.entity.Role;
import com.institution.kingsrunner.entity.Sector;

import java.util.List;
import java.util.Set;

public class TenantAuditExportResponse {

    private Long institutionId;
    private String institutionName;
    private Sector sector;
    private InstitutionStatus status;
    private Set<ErpModuleType> activeModules;
    private List<AuditUser> users;
    private long workerCount;

    public TenantAuditExportResponse() {}

    public TenantAuditExportResponse(Long institutionId, String institutionName, Sector sector,
                                     InstitutionStatus status, Set<ErpModuleType> activeModules,
                                     List<AuditUser> users, long workerCount) {
        this.institutionId = institutionId;
        this.institutionName = institutionName;
        this.sector = sector;
        this.status = status;
        this.activeModules = activeModules;
        this.users = users;
        this.workerCount = workerCount;
    }

    // ── Nested DTO ──────────────────────────────────────────────────────────

    public static class AuditUser {
        private Long userId;
        private String email;
        private String fullName;
        private Role role;
        private boolean forcePasswordReset;

        public AuditUser() {}

        public AuditUser(Long userId, String email, String fullName,
                         Role role, boolean forcePasswordReset) {
            this.userId = userId;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.forcePasswordReset = forcePasswordReset;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long v) { this.userId = v; }

        public String getEmail() { return email; }
        public void setEmail(String v) { this.email = v; }

        public String getFullName() { return fullName; }
        public void setFullName(String v) { this.fullName = v; }

        public Role getRole() { return role; }
        public void setRole(Role v) { this.role = v; }

        public boolean isForcePasswordReset() { return forcePasswordReset; }
        public void setForcePasswordReset(boolean v) { this.forcePasswordReset = v; }
    }

    // ── Getters / Setters ───────────────────────────────────────────────────

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long v) { this.institutionId = v; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String v) { this.institutionName = v; }

    public Sector getSector() { return sector; }
    public void setSector(Sector v) { this.sector = v; }

    public InstitutionStatus getStatus() { return status; }
    public void setStatus(InstitutionStatus v) { this.status = v; }

    public Set<ErpModuleType> getActiveModules() { return activeModules; }
    public void setActiveModules(Set<ErpModuleType> v) { this.activeModules = v; }

    public List<AuditUser> getUsers() { return users; }
    public void setUsers(List<AuditUser> v) { this.users = v; }

    public long getWorkerCount() { return workerCount; }
    public void setWorkerCount(long v) { this.workerCount = v; }
}
