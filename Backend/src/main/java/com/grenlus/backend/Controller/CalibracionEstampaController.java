package com.grenlus.backend.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.DTO.CalibracionEstampaDTO;
import com.grenlus.backend.Entity.CalibracionEstampa;
import com.grenlus.backend.Entity.PosicionDiseno;
import com.grenlus.backend.Service.CalibracionEstampaService;

@RestController
@RequestMapping("/indumentarias/{indumentariaId}/calibraciones-estampa")
public class CalibracionEstampaController {

    private final CalibracionEstampaService service;

    public CalibracionEstampaController(CalibracionEstampaService service) {
        this.service = service;
    }

    @GetMapping
    public List<CalibracionEstampa> listar(@PathVariable Long indumentariaId) {
        return service.listar(indumentariaId);
    }

    @PutMapping("/{posicion}")
    public CalibracionEstampa guardar(
            @PathVariable Long indumentariaId,
            @PathVariable PosicionDiseno posicion,
            @RequestBody CalibracionEstampaDTO dto
    ) {
        return service.guardar(indumentariaId, posicion, dto);
    }
}
