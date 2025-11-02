package com.favour.merrytext.security;

import com.favour.merrytext.model.User;
import com.favour.merrytext.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;
import java.util.ArrayList;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    @Value("${oauth2.redirect.uri}")
    private String redirectUri;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, RefreshTokenService refreshTokenService,
            UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Extract user info from Google
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String picture = oAuth2User.getAttribute("picture");
        Boolean emailVerified = oAuth2User.getAttribute("email_verified");

        // Find or create user
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .map(existingUser -> {
                            // Link existing account with Google
                            existingUser.setGoogleId(googleId);
                            existingUser.setAuthProvider("google");
                            existingUser.setEmailVerified(emailVerified != null && emailVerified);
                            if (existingUser.getProfilePicture() == null
                                    || existingUser.getProfilePicture().contains("avatar-dafault")) {
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
                            newUser.setAuthProvider("google");
                            newUser.setUsername(generateUsername(email));
                            newUser.setProfilePicture(picture);
                            newUser.setEmailVerified(emailVerified != null && emailVerified);
                            newUser.setMerryCoins(20);
                            newUser.setTotalXp(0);
                            newUser.setLevel(1);
                            newUser.setTransactions(new ArrayList<>());
                            newUser.setMessages(new ArrayList<>());
                            return userRepository.save(newUser);
                        }));

        // Generate tokens
        String accessToken = jwtUtil.generateToken(user.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

        // Redirect to frontend with tokens
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken.getToken())
                .queryParam("username", user.getUsername())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
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
