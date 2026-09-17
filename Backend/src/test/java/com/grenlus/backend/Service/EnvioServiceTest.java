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
                        mock(ZipnovaService.class),
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
                        .findByMetodoEntregaOrderByFechaPedidoDesc(
                                MetodoEntrega.ENVIO_DOMICILIO
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
