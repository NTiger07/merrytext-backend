package com.favour.merrytext.controller;

import com.favour.merrytext.dto.AchievementResponse;
import com.favour.merrytext.dto.ApiResponse;
import com.favour.merrytext.dto.UserStatsResponse;
import com.favour.merrytext.model.Achievement;
import com.favour.merrytext.model.User;
import com.favour.merrytext.model.UserAchievement;
import com.favour.merrytext.model.UserStats;
import com.favour.merrytext.repository.AchievementRepository;
import com.favour.merrytext.service.AchievementService;
import com.favour.merrytext.service.LevelService;
import com.favour.merrytext.service.StatsService;
import com.favour.merrytext.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("merrytext/api/v1/stats")
public class StatsController {

    private final StatsService statsService;
    private final AchievementService achievementService;
    private final LevelService levelService;
    private final UserService userService;
    private final AchievementRepository achievementRepository;

    public StatsController(StatsService statsService, AchievementService achievementService,
            LevelService levelService, UserService userService,
            AchievementRepository achievementRepository) {
        this.statsService = statsService;
        this.achievementService = achievementService;
        this.levelService = levelService;
        this.userService = userService;
        this.achievementRepository = achievementRepository;
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats(@PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            UserStats stats = statsService.getUserStats(user.getId());

            UserStatsResponse response = new UserStatsResponse();
            response.setUserId(user.getId());
            response.setName(user.getName());
            response.setMerryCoins(user.getMerryCoins());
            response.setTotalXp(user.getTotalXp());
            response.setLevel(user.getLevel());
            response.setXpToNextLevel(levelService.xpToNextLevel(user.getTotalXp()));
            response.setProgressToNextLevel(levelService.progressToNextLevel(user.getTotalXp()));
            response.setTotalMessagesSent(stats.getTotalMessagesSent());
            response.setTotalMessagesViewed(stats.getTotalMessagesViewed());
            response.setTotalCoinsEarned(stats.getTotalCoinsEarned());
            response.setTotalCoinsSpent(stats.getTotalCoinsSpent());
            response.setUniqueRecipients(stats.getUniqueRecipients());
            response.setCurrentStreak(stats.getCurrentStreak());
            response.setLongestStreak(stats.getLongestStreak());

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/achievements/{username}")
    public ResponseEntity<ApiResponse<List<AchievementResponse>>> getUserAchievements(
            @PathVariable String username) {
        try {
            User user = userService.getUserByUsername(username);
            List<UserAchievement> userAchievements = achievementService.getUserAchievements(user.getId());
            List<AchievementResponse> responses = new ArrayList<>();

            for (UserAchievement ua : userAchievements) {
                Achievement achievement = achievementRepository.findById(ua.getAchievementId())
                        .orElse(null);

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
                    responses.add(response);
                }
            }

            return ResponseEntity.ok(ApiResponse.success(responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeaderboard(
            @RequestParam(defaultValue = "xp") String sortBy,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            // This is a placeholder - you can implement proper leaderboard logic
            List<Map<String, Object>> leaderboard = new ArrayList<>();

            Map<String, Object> entry = new HashMap<>();
            entry.put("rank", 1);
            entry.put("username", "example_user");
            entry.put("level", 5);
            entry.put("totalXp", 2500);
            leaderboard.add(entry);

            return ResponseEntity.ok(ApiResponse.success(leaderboard));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
