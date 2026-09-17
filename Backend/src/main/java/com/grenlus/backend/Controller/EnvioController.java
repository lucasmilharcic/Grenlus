package com.grenlus.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.DTO.ActualizarEnvioDTO;
import com.grenlus.backend.DTO.CotizacionEnvioResponseDTO;
import com.grenlus.backend.DTO.CotizarEnvioDTO;
import com.grenlus.backend.DTO.EnvioResponseDTO;
import com.grenlus.backend.Entity.EstadoEnvio;
import com.grenlus.backend.Service.EnvioService;

@RestController
@RequestMapping("/envios")
public class EnvioController {

    private final EnvioService envioService;

    public EnvioController(
            EnvioService envioService
    ) {

        this.envioService =
                envioService;
    }

    // =========================================================
    // COTIZAR
    // =========================================================

    @PostMapping("/cotizar")
    public ResponseEntity<
            CotizacionEnvioResponseDTO
    > cotizar(
            @RequestBody
            CotizarEnvioDTO dto
    ) {

        return ResponseEntity.ok(
                envioService.cotizar(
                        dto
                )
        );
    }

    // =========================================================
    // CLIENTE - MIS ENVÍOS
    // =========================================================

    @GetMapping("/mis-envios")
    public ResponseEntity<
            List<EnvioResponseDTO>
    > misEnvios(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                envioService.listarMisEnvios(
                        authentication.getName()
                )
        );
    }

    // =========================================================
    // ADMIN - LISTAR
    // =========================================================

    /*
     * El filtro por estado es opcional.
     *
     * Sin parámetro devuelve todos los envíos
     * a domicilio.
     */
    @GetMapping
    public ResponseEntity<
            List<EnvioResponseDTO>
    > listar(
            @RequestParam(required = false)
            EstadoEnvio estado
    ) {

        return ResponseEntity.ok(
                envioService.listarEnvios(
                        estado
                )
        );
    }

    // =========================================================
    // ADMIN - OBTENER UNO
    // =========================================================

    @GetMapping("/{pedidoId}")
    public ResponseEntity<
            EnvioResponseDTO
    > buscar(
            @PathVariable
            Long pedidoId
    ) {

        return ResponseEntity.ok(
                envioService.buscarEnvio(
                        pedidoId
                )
        );
    }

    // =========================================================
    // ADMIN - ACTUALIZAR
    // =========================================================

    /*
     * Avanza el estado del envío y/o carga
     * el código de seguimiento.
     */
    @PutMapping("/{pedidoId}")
    public ResponseEntity<
            EnvioResponseDTO
    > actualizar(

            @PathVariable
            Long pedidoId,

            @RequestBody
            ActualizarEnvioDTO dto
    ) {

        return ResponseEntity.ok(
                envioService.actualizarEnvio(
                        pedidoId,
                        dto
                )
        );
    }
}
