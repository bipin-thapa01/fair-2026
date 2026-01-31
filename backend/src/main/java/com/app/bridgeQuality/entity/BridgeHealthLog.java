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

    @Column(name = "deflection_mm", nullable = false)
    private Double deflectionMm;

    @Column(name = "localized_strain_hotspot", nullable = false)
    private Double localizedStrainHotspot;

    @Column(name = "vibration_ms2", nullable = false)
    private Double vibrationMs2;

    @Column(name = "seismic_activity_ms2", nullable = false)
    private Double seismicActivityMs2;

    @Column(name = "impact_events_g", nullable = false)
    private Double impactEventsG;

    @Column(name = "modal_frequency_hz", nullable = false)
    private Double modalFrequencyHz;

    @Column(name = "energy_dissipation_au", nullable = false)
    private Double energyDissipationAu;

    @Column(name = "temperature_c", nullable = false)
    private Double temperatureC;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

}