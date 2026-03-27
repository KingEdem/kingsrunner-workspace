package com.institution.kingsrunner.dto;

import com.institution.kingsrunner.entity.ErpModuleType;

public class ModuleAccessRequestBody {
    private ErpModuleType requestedModule;

    public ModuleAccessRequestBody() {}

    public ErpModuleType getRequestedModule() { return requestedModule; }
    public void setRequestedModule(ErpModuleType requestedModule) { this.requestedModule = requestedModule; }
}
