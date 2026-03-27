package com.institution.kingsrunner.dto;

import java.time.LocalDateTime;

public class AnnouncementDto {

    private Long id;
    private String title;
    private String content;
    private String priority;
    private LocalDateTime createdAt;

    // No-arg constructor
    public AnnouncementDto() {
    }

    // All-args constructor
    public AnnouncementDto(Long id, String title, String content, String priority, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.priority = priority;
        this.createdAt = createdAt;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
