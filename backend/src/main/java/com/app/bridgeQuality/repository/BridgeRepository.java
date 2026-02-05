package com.app.bridgeQuality.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.app.bridgeQuality.entity.Bridge;

public interface BridgeRepository extends JpaRepository<Bridge,String> {
    @Query(value = "SELECT nextval('bridge_id_seq')", nativeQuery = true)
    Long getNextBridgeSequence();
}
