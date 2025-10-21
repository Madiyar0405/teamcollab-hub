package com.teamcollabhub.backend.auth;

import com.teamcollabhub.backend.user.UserMapper;
import com.teamcollabhub.backend.user.UserRepository;
import com.teamcollabhub.backend.user.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import com.teamcollabhub.backend.user.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal User user) {
        return UserMapper.toResponse(userRepository.findById(user.getId()).orElseThrow());
    }
}
