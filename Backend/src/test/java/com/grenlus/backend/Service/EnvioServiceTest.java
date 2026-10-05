package com.grenlus.backend.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.grenlus.backend.DTO.ActualizarEnvioDTO;
import com.grenlus.backend.DTO.EnvioResponseDTO;
import com.grenlus.backend.Entity.EstadoEnvio;
import com.grenlus.backend.Entity.EstadoPago;
import com.grenlus.backend.Entity.EstadoPedido;
import com.grenlus.backend.Entity.DetallePedido;
import com.grenlus.backend.Entity.Indumentaria;
import com.grenlus.backend.Entity.MetodoEntrega;
import com.grenlus.backend.Entity.Pedido;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Repository.PedidoRepository;

/*
 * Circuito del envío:
 *
 * PENDIENTE -> PREPARANDO -> DESPACHADO -> ENTREGADO
 */
class EnvioServiceTest {

    private PedidoRepository pedidoRepository;

    private EnvioService envioService;

    @BeforeEach
    void setUp() {

        pedidoRepository =
                mock(PedidoRepository.class);

        envioService =
                new EnvioService(
                        pedidoRepository
                );

        /*
         * save() devuelve el mismo pedido que
         * recibe, como hace JPA.
         */
        when(
                pedidoRepository.save(
                        any(Pedido.class)
                )
        ).thenAnswer(
                invocacion ->
                        invocacion.getArgument(0)
        );
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private Pedido pedidoConEnvio(
            EstadoEnvio estadoEnvio,
            EstadoPago estadoPago
    ) {

        Pedido pedido = new Pedido();

        pedido.setId(1L);
        pedido.setMetodoEntrega(
                MetodoEntrega.ENVIO_DOMICILIO);
        pedido.setEstadoEnvio(estadoEnvio);
        pedido.setEstadoPago(estadoPago);
        pedido.setEstado(EstadoPedido.PAGADO);
        pedido.setSubtotalProductos(
                new BigDecimal("40000"));
        pedido.setCostoEnvio(
                new BigDecimal("8500"));
        pedido.setTotal(
                new BigDecimal("48500"));

        when(
                pedidoRepository.findById(1L)
        ).thenReturn(
                Optional.of(pedido)
        );

        return pedido;
    }

    private ActualizarEnvioDTO dto(
            EstadoEnvio estado,
            String seguimiento
    ) {

        return new ActualizarEnvioDTO(
                estado,
                null,
                seguimiento
        );
    }

    // =========================================================
    // MÉTODO DE ENTREGA
    // =========================================================

    @Test
    void rechazaPedidosQueNoSonEnvioADomicilio() {

        Pedido pedido = new Pedido();

        pedido.setId(1L);
        pedido.setMetodoEntrega(
                MetodoEntrega.RETIRO);
        pedido.setEstadoEnvio(
                EstadoEnvio.NO_CORRESPONDE);

        when(
                pedidoRepository.findById(1L)
        ).thenReturn(
                Optional.of(pedido)
        );

        assertThatThrownBy(
                () ->
                        envioService.actualizarEnvio(
                                1L,
                                dto(
                                        EstadoEnvio.PREPARANDO,
                                        null
                                )
                        )
        )
                .isInstanceOf(
                        BadRequestException.class)
                .hasMessageContaining(
                        "envío a domicilio");
    }

    // =========================================================
    // PAGO
    // =========================================================

    @Test
    void noAvanzaSiElPagoNoEstaAprobado() {

        pedidoConEnvio(
                EstadoEnvio.PENDIENTE,
                EstadoPago.PENDIENTE
        );

        assertThatThrownBy(
                () ->
                        envioService.actualizarEnvio(
                                1L,
                                dto(
                                        EstadoEnvio.PREPARANDO,
                                        null
                                )
                        )
        )
                .isInstanceOf(
                        BadRequestException.class)
                .hasMessageContaining(
                        "pago");
    }

    @Test
    void permiteGuardarSeguimientoAunqueElPagoEstePendiente() {

        Pedido pedido =
                pedidoConEnvio(
                        EstadoEnvio.PENDIENTE,
                        EstadoPago.PENDIENTE
                );

        EnvioResponseDTO respuesta =
                envioService.actualizarEnvio(
                        1L,
                        dto(null, "AR123456789")
                );

        assertThat(
                respuesta.getCodigoSeguimiento())
                .isEqualTo("AR123456789");

        assertThat(
                pedido.getEstadoEnvio())
                .isEqualTo(EstadoEnvio.PENDIENTE);
    }

    @Test
    void guardaLaCotizacionYActualizaElTotalDelPedido() {

        Pedido pedido =
                pedidoConEnvio(
                        EstadoEnvio.PENDIENTE,
                        EstadoPago.PENDIENTE
                );

        EnvioResponseDTO respuesta =
                envioService.actualizarEnvio(
                        1L,
                        new ActualizarEnvioDTO(
                                null,
                                new BigDecimal("1200"),
                                null
                        )
                );

        assertThat(pedido.isEnvioCotizado())
                .isTrue();

        assertThat(respuesta.getCostoEnvio())
                .isEqualByComparingTo("1200");

        assertThat(respuesta.getTotal())
                .isEqualByComparingTo("41200");
    }

    @Test
    void listaEnviosSegunSiEstanArchivados() {

        Pedido archivado = pedidoConEnvio(
                EstadoEnvio.ENTREGADO,
                EstadoPago.APROBADO
        );
        archivado.setArchivado(true);

        when(
                pedidoRepository.findByMetodoEntregaAndArchivadoOrderByFechaPedidoDesc(
                        MetodoEntrega.ENVIO_DOMICILIO,
                        true
                )
        ).thenReturn(List.of(archivado));

        List<EnvioResponseDTO> resultado =
                envioService.listarEnvios(null, true);

        assertThat(resultado)
                .hasSize(1);
        assertThat(resultado.get(0).isArchivado())
                .isTrue();
    }

    @Test
    void incluyeProductosPreciosYDatosLogisticosEnElEnvio() {

        Pedido pedido = pedidoConEnvio(
                EstadoEnvio.PENDIENTE,
                EstadoPago.PENDIENTE
        );
        Indumentaria producto = new Indumentaria();
        producto.setId(12L);
        producto.setNombre("Remera personalizada");
        producto.setPesoGramos(250);
        producto.setLargoEnvioCm(30);
        producto.setAnchoEnvioCm(24);
        producto.setAltoEnvioCm(3);

        DetallePedido detalle = new DetallePedido();
        detalle.setId(4L);
        detalle.setProducto(producto);
        detalle.setCantidad(2);
        detalle.setPrecioUnitario(new BigDecimal("15000"));
        detalle.setSubtotal(new BigDecimal("30000"));
        pedido.setDetalles(List.of(detalle));
        pedido.setSubtotalProductos(new BigDecimal("30000"));

        EnvioResponseDTO respuesta =
                envioService.buscarEnvio(1L);

        assertThat(respuesta.getSubtotalProductos())
                .isEqualByComparingTo("30000");
        assertThat(respuesta.getDetalles())
                .hasSize(1);
        assertThat(respuesta.getDetalles().get(0).getProductoNombre())
                .isEqualTo("Remera personalizada");
        assertThat(respuesta.getDetalles().get(0).getCantidad())
                .isEqualTo(2);
        assertThat(respuesta.getDetalles().get(0).getSubtotal())
                .isEqualByComparingTo("30000");
        assertThat(respuesta.getDetalles().get(0).getPesoGramos())
                .isEqualTo(250);
        assertThat(respuesta.getDetalles().get(0).getLargoEnvioCm())
                .isEqualTo(30);
    }

    @Test
    void rechazaCostosDeEnvioNegativos() {

        pedidoConEnvio(
                EstadoEnvio.PENDIENTE,
                EstadoPago.PENDIENTE
        );

        assertThatThrownBy(
                () -> envioService.actualizarEnvio(
                        1L,
                        new ActualizarEnvioDTO(
                                null,
                                new BigDecimal("-1"),
                                null
                        )
                )
        )
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("no puede ser negativo");
    }

    @Test
    void noPermiteCambiarLaCotizacionDespuesDeAprobadoElPago() {

        pedidoConEnvio(
                EstadoEnvio.PENDIENTE,
                EstadoPago.APROBADO
        );

        assertThatThrownBy(
                () -> envioService.actualizarEnvio(
                        1L,
                        new ActualizarEnvioDTO(
                                null,
                                new BigDecimal("1200"),
                                null
                        )
                )
        )
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("después de iniciar o aprobar el pago");
    }

    // =========================================================
    // AVANCE
    // =========================================================

    @Test
    void avanzaAPreparandoYSincronizaElPedido() {

        Pedido pedido =
                pedidoConEnvio(
                        EstadoEnvio.PENDIENTE,
                        EstadoPago.APROBADO
                );

        EnvioResponseDTO respuesta =
                envioService.actualizarEnvio(
                        1L,
                        dto(
                                EstadoEnvio.PREPARANDO,
                                null
                        )
                );

        assertThat(
                respuesta.getEstadoEnvio())
                .isEqualTo(EstadoEnvio.PREPARANDO);

        assertThat(
                pedido.getEstado())
                .isEqualTo(
                        EstadoPedido.EN_PREPARACION);

        assertThat(
                pedido.getFechaDespacho())
                .isNull();
    }

    @Test
    void noDespachaSinCodigoDeSeguimiento() {

        pedidoConEnvio(
                EstadoEnvio.PREPARANDO,
                EstadoPago.APROBADO
        );

        assertThatThrownBy(
                () ->
                        envioService.actualizarEnvio(
                                1L,
                                dto(
                                        EstadoEnvio.DESPACHADO,
                                        null
                                )
                        )
        )
                .isInstanceOf(
                        BadRequestException.class)
                .hasMessageContaining(
                        "código de seguimiento");
    }

    @Test
    void despachaConSeguimientoYRegistraLaFecha() {

        Pedido pedido =
                pedidoConEnvio(
                        EstadoEnvio.PREPARANDO,
                        EstadoPago.APROBADO
                );

        EnvioResponseDTO respuesta =
                envioService.actualizarEnvio(
                        1L,
                        dto(
                                EstadoEnvio.DESPACHADO,
                                "AR987654321"
                        )
                );

        assertThat(
                respuesta.getEstadoEnvio())
                .isEqualTo(EstadoEnvio.DESPACHADO);

        assertThat(
                respuesta.getCodigoSeguimiento())
                .isEqualTo("AR987654321");

        assertThat(
                pedido.getFechaDespacho())
                .isNotNull();

        assertThat(
                pedido.getEstado())
                .isEqualTo(EstadoPedido.LISTO);
    }

    @Test
    void entregaRegistraAmbasFechas() {

        Pedido pedido =
                pedidoConEnvio(
                        EstadoEnvio.PREPARANDO,
                        EstadoPago.APROBADO
                );

        pedido.setCodigoSeguimiento(
                "AR111222333");

        envioService.actualizarEnvio(
                1L,
                dto(
                        EstadoEnvio.ENTREGADO,
                        null
                )
        );

        assertThat(
                pedido.getEstadoEnvio())
                .isEqualTo(EstadoEnvio.ENTREGADO);

        assertThat(
                pedido.getFechaDespacho())
                .isNotNull();

        assertThat(
                pedido.getFechaEntrega())
                .isNotNull();

        assertThat(
                pedido.getEstado())
                .isEqualTo(EstadoPedido.ENTREGADO);
    }

    // =========================================================
    // RETROCESOS
    // =========================================================

    @Test
    void noPermiteVolverAtras() {

        pedidoConEnvio(
                EstadoEnvio.DESPACHADO,
                EstadoPago.APROBADO
        );

        assertThatThrownBy(
                () ->
                        envioService.actualizarEnvio(
                                1L,
                                dto(
                                        EstadoEnvio.PREPARANDO,
                                        null
                                )
                        )
        )
                .isInstanceOf(
                        BadRequestException.class)
                .hasMessageContaining(
                        "no puede volver");
    }

    @Test
    void rechazaNoCorresponde() {

        pedidoConEnvio(
                EstadoEnvio.PENDIENTE,
                EstadoPago.APROBADO
        );

        assertThatThrownBy(
                () ->
                        envioService.actualizarEnvio(
                                1L,
                                dto(
                                        EstadoEnvio.NO_CORRESPONDE,
                                        null
                                )
                        )
        )
                .isInstanceOf(
                        BadRequestException.class);
    }

    @Test
    void repetirElMismoEstadoNoRompe() {

        Pedido pedido =
                pedidoConEnvio(
                        EstadoEnvio.ENTREGADO,
                        EstadoPago.APROBADO
                );

        envioService.actualizarEnvio(
                1L,
                dto(
                        EstadoEnvio.ENTREGADO,
                        null
                )
        );

        assertThat(
                pedido.getEstadoEnvio())
                .isEqualTo(EstadoEnvio.ENTREGADO);
    }

    // =========================================================
    // LISTADOS
    // =========================================================

    @Test
    void listarSinFiltroTraeSoloEnviosADomicilio() {

        /*
         * Armamos el pedido antes de stubear, si no
         * Mockito ve un stub abierto dentro de otro.
         */
        Pedido pedido =
                pedidoConEnvio(
                        EstadoEnvio.PENDIENTE,
                        EstadoPago.APROBADO
                );

        when(
                pedidoRepository
                        .findByMetodoEntregaAndArchivadoOrderByFechaPedidoDesc(
                                MetodoEntrega.ENVIO_DOMICILIO,
                                false
                        )
        ).thenReturn(
                List.of(pedido)
        );

        List<EnvioResponseDTO> envios =
                envioService.listarEnvios(null);

        assertThat(envios)
                .hasSize(1);

        assertThat(
                envios.get(0).getMetodoEntrega())
                .isEqualTo(
                        MetodoEntrega.ENVIO_DOMICILIO);
    }

    @Test
    void misEnviosExigeUsuario() {

        assertThatThrownBy(
                () ->
                        envioService.listarMisEnvios(
                                "  "
                        )
        )
                .isInstanceOf(
                        BadRequestException.class);
    }
}
