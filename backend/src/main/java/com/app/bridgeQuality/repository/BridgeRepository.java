package com.app.bridgeQuality.repository;

import com.app.bridgeQuality.entity.Bridge;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BridgeRepository extends JpaRepository<Bridge,String> {
}
