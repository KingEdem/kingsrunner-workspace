package com.institution.kingsrunner.dto;

public class CreateInstAdminRequest {

    private Long institutionId;
    private String fullName;
    private String email;

    public CreateInstAdminRequest() {}

    public CreateInstAdminRequest(Long institutionId, String fullName, String email) {
        this.institutionId = institutionId;
        this.fullName = fullName;
        this.email = email;
    }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
