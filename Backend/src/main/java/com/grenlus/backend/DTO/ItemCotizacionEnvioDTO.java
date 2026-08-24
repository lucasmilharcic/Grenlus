package com.grenlus.backend.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ItemCotizacionEnvioDTO {

    private Long productoId;

    private Integer cantidad;
}