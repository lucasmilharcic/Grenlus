package com.grenlus.backend.DTO;

import java.util.List;

import com.grenlus.backend.Entity.MetodoEntrega;
import com.grenlus.backend.Entity.MetodoPago;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePedidoDTO {

    private String nombreCliente;
    private String telefono;
    private String email;
    private String direccion;
    private String ciudad;
    private String provincia;
    private String codigoPostal;

    private MetodoEntrega metodoEntrega;
    private Long tarifaEnvioId;

    private MetodoPago metodoPago;

    private List<DetallePedidoDTO> detalles;
}