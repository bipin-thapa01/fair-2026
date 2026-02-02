package com.app.bridgeQuality.repository;

import com.app.bridgeQuality.entity.MLOutputLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MLOutputLogRepository extends JpaRepository<MLOutputLog, UUID> {
}
