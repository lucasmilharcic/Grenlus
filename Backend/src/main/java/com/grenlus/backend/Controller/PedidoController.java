package com.grenlus.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.DTO.CreatePedidoDTO;
import com.grenlus.backend.DTO.PedidoResponseDTO;
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
     * Sigue permitiendo comprar sin cuenta.
     *
     * Si viene JWT, Authentication contiene
     * el username y asociamos el Pedido.
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

    // =========================================================
    // ADMIN - LISTAR TODOS
    // =========================================================

    @GetMapping
    public ResponseEntity<
            List<PedidoResponseDTO>
    > listarPedidos() {

        return ResponseEntity.ok(
                pedidoService
                        .listarPedidos()
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
}