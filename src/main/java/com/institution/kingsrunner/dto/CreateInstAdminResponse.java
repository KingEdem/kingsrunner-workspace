package com.institution.kingsrunner.dto;

public class CreateInstAdminResponse {

    private Long userId;
    private String userCode;
    private String email;
    private String fullName;
    private Long institutionId;
    private String temporaryPassword;

    public CreateInstAdminResponse() {}

    public CreateInstAdminResponse(Long userId, String userCode, String email, String fullName,
                                   Long institutionId, String temporaryPassword) {
        this.userId = userId;
        this.userCode = userCode;
        this.email = email;
        this.fullName = fullName;
        this.institutionId = institutionId;
        this.temporaryPassword = temporaryPassword;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserCode() { return userCode; }
    public void setUserCode(String userCode) { this.userCode = userCode; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }

    public String getTemporaryPassword() { return temporaryPassword; }
    public void setTemporaryPassword(String temporaryPassword) { this.temporaryPassword = temporaryPassword; }
}
