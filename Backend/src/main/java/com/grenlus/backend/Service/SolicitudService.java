package com.grenlus.backend.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.grenlus.backend.DTO.CreateSolicitudDTO;
import com.grenlus.backend.DTO.SolicitudResponseDTO;
import com.grenlus.backend.Entity.DisenoSolicitud;
import com.grenlus.backend.Entity.Producto;
import com.grenlus.backend.Entity.Solicitud;
import com.grenlus.backend.Repository.ProductoRepository;
import com.grenlus.backend.Repository.SolicitudRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final ProductoRepository productoRepository;

    public List<Solicitud> findAll() {
        return solicitudRepository.findAll();
    }

    public Optional<Solicitud> findById(Long id) {
        return solicitudRepository.findById(id);
    }

    public SolicitudResponseDTO crear(CreateSolicitudDTO dto) {

        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Solicitud solicitud = new Solicitud();

        solicitud.setProducto(producto);
        solicitud.setNombreCliente(dto.getNombreCliente());
        solicitud.setTelefono(dto.getTelefono());
        solicitud.setEmail(dto.getEmail());
        solicitud.setCiudad(dto.getCiudad());
        solicitud.setCantidad(dto.getCantidad());
        solicitud.setTalle(dto.getTalle());
        solicitud.setColor(dto.getColor());
        solicitud.setDescripcion(dto.getDescripcion());
        solicitud.setImagenReferencia(dto.getImagenReferencia());

        if (dto.getDisenos() != null) {
            List<DisenoSolicitud> lista = dto.getDisenos().stream().map(d -> {
                DisenoSolicitud diseno = new DisenoSolicitud();
                diseno.setRutaImagen(d.getRutaImagen());
                diseno.setPosicion(d.getPosicion());
                diseno.setObservaciones(d.getObservaciones());
                diseno.setSolicitud(solicitud);

                return diseno;
            }).toList();

            solicitud.setDisenos(lista);
        }

        Solicitud guardada = solicitudRepository.save(solicitud);

        return convertirADTO(guardada);
    }

    public void deleteById(Long id) {
        solicitudRepository.deleteById(id);
    }

    public Solicitud editarSolicitud(Long id, Solicitud nuevaSolicitud) {

        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setProducto(nuevaSolicitud.getProducto());
        solicitud.setNombreCliente(nuevaSolicitud.getNombreCliente());
        solicitud.setTelefono(nuevaSolicitud.getTelefono());
        solicitud.setEmail(nuevaSolicitud.getEmail());
        solicitud.setCiudad(nuevaSolicitud.getCiudad());
        solicitud.setCantidad(nuevaSolicitud.getCantidad());
        solicitud.setTalle(nuevaSolicitud.getTalle());
        solicitud.setColor(nuevaSolicitud.getColor());
        solicitud.setDescripcion(nuevaSolicitud.getDescripcion());
        solicitud.setImagenReferencia(nuevaSolicitud.getImagenReferencia());
        solicitud.setEstado(nuevaSolicitud.getEstado());

        return solicitudRepository.save(solicitud);
    }

    public DisenoSolicitud agregarDiseno(Long solicitudId, DisenoSolicitud diseno) {

        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        diseno.setSolicitud(solicitud);

        solicitud.getDisenos().add(diseno);

        solicitudRepository.save(solicitud);

        return diseno;
    }

    public DisenoSolicitud editarDiseno(Long solicitudId,
            Long disenoId,
            DisenoSolicitud nuevoDiseno) {

        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        DisenoSolicitud diseno = solicitud.getDisenos().stream()
                .filter(d -> d.getId().equals(disenoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Diseño no encontrado"));

        diseno.setRutaImagen(nuevoDiseno.getRutaImagen());
        diseno.setPosicion(nuevoDiseno.getPosicion());
        diseno.setObservaciones(nuevoDiseno.getObservaciones());

        solicitudRepository.save(solicitud);

        return diseno;
    }

    public void eliminarDiseno(Long solicitudId, Long disenoId) {

        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        DisenoSolicitud diseno = solicitud.getDisenos().stream()
                .filter(d -> d.getId().equals(disenoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Diseño no encontrado"));

        solicitud.getDisenos().remove(diseno);

        solicitudRepository.save(solicitud);
    }

    private SolicitudResponseDTO convertirADTO(Solicitud solicitud) {

        SolicitudResponseDTO dto = new SolicitudResponseDTO();

        dto.setId(solicitud.getId());
        dto.setProductoId(solicitud.getProducto().getId());
        dto.setNombreCliente(solicitud.getNombreCliente());
        dto.setTelefono(solicitud.getTelefono());
        dto.setEmail(solicitud.getEmail());
        dto.setCiudad(solicitud.getCiudad());
        dto.setCantidad(solicitud.getCantidad());
        dto.setTalle(solicitud.getTalle());
        dto.setColor(solicitud.getColor());
        dto.setDescripcion(solicitud.getDescripcion());
        dto.setImagenReferencia(solicitud.getImagenReferencia());
        dto.setEstado(solicitud.getEstado());
        dto.setFechaSolicitud(solicitud.getFechaSolicitud());

        return dto;
    }
}