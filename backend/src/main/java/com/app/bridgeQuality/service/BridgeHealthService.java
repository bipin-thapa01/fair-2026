package com.app.bridgeQuality.service;

import com.app.bridgeQuality.dto.*;
import com.app.bridgeQuality.entity.Bridge;
import com.app.bridgeQuality.entity.BridgeHealthLog;
import com.app.bridgeQuality.entity.MLOutputLog;
import com.app.bridgeQuality.entity.enums.BridgeStatus;
import com.app.bridgeQuality.repository.BridgeHealthLogRepository;
import com.app.bridgeQuality.repository.BridgeRepository;
import com.app.bridgeQuality.repository.MLOutputLogRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.jetbrains.annotations.Contract;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        Integer updateBQI = mlResponse.getHealthIndex();
        bridge.setStatus(BridgeStatus.valueOf(updatedStatus));
        bridge.setBqi(updateBQI);
        bridgeRepository.save(bridge);

        // Return response
        BridgeHealthLogResponseDTO responseDTO = new BridgeHealthLogResponseDTO();
        responseDTO.setLogId(String.valueOf(log.getId()));
        responseDTO.setHealthIndex(mlResponse.getHealthIndex());
        responseDTO.setHealthState(mlResponse.getHealthState());
        responseDTO.setRecommendedAction(mlResponse.getRecommendedAction());

        return responseDTO;
    }

    @Contract(pure = true)
    private @NotNull String mapHealthStateToBridgeStatus(String healthState) {
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

    public List<SensorLogResponse> getAllSensorLogs() {
        return bridgeHealthLogRepository.findAll()
                .stream()
                .map(this::mapToSensorLogDto)
                .toList();
    }

    public Optional<SensorLogResponse> getSensorLogById(UUID id) {
        BridgeHealthLog log = bridgeHealthLogRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sensor log not found with id: " + id));

        return Optional.of(mapToSensorLogDto(log));
    }

    private SensorLogResponse mapToSensorLogDto(BridgeHealthLog entity) {
        SensorLogResponse dto = new SensorLogResponse();
        dto.setId(entity.getId());
        dto.setBridgeId(entity.getBridgeId().getId());
        dto.setStrainMicrostrain(entity.getStrainMicrostrain());
        dto.setVibrationMs2(entity.getVibrationMs2());
        dto.setTemperatureC(entity.getTemperatureC());
        dto.setHumidityPercent(entity.getHumidityPercent());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public List<MlLogResponse> getAllMlLogs() {
        return mlOutputLogRepository.findAll()
                .stream()
                .map(this::mapToMlLogDto)
                .toList();
    }

    public Optional<MlLogResponse> getMlLogById(UUID id) {
        MLOutputLog log = mlOutputLogRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sensor log not found with id: " + id));

        return Optional.of(mapToMlLogDto(log));
    }

    private MlLogResponse mapToMlLogDto(MLOutputLog entity) {
        MlLogResponse dto = new MlLogResponse();
        dto.setId(entity.getId());
        dto.setBridgeLogRef(entity.getBridgeLogRef().getId());
        dto.setHealthIndex(entity.getHealthIndex());
        dto.setHealthState(entity.getHealthState());
        dto.setRecommendedAction(entity.getRecommendedAction());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
