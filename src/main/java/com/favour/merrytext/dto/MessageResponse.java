package com.favour.merrytext.dto;

import com.favour.merrytext.model.Message;

public class MessageResponse {
    private Message message;
    private String shareableUrl;
    private String shareableText;
    private Integer remainingCoins;
    private Integer totalRecipients; // For bulk messages

    // Getters and Setters
    public Message getMessage() {
        return message;
    }

    public void setMessage(Message message) {
        this.message = message;
    }

    public String getShareableUrl() {
        return shareableUrl;
    }

    public void setShareableUrl(String shareableUrl) {
        this.shareableUrl = shareableUrl;
    }

    public String getShareableText() {
        return shareableText;
    }

    public void setShareableText(String shareableText) {
        this.shareableText = shareableText;
    }

    public Integer getRemainingCoins() {
        return remainingCoins;
    }

    public void setRemainingCoins(Integer remainingCoins) {
        this.remainingCoins = remainingCoins;
    }

    public Integer getTotalRecipients() {
        return totalRecipients;
    }

    public void setTotalRecipients(Integer totalRecipients) {
        this.totalRecipients = totalRecipients;
    }
}
