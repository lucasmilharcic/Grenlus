package com.grenlus.backend.Controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import com.grenlus.backend.Service.TransferenciaService;
import com.grenlus.backend.Service.PedidoService;

@RestController
@RequestMapping("/pagos/transferencia")
public class TransferenciaController {

    private final TransferenciaService transferenciaService;
    private final PedidoService pedidoService;

    public TransferenciaController(
            TransferenciaService transferenciaService,
            PedidoService pedidoService) {

        this.transferenciaService =
                transferenciaService;
        this.pedidoService = pedidoService;
    }

    // =========================================================
    // DATOS DE TRANSFERENCIA
    // =========================================================

    @GetMapping("/datos")
    public ResponseEntity<Map<String, String>>
            datosTransferencia() {

        return ResponseEntity.ok(
                transferenciaService
                        .obtenerDatos()
        );
    }

    // =========================================================
    // COMPROBANTE DEL CLIENTE
    // =========================================================

    @PostMapping(
            value = "/{pedidoId}/comprobante",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>>
            subirComprobante(

            @PathVariable
            Long pedidoId,

            @RequestParam("archivo")
            MultipartFile archivo,

            Authentication authentication
    ) {

        pedidoService.validarPropiedadPedido(
                pedidoId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                transferenciaService
                        .subirComprobante(
                                pedidoId,
                                archivo
                        )
        );
    }

    @PostMapping(
            value = "/{pedidoId}/comprobante-invitado",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> subirComprobanteInvitado(
            @PathVariable Long pedidoId,
            @RequestHeader("X-Guest-Order-Token") String tokenAcceso,
            @RequestParam("archivo") MultipartFile archivo
    ) {

        pedidoService.validarAccesoPedidoInvitado(pedidoId, tokenAcceso);

        return ResponseEntity.ok(
                transferenciaService.subirComprobante(pedidoId, archivo)
        );
    }

    @PostMapping(
            value = "/{pedidoId}/comprobante-cuenta",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> subirComprobanteCuenta(
            @PathVariable Long pedidoId,
            @RequestParam("archivo") MultipartFile archivo,
            Authentication authentication
    ) {

        pedidoService.validarPropiedadPedido(pedidoId, authentication.getName());

        return ResponseEntity.ok(
                transferenciaService.subirComprobante(pedidoId, archivo)
        );
    }

    // =========================================================
    // ADMIN
    // =========================================================

    @PutMapping("/{pedidoId}/aprobar")
    public ResponseEntity<Void>
            aprobar(

            @PathVariable
            Long pedidoId
    ) {

        transferenciaService
                .aprobarTransferencia(
                        pedidoId
                );

        return ResponseEntity
                .noContent()
                .build();
    }

    @PutMapping("/{pedidoId}/aprobar-manual")
    public ResponseEntity<Void> aprobarManualmente(

            @PathVariable
            Long pedidoId
    ) {

        transferenciaService.aprobarPagoManualmente(pedidoId);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{pedidoId}/rechazar")
    public ResponseEntity<Void>
            rechazar(

            @PathVariable
            Long pedidoId
    ) {

        transferenciaService
                .rechazarTransferencia(
                        pedidoId
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}