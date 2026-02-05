package com.app.bridgeQuality.dto;

import com.app.bridgeQuality.entity.enums.BridgeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BridgeResponse {
    String id;
    String name;
    BridgeStatus status;
    double longitude;
    double latitude;
    Integer bqi;
}
