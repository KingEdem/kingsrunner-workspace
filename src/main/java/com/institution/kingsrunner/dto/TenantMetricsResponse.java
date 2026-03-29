package com.institution.kingsrunner.dto;

import com.institution.kingsrunner.entity.InstitutionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TenantMetricsResponse {

    private Long institutionId;
    private String institutionName;
    private InstitutionStatus status;
    private String domain;
    private long userCount;
    private long activeLogins;
    private List<String> activeModules;
}
