package com.app.bridgeQuality.dto;

import com.app.bridgeQuality.entity.Bridge;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BridgeHealthLogRequestDTO {
    private Bridge bridgeId;

    private Double strainMicrostrain;
    private Double vibrationMs2;
    private Double temperatureC;
}
