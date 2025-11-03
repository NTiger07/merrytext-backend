package com.favour.merrytext.security;

import com.favour.merrytext.model.User;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.dto.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;

@RestController
@RequestMapping("merrytext/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
            UserRepository userRepository, BCryptPasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;

    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Check if username exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // Check if email exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // Create new user
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());
        newUser.setAuthProvider("email");
        newUser.setMerryCoins(20);
        newUser.setTotalXp(0);
        newUser.setLevel(1);
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setProfilePicture(
                "https://bzshoukkpprusjmisyrw.supabase.co/storage/v1/object/public/merrytext-media/avatars/avatar-dafault.png");
        newUser.setTransactions(new ArrayList<>());
        newUser.setMessages(new ArrayList<>());

        userRepository.save(newUser);

        // Generate token
        String accessToken = jwtUtil.generateToken(newUser.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(newUser.getUsername());

        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken.getToken(), newUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsernameEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        User user = userRepository.findByUsername(request.getUsernameEmail())
                .orElseGet(() -> userRepository.findByEmail(request.getUsernameEmail())
                        .orElseThrow(() -> new RuntimeException("User not found")));

        String accessToken = jwtUtil.generateToken(user.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

        return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken.getToken(), user));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            if (jwtUtil.validateToken(token, username)) {
                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                return ResponseEntity.ok(new AuthResponse(token, user));
            }
            return ResponseEntity.status(401).body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUsername)
                .map(username -> {
                    String newAccessToken = jwtUtil.generateToken(username);
                    User user = userRepository.findByUsername(username)
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    return ResponseEntity.ok(new AuthResponse(
                            newAccessToken,
                            requestRefreshToken,
                            user));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequest request) {
        refreshTokenService.revokeToken(request.getRefreshToken());
        return ResponseEntity.ok("Logged out successfully");
    }
}
