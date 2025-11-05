package com.favour.merrytext.controller;

import com.favour.merrytext.model.User;
import com.favour.merrytext.model.Message;
import com.favour.merrytext.dto.ApiResponse;
import com.favour.merrytext.dto.CreateMessageRequest;
import com.favour.merrytext.dto.EditMessageRequest;
import com.favour.merrytext.service.MessageService;
import com.favour.merrytext.service.LinkGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("merrytext/api/v1/message")
public class MessageController {

    private final MessageService messageService;
    private final LinkGenerationService linkGenerationService;

    public MessageController(MessageService messageService, LinkGenerationService linkGenerationService) {
        this.messageService = messageService;
        this.linkGenerationService = linkGenerationService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendMessage(
            @AuthenticationPrincipal User user,
            @RequestBody CreateMessageRequest request) {

        try {
            Message message = messageService.createMessage(
                    request.getOwnerEmail(),
                    request.getOwnerUsername(),
                    request.getTemplateType(),
                    request.getPersonalizedText(),
                    request.getMediaUrls(),
                    request.getMediaType());

            // Fetch the user to get updated coin balance and ensure we have the user object
            User messageOwner = messageService.getUserByUsername(request.getOwnerUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("message", message);
            response.put("uniqueUrl", message.getMessageUrl()); // Just the unique URL part
            response.put("shareableUrl", linkGenerationService.getFullViewUrl(message.getMessageUrl())); // Full URL
            response.put("shareableText",
                    linkGenerationService.generateShareableText(messageOwner, message.getMessageUrl()));
            response.put("remainingCoins", messageOwner.getMerryCoins());

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/view/{messageUrl}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> viewMessage(@PathVariable String messageUrl) {
        try {
            // Fetch the message details from database
            Message message = messageService.getMessageByUrl(messageUrl);

            // Increment times opened
            messageService.incrementTimesOpened(messageUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("message", message);
            response.put("messageUrl", messageUrl);
            response.put("status", "active");

            // Add share information
            response.put("shareOptions", new String[] { "copy_link", "whatsapp", "email", "social_media" });
            response.put("shareableUrl", linkGenerationService.getFullViewUrl(messageUrl));
            response.put("qrCodeUrl", "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
                    linkGenerationService.getFullViewUrl(messageUrl));

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/edit/{messageUrl}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> editMessage(
            @PathVariable String messageUrl,
            @RequestBody EditMessageRequest request) {

        try {
            Message updatedMessage = messageService.updateMessage(
                    messageUrl,
                    request.getTemplateType(),
                    request.getPersonalizedText(),
                    request.getMediaUrls(),
                    request.getMediaType());

            Map<String, Object> response = new HashMap<>();
            response.put("message", updatedMessage);
            response.put("messageUrl", updatedMessage.getMessageUrl()); // Same URL
            response.put("shareableUrl", linkGenerationService.getFullViewUrl(updatedMessage.getMessageUrl()));
            response.put("status", "updated");

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}