package com.app.bridgeQuality.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BridgeHealthLogRequestDTO {
    private String bridgeId;

    private Double strainMicrostrain;
    private Double vibrationMs2;
    private Double temperatureC;
    private Double humidityPercent;
}
