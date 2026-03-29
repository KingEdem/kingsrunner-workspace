package com.institution.kingsrunner.dto;

public class ProvisionTenantRequest {
    private String name;
    private String domain;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
}
