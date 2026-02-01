package com.app.bridgeQuality.controller;

import com.app.bridgeQuality.dto.AuthResponse;
import com.app.bridgeQuality.dto.LoginDTO;
import com.app.bridgeQuality.dto.SignupDTO;
import com.app.bridgeQuality.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@RequestBody SignupDTO request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginDTO request) {
        return authService.login(request);
    }
}
