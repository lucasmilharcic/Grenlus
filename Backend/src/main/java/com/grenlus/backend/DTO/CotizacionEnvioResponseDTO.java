package com.grenlus.backend.DTO;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CotizacionEnvioResponseDTO {

    private String codigoPostal;

    private String localidad;

    private String provincia;

    private List<OpcionEnvioDTO> opciones =
            new ArrayList<>();
}