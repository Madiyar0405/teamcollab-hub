package com.teamcollabhub.backend.auth;

import com.teamcollabhub.backend.exception.BadRequestException;
import com.teamcollabhub.backend.security.JwtTokenProvider;
import com.teamcollabhub.backend.user.User;
import com.teamcollabhub.backend.user.UserMapper;
import com.teamcollabhub.backend.user.UserRepository;
import com.teamcollabhub.backend.user.UserResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDepartment(request.department());
        user.setRole("user");
        user.setAvatar(defaultAvatar(request.name()));
        User saved = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(saved.getId().toString(), saved.getEmail());
        UserResponse response = UserMapper.toResponse(saved);
        return new AuthResponse(token, response);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = (User) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(user.getId().toString(), user.getEmail());
        return new AuthResponse(token, UserMapper.toResponse(user));
    }

    private String defaultAvatar(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        return "https://ui-avatars.com/api/?name=" + name.replace(" ", "%20") + "&background=0D8ABC&color=fff";
    }
}
