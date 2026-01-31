package com.app.bridgeQuality.repository;

import com.app.bridgeQuality.entity.MlOutputLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MlOutputLogRepository extends JpaRepository<MlOutputLog, UUID> {
}
