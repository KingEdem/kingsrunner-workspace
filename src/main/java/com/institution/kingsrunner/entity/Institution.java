package com.institution.kingsrunner.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "institutions")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private Sector sector;

    @JsonIgnore
    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Department> departments = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "institution_active_modules", joinColumns = @JoinColumn(name = "institution_id"))
    @Column(name = "module_type")
    @Enumerated(EnumType.STRING)
    private Set<ErpModuleType> activeModules = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InstitutionStatus institutionStatus = InstitutionStatus.ACTIVE;

    private String uiTheme = "system";

    private Integer rateLimit = 1000;

    public Institution() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Sector getSector() {
        return sector;
    }

    public void setSector(Sector sector) {
        this.sector = sector;
    }

    public List<Department> getDepartments() {
        return departments;
    }

    public void setDepartments(List<Department> departments) {
        this.departments = departments;
    }

    public Set<ErpModuleType> getActiveModules() {
        return activeModules;
    }

    public void setActiveModules(Set<ErpModuleType> activeModules) {
        this.activeModules = activeModules;
    }

    public InstitutionStatus getInstitutionStatus() {
        return institutionStatus;
    }

    public void setInstitutionStatus(InstitutionStatus institutionStatus) {
        this.institutionStatus = institutionStatus;
    }

    public String getUiTheme() {
        return uiTheme;
    }

    public void setUiTheme(String uiTheme) {
        this.uiTheme = uiTheme;
    }

    public Integer getRateLimit() {
        return rateLimit;
    }

    public void setRateLimit(Integer rateLimit) {
        this.rateLimit = rateLimit;
    }
}
