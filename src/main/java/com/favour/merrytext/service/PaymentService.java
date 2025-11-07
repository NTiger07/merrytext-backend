package com.favour.merrytext.service;

import com.favour.merrytext.model.User;
import com.favour.merrytext.model.Transaction;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.repository.TransactionRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

        @Value("${stripe.secret.key}")
        private String stripeSecretKey;

        @Value("${app.frontend.url}")
        private String frontendUrl;

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

        public Map<String, Object> createCheckoutSession(String ownerEmail, String ownerUsername, Integer amount,
                        Integer coins,
                        String priceId)
                        throws StripeException {
                Stripe.apiKey = stripeSecretKey;

                // Calculate coins: $2 = 200 cents = 30 coins
                int coinsPurchased = (amount * 30) / 200;

                User user = userRepository.findByUsername(ownerUsername)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Create checkout session
                SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.ALIPAY)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("https://merrytext.vercel.app/payment/success")
                .setCancelUrl("https://merrytext.vercel.app/payment/cancel")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(100L)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Test Product")
                                                                .build()
                                                )
                                                .build()
                                ).setQuantity(1L)
                                .build()
                )


                                .setCustomerEmail(ownerEmail)
                                .putMetadata("username", ownerUsername)
                                .putMetadata("email", ownerEmail)
                                .putMetadata("coins", String.valueOf(coinsPurchased))
                                .putMetadata("amount", String.valueOf(amount))
                                .build();

                Session session = Session.create(params);

                // Create pending transaction record
                Transaction transaction = new Transaction();
                transaction.setOwnerUsername(user.getUsername());
                transaction.setOwnerEmail(user.getEmail());
                transaction.setStripePaymentIntentId(session.getId());
                transaction.setAmount(amount);
                transaction.setCoinsPurchased(coinsPurchased);
                transaction.setStatus("pending");
                transactionRepository.save(transaction);

                Map<String, Object> response = new HashMap<>();
                response.put("sessionId", session.getId());
                response.put("url", session.getUrl());
                response.put("coinsPurchased", coinsPurchased);

                return response;
        }

        @Transactional
        public void completePayment(String sessionId) throws StripeException {
                Stripe.apiKey = stripeSecretKey;

                // Retrieve the session to get metadata
                Session session = Session.retrieve(sessionId);

                if (!"paid".equals(session.getPaymentStatus())) {
                        throw new IllegalStateException("Payment not completed");
                }

                String username = session.getMetadata().get("username");
                int coinsPurchased = Integer.parseInt(session.getMetadata().get("coins"));

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Update transaction status
                Transaction transaction = transactionRepository.findByStripePaymentIntentId(sessionId)
                                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

                if ("completed".equals(transaction.getStatus())) {
                        return; // Already processed
                }

                transaction.setStatus("completed");
                transactionRepository.save(transaction);

                // Update user's coin balance
                user.setMerryCoins(user.getMerryCoins() + coinsPurchased);
                userRepository.save(user);

                // Update stats and award XP
                statsService.incrementCoinsEarned(user.getId(), coinsPurchased);
                achievementService.awardXp(user, levelService.getXpForAction("PURCHASE_COINS"));
                achievementService.checkAndUpdateAchievements(user.getId());
        }
}
