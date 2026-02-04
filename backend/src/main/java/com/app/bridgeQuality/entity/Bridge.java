package com.app.bridgeQuality.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.*;
import lombok.Builder;
import org.hibernate.annotations.ColumnDefault;
import org.locationtech.jts.geom.Point;

import com.app.bridgeQuality.entity.enums.BridgeStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bridges")
@Builder
public class Bridge implements Persistable<String> {
    @Id
    private String id;

    @Transient
    private boolean isNew = true;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BridgeStatus status;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "location", columnDefinition = "geography(Point,4326)", nullable = false)
    private Point location;

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}