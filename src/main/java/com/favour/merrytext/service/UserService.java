package com.favour.merrytext.service;

import com.favour.merrytext.dto.AchievementResponse;
import com.favour.merrytext.model.Achievement;
import com.favour.merrytext.model.User;
import com.favour.merrytext.model.Message;
import com.favour.merrytext.model.Transaction;
import com.favour.merrytext.model.UserAchievement;
import com.favour.merrytext.model.UserStats;
import com.favour.merrytext.repository.AchievementRepository;
import com.favour.merrytext.repository.UserAchievementRepository;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.repository.MessageRepository;
import com.favour.merrytext.repository.TransactionRepository;
import com.favour.merrytext.repository.UserStatsRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final TransactionRepository transactionRepository;
    private final UserStatsRepository userStatsRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final AchievementRepository achievementRepository;
    private final LevelService levelService;

    public UserService(UserRepository userRepository,
            MessageRepository messageRepository,
            TransactionRepository transactionRepository,
            UserStatsRepository userStatsRepository,
            UserAchievementRepository userAchievementRepository,
            AchievementRepository achievementRepository,
            LevelService levelService) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.transactionRepository = transactionRepository;
        this.userStatsRepository = userStatsRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.achievementRepository = achievementRepository;
        this.levelService = levelService;
    }

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();

        // For each user, populate their data
        for (User user : users) {
            populateUserData(user);
        }

        return users;
    }

    public User getUserByUsername(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new IllegalStateException(
                "User does not exist"));

        populateUserData(user);

        return user;
    }

    /**
     * Populate user with messages, transactions, stats, and achievements
     */
    private void populateUserData(User user) {
        // Load messages and transactions
        List<Message> userMessages = messageRepository.findByOwnerEmail(user.getEmail());
        List<Transaction> userTransactions = transactionRepository
                .findByOwnerEmailOrderByCreatedAtDesc(user.getEmail());

        user.setMessages(userMessages);
        user.setTransactions(userTransactions);

        // Load stats
        UserStats stats = userStatsRepository.findByUserId(user.getId()).orElse(null);
        user.setStats(stats);

        // Calculate XP progress
        if (user.getTotalXp() != null) {
            user.setXpToNextLevel(levelService.xpToNextLevel(user.getTotalXp()));
            user.setProgressToNextLevel(levelService.progressToNextLevel(user.getTotalXp()));
        }

        // Load achievements
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(user.getId());
        List<AchievementResponse> achievementResponses = new ArrayList<>();

        for (UserAchievement ua : userAchievements) {
            Achievement achievement = achievementRepository.findById(ua.getAchievementId()).orElse(null);

            if (achievement != null) {
                AchievementResponse response = new AchievementResponse();
                response.setId(achievement.getId());
                response.setName(achievement.getName());
                response.setDescription(achievement.getDescription());
                response.setIcon(achievement.getIcon());
                response.setUnlocked(ua.getUnlocked());
                response.setProgress(ua.getProgress());
                response.setTotal(achievement.getTotal());
                response.setCategory(achievement.getCategory());
                response.setXpReward(achievement.getXpReward());
                achievementResponses.add(response);
            }
        }

        user.setAchievements(achievementResponses);
    }
}
