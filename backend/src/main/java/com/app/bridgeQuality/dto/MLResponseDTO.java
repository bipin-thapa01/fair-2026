package com.app.bridgeQuality.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MLResponseDTO {

    private int healthIndex;
    private String healthState;
    private String recommendedAction;

}
