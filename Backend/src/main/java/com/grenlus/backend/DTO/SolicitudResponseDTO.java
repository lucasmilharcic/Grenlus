package com.grenlus.backend.DTO;

import java.time.LocalDateTime;
import java.util.List;

import com.grenlus.backend.Entity.EstadoSolicitud;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudResponseDTO {
    private Long id;
    private Long productoId;
    private String nombreCliente;
    private String telefono;
    private String email;
    private String ciudad;
    private Integer cantidad;
    private String talle;
    private String color;
    private String descripcion;
    private String imagenReferencia;
    private EstadoSolicitud estado;
    private LocalDateTime fechaSolicitud;
    private List<DisenoResponseDTO> disenos;
}
