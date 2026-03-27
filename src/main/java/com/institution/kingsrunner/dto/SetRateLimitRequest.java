package com.institution.kingsrunner.dto;

public class SetRateLimitRequest {

    private int rateLimit;

    public SetRateLimitRequest() {}

    public SetRateLimitRequest(int rateLimit) {
        this.rateLimit = rateLimit;
    }

    public int getRateLimit() { return rateLimit; }
    public void setRateLimit(int rateLimit) { this.rateLimit = rateLimit; }
}
