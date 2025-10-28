package com.favour.merrytext.dto;

public class UserStatsResponse {
    private Long userId;
    private String name;
    private Integer merryCoins;
    private Integer totalXp;
    private Integer level;
    private Long totalMessagesSent;
    private Long totalMessagesOpened;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getMerryCoins() {
        return merryCoins;
    }

    public void setMerryCoins(Integer merryCoins) {
        this.merryCoins = merryCoins;
    }

    public Integer getTotalXp() {
        return totalXp;
    }

    public void setTotalXp(Integer totalXp) {
        this.totalXp = totalXp;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Long getTotalMessagesSent() {
        return totalMessagesSent;
    }

    public void setTotalMessagesSent(Long totalMessagesSent) {
        this.totalMessagesSent = totalMessagesSent;
    }

    public Long getTotalMessagesOpened() {
        return totalMessagesOpened;
    }

    public void setTotalMessagesOpened(Long totalMessagesOpened) {
        this.totalMessagesOpened = totalMessagesOpened;
    }
}
