package com.institution.kingsrunner.dto;

import com.institution.kingsrunner.entity.InstitutionStatus;

public class TenantMetricsResponse {

    private Long institutionId;
    private String institutionName;
    private InstitutionStatus status;
    private long userCount;
    private int activeModuleCount;
    private String uiTheme;
    private int rateLimit;

    public TenantMetricsResponse(Long institutionId, String institutionName, InstitutionStatus status,
                                  long userCount, int activeModuleCount, String uiTheme, int rateLimit) {
        this.institutionId = institutionId;
        this.institutionName = institutionName;
        this.status = status;
        this.userCount = userCount;
        this.activeModuleCount = activeModuleCount;
        this.uiTheme = uiTheme;
        this.rateLimit = rateLimit;
    }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public InstitutionStatus getStatus() { return status; }
    public void setStatus(InstitutionStatus status) { this.status = status; }

    public long getUserCount() { return userCount; }
    public void setUserCount(long userCount) { this.userCount = userCount; }

    public int getActiveModuleCount() { return activeModuleCount; }
    public void setActiveModuleCount(int activeModuleCount) { this.activeModuleCount = activeModuleCount; }

    public String getUiTheme() { return uiTheme; }
    public void setUiTheme(String uiTheme) { this.uiTheme = uiTheme; }

    public int getRateLimit() { return rateLimit; }
    public void setRateLimit(int rateLimit) { this.rateLimit = rateLimit; }
}
