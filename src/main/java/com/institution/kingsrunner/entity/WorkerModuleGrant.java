package com.institution.kingsrunner.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_module_grants")
public class WorkerModuleGrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "module_key", nullable = false)
    private String moduleKey;

    @Column(name = "granted", nullable = false)
    private boolean granted = true;

    @Column(name = "granted_at", nullable = false)
    private LocalDateTime grantedAt;

    public WorkerModuleGrant() {}

    public WorkerModuleGrant(Worker worker, String moduleKey) {
        this.worker = worker;
        this.moduleKey = moduleKey;
        this.grantedAt = LocalDateTime.now();
        this.granted = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Worker getWorker() { return worker; }
    public void setWorker(Worker worker) { this.worker = worker; }
    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public String getModuleKey() { return moduleKey; }
    public void setModuleKey(String moduleKey) { this.moduleKey = moduleKey; }
    public boolean isGranted() { return granted; }
    public void setGranted(boolean granted) { this.granted = granted; }
    public LocalDateTime getGrantedAt() { return grantedAt; }
    public void setGrantedAt(LocalDateTime grantedAt) { this.grantedAt = grantedAt; }
}
