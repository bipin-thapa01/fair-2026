package com.app.bridgeQuality.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BridgeSummaryDTO {
    private String bridgeId;
    private String name;
    private String status;
    private Object location;
    private OffsetDateTime updatedAt;

    private int healthIndex;
    private String healthState;
    private String recommendedAction;
    private OffsetDateTime mlUpdatedAt;
}
