package com.favour.merrytext.service;

import com.favour.merrytext.model.UserStats;
import com.favour.merrytext.repository.UserStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class StatsService {

    private final UserStatsRepository userStatsRepository;

    public StatsService(UserStatsRepository userStatsRepository) {
        this.userStatsRepository = userStatsRepository;
    }

    /**
     * Initialize stats for a new user
     */
    @Transactional
    public UserStats initializeUserStats(Long userId) {
        UserStats stats = new UserStats();
        stats.setUserId(userId);
        return userStatsRepository.save(stats);
    }

    /**
     * Get or create user stats
     */
    public UserStats getUserStats(Long userId) {
        return userStatsRepository.findByUserId(userId)
                .orElseGet(() -> initializeUserStats(userId));
    }

    /**
     * Update stats when a message is sent
     */
    @Transactional
    public void incrementMessageSent(Long userId, int coinsSpent) {
        UserStats stats = getUserStats(userId);

        stats.setTotalMessagesSent(stats.getTotalMessagesSent() + 1);
        stats.setTotalCoinsSpent(stats.getTotalCoinsSpent() + coinsSpent);

        // Update streak
        LocalDate today = LocalDate.now();
        LocalDate lastMessageDate = stats.getLastMessageDate();

        if (lastMessageDate == null || !lastMessageDate.equals(today)) {
            if (lastMessageDate != null && lastMessageDate.plusDays(1).equals(today)) {
                // Consecutive day
                stats.setCurrentStreak(stats.getCurrentStreak() + 1);
            } else if (lastMessageDate == null || lastMessageDate.equals(today)) {
                // First message or same day
                stats.setCurrentStreak(1);
            } else {
                // Streak broken
                stats.setCurrentStreak(1);
            }

            stats.setLastMessageDate(today);

            // Update longest streak
            if (stats.getCurrentStreak() > stats.getLongestStreak()) {
                stats.setLongestStreak(stats.getCurrentStreak());
            }
        }

        userStatsRepository.save(stats);
    }

    /**
     * Update stats when a message is viewed
     */
    @Transactional
    public void incrementMessageViewed(Long userId) {
        UserStats stats = getUserStats(userId);
        stats.setTotalMessagesViewed(stats.getTotalMessagesViewed() + 1);
        userStatsRepository.save(stats);
    }

    /**
     * Update stats when coins are earned
     */
    @Transactional
    public void incrementCoinsEarned(Long userId, int coinsEarned) {
        UserStats stats = getUserStats(userId);
        stats.setTotalCoinsEarned(stats.getTotalCoinsEarned() + coinsEarned);
        userStatsRepository.save(stats);
    }

    /**
     * Update unique recipients count
     */
    @Transactional
    public void updateUniqueRecipients(Long userId, int uniqueCount) {
        UserStats stats = getUserStats(userId);
        stats.setUniqueRecipients(uniqueCount);
        userStatsRepository.save(stats);
    }
}
