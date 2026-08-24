package com.grenlus.backend.DTO;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OpcionEnvioDTO {

    /*
     * Lo vamos a utilizar en React para identificar
     * la opción seleccionada.
     */
    private String opcionId;

    /*
     * Datos que después necesitaremos para crear
     * el envío real en Zipnova.
     */
    private Long carrierId;

    private String carrierNombre;

    private String carrierLogo;

    private String logisticType;

    private String serviceType;

    private String serviceNombre;

    /*
     * Precio FINAL con impuestos.
     */
    private BigDecimal precio;

    private Integer diasMin;

    private Integer diasMax;
}