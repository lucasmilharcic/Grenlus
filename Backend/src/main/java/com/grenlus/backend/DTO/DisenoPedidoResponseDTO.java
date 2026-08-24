package com.grenlus.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DisenoPedidoResponseDTO {

    private Long id;

    private String rutaImagen;

    private String rutaMockup;

    private String rutaImagenBase;

    private String posicion;

    private String tamano;

    private String observaciones;

    private Double posicionX;

    private Double posicionY;

    private Double ancho;

    private Double alto;

    private Double anchoCm;

    private Double altoCm;

    private Double areaX;

    private Double areaY;

    private Double areaWidth;

    private Double areaHeight;

    private Double areaAnchoMaxCm;

    private Double areaAltoMaxCm;
}