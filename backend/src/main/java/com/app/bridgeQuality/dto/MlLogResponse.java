package com.app.bridgeQuality.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MlLogResponse {
    private UUID id;
    private UUID bridgeLogRef;
    private Integer healthIndex;
    private String healthState;
    private String recommendedAction;
    private OffsetDateTime createdAt;
}
