package com.institution.kingsrunner.dto;

public class AiChatResponse {

    private String reply;
    private String institutionId;

    public AiChatResponse() {
    }

    public AiChatResponse(String reply, String institutionId) {
        this.reply = reply;
        this.institutionId = institutionId;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(String institutionId) {
        this.institutionId = institutionId;
    }
}
