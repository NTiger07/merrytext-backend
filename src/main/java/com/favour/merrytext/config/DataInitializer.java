package com.favour.merrytext.config;

import com.favour.merrytext.model.Achievement;
import com.favour.merrytext.repository.AchievementRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initAchievements(AchievementRepository achievementRepository) {
        return args -> {
            // Only initialize if no achievements exist
            if (achievementRepository.count() == 0) {

                Achievement firstMessage = new Achievement();
                firstMessage.setName("First Message");
                firstMessage.setDescription("Send your first festive message");
                firstMessage.setIcon("Sparkles");
                firstMessage.setTotal(1);
                firstMessage.setCategory("messaging");
                firstMessage.setXpReward(50);
                achievementRepository.save(firstMessage);

                Achievement socialButterfly = new Achievement();
                socialButterfly.setName("Social Butterfly");
                socialButterfly.setDescription("Send messages to 10 different people");
                socialButterfly.setIcon("Target");
                socialButterfly.setTotal(10);
                socialButterfly.setCategory("social");
                socialButterfly.setXpReward(100);
                achievementRepository.save(socialButterfly);

                Achievement coinCollector = new Achievement();
                coinCollector.setName("Coin Collector");
                coinCollector.setDescription("Earn 100 coins");
                coinCollector.setIcon("Trophy");
                coinCollector.setTotal(100);
                coinCollector.setCategory("coins");
                coinCollector.setXpReward(75);
                achievementRepository.save(coinCollector);

                Achievement speedSender = new Achievement();
                speedSender.setName("Speed Sender");
                speedSender.setDescription("Send 5 messages in one day");
                speedSender.setIcon("Zap");
                speedSender.setTotal(5);
                speedSender.setCategory("speed");
                speedSender.setXpReward(60);
                achievementRepository.save(speedSender);

                Achievement masterMessenger = new Achievement();
                masterMessenger.setName("Master Messenger");
                masterMessenger.setDescription("Send 100 total messages");
                masterMessenger.setIcon("Award");
                masterMessenger.setTotal(100);
                masterMessenger.setCategory("messaging");
                masterMessenger.setXpReward(200);
                achievementRepository.save(masterMessenger);

                System.out.println("✅ Achievements initialized successfully!");
            }
        };
    }
}
