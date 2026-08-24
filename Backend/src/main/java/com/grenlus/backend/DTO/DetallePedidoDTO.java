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
public class DetallePedidoDTO {

    private Long productoId;

    private Integer cantidad;

    private String talle;

    private String color;

    private List<DisenoPedidoDTO> disenos;
}