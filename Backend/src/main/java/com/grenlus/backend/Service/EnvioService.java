package com.grenlus.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grenlus.backend.DTO.CotizacionEnvioResponseDTO;
import com.grenlus.backend.DTO.CotizarEnvioDTO;
import com.grenlus.backend.DTO.OpcionEnvioDTO;
import com.grenlus.backend.Exception.BadRequestException;

@Service
public class EnvioService {

    private final ZipnovaService zipnovaService;

    public EnvioService(
            ZipnovaService zipnovaService
    ) {

        this.zipnovaService =
                zipnovaService;
    }

    // =========================================================
    // COTIZAR ENVÍO
    // =========================================================

    @Transactional(readOnly = true)
    public CotizacionEnvioResponseDTO cotizar(
            CotizarEnvioDTO dto
    ) {

        return zipnovaService
                .cotizar(dto);
    }

    // =========================================================
    // OBTENER OPCIÓN ACTUAL
    // =========================================================

    /*
     * Cuando el usuario confirma el pedido NO confiamos
     * en el precio que llegó desde React.
     *
     * Volvemos a cotizar contra Zipnova y buscamos
     * nuevamente la opción que había seleccionado.
     */

    @Transactional(readOnly = true)
    public OpcionEnvioDTO obtenerOpcionActual(
            CotizarEnvioDTO dto,
            String opcionId
    ) {

        if (
                opcionId == null ||
                opcionId.isBlank()
        ) {

            throw new BadRequestException(
                    "Debés seleccionar una opción de envío."
            );
        }

        CotizacionEnvioResponseDTO cotizacion =
                zipnovaService.cotizar(dto);

        if (
                cotizacion == null ||
                cotizacion.getOpciones() == null ||
                cotizacion.getOpciones().isEmpty()
        ) {

            throw new BadRequestException(
                    "No hay opciones de envío disponibles."
            );
        }

        return cotizacion
                .getOpciones()
                .stream()
                .filter(
                        opcion ->
                                opcion != null &&
                                opcionId.equals(
                                        opcion.getOpcionId()
                                )
                )
                .findFirst()
                .orElseThrow(
                        () ->
                                new BadRequestException(
                                        "La opción de envío seleccionada ya no está disponible. Volvé a calcular el envío."
                                )
                );
    }
}