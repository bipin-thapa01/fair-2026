package com.app.bridgeQuality.service;

import com.app.bridgeQuality.dto.BridgeHealthLogRequestDTO;
import com.app.bridgeQuality.dto.BridgeHealthLogResponseDTO;
import com.app.bridgeQuality.dto.MLRequestDTO;
import com.app.bridgeQuality.dto.MLResponseDTO;
import com.app.bridgeQuality.entity.Bridge;
import com.app.bridgeQuality.entity.BridgeHealthLog;
import com.app.bridgeQuality.entity.MLOutputLog;
import com.app.bridgeQuality.entity.enums.BridgeStatus;
import com.app.bridgeQuality.repository.BridgeHealthLogRepository;
import com.app.bridgeQuality.repository.BridgeRepository;
import com.app.bridgeQuality.repository.MLOutputLogRepository;
import lombok.AllArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BridgeHealthService {

    private final BridgeRepository bridgeRepository;
    private final BridgeHealthLogRepository bridgeHealthLogRepository;
    private final MLOutputLogRepository mlOutputLogRepository;
    private final MLService mlService;

    public BridgeHealthLogResponseDTO processSensorData(@NotNull BridgeHealthLogRequestDTO inputDTO) {

        // Validate bridge
        Bridge bridge = bridgeRepository.findById(inputDTO.getBridgeId())
                .orElseThrow(() -> new RuntimeException("Bridge not found"));

        // Save raw sensor data
        BridgeHealthLog log = new BridgeHealthLog();
        log.setBridgeId(bridge);
        log.setStrainMicrostrain(inputDTO.getStrainMicrostrain());
        log.setVibrationMs2(inputDTO.getVibrationMs2());
        log.setTemperatureC(inputDTO.getTemperatureC());
        log.setHumidityPercent(inputDTO.getHumidityPercent());

        log = bridgeHealthLogRepository.save(log);

        // Send to ML model
        MLRequestDTO mlRequest = new MLRequestDTO();
        mlRequest.setStrain_microstrain(inputDTO.getStrainMicrostrain());
        mlRequest.setVibration_ms2(inputDTO.getVibrationMs2());
        mlRequest.setTemperature_C(inputDTO.getTemperatureC());
        mlRequest.setHumidity_percent(inputDTO.getHumidityPercent());

        MLResponseDTO mlResponse = mlService.sendToModel(mlRequest);

        // Save ML output
        MLOutputLog mlLog = new MLOutputLog();
        mlLog.setBridgeLogRef(log);
        mlLog.setHealthIndex(mlResponse.getHealthIndex());
        mlLog.setHealthState(mlResponse.getHealthState());
        mlLog.setRecommendedAction(mlResponse.getRecommendedAction());

        mlOutputLogRepository.save(mlLog);

        // UPDATE BRIDGE STATUS BASED ON ML OUTPUT
        String updatedStatus = mapHealthStateToBridgeStatus(mlResponse.getHealthState());
        bridge.setStatus(BridgeStatus.valueOf(updatedStatus));
        bridgeRepository.save(bridge);

        // Return response
        BridgeHealthLogResponseDTO responseDTO = new BridgeHealthLogResponseDTO();
        responseDTO.setLogId(String.valueOf(log.getId()));
        responseDTO.setHealthIndex(mlResponse.getHealthIndex());
        responseDTO.setHealthState(mlResponse.getHealthState());
        responseDTO.setRecommendedAction(mlResponse.getRecommendedAction());

        return responseDTO;
    }

    private String mapHealthStateToBridgeStatus(String healthState) {
        if (healthState == null) return "FAIR";

        return switch (healthState.toUpperCase()) {
            case "EXCELLENT" -> "EXCELLENT";
            case "GOOD" -> "GOOD";
            case "FAIR" -> "FAIR";
            case "POOR" -> "POOR";
            case "CRITICAL" -> "CRITICAL";
            default -> "FAIR"; // fallback
        };
    }
}
