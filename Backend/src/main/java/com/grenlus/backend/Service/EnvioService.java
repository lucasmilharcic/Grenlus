package com.grenlus.backend.Service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grenlus.backend.DTO.CotizacionEnvioResponseDTO;
import com.grenlus.backend.DTO.CotizarEnvioDTO;
import com.grenlus.backend.Entity.TarifaEnvio;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Repository.TarifaEnvioRepository;

@Service
public class EnvioService {

    private final ZipnovaService zipnovaService;

    /*
     * TEMPORAL.
     *
     * PedidoService todavía depende de TarifaEnvio
     * hasta que migremos Pedido a Zipnova.
     */
    private final TarifaEnvioRepository tarifaEnvioRepository;

    public EnvioService(
            ZipnovaService zipnovaService,
            TarifaEnvioRepository tarifaEnvioRepository
    ) {

        this.zipnovaService =
                zipnovaService;

        this.tarifaEnvioRepository =
                tarifaEnvioRepository;
    }

    // =========================================================
    // NUEVO - COTIZACIÓN ZIPNOVA
    // =========================================================

    @Transactional(readOnly = true)
    public CotizacionEnvioResponseDTO cotizar(
            CotizarEnvioDTO dto
    ) {

        return zipnovaService
                .cotizar(dto);
    }

    // =========================================================
    // LEGACY TEMPORAL - PEDIDO
    // =========================================================

    @Transactional(readOnly = true)
    public TarifaEnvio obtenerTarifa(
            Long tarifaId
    ) {

        if (tarifaId == null) {

            throw new BadRequestException(
                    "La tarifa de envío es obligatoria."
            );
        }

        TarifaEnvio tarifa =
                tarifaEnvioRepository
                        .findById(tarifaId)
                        .orElseThrow(() ->
                                new BadRequestException(
                                        "Tarifa de envío no encontrada."
                                )
                        );

        if (!tarifa.isActivo()) {

            throw new BadRequestException(
                    "La tarifa de envío ya no está disponible."
            );
        }

        if (
                tarifa.getPrecio() == null ||
                tarifa.getPrecio()
                        .compareTo(
                                BigDecimal.ZERO
                        ) < 0
        ) {

            throw new BadRequestException(
                    "La tarifa de envío tiene un precio inválido."
            );
        }

        return tarifa;
    }

    // =========================================================
    // LEGACY TEMPORAL - PRECIO
    // =========================================================

    @Transactional(readOnly = true)
    public BigDecimal obtenerPrecioTarifa(
            Long tarifaId
    ) {

        return obtenerTarifa(
                tarifaId
        ).getPrecio();
    }
}