// Entity/TarifaEnvio.java
package com.grenlus.backend.Entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class TarifaEnvio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    @Column(nullable = false)
    private BigDecimal precio;

    @Column(nullable = false)
    private boolean activo = true;

    /*
     * Para la primera versión usamos
     * una clave simple de zona.
     *
     * Ejemplos:
     * LOCAL
     * AMBA
     * BUENOS_AIRES
     * INTERIOR
     * PATAGONIA
     */
    @Column(nullable = false, unique = true)
    private String codigoZona;
}