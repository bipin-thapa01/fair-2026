package com.app.bridgeQuality.repository;

import com.app.bridgeQuality.entity.Bridge;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BridgeRepository extends JpaRepository<Bridge,String> {
    @Query(value = "SELECT nextval('bridge_id_seq')", nativeQuery = true)
    Long getNextBridgeSequence();
}
