package com.favour.merrytext.service;

import com.favour.merrytext.model.User;
import com.favour.merrytext.model.Message;
import com.favour.merrytext.model.TemplateType;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
public class MessageService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final LinkGenerationService linkGenerationService;

    public MessageService(UserRepository userRepository, MessageRepository messageRepository,
            SupabaseStorageService supabaseStorageService, LinkGenerationService linkGenerationService) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.supabaseStorageService = supabaseStorageService;
        this.linkGenerationService = linkGenerationService;
    }

    @Transactional
    public Message createMessage(User user, String recipientName, String recipientPhone,
            String relationshipType, String templateType, String personalizedText,
            MultipartFile mediaFile) throws Exception {

        // Calculate coins required
        int coinsRequired = calculateCoinsRequired(templateType, mediaFile != null);

        // Check if user has enough coins
        if (user.getMerryCoins() < coinsRequired) {
            throw new IllegalArgumentException("Insufficient Merry Coins. Required: " + coinsRequired);
        }

        // Process media upload if present
        String mediaUrl = null;
        String mediaType = null;

        if (mediaFile != null && !mediaFile.isEmpty()) {
            // Validate file before upload
            String expectedMediaType = getExpectedMediaType(templateType);
            supabaseStorageService.validateFile(mediaFile, expectedMediaType);

            // Upload to Supabase
            mediaUrl = supabaseStorageService.uploadFile(mediaFile);
            mediaType = getMediaType(mediaFile);

            // Additional validation for specific templates
            validateMediaConstraints(templateType, mediaFile, mediaType);
        }

        // Deduct coins
        user.setMerryCoins(user.getMerryCoins() - coinsRequired);
        userRepository.save(user);

        // Create message
        Message message = new Message();
        message.setOwnerUsername(user.getUsername());
        message.setOwnerEmail(user.getEmail());
        message.setRecipientName(recipientName);
        message.setRecipientPhone(recipientPhone);
        message.setRelationshipType(relationshipType);
        message.setTemplateType(TemplateType.valueOf(templateType));
        message.setPersonalizedText(personalizedText);
        message.setMediaUrl(mediaUrl);
        message.setMediaType(mediaType);
        message.setCoinsSpent(coinsRequired);
        message.setMessageUrl(linkGenerationService.generateUniqueMessageUrl());
        message.setSentAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    @Transactional
    public Message createBulkMessage(User user, String[] recipientNames, String[] recipientPhones,
            String relationshipType, String templateType, String personalizedText,
            MultipartFile mediaFile) throws Exception {

        // Calculate total coins for all recipients
        int coinsPerMessage = calculateCoinsRequired(templateType, mediaFile != null);
        int totalCoinsRequired = coinsPerMessage * recipientNames.length;

        if (user.getMerryCoins() < totalCoinsRequired) {
            throw new IllegalArgumentException("Insufficient Merry Coins. Required: " + totalCoinsRequired + " for "
                    + recipientNames.length + " messages");
        }

        // Process media upload once for all messages
        String mediaUrl = null;
        String mediaType = null;

        if (mediaFile != null && !mediaFile.isEmpty()) {
            String expectedMediaType = getExpectedMediaType(templateType);
            supabaseStorageService.validateFile(mediaFile, expectedMediaType);
            mediaUrl = supabaseStorageService.uploadFile(mediaFile);
            mediaType = getMediaType(mediaFile);
            validateMediaConstraints(templateType, mediaFile, mediaType);
        }

        Message firstMessage = null;

        // Create individual messages for each recipient
        for (int i = 0; i < recipientNames.length; i++) {
            Message message = new Message();
            message.setOwnerUsername(user.getUsername()); 
            message.setOwnerEmail(user.getEmail());
            message.setRecipientName(recipientNames[i]);
            message.setRecipientPhone(recipientPhones[i]);
            message.setRelationshipType(relationshipType);
            message.setTemplateType(TemplateType.valueOf(templateType));
            message.setPersonalizedText(personalizedText);
            message.setMediaUrl(mediaUrl); // Same media for all
            message.setMediaType(mediaType);
            message.setCoinsSpent(coinsPerMessage);
            message.setMessageUrl(linkGenerationService.generateUniqueMessageUrl());
            message.setSentAt(LocalDateTime.now());

            Message savedMessage = messageRepository.save(message);
            if (firstMessage == null) {
                firstMessage = savedMessage;
            }
        }

        // Deduct total coins
        user.setMerryCoins(user.getMerryCoins() - totalCoinsRequired);
        userRepository.save(user);

        return firstMessage;
    }

    private int calculateCoinsRequired(String templateType, boolean hasMedia) {
        int baseCost = 2; // Base cost for text-only messages

        if (!hasMedia) {
            return baseCost;
        }

        switch (templateType) {
            case "MEMORY_LANE":
                return baseCost + 2; // +2 for photo
            case "PERSONALIZED_CAROL":
                return baseCost + 5; // +5 for audio upload
            default:
                return baseCost;
        }
    }

    private String getExpectedMediaType(String templateType) {
        switch (templateType) {
            case "MEMORY_LANE":
                return "image"; // Can be image or video, but default to image
            case "PERSONALIZED_CAROL":
                return "audio";
            default:
                return "image"; // Default fallback
        }
    }

    private void validateMediaConstraints(String templateType, MultipartFile mediaFile, String mediaType)
            throws Exception {
        if ("PERSONALIZED_CAROL".equals(templateType) && "audio".equals(mediaType)) {
            // Audio duration validation would happen here
            // You could integrate with a audio processing library
        }

        if ("MEMORY_LANE".equals(templateType)) {
            if (!"image".equals(mediaType) && !"video".equals(mediaType)) {
                throw new IllegalArgumentException("Memory Lane template only supports photos and videos");
            }
        }
    }

    private String getMediaType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null) {
            if (contentType.startsWith("image/"))
                return "image";
            if (contentType.startsWith("video/"))
                return "video";
            if (contentType.startsWith("audio/"))
                return "audio";
        }
        return "unknown";
    }
}