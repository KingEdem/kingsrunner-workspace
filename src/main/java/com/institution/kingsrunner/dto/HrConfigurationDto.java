package com.institution.kingsrunner.dto;

public class HrConfigurationDto {
    private Integer defaultWorkingHours;
    private String leavePolicy;
    private String payrollCycle;
    private Integer probationPeriodMonths;

    public HrConfigurationDto() {
    }

    public HrConfigurationDto(Integer defaultWorkingHours,
                              String leavePolicy,
                              String payrollCycle,
                              Integer probationPeriodMonths) {
        this.defaultWorkingHours = defaultWorkingHours;
        this.leavePolicy = leavePolicy;
        this.payrollCycle = payrollCycle;
        this.probationPeriodMonths = probationPeriodMonths;
    }

    public Integer getDefaultWorkingHours() {
        return defaultWorkingHours;
    }

    public void setDefaultWorkingHours(Integer defaultWorkingHours) {
        this.defaultWorkingHours = defaultWorkingHours;
    }

    public String getLeavePolicy() {
        return leavePolicy;
    }

    public void setLeavePolicy(String leavePolicy) {
        this.leavePolicy = leavePolicy;
    }

    public String getPayrollCycle() {
        return payrollCycle;
    }

    public void setPayrollCycle(String payrollCycle) {
        this.payrollCycle = payrollCycle;
    }

    public Integer getProbationPeriodMonths() {
        return probationPeriodMonths;
    }

    public void setProbationPeriodMonths(Integer probationPeriodMonths) {
        this.probationPeriodMonths = probationPeriodMonths;
    }
}
