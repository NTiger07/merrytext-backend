package com.favour.merrytext.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "owner_email")
    private String ownerEmail;
    private String ownerUsername;
    @Enumerated(EnumType.STRING)
    private TemplateType templateType;
    private String personalizedText;
    @Column(columnDefinition = "TEXT")
    private List<String> mediaUrls;
    private List<String> mediaType;
    private Integer coinsSpent;
    private String messageUrl; // Unique URL for the message
    private Integer timesOpened;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setOwnerUsername(String owneUsername) {
        this.ownerUsername = owneUsername;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public TemplateType getTemplateType() {
        return templateType;
    }

    public void setTemplateType(TemplateType templateType) {
        this.templateType = templateType;
    }

    public String getPersonalizedText() {
        return personalizedText;
    }

    public void setPersonalizedText(String personalizedText) {
        this.personalizedText = personalizedText;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public List<String> getMediaType() {
        return mediaType;
    }

    public void setMediaType(List<String> mediaType) {
        this.mediaType = mediaType;
    }

    public Integer getCoinsSpent() {
        return coinsSpent;
    }

    public void setCoinsSpent(Integer coinsSpent) {
        this.coinsSpent = coinsSpent;
    }

    public String getMessageUrl() {
        return messageUrl;
    }

    public void setMessageUrl(String messageUrl) {
        this.messageUrl = messageUrl;
    }

    public Integer getTimesOpened() {
        return timesOpened;
    }

    public void setTimesOpened(Integer timesOpened) {
        this.timesOpened = timesOpened;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
