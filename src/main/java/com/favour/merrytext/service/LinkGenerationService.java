package com.favour.merrytext.service;

import org.springframework.stereotype.Service;
import com.favour.merrytext.model.User;
import java.util.UUID;

@Service
public class LinkGenerationService {

    private static final String BASE_URL = "https://merrytext.com/view";

    public String generateUniqueMessageUrl() {
        return UUID.randomUUID().toString();
    }

    public String getFullViewUrl(String messageUrl) {
        return BASE_URL + "/" + messageUrl;
    }

    public String generateShareableText(User sender, String messageUrl) {
        String fullUrl = getFullViewUrl(messageUrl);
        return String.format("You've received a festive message from %s! 🎄 View it here: %s",
                sender.getName(), fullUrl);
    }
}