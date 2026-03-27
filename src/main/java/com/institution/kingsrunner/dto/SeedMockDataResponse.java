package com.institution.kingsrunner.dto;

public class SeedMockDataResponse {

    private int workersCreated;
    private Long institutionId;
    private String message;

    public SeedMockDataResponse() {}

    public SeedMockDataResponse(int workersCreated, Long institutionId, String message) {
        this.workersCreated = workersCreated;
        this.institutionId = institutionId;
        this.message = message;
    }

    public int getWorkersCreated() { return workersCreated; }
    public void setWorkersCreated(int v) { this.workersCreated = v; }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long v) { this.institutionId = v; }

    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
}
