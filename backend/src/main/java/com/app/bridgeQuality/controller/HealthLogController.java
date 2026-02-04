package com.app.bridgeQuality.controller;

import com.app.bridgeQuality.dto.BridgeHealthLogRequestDTO;
import com.app.bridgeQuality.dto.BridgeHealthLogResponseDTO;
import com.app.bridgeQuality.dto.MlLogResponse;
import com.app.bridgeQuality.dto.SensorLogResponse;
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
    public List<SensorLogResponse> getAllSensorLog() {
        return bridgeHealthService.getAllSensorLogs();
    }

    @GetMapping("/sensorLog/{id}")
    public Optional<SensorLogResponse> getSensorLogById(@PathVariable UUID id) {
        return bridgeHealthService.getSensorLogById(id);
    }

    @GetMapping("/mlLog")
    public List<MlLogResponse> getAllMLOutputLog() { return bridgeHealthService.getAllMlLogs(); }

    @GetMapping("/mlLog/{id}")
    public Optional<MlLogResponse> getMLOutputLogById(@PathVariable UUID id) { return bridgeHealthService.getMlLogById(id); }
}
