package com.grenlus.backend.DTO;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CotizarEnvioDTO {

    private String codigoPostal;

    private String provincia;

    private String localidad;

    /*
     * Valor total de la mercadería.
     * Zipnova lo utiliza como valor declarado.
     */
    private BigDecimal valorDeclarado;

    /*
     * Productos que hay actualmente en el carrito.
     *
     * El frontend solamente manda productoId + cantidad.
     * Peso y dimensiones SIEMPRE los obtiene el backend
     * desde la base de datos.
     */
    private List<ItemCotizacionEnvioDTO> items =
            new ArrayList<>();
}