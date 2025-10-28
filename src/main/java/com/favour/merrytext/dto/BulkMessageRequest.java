package com.favour.merrytext.dto;

public class BulkMessageRequest {
    private String[] recipientNames;
    private String[] recipientPhones;
    private String relationshipType;
    private String templateType;
    private String personalizedText;
    private String mediaType;

    // Getters and Setters
    public String[] getRecipientNames() {
        return recipientNames;
    }

    public void setRecipientNames(String[] recipientNames) {
        this.recipientNames = recipientNames;
    }

    public String[] getRecipientPhones() {
        return recipientPhones;
    }

    public void setRecipientPhones(String[] recipientPhones) {
        this.recipientPhones = recipientPhones;
    }

    public String getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(String relationshipType) {
        this.relationshipType = relationshipType;
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

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }
}
