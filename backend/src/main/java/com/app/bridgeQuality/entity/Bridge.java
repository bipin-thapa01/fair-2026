package com.app.bridgeQuality.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.app.bridgeQuality.entity.enums.BridgeStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bridges")
public class Bridge {
    @Id
    @GeneratedValue
    private String id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BridgeStatus status;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false, updatable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "location", columnDefinition = "geography(Point,4326)", nullable = false)
    @JdbcTypeCode(SqlTypes.OTHER)
    private Object location;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }
}