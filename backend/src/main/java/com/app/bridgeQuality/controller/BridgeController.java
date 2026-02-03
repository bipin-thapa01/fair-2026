package com.app.bridgeQuality.controller;

import com.app.bridgeQuality.dto.BridgeCreateRequest;
import com.app.bridgeQuality.entity.Bridge;
import com.app.bridgeQuality.repository.BridgeRepository;
import com.app.bridgeQuality.service.BridgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bridge")
@RequiredArgsConstructor
public class BridgeController {

    public final BridgeRepository bridgeRepository;
    public final BridgeService bridgeService;

    @GetMapping
    public List<Bridge> bridgeList() {
        return bridgeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Bridge> getBridge(@PathVariable String id) {
        return bridgeRepository.findById(id);
    }

    @PostMapping("/addNew")
    public ResponseEntity<?> uploadBridge(@RequestBody BridgeCreateRequest request) {
        bridgeService.createBridge(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

}
