package com.app.bridgeQuality.service;

import com.app.bridgeQuality.dto.MLRequestDTO;
import com.app.bridgeQuality.dto.MLResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MLService {

    private final RestTemplate restTemplate = new RestTemplate();
//    endpoint to reach the ML model
    private static final String ML_ENDPOINT = "http://localhost:8000/predict"; // Example

    public MLResponseDTO sendToModel(MLRequestDTO requestDTO) {
        return restTemplate.postForObject(ML_ENDPOINT, requestDTO, MLResponseDTO.class);
    }
}
