package com.grenlus.backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.DTO.CotizacionEnvioResponseDTO;
import com.grenlus.backend.DTO.CotizarEnvioDTO;
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
}