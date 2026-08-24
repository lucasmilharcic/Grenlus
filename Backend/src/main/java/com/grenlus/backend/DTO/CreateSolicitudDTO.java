package com.grenlus.backend.DTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSolicitudDTO {
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
    private List<CreateDisenoDTO> disenos;
}
