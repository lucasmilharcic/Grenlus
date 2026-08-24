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
public class CreateDisenoDTO {
    // Ruta o URL de la imagen (se asume que el archivo ya fue subido y se pasa la ruta)
    private String rutaImagen;

    // Posición: FRENTE, ESPALDA, MANGA_DERECHA, ...
    private PosicionDiseno posicion;

    // Descripción / medidas ("aprox 15x20 cm", "ocupa todo el frente")
    private String observaciones;
}
