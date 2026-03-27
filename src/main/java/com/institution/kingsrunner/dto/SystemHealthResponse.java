package com.institution.kingsrunner.dto;

public class SystemHealthResponse {

    private long totalMemoryBytes;
    private long usedMemoryBytes;
    private long freeMemoryBytes;
    private long maxMemoryBytes;
    private String dbStatus;
    private long uptimeMs;

    public SystemHealthResponse() {}

    public SystemHealthResponse(long totalMemoryBytes, long usedMemoryBytes, long freeMemoryBytes,
                                long maxMemoryBytes, String dbStatus, long uptimeMs) {
        this.totalMemoryBytes = totalMemoryBytes;
        this.usedMemoryBytes = usedMemoryBytes;
        this.freeMemoryBytes = freeMemoryBytes;
        this.maxMemoryBytes = maxMemoryBytes;
        this.dbStatus = dbStatus;
        this.uptimeMs = uptimeMs;
    }

    public long getTotalMemoryBytes() { return totalMemoryBytes; }
    public void setTotalMemoryBytes(long v) { this.totalMemoryBytes = v; }

    public long getUsedMemoryBytes() { return usedMemoryBytes; }
    public void setUsedMemoryBytes(long v) { this.usedMemoryBytes = v; }

    public long getFreeMemoryBytes() { return freeMemoryBytes; }
    public void setFreeMemoryBytes(long v) { this.freeMemoryBytes = v; }

    public long getMaxMemoryBytes() { return maxMemoryBytes; }
    public void setMaxMemoryBytes(long v) { this.maxMemoryBytes = v; }

    public String getDbStatus() { return dbStatus; }
    public void setDbStatus(String v) { this.dbStatus = v; }

    public long getUptimeMs() { return uptimeMs; }
    public void setUptimeMs(long v) { this.uptimeMs = v; }
}
