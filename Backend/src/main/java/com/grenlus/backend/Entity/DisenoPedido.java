package com.grenlus.backend.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class DisenoPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Archivo ORIGINAL subido por el cliente.
     */
    private String rutaImagen;

    /*
     * Mockup final generado desde el frontend.
     *
     * Ejemplo:
     *
     * remera + logo del cliente
     *
     * Este campo lo usaremos en el próximo
     * bloque del frontend.
     */
    private String rutaMockup;

    /*
     * Imagen base del producto usada cuando
     * se hizo el pedido.
     *
     * Se congela para conservar pedidos viejos.
     */
    private String rutaImagenBase;

    /*
     * FRENTE, ESPALDA,
     * MANGA_DERECHA...
     */
    private String posicion;

    /*
     * CHICA, MEDIA o GRANDE.
     */
    private String tamano;

    /*
     * Posición ABSOLUTA del logo dentro
     * del mockup completo.
     *
     * Porcentajes.
     */
    private Double x;

    private Double y;

    /*
     * Tamaño visual del logo.
     *
     * Porcentajes.
     */
    private Double width;

    private Double height;

    /*
     * Tamaño físico real del diseño.
     */
    private Double anchoCm;

    private Double altoCm;

    /*
     * Snapshot del área permitida utilizada.
     *
     * Así si el administrador cambia el
     * producto mañana, el pedido viejo
     * conserva su área original.
     */
    private Double areaX;

    private Double areaY;

    private Double areaWidth;

    private Double areaHeight;

    /*
     * Máximo real permitido que tenía
     * ese tamaño al momento de comprar.
     */
    private Double areaAnchoMaxCm;

    private Double areaAltoMaxCm;

    private String observaciones;

    @ManyToOne
    private DetallePedido detallePedido;
}