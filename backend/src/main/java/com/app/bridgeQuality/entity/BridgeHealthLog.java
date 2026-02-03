package com.app.bridgeQuality.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bridge_health_log")
public class BridgeHealthLog {
    @Id
    @GeneratedValue()
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bridge_id", nullable = false)
    private Bridge bridgeId;

    @Column(name = "strain_microstrain", nullable = false)
    private Double strainMicrostrain;

    @Column(name = "vibration_ms2", nullable = false)
    private Double vibrationMs2;

    @Column(name = "temperature_c", nullable = false)
    private Double temperatureC;

    @Column(name = "humidity_percent", nullable = false)
    private Double humidityPercent;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

}