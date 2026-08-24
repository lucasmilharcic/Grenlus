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
public class DisenoPedidoDTO {

    /*
     * Archivo original.
     */
    private String rutaImagen;

    /*
     * PNG/JPG del mockup ya compuesto.
     *
     * Se agregará desde React en el próximo
     * bloque.
     */
    private String rutaMockup;

    private PosicionDiseno posicion;

    /*
     * CHICA / MEDIA / GRANDE
     */
    private String tamano;

    /*
     * Posición visual sobre el mockup.
     */
    private Double posicionX;

    private Double posicionY;

    /*
     * Tamaño visual.
     */
    private Double ancho;

    private Double alto;

    /*
     * Medida física real.
     */
    private Double anchoCm;

    private Double altoCm;

    private String observaciones;
}