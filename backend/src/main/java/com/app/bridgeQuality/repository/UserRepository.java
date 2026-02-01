package com.app.bridgeQuality.repository;

import com.app.bridgeQuality.entity.MlOutputLog;
import com.app.bridgeQuality.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
