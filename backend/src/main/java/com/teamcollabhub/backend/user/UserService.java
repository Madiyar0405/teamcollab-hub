package com.teamcollabhub.backend.user;

import com.teamcollabhub.backend.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User updateUser(UUID id, UpdateUserRequest request) {
        User user = getById(id);
        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.department() != null) {
            user.setDepartment(request.department());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.avatar() != null) {
            user.setAvatar(request.avatar());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        return userRepository.save(user);
    }
}
