package com.favour.merrytext.service;

import com.favour.merrytext.model.User;
import com.favour.merrytext.model.Message;
import com.favour.merrytext.model.TemplateType;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final StatsService statsService;
    private final AchievementService achievementService;
    private final LevelService levelService;

    public MessageService(UserRepository userRepository, MessageRepository messageRepository,
            StatsService statsService, AchievementService achievementService,
            LevelService levelService) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.statsService = statsService;
        this.achievementService = achievementService;
        this.levelService = levelService;
    }

    /**
     * Generates a unique URL for a message using random alphanumeric characters
     * Format: 7 characters, uppercase and lowercase letters + digits (e.g.,
     * "aB3xK9z")
     */
    public String generateUniqueMessageUrl() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder url = new StringBuilder(7);
        java.util.Random random = new java.util.Random();

        for (int i = 0; i < 7; i++) {
            url.append(characters.charAt(random.nextInt(characters.length())));
        }

        return url.toString();
    }

    @Transactional
    public Message createMessage(String ownerEmail, String ownerUsername,
            String templateType, String personalizedText,
            List<String> mediaUrls, List<String> mediaType) {

        // Calculate coins required
        int coinsRequired = calculateCoinsRequired(templateType, mediaUrls != null && !mediaUrls.isEmpty());
        User user = userRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user has enough coins
        if (user.getMerryCoins() < coinsRequired) {
            throw new IllegalArgumentException("Insufficient Merry Coins. Required: " + coinsRequired);
        }

        // Deduct coins
        user.setMerryCoins(user.getMerryCoins() - coinsRequired);
        userRepository.save(user);

        // Create message with unique URL
        Message message = new Message();
        message.setOwnerUsername(user.getUsername());
        message.setOwnerEmail(user.getEmail());
        message.setTemplateType(TemplateType.valueOf(templateType));
        message.setPersonalizedText(personalizedText);
        message.setMediaUrls(mediaUrls);
        message.setMediaType(mediaType);
        message.setCoinsSpent(coinsRequired);
        message.setMessageUrl(generateUniqueMessageUrl());
        message.setTimesOpened(0);
        message.setCreatedAt(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        // Update user stats
        statsService.incrementMessageSent(user.getId(), coinsRequired);

        // Award XP for sending message
        achievementService.awardXp(user, levelService.getXpForAction("MESSAGE_SENT"));

        // Check and update achievements
        achievementService.checkAndUpdateAchievements(user.getId());

        return savedMessage;
    }

    private int calculateCoinsRequired(String templateType, boolean hasMedia) {
        int baseCost = 2; // Base cost for text-only messages

        if (!hasMedia) {
            return baseCost;
        }

        switch (templateType) {
            case "MEMORY_LANE":
                return baseCost + 2; // +2 for photo/video
            case "PERSONALIZED_CAROL":
                return baseCost + 5; // +5 for audio
            default:
                return baseCost;
        }
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public Message getMessageByUrl(String messageUrl) {
        return messageRepository.findByMessageUrl(messageUrl)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }

    @Transactional
    public void incrementTimesOpened(String messageUrl) {
        Message message = getMessageByUrl(messageUrl);
        message.setTimesOpened(message.getTimesOpened() + 1);
        messageRepository.save(message);

        // Find message owner and update their stats
        User owner = userRepository.findByUsername(message.getOwnerUsername())
                .orElse(null);
        if (owner != null) {
            statsService.incrementMessageViewed(owner.getId());
            achievementService.awardXp(owner, levelService.getXpForAction("MESSAGE_VIEWED"));
        }
    }

    @Transactional
    public Message updateMessage(String messageUrl, String templateType,
            String personalizedText, List<String> mediaUrls, List<String> mediaType) {

        // Fetch existing message
        Message message = getMessageByUrl(messageUrl);

        // Update fields (keeping the same URL and other metadata)
        if (templateType != null) {
            message.setTemplateType(TemplateType.valueOf(templateType));
        }
        if (personalizedText != null) {
            message.setPersonalizedText(personalizedText);
        }
        if (mediaUrls != null) {
            message.setMediaUrls(mediaUrls);
        }
        if (mediaType != null) {
            message.setMediaType(mediaType);
        }

        return messageRepository.save(message);
    }
}