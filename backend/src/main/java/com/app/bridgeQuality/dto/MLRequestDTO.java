package com.app.bridgeQuality.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MLRequestDTO {

    private Double Strain_microstrain;
    private Double Vibration_ms2;
    private Double Temperature_C;
    private Double Humidity_percent;

}
