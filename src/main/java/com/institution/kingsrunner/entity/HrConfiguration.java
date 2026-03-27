package com.institution.kingsrunner.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "hr_configurations")
public class HrConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // THE TENANT SHIELD - This ensures data never bleeds between institutions
    @Column(name = "institution_id", nullable = false, unique = true)
    private Long institutionId;

    // Fields from the React UI Modal
    @Column(name = "default_working_hours")
    private Integer defaultWorkingHours;

    @Column(name = "leave_policy")
    private String leavePolicy;

    @Column(name = "payroll_cycle")
    private String payrollCycle;

    @Column(name = "probation_period_months")
    private Integer probationPeriodMonths;

    public HrConfiguration() {
    }

    public HrConfiguration(Long id,
                           Long institutionId,
                           Integer defaultWorkingHours,
                           String leavePolicy,
                           String payrollCycle,
                           Integer probationPeriodMonths) {
        this.id = id;
        this.institutionId = institutionId;
        this.defaultWorkingHours = defaultWorkingHours;
        this.leavePolicy = leavePolicy;
        this.payrollCycle = payrollCycle;
        this.probationPeriodMonths = probationPeriodMonths;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Long institutionId) {
        this.institutionId = institutionId;
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
