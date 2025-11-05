package com.favour.merrytext.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
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
    @Column(columnDefinition = "TEXT")
    private String personalizedText;

    // Store as comma-separated string in database
    @Column(name = "media_urls", columnDefinition = "TEXT")
    private String mediaUrlsString;

    @Column(name = "media_type", columnDefinition = "TEXT")
    private String mediaTypeString;

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
        if (mediaUrlsString == null || mediaUrlsString.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(mediaUrlsString.split("\\|\\|"));
    }

    public void setMediaUrls(List<String> mediaUrls) {
        if (mediaUrls == null || mediaUrls.isEmpty()) {
            this.mediaUrlsString = "";
        } else {
            this.mediaUrlsString = String.join("||", mediaUrls);
        }
    }

    public List<String> getMediaType() {
        if (mediaTypeString == null || mediaTypeString.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(mediaTypeString.split("\\|\\|"));
    }

    public void setMediaType(List<String> mediaType) {
        if (mediaType == null || mediaType.isEmpty()) {
            this.mediaTypeString = "";
        } else {
            this.mediaTypeString = String.join("||", mediaType);
        }
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
