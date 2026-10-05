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

/*
 * Vista del pedido enfocada en la logística.
 *
 * La usa el panel de envíos del admin y también
 * la pantalla de seguimiento del cliente.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnvioResponseDTO {

    private Long pedidoId;

    private LocalDateTime fechaPedido;

    // =========================================================
    // DESTINATARIO
    // =========================================================

    private String nombreCliente;

    private String telefono;

    private String email;

    private String direccion;

    private String ciudad;

    private String provincia;

    private String codigoPostal;

    // =========================================================
    // ENTREGA
    // =========================================================

    private MetodoEntrega metodoEntrega;

    private EstadoEnvio estadoEnvio;

    private BigDecimal costoEnvio;

    private boolean envioCotizado;

    private boolean archivado;

    private String codigoSeguimiento;

    private LocalDateTime fechaDespacho;

    private LocalDateTime fechaEntrega;

    // =========================================================
    // CONTEXTO DEL PEDIDO
    // =========================================================

    private EstadoPedido estado;

    private EstadoPago estadoPago;

    private MetodoPago metodoPago;

    private BigDecimal total;

    private Integer cantidadItems;

    private BigDecimal subtotalProductos;

    private List<DetallePedidoResponseDTO> detalles;
}
