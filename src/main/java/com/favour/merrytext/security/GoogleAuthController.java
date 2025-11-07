package com.favour.merrytext.security;

import com.favour.merrytext.model.User;
import com.favour.merrytext.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;

@RestController
@RequestMapping("merrytext/api/v1/auth")
public class GoogleAuthController {

    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    public GoogleAuthController(JwtUtil jwtUtil, RefreshTokenService refreshTokenService,
            UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
    }

    @PostMapping("/google")
    public ResponseEntity<?> authenticateGoogleUser(@RequestBody String credential) {
        // String credential = request.get("credential");

        if (credential == null || credential.isEmpty()) {
            return ResponseEntity.badRequest().body("Credential is required");
        }

        try {
            // Verify the Google ID token
            GoogleIdToken idToken = verifyGoogleToken(credential);

            if (idToken == null) {
                return ResponseEntity.status(401).body("Invalid Google token");
            }

            // Extract user information from token
            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            Boolean emailVerified = payload.getEmailVerified();

            // Find or create user
            User user = findOrCreateGoogleUser(googleId, email, name, picture, emailVerified);

            // Generate JWT tokens
            String accessToken = jwtUtil.generateToken(user.getUsername());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

            return ResponseEntity.ok(new AuthResponse(
                    accessToken,
                    refreshToken.getToken(),
                    user));

        } catch (Exception e) {
            System.err.println("Google authentication error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Google authentication failed: " + e.getMessage());
        }
    }

    private GoogleIdToken verifyGoogleToken(String idTokenString) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        return verifier.verify(idTokenString);
    }

    private User findOrCreateGoogleUser(String googleId, String email, String name,
            String picture, Boolean emailVerified) {
        // First, try to find user by Google ID
        return userRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    // If not found by Google ID, try to find by email
                    return userRepository.findByEmail(email)
                            .map(existingUser -> {
                                // Link existing account with Google
                                existingUser.setGoogleId(googleId);
                                existingUser.setAuthProvider("google");
                                existingUser.setEmailVerified(emailVerified != null && emailVerified);

                                // Update profile picture if it's the default one
                                if (existingUser.getProfilePicture() == null ||
                                        existingUser.getProfilePicture().contains("avatar-dafault")) {
                                    existingUser.setProfilePicture(picture);
                                }

                                return userRepository.save(existingUser);
                            })
                            .orElseGet(() -> {
                                // Create new user
                                User newUser = new User();
                                newUser.setGoogleId(googleId);
                                newUser.setEmail(email);
                                newUser.setName(name);
                                newUser.setUsername(generateUsername(email));
                                newUser.setProfilePicture(picture);
                                newUser.setAuthProvider("google");
                                newUser.setEmailVerified(emailVerified != null && emailVerified);
                                newUser.setMerryCoins(20);
                                newUser.setTotalXp(0);
                                newUser.setLevel(1);
                                newUser.setTransactions(new ArrayList<>());
                                newUser.setMessages(new ArrayList<>());

                                return userRepository.save(newUser);
                            });
                });
    }

    private String generateUsername(String email) {
        String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String username = baseUsername;
        int counter = 1;

        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}
