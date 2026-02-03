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
@Table(name = "ml_output_log")
public class MLOutputLog {
    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bridge_log_ref")
    private BridgeHealthLog bridgeLogRef;

    @ColumnDefault("100")
    @Column(name = "health_index", nullable = false)
    private Integer healthIndex;

    @Column(name = "health_state", nullable = false, length = 25)
    private String healthState;

    @Column(name = "recommended_action", nullable = false, length = 50)
    private String recommendedAction;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

}