package com.favour.merrytext.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_stats")
public class UserStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true)
    private Long userId;

    private Integer totalMessagesSent;
    private Integer totalMessagesViewed;
    private Integer totalCoinsEarned;
    private Integer totalCoinsSpent;
    private Integer uniqueRecipients;
    private Integer messagesViewedToday;
    private LocalDate lastMessageDate;
    private Integer currentStreak;
    private Integer longestStreak;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (totalMessagesSent == null)
            totalMessagesSent = 0;
        if (totalMessagesViewed == null)
            totalMessagesViewed = 0;
        if (totalCoinsEarned == null)
            totalCoinsEarned = 0;
        if (totalCoinsSpent == null)
            totalCoinsSpent = 0;
        if (uniqueRecipients == null)
            uniqueRecipients = 0;
        if (messagesViewedToday == null)
            messagesViewedToday = 0;
        if (currentStreak == null)
            currentStreak = 0;
        if (longestStreak == null)
            longestStreak = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public Integer getMessagesViewedToday() {
        return messagesViewedToday;
    }

    public void setMessagesViewedToday(Integer messagesViewedToday) {
        this.messagesViewedToday = messagesViewedToday;
    }

    public LocalDate getLastMessageDate() {
        return lastMessageDate;
    }

    public void setLastMessageDate(LocalDate lastMessageDate) {
        this.lastMessageDate = lastMessageDate;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
