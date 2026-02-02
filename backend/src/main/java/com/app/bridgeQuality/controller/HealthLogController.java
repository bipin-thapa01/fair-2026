package com.app.bridgeQuality.controller;

import com.app.bridgeQuality.dto.BridgeHealthLogRequestDTO;
import com.app.bridgeQuality.dto.BridgeHealthLogResponseDTO;
import com.app.bridgeQuality.service.BridgeHealthService;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bridgeHealth")
@RequiredArgsConstructor
public class HealthLogController {

    private final BridgeHealthService bridgeHealthService;

    @PostMapping("/ingest")
    public ResponseEntity<@NotNull BridgeHealthLogResponseDTO> ingestSensorData(
            @RequestBody BridgeHealthLogRequestDTO inputDTO
    ) {
        BridgeHealthLogResponseDTO response = bridgeHealthService.processSensorData(inputDTO);
        return ResponseEntity.ok(response);
    }
}
