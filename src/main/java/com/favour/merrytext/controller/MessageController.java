package com.favour.merrytext.controller;

import com.favour.merrytext.model.User;
import com.favour.merrytext.model.Message;
import com.favour.merrytext.dto.ApiResponse;
import com.favour.merrytext.dto.CreateMessageRequest;
import com.favour.merrytext.dto.BulkMessageRequest;
import com.favour.merrytext.service.MessageService;
import com.favour.merrytext.service.LinkGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    private final MessageService messageService;
    private final LinkGenerationService linkGenerationService;

    public MessageController(MessageService messageService, LinkGenerationService linkGenerationService) {
        this.messageService = messageService;
        this.linkGenerationService = linkGenerationService;
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendMessage(
            @AuthenticationPrincipal User user,
            @RequestPart("data") CreateMessageRequest request,
            @RequestPart(value = "media", required = false) MultipartFile mediaFile) {

        try {
            Message message = messageService.createMessage(
                    user,
                    request.getRecipientName(),
                    request.getRecipientPhone(),
                    request.getRelationshipType(),
                    request.getTemplateType(),
                    request.getPersonalizedText(),
                    mediaFile);

            Map<String, Object> response = new HashMap<>();
            response.put("message", message);
            response.put("shareableUrl", linkGenerationService.getFullViewUrl(message.getMessageUrl()));
            response.put("shareableText", linkGenerationService.generateShareableText(user, message.getMessageUrl()));
            response.put("remainingCoins", user.getMerryCoins());

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/send-bulk")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendBulkMessage(
            @AuthenticationPrincipal User user,
            @RequestPart("data") BulkMessageRequest request,
            @RequestPart(value = "media", required = false) MultipartFile mediaFile) {

        try {
            Message message = messageService.createBulkMessage(
                    user,
                    request.getRecipientNames(),
                    request.getRecipientPhones(),
                    request.getRelationshipType(),
                    request.getTemplateType(),
                    request.getPersonalizedText(),
                    mediaFile);

            Map<String, Object> response = new HashMap<>();
            response.put("message", message);
            response.put("totalRecipients", request.getRecipientNames().length);
            response.put("shareableUrl", linkGenerationService.getFullViewUrl(message.getMessageUrl()));
            response.put("shareableText", linkGenerationService.generateShareableText(user, message.getMessageUrl()));
            response.put("remainingCoins", user.getMerryCoins());

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/view/{messageUrl}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> viewMessage(@PathVariable String messageUrl) {
        // This endpoint would:
        // 1. Fetch the message details
        // 2. Mark it as opened
        // 3. Return the template data for rendering
        // 4. Track analytics

        Map<String, Object> response = new HashMap<>();
        response.put("messageUrl", messageUrl);
        response.put("status", "active");

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{messageId}/share-info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getShareInfo(
            @AuthenticationPrincipal User user,
            @PathVariable Long messageId) {

        // Return share information for a specific message
        // This could include QR code data, social sharing options, etc.

        Map<String, Object> response = new HashMap<>();
        response.put("shareOptions", new String[] { "copy_link", "whatsapp", "email", "social_media" });
        response.put("qrCodeUrl", "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
                linkGenerationService.getFullViewUrl(messageId.toString()));

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}