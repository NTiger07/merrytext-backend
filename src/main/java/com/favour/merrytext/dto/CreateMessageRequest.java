package com.favour.merrytext.dto;

import java.util.List;

public class CreateMessageRequest {
    private String ownerEmail;
    private String ownerUsername;
    private String templateType;
    private String personalizedText;
    private List<String> mediaUrls; // Array of media URLs uploaded by frontend
    private List<String> mediaType; // "photo", "video", "audio", "mixed"

    // Getters and Setters
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

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
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
}
