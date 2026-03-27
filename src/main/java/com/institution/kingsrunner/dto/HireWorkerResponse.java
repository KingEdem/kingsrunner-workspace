package com.institution.kingsrunner.dto;

public class HireWorkerResponse {
    private String email;
    private String temporaryPassword;
    private String message;

    public HireWorkerResponse() {
    }

    public HireWorkerResponse(String email, String temporaryPassword, String message) {
        this.email = email;
        this.temporaryPassword = temporaryPassword;
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
