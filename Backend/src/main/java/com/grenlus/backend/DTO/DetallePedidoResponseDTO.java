package com.grenlus.backend.DTO;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedidoResponseDTO {

    private Long id;

    private Long productoId;

    private String productoNombre;

    private Integer cantidad;

    private String talle;

    private String color;

    private String tamanoEstampa;

    /*
     * Valores congelados al comprar.
     */
    private BigDecimal precioBase;

    private BigDecimal precioEstampa;

    private BigDecimal precioUnitario;

    private BigDecimal subtotal;

    private List<DisenoPedidoResponseDTO> disenos;
}