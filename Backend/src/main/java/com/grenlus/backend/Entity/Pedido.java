package com.grenlus.backend.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private String nombreCliente;
    private String telefono;
    private String email;
    private String direccion;
    private String ciudad;
    private String provincia;
    private String codigoPostal;

    @Enumerated(EnumType.STRING)
    private MetodoEntrega metodoEntrega;

    @Enumerated(EnumType.STRING)
    private EstadoEnvio estadoEnvio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarifa_envio_id")
    private TarifaEnvio tarifaEnvio;

    private BigDecimal costoEnvio;
    private String codigoSeguimiento;

    private BigDecimal subtotalProductos;
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private EstadoPedido estado;

    @Enumerated(EnumType.STRING)
    private EstadoPago estadoPago;

    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago;

    private String mercadoPagoUrl;
    private String mercadoPagoPreferenceId;
    private String mercadoPagoPaymentId;

    private String comprobanteTransferencia;

    private LocalDateTime fechaPedido;

    @OneToMany(
            mappedBy = "pedido",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DetallePedido> detalles =
            new ArrayList<>();

    @PrePersist
    public void prePersist() {

        if (fechaPedido == null) {
            fechaPedido = LocalDateTime.now();
        }

        if (estado == null) {
            estado = EstadoPedido.PENDIENTE;
        }

        if (estadoPago == null) {
            estadoPago = EstadoPago.PENDIENTE;
        }

        if (subtotalProductos == null) {
            subtotalProductos = BigDecimal.ZERO;
        }

        if (costoEnvio == null) {
            costoEnvio = BigDecimal.ZERO;
        }

        if (total == null) {
            total = BigDecimal.ZERO;
        }

        if (metodoEntrega == null) {
            metodoEntrega = MetodoEntrega.RETIRO;
        }

        if (estadoEnvio == null) {

            if (metodoEntrega == MetodoEntrega.ENVIO_DOMICILIO) {
                estadoEnvio = EstadoEnvio.PENDIENTE;
            } else {
                estadoEnvio = EstadoEnvio.NO_CORRESPONDE;
            }
        }
    }

    public void agregarDetalle(
            DetallePedido detalle) {

        detalles.add(detalle);
        detalle.setPedido(this);
    }
}