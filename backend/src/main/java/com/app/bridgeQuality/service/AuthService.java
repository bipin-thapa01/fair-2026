package com.app.bridgeQuality.service;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.bridgeQuality.dto.AuthResponse;
import com.app.bridgeQuality.dto.LoginDTO;
import com.app.bridgeQuality.dto.SignupDTO;
import com.app.bridgeQuality.entity.User;
import com.app.bridgeQuality.entity.enums.UserRole;
import com.app.bridgeQuality.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    @Transactional
    public AuthResponse signup(SignupDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(UserRole.USER)
                .createdAt(OffsetDateTime.now())
                .build();

        userRepository.save(user);

        return new AuthResponse(user.getId());
    }

    public AuthResponse login(LoginDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!request.getPassword().equals(user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return new AuthResponse(user.getId());
    }
}
