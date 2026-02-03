package com.app.bridgeQuality.service;

import com.app.bridgeQuality.dto.BridgeCreateRequest;
import com.app.bridgeQuality.dto.BridgeResponse;
import com.app.bridgeQuality.entity.Bridge;
import com.app.bridgeQuality.entity.enums.BridgeStatus;
import com.app.bridgeQuality.repository.BridgeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BridgeService {
    private final BridgeRepository bridgeRepository;
    private final GeometryFactory geometryFactory =
            new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public void createBridge(BridgeCreateRequest request) {
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new IllegalArgumentException("Latitude and longitude are required");
        }
        Long nextVal = bridgeRepository.getNextBridgeSequence();
        String bridgeId = String.format("BRIDGE-%03d", nextVal);

        Point location = geometryFactory.createPoint(
                new Coordinate(request.getLongitude(), request.getLatitude()) // lon, lat
        );

        Bridge bridge = Bridge.builder()
                .id(bridgeId)
                .name(request.getName())
                .location(location)
                .status(BridgeStatus.EXCELLENT)
                .build();

        bridgeRepository.save(bridge);
    }

    public BridgeResponse toResponse(Bridge bridge) {
        return new BridgeResponse(
                bridge.getId(),
                bridge.getName(),
                bridge.getStatus(),
                bridge.getLocation().getY(), // latitude
                bridge.getLocation().getX()  // longitude
        );
    }
}
