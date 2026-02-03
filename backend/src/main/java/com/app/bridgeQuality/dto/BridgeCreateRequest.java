package com.app.bridgeQuality.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BridgeCreateRequest {
    private String name;
    private Double latitude;
    private Double longitude;
}
