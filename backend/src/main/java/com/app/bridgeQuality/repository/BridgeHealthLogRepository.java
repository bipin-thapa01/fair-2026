package com.app.bridgeQuality.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.bridgeQuality.entity.BridgeHealthLog;

public interface BridgeHealthLogRepository extends JpaRepository<BridgeHealthLog, UUID> {
}
