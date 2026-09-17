package com.grenlus.backend.DTO;

import com.grenlus.backend.Entity.EstadoEnvio;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarEnvioDTO {

    /*
     * Nuevo estado del envío.
     *
     * Puede venir null cuando el admin solamente
     * quiere cargar o corregir el código de seguimiento
     * sin mover el estado.
     */
    private EstadoEnvio estadoEnvio;

    /*
     * Número de seguimiento del transporte.
     *
     * Es obligatorio para poder pasar a DESPACHADO.
     */
    private String codigoSeguimiento;
}
