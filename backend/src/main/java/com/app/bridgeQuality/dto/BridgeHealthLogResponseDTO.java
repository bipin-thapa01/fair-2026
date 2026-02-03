package com.app.bridgeQuality.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BridgeHealthLogResponseDTO {

    private String logId;
    private int healthIndex;
    private String healthState;
    private String recommendedAction;

}
