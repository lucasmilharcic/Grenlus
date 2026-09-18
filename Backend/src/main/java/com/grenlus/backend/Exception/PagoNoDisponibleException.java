package com.grenlus.backend.Exception;

/*
 * El proveedor de pagos no pudo atender el pedido:
 * falta configuración, rechazó la credencial o no respondió.
 *
 * No es culpa del cliente (no es 400) y tampoco queremos
 * esconderlo detrás del "error inesperado" genérico,
 * porque el mensaje dice exactamente qué hay que arreglar.
 */
public class PagoNoDisponibleException extends RuntimeException {

    public PagoNoDisponibleException(String message) {
        super(message);
    }

    public PagoNoDisponibleException(String message, Throwable cause) {
        super(message, cause);
    }
}
