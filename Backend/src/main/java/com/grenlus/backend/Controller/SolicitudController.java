package com.grenlus.backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.grenlus.backend.DTO.CreateSolicitudDTO;
import com.grenlus.backend.DTO.SolicitudResponseDTO;
import com.grenlus.backend.Entity.DisenoSolicitud;
import com.grenlus.backend.Entity.Solicitud;
import com.grenlus.backend.Service.SolicitudService;

@RestController
@RequestMapping("/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping
    public List<Solicitud> getSolicitudes() {
        return solicitudService.findAll();
    }

    @GetMapping("/{id}")
    public Solicitud getSolicitudById(@PathVariable Long id) {
        return solicitudService.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
    }

    @PostMapping
    public ResponseEntity<SolicitudResponseDTO> crear(@RequestBody CreateSolicitudDTO dto) {
        return ResponseEntity.ok(solicitudService.crear(dto));
    }

    @PutMapping("/{id}")
    public Solicitud editarSolicitud(@PathVariable Long id,
            @RequestBody Solicitud solicitud) {
        return solicitudService.editarSolicitud(id, solicitud);
    }

    @DeleteMapping("/{id}")
    public void eliminarSolicitud(@PathVariable Long id) {
        solicitudService.deleteById(id);
    }

    @PostMapping("/{id}/disenos")
    public DisenoSolicitud agregarDiseno(@PathVariable Long id,
            @RequestBody DisenoSolicitud diseno) {

        return solicitudService.agregarDiseno(id, diseno);
    }

    @PutMapping("/{id}/disenos/{disenoId}")
    public DisenoSolicitud editarDiseno(@PathVariable Long id,
            @PathVariable Long disenoId,
            @RequestBody DisenoSolicitud diseno) {

        return solicitudService.editarDiseno(id, disenoId, diseno);
    }

    @DeleteMapping("/{id}/disenos/{disenoId}")
    public void eliminarDiseno(@PathVariable Long id,
            @PathVariable Long disenoId) {

        solicitudService.eliminarDiseno(id, disenoId);
    }
}