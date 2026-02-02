package com.app.bridgeQuality.controller;

import com.app.bridgeQuality.entity.Bridge;
import com.app.bridgeQuality.repository.BridgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bridge")
@RequiredArgsConstructor
public class BridgeController {

    public final BridgeRepository bridgeRepository;

    @GetMapping
    public List<Bridge> bridgeList() {
        return bridgeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Bridge> getBridge(@PathVariable String id) {
        return bridgeRepository.findById(id);
    }

}
