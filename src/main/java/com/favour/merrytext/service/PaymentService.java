package com.favour.merrytext.service;

import com.favour.merrytext.model.User;
import com.favour.merrytext.model.Transaction;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.repository.TransactionRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

        @Value("${stripe.secret.key}")
        private String stripeSecretKey;

        private final UserRepository userRepository;
        private final TransactionRepository transactionRepository;
        private final StatsService statsService;
        private final AchievementService achievementService;
        private final LevelService levelService;

        public PaymentService(UserRepository userRepository, TransactionRepository transactionRepository,
                        StatsService statsService, AchievementService achievementService,
                        LevelService levelService) {
                this.userRepository = userRepository;
                this.transactionRepository = transactionRepository;
                this.statsService = statsService;
                this.achievementService = achievementService;
                this.levelService = levelService;
        }

        @Transactional
        public Map<String, Object> processPayment(User user, Integer amount, String paymentMethodId)
                        throws StripeException {
                Stripe.apiKey = stripeSecretKey;

                // Calculate coins: $2 = 200 cents = 30 coins
                int coinsPurchased = (amount * 30) / 200;

                // Create payment intent
                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                                .setAmount(amount.longValue())
                                .setCurrency("usd")
                                .setPaymentMethod(paymentMethodId)
                                .setConfirm(true)
                                .setReturnUrl("https://your-app.com/payment-success")
                                .setAutomaticPaymentMethods(
                                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                                                .setEnabled(true)
                                                                .setAllowRedirects(
                                                                                PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                                                .build())
                                .build();

                PaymentIntent paymentIntent = PaymentIntent.create(params);

                // Create transaction record
                Transaction transaction = new Transaction();
                transaction.setOwnerUsername(user.getUsername());
                transaction.setOwnerEmail(user.getEmail());
                transaction.setStripePaymentIntentId(paymentIntent.getId());
                transaction.setAmount(amount);
                transaction.setCoinsPurchased(coinsPurchased);
                transaction.setStatus("completed");
                transactionRepository.save(transaction);

                // Update user's coin balance
                user.setMerryCoins(user.getMerryCoins() + coinsPurchased);
                userRepository.save(user);

                // Update stats and award XP
                statsService.incrementCoinsEarned(user.getId(), coinsPurchased);
                achievementService.awardXp(user, levelService.getXpForAction("PURCHASE_COINS"));
                achievementService.checkAndUpdateAchievements(user.getId());

                Map<String, Object> response = new HashMap<>();
                response.put("paymentIntentId", paymentIntent.getId());
                response.put("coinsPurchased", coinsPurchased);
                response.put("newBalance", user.getMerryCoins());
                response.put("status", paymentIntent.getStatus());

                return response;
        }
}
