package com.institution.kingsrunner.dto;

import com.institution.kingsrunner.entity.ErpModuleType;

public class ForceEnableModuleRequest {

    private ErpModuleType module;

    public ForceEnableModuleRequest() {}

    public ForceEnableModuleRequest(ErpModuleType module) {
        this.module = module;
    }

    public ErpModuleType getModule() { return module; }
    public void setModule(ErpModuleType module) { this.module = module; }
}
