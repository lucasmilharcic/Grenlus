package com.grenlus.backend.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.grenlus.backend.Entity.EstadoEnvio;
import com.grenlus.backend.Entity.EstadoPago;
import com.grenlus.backend.Entity.EstadoPedido;
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
public class PedidoResponseDTO {

    private Long id;

    private String nombreCliente;
    private String telefono;
    private String email;
    private String direccion;
    private String ciudad;
    private String provincia;
    private String codigoPostal;

    private MetodoEntrega metodoEntrega;
    private EstadoEnvio estadoEnvio;
    private Long tarifaEnvioId;
    private String tarifaEnvioNombre;
    private BigDecimal costoEnvio;
    private String codigoSeguimiento;

    /*
     * Snapshot del transporte elegido y fechas reales
     * del envío. Lo usa la pantalla de mis compras.
     */
    private String carrierEnvioNombre;
    private String serviceNombreEnvio;
    private LocalDateTime fechaDespacho;
    private LocalDateTime fechaEntrega;

    private BigDecimal subtotalProductos;
    private BigDecimal total;

    private EstadoPedido estado;
    private EstadoPago estadoPago;
    private MetodoPago metodoPago;

    private String mercadoPagoUrl;
    private String mercadoPagoPreferenceId;

    private String comprobanteTransferencia;

    private LocalDateTime fechaPedido;

    private List<DetallePedidoResponseDTO> detalles;
}