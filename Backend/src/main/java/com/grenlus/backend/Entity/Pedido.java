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

    // =========================================================
    // ENVÍO ZIPNOVA
    // =========================================================

    /*
     * Guardamos un snapshot de la opción seleccionada.
     *
     * No guardamos una relación con TarifaEnvio porque
     * las tarifas ahora vienen dinámicamente desde Zipnova.
     */

    private String opcionEnvioId;

    private Long carrierEnvioId;

    private String carrierEnvioNombre;

    private String logisticTypeEnvio;

    private String serviceTypeEnvio;

    private String serviceNombreEnvio;

    private BigDecimal costoEnvio;

    private String codigoSeguimiento;

    // =========================================================
    // TOTALES
    // =========================================================

    private BigDecimal subtotalProductos;

    private BigDecimal total;

    // =========================================================
    // ESTADOS
    // =========================================================

    @Enumerated(EnumType.STRING)
    private EstadoPedido estado;

    @Enumerated(EnumType.STRING)
    private EstadoPago estadoPago;

    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago;

    // =========================================================
    // MERCADO PAGO
    // =========================================================

    private String mercadoPagoUrl;

    private String mercadoPagoPreferenceId;

    private String mercadoPagoPaymentId;

    // =========================================================
    // TRANSFERENCIA
    // =========================================================

    private String comprobanteTransferencia;

    // =========================================================
    // FECHA
    // =========================================================

    private LocalDateTime fechaPedido;

    // =========================================================
    // DETALLES
    // =========================================================

    @OneToMany(
            mappedBy = "pedido",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DetallePedido> detalles =
            new ArrayList<>();

    // =========================================================
    // PRE PERSIST
    // =========================================================

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

            if (
                    metodoEntrega ==
                            MetodoEntrega.ENVIO_DOMICILIO
            ) {

                estadoEnvio =
                        EstadoEnvio.PENDIENTE;

            } else {

                estadoEnvio =
                        EstadoEnvio.NO_CORRESPONDE;
            }
        }
    }

    // =========================================================
    // AGREGAR DETALLE
    // =========================================================

    public void agregarDetalle(
            DetallePedido detalle
    ) {

        detalles.add(detalle);

        detalle.setPedido(this);
    }
}