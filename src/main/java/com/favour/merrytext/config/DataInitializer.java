package com.favour.merrytext.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.favour.merrytext.model.User;
import com.favour.merrytext.model.Message;
import com.favour.merrytext.model.Transaction;
import com.favour.merrytext.model.TemplateType;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.repository.MessageRepository;
import com.favour.merrytext.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private TransactionRepository transactionRepository;

    @Bean
    public CommandLineRunner initializeData() {
        return args -> {
            // Check if database is empty
            if (userRepository.count() == 0) {
                // Create dummy users
                User user1 = new User();
                user1.setEmail("john@example.com");
                user1.setUsername("john");
                user1.setName("John Doe");
                user1.setAuthProvider("email");
                user1.setMerryCoins(100);
                user1.setTotalXp(50);
                user1.setLevel(1);

                User user2 = new User();
                user2.setEmail("jane@example.com");
                user2.setUsername("jane");
                user2.setName("Jane Doe");
                user2.setAuthProvider("email");
                user2.setMerryCoins(150);
                user2.setTotalXp(75);
                user2.setLevel(2);

                // Save users
                userRepository.saveAll(Arrays.asList(user1, user2));

                // Create dummy messages
                Message message1 = new Message();
                message1.setOwnerUsername(user1.getUsername());
                message1.setOwnerEmail(user1.getEmail());
                message1.setRecipientName("Alice Smith");
                message1.setRecipientPhone("+1234567890");
                message1.setRelationshipType("friend");
                message1.setPersonalizedText("Happy birthday! Hope you have a wonderful day!");
                message1.setTemplateType(TemplateType.CONFETTI_CANNON);
                message1.setCoinsSpent(10);
                message1.setMessageUrl("https://merrytext.com/m/123");
                message1.setIsOpened(false);
                message1.setSentAt(LocalDateTime.now());

                Message message2 = new Message();
                message2.setOwnerUsername(user2.getUsername());
                message2.setOwnerEmail(user2.getEmail());
                message2.setRecipientName("Bob Johnson");
                message2.setRecipientPhone("+1987654321");
                message2.setRelationshipType("family");
                message2.setPersonalizedText("Congratulations on your graduation!");
                message2.setTemplateType(TemplateType.HOLLYWOOD_TRAILER);
                message2.setCoinsSpent(15);
                message2.setMessageUrl("https://merrytext.com/m/456");
                message2.setIsOpened(true);
                message2.setSentAt(LocalDateTime.now().minusDays(1));
                message2.setOpenedAt(LocalDateTime.now().minusHours(12));

                // Save messages
                messageRepository.saveAll(Arrays.asList(message1, message2));

                // Create dummy transactions
                Transaction transaction1 = new Transaction();
                transaction1.setOwnerUsername(user1.getUsername());
                transaction1.setOwnerEmail(user1.getEmail());
                transaction1.setAmount(1000); // $10.00 in cents
                transaction1.setCoinsPurchased(100);
                transaction1.setStatus("completed");
                transaction1.setStripePaymentIntentId("pi_123456789");

                Transaction transaction2 = new Transaction();
                transaction2.setOwnerUsername(user2.getUsername());
                transaction2.setOwnerEmail(user2.getEmail()); // $15.00 in cents
                transaction2.setCoinsPurchased(150);
                transaction2.setStatus("completed");
                transaction2.setStripePaymentIntentId("pi_987654321");

                // Save transactions
                transactionRepository.saveAll(Arrays.asList(transaction1, transaction2));

                System.out.println("Initialized database with dummy data");
            } else {
                System.out.println("Database already contains data, skipping initialization");
            }
        };
    }
}