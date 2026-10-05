package com.grenlus.backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.Service.TransferenciaService;

@RestController
@RequestMapping("/pagos")
public class PagoController {

    private final TransferenciaService transferenciaService;

    public PagoController(TransferenciaService transferenciaService) {
        this.transferenciaService = transferenciaService;
    }

    @PutMapping("/{pedidoId}/aprobar-manual")
    public ResponseEntity<Void> aprobarManualmente(
            @PathVariable Long pedidoId
    ) {
        transferenciaService.aprobarPagoManualmente(pedidoId);
        return ResponseEntity.noContent().build();
    }
}
