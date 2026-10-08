package com.grenlus.backend.Entity;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "calibracion_estampa",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_calibracion_indumentaria_posicion",
                        columnNames = {"indumentaria_id", "posicion"}
                )
        }
)
public class CalibracionEstampa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indumentaria_id", nullable = false)
    @JsonIgnore
    private Indumentaria indumentaria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PosicionDiseno posicion;

    private Double punto1X;

    private Double punto1Y;

    private Double punto2X;

    private Double punto2Y;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "calibracion_estampa_talle",
            joinColumns = @JoinColumn(name = "calibracion_id")
    )
    @MapKeyColumn(name = "talle", length = 20)
    @Column(name = "distancia_cm", nullable = false)
    private Map<String, BigDecimal> medidasCmPorTalle = new HashMap<>();
}
