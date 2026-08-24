package com.grenlus.backend.DTO;

import com.grenlus.backend.Entity.PosicionDiseno;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DisenoResponseDTO {
    private Long id;
    private String rutaImagen;
    private PosicionDiseno posicion;
    private String observaciones;
}
