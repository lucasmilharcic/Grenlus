package com.grenlus.backend.Entity;

import java.math.BigDecimal;

import jakarta.persistence.Entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Carteleria extends Producto {

    /**
     * Si es true, el producto tiene un precio fijo
     * y puede comprarse directamente.
     *
     * Si es false y esCotizable=true,
     * se genera una solicitud.
     */
    private boolean esCotizable;

    /**
     * Precio fijo de cartelería.
     *
     * Se utiliza cuando esCotizable = false.
     */
    private BigDecimal precioFijo;

    private boolean requiereMedidas;

    private boolean requiereImagen;

    private boolean requiereCantidad;

    private boolean requiereInstalacion;

    private boolean permiteEnvio;
}