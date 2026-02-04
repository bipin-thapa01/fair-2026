package com.app.bridgeQuality.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SensorLogResponse {
    private UUID id;
    private String bridgeId;
    private Double strainMicrostrain;
    private Double vibrationMs2;
    private Double temperatureC;
    private Double humidityPercent;
    private OffsetDateTime createdAt;
}
