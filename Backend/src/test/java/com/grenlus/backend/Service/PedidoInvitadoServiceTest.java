package com.grenlus.backend.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.grenlus.backend.Entity.Pedido;
import com.grenlus.backend.Entity.EstadoPago;
import com.grenlus.backend.Entity.EstadoPedido;
import com.grenlus.backend.Entity.MetodoEntrega;
import com.grenlus.backend.Entity.MetodoPago;
import com.grenlus.backend.Entity.Usuario;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Repository.AreaPersonalizacionRepository;
import com.grenlus.backend.Repository.PedidoRepository;
import com.grenlus.backend.Repository.ProductoRepository;
import com.grenlus.backend.Repository.UsuarioRepository;

class PedidoInvitadoServiceTest {

    private PedidoRepository pedidoRepository;

    private PedidoService pedidoService;

    @BeforeEach
    void setUp() {
        pedidoRepository = mock(PedidoRepository.class);
        pedidoService = new PedidoService(
                pedidoRepository,
                mock(ProductoRepository.class),
                mock(AreaPersonalizacionRepository.class),
                mock(UsuarioRepository.class),
                mock(EnvioService.class)
        );
        when(pedidoRepository.save(any(Pedido.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));
    }

    @Test
    void devuelvePedidoConCodigoDeAccesoValido() throws Exception {
        Pedido pedido = new Pedido();
        pedido.setId(42L);
        pedido.setGuestAccessTokenHash(hash("token-secreto"));
        when(pedidoRepository.findById(42L))
                .thenReturn(Optional.of(pedido));

        assertThat(pedidoService.obtenerPedidoInvitado(
                42L,
                "token-secreto"
        ).getId()).isEqualTo(42L);
    }

    @Test
    void noRevelaPedidoConCodigoDeAccesoInvalido() throws Exception {
        Pedido pedido = new Pedido();
        pedido.setId(42L);
        pedido.setGuestAccessTokenHash(hash("token-secreto"));
        when(pedidoRepository.findById(42L))
                .thenReturn(Optional.of(pedido));

        assertThatThrownBy(() ->
                pedidoService.obtenerPedidoInvitado(42L, "incorrecto")
        ).isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Pedido no encontrado");
    }

    @Test
    void invitadoPuedeElegirMedioDePagoDespuesDeCotizar() throws Exception {
        Pedido pedido = pedidoCotizado(hash("token-secreto"));
        pedido.setMetodoPago(MetodoPago.TRANSFERENCIA);
        when(pedidoRepository.findById(42L))
                .thenReturn(Optional.of(pedido));

        var actualizado = pedidoService.actualizarMetodoPagoInvitado(
                42L,
                "token-secreto",
                MetodoPago.MERCADO_PAGO
        );

        assertThat(pedido.getMetodoPago()).isEqualTo(MetodoPago.MERCADO_PAGO);
        assertThat(actualizado.getMetodoPago()).isEqualTo(MetodoPago.MERCADO_PAGO);
    }

    @Test
    void noPermiteElegirMedioDePagoSinCotizacion() throws Exception {
        Pedido pedido = pedidoCotizado(hash("token-secreto"));
        pedido.setEnvioCotizado(false);
        when(pedidoRepository.findById(42L))
                .thenReturn(Optional.of(pedido));

        assertThatThrownBy(() -> pedidoService.actualizarMetodoPagoInvitado(
                42L,
                "token-secreto",
                MetodoPago.TRANSFERENCIA
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("envío esté cotizado");
    }

    @Test
    void clientePuedeCambiarMetodoDePagoSoloEnSuPedidoCotizado() {
        Pedido pedido = pedidoCotizado(null);
        Usuario usuario = new Usuario();
        usuario.setUsername("cliente@example.com");
        pedido.setUsuario(usuario);
        when(pedidoRepository.findById(42L))
                .thenReturn(Optional.of(pedido));

        var actualizado = pedidoService.actualizarMetodoPagoCuenta(
                42L,
                "cliente@example.com",
                MetodoPago.TRANSFERENCIA
        );

        assertThat(actualizado.getMetodoPago()).isEqualTo(MetodoPago.TRANSFERENCIA);
    }

    @Test
    void noPermiteActualizarPagoDePedidoDeOtroUsuario() {
        Pedido pedido = pedidoCotizado(null);
        Usuario usuario = new Usuario();
        usuario.setUsername("propietario@example.com");
        pedido.setUsuario(usuario);
        when(pedidoRepository.findById(42L))
                .thenReturn(Optional.of(pedido));

        assertThatThrownBy(() -> pedidoService.actualizarMetodoPagoCuenta(
                42L,
                "otro@example.com",
                MetodoPago.TRANSFERENCIA
        ))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Pedido no encontrado");
    }

    @Test
    void noCreaPedidoSinSesion() {
        assertThatThrownBy(() -> pedidoService.crearPedido(null, null))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Iniciá sesión");
    }

    private Pedido pedidoCotizado(String tokenHash) {
        Pedido pedido = new Pedido();
        pedido.setId(42L);
        pedido.setGuestAccessTokenHash(tokenHash);
        pedido.setMetodoEntrega(MetodoEntrega.ENVIO_DOMICILIO);
        pedido.setEnvioCotizado(true);
        pedido.setEstadoPago(EstadoPago.PENDIENTE);
        pedido.setEstado(EstadoPedido.PENDIENTE);
        return pedido;
    }

    private String hash(String token) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(digest);
    }
}
