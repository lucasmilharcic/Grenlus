package com.grenlus.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.DTO.ColorProductoDTO;
import com.grenlus.backend.Entity.ColorProducto;
import com.grenlus.backend.Service.ColorProductoService;

@RestController
@RequestMapping(
        "/indumentarias/{indumentariaId}/colores"
)
public class ColorProductoController {

    private final ColorProductoService service;

    public ColorProductoController(
            ColorProductoService service) {

        this.service = service;
    }

    // =========================================================
    // LISTAR
    // =========================================================

    @GetMapping
    public ResponseEntity<List<ColorProducto>> listar(
            @PathVariable Long indumentariaId) {

        return ResponseEntity.ok(
                service.listar(indumentariaId));
    }

    // =========================================================
    // ADMIN
    // =========================================================

    @PostMapping
    public ResponseEntity<ColorProducto> crear(
            @PathVariable Long indumentariaId,
            @RequestBody ColorProductoDTO dto) {

        return ResponseEntity.ok(
                service.crear(indumentariaId, dto));
    }

    @PutMapping("/{colorId}")
    public ResponseEntity<ColorProducto> editar(
            @PathVariable Long indumentariaId,
            @PathVariable Long colorId,
            @RequestBody ColorProductoDTO dto) {

        return ResponseEntity.ok(
                service.editar(
                        indumentariaId,
                        colorId,
                        dto));
    }

    @DeleteMapping("/{colorId}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long indumentariaId,
            @PathVariable Long colorId) {

        service.eliminar(indumentariaId, colorId);

        return ResponseEntity.noContent().build();
    }
}
