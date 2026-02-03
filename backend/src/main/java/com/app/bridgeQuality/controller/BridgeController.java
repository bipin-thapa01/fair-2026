package com.app.bridgeQuality.controller;

import com.app.bridgeQuality.dto.BridgeCreateRequest;
import com.app.bridgeQuality.dto.BridgeResponse;
import com.app.bridgeQuality.repository.BridgeRepository;
import com.app.bridgeQuality.service.BridgeService;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bridge")
@RequiredArgsConstructor
public class BridgeController {

    public final BridgeRepository bridgeRepository;
    public final BridgeService bridgeService;

    @GetMapping
    public List<BridgeResponse> bridgeList() {
        return bridgeRepository.findAll()
                .stream()
                .map(bridgeService::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<@NotNull BridgeResponse> getBridge(@PathVariable String id) {
        return bridgeRepository.findById(id)
                .map(bridgeService::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/addNew")
    public ResponseEntity<?> uploadBridge(@RequestBody BridgeCreateRequest request) {
        bridgeService.createBridge(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

}
