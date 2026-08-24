package com.grenlus.backend.Entity;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String descripcion;

    private String imagenPrincipal;

    private boolean activo;

    /**
     * Precio base del producto.
     *
     * Ejemplo:
     * Remera = $18.000
     */
    private BigDecimal precioBase;

    /**
     * Adicional por estampa chica.
     */
    private BigDecimal precioEstampaChica;

    /**
     * Adicional por estampa media.
     */
    private BigDecimal precioEstampaMedia;

    /**
     * Adicional por estampa grande.
     */
    private BigDecimal precioEstampaGrande;

    // =========================================================
    // DATOS LOGÍSTICOS - ZIPNOVA
    // =========================================================

    /**
     * Peso estimado de UNA unidad lista para despachar.
     * Unidad: gramos.
     */
    private Integer pesoGramos;

    /**
     * Medidas estimadas de UNA unidad lista para despachar.
     * Unidad: centímetros.
     */
    private Integer largoEnvioCm;
    private Integer anchoEnvioCm;
    private Integer altoEnvioCm;
}