package com.app.bridgeQuality.repository;

import com.app.bridgeQuality.entity.Bridge;
import com.app.bridgeQuality.entity.BridgeHealthLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BridgeHealthLogRepository extends JpaRepository<BridgeHealthLog, UUID> {
}
