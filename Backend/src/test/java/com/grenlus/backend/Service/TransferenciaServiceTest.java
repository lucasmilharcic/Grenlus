package com.grenlus.backend.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.grenlus.backend.Entity.EstadoPago;
import com.grenlus.backend.Entity.EstadoPedido;
import com.grenlus.backend.Entity.MetodoEntrega;
import com.grenlus.backend.Entity.MetodoPago;
import com.grenlus.backend.Entity.Pedido;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Repository.PedidoRepository;

class TransferenciaServiceTest {

    private PedidoRepository pedidoRepository;
    private TransferenciaService transferenciaService;

    @BeforeEach
    void setUp() {

        pedidoRepository = mock(PedidoRepository.class);

        transferenciaService = new TransferenciaService(
                pedidoRepository,
                mock(FileStorageService.class),
                "",
                "",
                ""
        );

        when(pedidoRepository.save(any(Pedido.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));
    }

    @Test
    void aprobacionManualApruebaTransferenciaPendienteSinComprobante() {

        Pedido pedido = pedidoPendienteTransferencia();
        pedido.setComprobanteTransferencia(null);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        transferenciaService.aprobarPagoManualmente(1L);

        assertThat(pedido.getEstadoPago()).isEqualTo(EstadoPago.APROBADO);
        assertThat(pedido.getEstado()).isEqualTo(EstadoPedido.PAGADO);
        verify(pedidoRepository).save(pedido);
    }

    @Test
    void aprobacionManualApruebaMercadoPagoPendienteLuegoDeConfirmarIngreso() {
        Pedido pedido = pedidoPendienteTransferencia();
        pedido.setMetodoPago(MetodoPago.MERCADO_PAGO);
        pedido.setMetodoEntrega(MetodoEntrega.ENVIO_DOMICILIO);
        pedido.setEnvioCotizado(true);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        transferenciaService.aprobarPagoManualmente(1L);

        assertThat(pedido.getEstadoPago()).isEqualTo(EstadoPago.APROBADO);
        assertThat(pedido.getEstado()).isEqualTo(EstadoPedido.PAGADO);
        verify(pedidoRepository).save(pedido);
    }

    @Test
    void aprobacionManualNoApruebaEnvioSinCotizar() {

        Pedido pedido = pedidoPendienteTransferencia();
        pedido.setMetodoEntrega(MetodoEntrega.ENVIO_DOMICILIO);
        pedido.setEnvioCotizado(false);
        pedido.setCostoEnvio(BigDecimal.ZERO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThatThrownBy(() -> transferenciaService.aprobarPagoManualmente(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("antes de cotizar el envío");
    }

    @Test
    void aprobacionManualSoloAceptaPagosPendientes() {

        Pedido pedido = pedidoPendienteTransferencia();
        pedido.setEstadoPago(EstadoPago.RECHAZADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThatThrownBy(() -> transferenciaService.aprobarPagoManualmente(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Solo se pueden aprobar pagos pendientes");
    }

    @Test
    void aprobacionManualNoApruebaPedidosCancelados() {

        Pedido pedido = pedidoPendienteTransferencia();
        pedido.setEstado(EstadoPedido.CANCELADO);
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));

        assertThatThrownBy(() -> transferenciaService.aprobarPagoManualmente(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("pedido cancelado");
    }

    private Pedido pedidoPendienteTransferencia() {

        Pedido pedido = new Pedido();
        pedido.setId(1L);
        pedido.setMetodoPago(MetodoPago.TRANSFERENCIA);
        pedido.setMetodoEntrega(MetodoEntrega.RETIRO);
        pedido.setEstadoPago(EstadoPago.PENDIENTE);
        pedido.setEstado(EstadoPedido.PENDIENTE);
        return pedido;
    }
}
