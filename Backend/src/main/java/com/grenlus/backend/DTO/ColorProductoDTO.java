package com.grenlus.backend.DTO;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ColorProductoDTO {

    private String nombre;

    /*
     * Lo que suma el color sobre el precio base.
     */
    private BigDecimal precioAdicional;

    private Boolean activo;

    /*
     * Talles donde este color NO está disponible.
     *
     * Vacío = está en todos los talles del producto.
     */
    private Set<String> tallesExcluidos = new LinkedHashSet<>();
}
