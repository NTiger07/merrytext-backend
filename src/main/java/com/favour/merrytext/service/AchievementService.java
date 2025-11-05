package com.favour.merrytext.service;

import com.favour.merrytext.model.Achievement;
import com.favour.merrytext.model.User;
import com.favour.merrytext.model.UserAchievement;
import com.favour.merrytext.model.UserStats;
import com.favour.merrytext.repository.AchievementRepository;
import com.favour.merrytext.repository.UserAchievementRepository;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.repository.UserStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserStatsRepository userStatsRepository;
    private final UserRepository userRepository;
    private final LevelService levelService;

    public AchievementService(AchievementRepository achievementRepository,
            UserAchievementRepository userAchievementRepository,
            UserStatsRepository userStatsRepository,
            UserRepository userRepository,
            LevelService levelService) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.userStatsRepository = userStatsRepository;
        this.userRepository = userRepository;
        this.levelService = levelService;
    }

    /**
     * Initialize achievements for a new user
     */
    @Transactional
    public void initializeUserAchievements(Long userId) {
        List<Achievement> allAchievements = achievementRepository.findAll();

        for (Achievement achievement : allAchievements) {
            UserAchievement userAchievement = new UserAchievement();
            userAchievement.setUserId(userId);
            userAchievement.setAchievementId(achievement.getId());
            userAchievement.setProgress(0);
            userAchievement.setUnlocked(false);
            userAchievementRepository.save(userAchievement);
        }
    }

    /**
     * Check and update achievements based on user stats
     */
    @Transactional
    public List<Achievement> checkAndUpdateAchievements(Long userId) {
        UserStats stats = userStatsRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User stats not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Achievement> newlyUnlocked = new ArrayList<>();
        List<Achievement> allAchievements = achievementRepository.findAll();

        for (Achievement achievement : allAchievements) {
            UserAchievement userAchievement = userAchievementRepository
                    .findByUserIdAndAchievementId(userId, achievement.getId())
                    .orElse(null);

            if (userAchievement == null) {
                userAchievement = new UserAchievement();
                userAchievement.setUserId(userId);
                userAchievement.setAchievementId(achievement.getId());
                userAchievement.setProgress(0);
                userAchievement.setUnlocked(false);
            }

            if (!userAchievement.getUnlocked()) {
                int progress = calculateProgress(achievement, stats, user);
                userAchievement.setProgress(progress);

                // Check if achievement should be unlocked
                if (progress >= achievement.getTotal()) {
                    userAchievement.setUnlocked(true);
                    userAchievement.setUnlockedAt(LocalDateTime.now());
                    newlyUnlocked.add(achievement);

                    // Award XP for achievement
                    int xpGained = achievement.getXpReward() != null ? achievement.getXpReward() : 50;
                    awardXp(user, xpGained);
                }

                userAchievementRepository.save(userAchievement);
            }
        }

        return newlyUnlocked;
    }

    /**
     * Calculate progress for a specific achievement
     */
    private int calculateProgress(Achievement achievement, UserStats stats, User user) {
        switch (achievement.getName()) {
            case "First Message":
                return stats.getTotalMessagesSent();
            case "Social Butterfly":
                return stats.getUniqueRecipients();
            case "Coin Collector":
                return stats.getTotalCoinsEarned();
            case "Speed Sender":
                return stats.getMessagesViewedToday();
            case "Master Messenger":
                return stats.getTotalMessagesSent();
            default:
                return 0;
        }
    }

    /**
     * Award XP to user and update level
     */
    @Transactional
    public void awardXp(User user, int xpAmount) {
        int currentXp = user.getTotalXp() != null ? user.getTotalXp() : 0;
        int newXp = currentXp + xpAmount;

        int oldLevel = levelService.calculateLevel(currentXp);
        int newLevel = levelService.calculateLevel(newXp);

        user.setTotalXp(newXp);
        user.setLevel(newLevel);

        // Award coins for leveling up
        if (newLevel > oldLevel) {
            int coinsAwarded = (newLevel - oldLevel) * 10; // 10 coins per level
            user.setMerryCoins(user.getMerryCoins() + coinsAwarded);
        }

        userRepository.save(user);
    }

    /**
     * Get all achievements with user progress
     */
    public List<UserAchievement> getUserAchievements(Long userId) {
        return userAchievementRepository.findByUserId(userId);
    }
}
