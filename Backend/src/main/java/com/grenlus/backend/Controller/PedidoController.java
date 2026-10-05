package com.grenlus.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.DTO.CreatePedidoDTO;
import com.grenlus.backend.DTO.PedidoResponseDTO;
import com.grenlus.backend.Entity.MetodoPago;
import com.grenlus.backend.Service.PedidoService;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(
            PedidoService pedidoService
    ) {

        this.pedidoService =
                pedidoService;
    }

    // =========================================================
    // CREAR PEDIDO
    // =========================================================

    /*
     * El checkout requiere una sesión. Cada pedido queda asociado
     * al usuario para que aparezca en "Mis compras".
     */
    @PostMapping
    public ResponseEntity<PedidoResponseDTO>
            crearPedido(

            @RequestBody
            CreatePedidoDTO dto,

            Authentication authentication
    ) {

        String username =
                null;

        if (
                authentication != null &&
                authentication.isAuthenticated() &&
                !"anonymousUser".equalsIgnoreCase(
                        authentication.getName()
                )
        ) {

            username =
                    authentication.getName();
        }

        return ResponseEntity.ok(
                pedidoService.crearPedido(
                        dto,
                        username
                )
        );
    }

    // =========================================================
    // MIS COMPRAS
    // =========================================================

    @GetMapping("/mis-compras")
    public ResponseEntity<
            List<PedidoResponseDTO>
    > misCompras(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                pedidoService
                        .listarMisCompras(
                                authentication
                                        .getName()
                        )
        );
    }

    @GetMapping("/invitado/{id}")
    public ResponseEntity<PedidoResponseDTO> buscarPedidoInvitado(
            @PathVariable Long id,
            @RequestHeader("X-Guest-Order-Token") String tokenAcceso
    ) {

        return ResponseEntity.ok(
                pedidoService.obtenerPedidoInvitado(
                        id,
                        tokenAcceso
                )
        );
    }

    @PutMapping("/invitado/{id}/metodo-pago")
    public ResponseEntity<PedidoResponseDTO> actualizarMetodoPagoInvitado(
            @PathVariable Long id,
            @RequestHeader("X-Guest-Order-Token") String tokenAcceso,
            @RequestParam MetodoPago metodoPago
    ) {

        return ResponseEntity.ok(
                pedidoService.actualizarMetodoPagoInvitado(
                        id,
                        tokenAcceso,
                        metodoPago
                )
        );
    }

    @PutMapping("/mis-compras/{id}/metodo-pago")
    public ResponseEntity<PedidoResponseDTO> actualizarMetodoPagoCuenta(
            @PathVariable Long id,
            @RequestParam MetodoPago metodoPago,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                pedidoService.actualizarMetodoPagoCuenta(
                        id,
                        authentication.getName(),
                        metodoPago
                )
        );
    }

    // =========================================================
    // ADMIN - LISTAR TODOS
    // =========================================================

    @GetMapping
    public ResponseEntity<
            List<PedidoResponseDTO>
    > listarPedidos(
            @RequestParam(defaultValue = "false")
            boolean archivados
    ) {

        return ResponseEntity.ok(
                pedidoService
                        .listarPedidos(archivados)
        );
    }

    // =========================================================
    // ADMIN - OBTENER UNO
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<
            PedidoResponseDTO
    > buscarPedido(
            @PathVariable
            Long id
    ) {

        return ResponseEntity.ok(
                pedidoService
                        .buscarPorId(id)
        );
    }

    @PutMapping("/{id}/archivo")
    public ResponseEntity<Void> actualizarArchivo(
            @PathVariable Long id,
            @RequestParam boolean archivado
    ) {

        pedidoService.actualizarArchivado(id, archivado);
        return ResponseEntity.noContent().build();
    }
}