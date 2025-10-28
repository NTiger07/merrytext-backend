package com.favour.merrytext.controller;

import com.favour.merrytext.model.User;
import com.favour.merrytext.dto.ApiResponse;
import com.favour.merrytext.dto.PaymentRequest;
import com.favour.merrytext.service.PaymentService;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/add-coins")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addCoins(
            @AuthenticationPrincipal User user,
            @RequestBody PaymentRequest paymentRequest) {

        try {
            Map<String, Object> result = paymentService.processPayment(
                    user,
                    paymentRequest.getAmount(),
                    paymentRequest.getPaymentMethodId());

            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (StripeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Payment failed: " + e.getMessage()));
        }
    }
}
