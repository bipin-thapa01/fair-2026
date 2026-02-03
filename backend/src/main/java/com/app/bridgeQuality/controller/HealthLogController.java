package com.app.bridgeQuality.controller;

import com.app.bridgeQuality.dto.BridgeHealthLogRequestDTO;
import com.app.bridgeQuality.dto.BridgeHealthLogResponseDTO;
import com.app.bridgeQuality.entity.BridgeHealthLog;
import com.app.bridgeQuality.entity.MLOutputLog;
import com.app.bridgeQuality.repository.BridgeHealthLogRepository;
import com.app.bridgeQuality.repository.MLOutputLogRepository;
import com.app.bridgeQuality.service.BridgeHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/bridgeHealth")
@RequiredArgsConstructor
public class HealthLogController {

    private final BridgeHealthLogRepository bridgeHealthLogRepository;
    private final MLOutputLogRepository mlOutputLogRepository;
    private final BridgeHealthService bridgeHealthService;

    @PostMapping("/ingest")
    public ResponseEntity<?> ingestSensorData(
            @RequestBody BridgeHealthLogRequestDTO inputDTO
    ) {
        if (inputDTO.getBridgeId() == null) {
            return ResponseEntity.badRequest().body("bridgeId must not be null");
        }
        BridgeHealthLogResponseDTO response = bridgeHealthService.processSensorData(inputDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sensorLog")
    public List<BridgeHealthLog> getAllSensorLog() { return bridgeHealthLogRepository.findAll(); }

    @GetMapping("/sensorLog/{id}")
    public Optional<BridgeHealthLog> getSensorLogById(@PathVariable UUID id) { return bridgeHealthLogRepository.findById(id); }

    @GetMapping("/mlLog")
    public List<MLOutputLog> getAllMLOutputLog() { return mlOutputLogRepository.findAll(); }

    @GetMapping("/mlLog/{id}")
    public Optional<MLOutputLog> getMLOutputLogById(@PathVariable UUID id) { return mlOutputLogRepository.findById(id); }
}
