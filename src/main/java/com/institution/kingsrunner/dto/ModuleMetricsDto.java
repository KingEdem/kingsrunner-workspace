package com.institution.kingsrunner.dto;

public class ModuleMetricsDto {
    private long activeUsers;
    private String storageUsed;
    private String lastSync;
    private String uptime;

    public ModuleMetricsDto() {
    }

    public ModuleMetricsDto(long activeUsers, String storageUsed, String lastSync, String uptime) {
        this.activeUsers = activeUsers;
        this.storageUsed = storageUsed;
        this.lastSync = lastSync;
        this.uptime = uptime;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public String getStorageUsed() {
        return storageUsed;
    }

    public void setStorageUsed(String storageUsed) {
        this.storageUsed = storageUsed;
    }

    public String getLastSync() {
        return lastSync;
    }

    public void setLastSync(String lastSync) {
        this.lastSync = lastSync;
    }

    public String getUptime() {
        return uptime;
    }

    public void setUptime(String uptime) {
        this.uptime = uptime;
    }
}
