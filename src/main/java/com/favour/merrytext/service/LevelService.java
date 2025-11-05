package com.favour.merrytext.service;

import org.springframework.stereotype.Service;

@Service
public class LevelService {

    /**
     * Calculate level from total XP
     * Formula: Level = floor(sqrt(XP / 100))
     * This creates exponential leveling curve
     */
    public int calculateLevel(int totalXp) {
        if (totalXp <= 0)
            return 1;
        return (int) Math.floor(Math.sqrt(totalXp / 100.0)) + 1;
    }

    /**
     * Calculate XP required for a specific level
     * Formula: XP = (Level - 1)^2 * 100
     */
    public int xpRequiredForLevel(int level) {
        if (level <= 1)
            return 0;
        return (int) Math.pow(level - 1, 2) * 100;
    }

    /**
     * Calculate XP needed to reach the next level
     */
    public int xpToNextLevel(int currentXp) {
        int currentLevel = calculateLevel(currentXp);
        int nextLevelXp = xpRequiredForLevel(currentLevel + 1);
        return nextLevelXp - currentXp;
    }

    /**
     * Calculate progress percentage to next level
     */
    public double progressToNextLevel(int currentXp) {
        int currentLevel = calculateLevel(currentXp);
        int currentLevelXp = xpRequiredForLevel(currentLevel);
        int nextLevelXp = xpRequiredForLevel(currentLevel + 1);

        if (nextLevelXp == currentLevelXp)
            return 100.0;

        double progress = ((double) (currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
        return Math.min(100.0, Math.max(0.0, progress));
    }

    /**
     * Award XP for different actions
     */
    public int getXpForAction(String action) {
        switch (action) {
            case "MESSAGE_SENT":
                return 10;
            case "MESSAGE_VIEWED":
                return 5;
            case "ACHIEVEMENT_UNLOCKED":
                return 50;
            case "DAILY_LOGIN":
                return 20;
            case "PURCHASE_COINS":
                return 15;
            default:
                return 0;
        }
    }
}
