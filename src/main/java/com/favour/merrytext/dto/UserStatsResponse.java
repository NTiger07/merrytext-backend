package com.favour.merrytext.dto;

public class UserStatsResponse {
    private Long userId;
    private String name;
    private Integer merryCoins;
    private Integer totalXp;
    private Integer level;
    private Integer xpToNextLevel;
    private Double progressToNextLevel;
    private Integer totalMessagesSent;
    private Integer totalMessagesViewed;
    private Integer totalCoinsEarned;
    private Integer totalCoinsSpent;
    private Integer uniqueRecipients;
    private Integer currentStreak;
    private Integer longestStreak;

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

    public Integer getXpToNextLevel() {
        return xpToNextLevel;
    }

    public void setXpToNextLevel(Integer xpToNextLevel) {
        this.xpToNextLevel = xpToNextLevel;
    }

    public Double getProgressToNextLevel() {
        return progressToNextLevel;
    }

    public void setProgressToNextLevel(Double progressToNextLevel) {
        this.progressToNextLevel = progressToNextLevel;
    }

    public Integer getTotalMessagesSent() {
        return totalMessagesSent;
    }

    public void setTotalMessagesSent(Integer totalMessagesSent) {
        this.totalMessagesSent = totalMessagesSent;
    }

    public Integer getTotalMessagesViewed() {
        return totalMessagesViewed;
    }

    public void setTotalMessagesViewed(Integer totalMessagesViewed) {
        this.totalMessagesViewed = totalMessagesViewed;
    }

    public Integer getTotalCoinsEarned() {
        return totalCoinsEarned;
    }

    public void setTotalCoinsEarned(Integer totalCoinsEarned) {
        this.totalCoinsEarned = totalCoinsEarned;
    }

    public Integer getTotalCoinsSpent() {
        return totalCoinsSpent;
    }

    public void setTotalCoinsSpent(Integer totalCoinsSpent) {
        this.totalCoinsSpent = totalCoinsSpent;
    }

    public Integer getUniqueRecipients() {
        return uniqueRecipients;
    }

    public void setUniqueRecipients(Integer uniqueRecipients) {
        this.uniqueRecipients = uniqueRecipients;
    }

    public Integer getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }

    public Integer getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(Integer longestStreak) {
        this.longestStreak = longestStreak;
    }
}
