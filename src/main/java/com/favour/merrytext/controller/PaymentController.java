package com.favour.merrytext.controller;

import com.favour.merrytext.model.User;
import com.favour.merrytext.dto.ApiResponse;
import com.favour.merrytext.dto.PaymentRequest;
import com.favour.merrytext.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("merrytext/api/v1/payment")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addCoins(
            @AuthenticationPrincipal User user,
            @RequestBody PaymentRequest paymentRequest) {

        try {
            Map<String, Object> result = paymentService.createCheckoutSession(
                    paymentRequest.getOwnerEmail(),
                    paymentRequest.getOwnerUsername(),
                    paymentRequest.getAmount(),
                    paymentRequest.getCoins(),
                    paymentRequest.getPriceId());

            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (StripeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Payment failed: " + e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            // Invalid signature
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        // Handle the checkout.session.completed event
        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow(() -> new RuntimeException("Session not found"));

            try {
                paymentService.completePayment(session.getId());
            } catch (Exception e) {
                return ResponseEntity.internalServerError()
                        .body("Failed to process payment: " + e.getMessage());
            }
        }

        return ResponseEntity.ok("Success");
    }
}
