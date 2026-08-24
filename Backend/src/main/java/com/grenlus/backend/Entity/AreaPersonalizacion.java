package com.grenlus.backend.Entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
        name = "area_personalizacion",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_area_indumentaria_posicion_color",
                        columnNames = {
                                "indumentaria_id",
                                "posicion",
                                "color"
                        }
                )
        }
)
public class AreaPersonalizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // INDUMENTARIA
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "indumentaria_id",
            nullable = false
    )
    @JsonIgnore
    private Indumentaria indumentaria;

    // =========================================================
    // POSICIÓN
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PosicionDiseno posicion;

    // =========================================================
    // COLOR
    //
    // Ejemplos:
    //
    // Negro
    // Blanco
    // Azul
    //
    // null = mockup genérico / producto viejo sin color.
    // =========================================================

    @Column(length = 100)
    private String color;

    // =========================================================
    // FOTO DEL MOCKUP
    // =========================================================

    private String imagenMockup;

    // =========================================================
    // ÁREA GENERAL PERMITIDA
    //
    // Valores porcentuales respecto de la imagen.
    // =========================================================

    private Double x;

    private Double y;

    private Double width;

    private Double height;

    // =========================================================
    // MEDIDAS INTERNAS POR TAMAÑO
    //
    // Estas NO hace falta mostrárselas al cliente.
    //
    // Sirven internamente para definir los límites
    // de CHICA / MEDIA / GRANDE.
    // =========================================================

    private BigDecimal anchoChicaCm;

    private BigDecimal altoChicaCm;

    private BigDecimal anchoMediaCm;

    private BigDecimal altoMediaCm;

    private BigDecimal anchoGrandeCm;

    private BigDecimal altoGrandeCm;

    // =========================================================
    // NORMALIZAR COLOR
    // =========================================================

    public void setColor(
            String color) {

        if (
                color == null ||
                color.isBlank()
        ) {

            this.color = null;

            return;
        }

        this.color =
                color.trim();
    }
}