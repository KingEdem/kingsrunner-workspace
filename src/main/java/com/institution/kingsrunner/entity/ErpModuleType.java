package com.institution.kingsrunner.entity;

/**
 * The fixed master list of ERP modules available on The Institution Runner platform.
 * Institutions may be granted access to a subset of these modules.
 */
public enum ErpModuleType {

    /** Accounting, payroll, and budgeting operations. */
    FINANCIAL_MANAGEMENT,

    /** Human Capital Management: employee records, onboarding, and leave. */
    HRM,

    /** Inventory, procurement, and logistics tracking. */
    SUPPLY_CHAIN,

    /** Customer, Student, or Patient relationship management. */
    CRM,

    /** Project & operations management, task tracking, and facility operations. */
    OPERATIONS
}
