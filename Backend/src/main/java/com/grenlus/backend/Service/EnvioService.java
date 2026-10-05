package com.grenlus.backend.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grenlus.backend.DTO.ActualizarEnvioDTO;
import com.grenlus.backend.DTO.DetallePedidoResponseDTO;
import com.grenlus.backend.DTO.EnvioResponseDTO;
import com.grenlus.backend.Entity.DetallePedido;
import com.grenlus.backend.Entity.EstadoEnvio;
import com.grenlus.backend.Entity.EstadoPago;
import com.grenlus.backend.Entity.EstadoPedido;
import com.grenlus.backend.Entity.MetodoEntrega;
import com.grenlus.backend.Entity.Pedido;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Repository.PedidoRepository;

@Service
public class EnvioService {

    private final PedidoRepository pedidoRepository;

    public EnvioService(
            PedidoRepository pedidoRepository
    ) {
        this.pedidoRepository =
                pedidoRepository;
    }

    // =========================================================
    // ADMIN - LISTAR ENVÍOS
    // =========================================================

    /*
     * Solamente los pedidos con envío a domicilio generan
     * una entrega que haya que seguir.
     *
     * RETIRO y COORDINAR se resuelven en el local, por eso
     * quedan fuera del panel.
     */

    @Transactional(readOnly = true)
    public List<EnvioResponseDTO> listarEnvios(
            EstadoEnvio estadoEnvio
    ) {

        return listarEnvios(estadoEnvio, false);
    }

    @Transactional(readOnly = true)
    public List<EnvioResponseDTO> listarEnvios(
            EstadoEnvio estadoEnvio,
            boolean archivado
    ) {

        List<Pedido> pedidos =
                estadoEnvio == null

                        ? pedidoRepository
                                .findByMetodoEntregaAndArchivadoOrderByFechaPedidoDesc(
                                        MetodoEntrega.ENVIO_DOMICILIO,
                                        archivado
                                )

                        : pedidoRepository
                                .findByMetodoEntregaAndEstadoEnvioAndArchivadoOrderByFechaPedidoDesc(
                                        MetodoEntrega.ENVIO_DOMICILIO,
                                        estadoEnvio,
                                        archivado
                                );

        return pedidos
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    // =========================================================
    // ADMIN - BUSCAR UN ENVÍO
    // =========================================================

    @Transactional(readOnly = true)
    public EnvioResponseDTO buscarEnvio(
            Long pedidoId
    ) {

        return convertirADTO(
                obtenerPedido(pedidoId)
        );
    }

    // =========================================================
    // CLIENTE - MIS ENVÍOS
    // =========================================================

    @Transactional(readOnly = true)
    public List<EnvioResponseDTO> listarMisEnvios(
            String username
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {

            throw new BadRequestException(
                    "Usuario no autenticado."
            );
        }

        return pedidoRepository
                .findByUsuarioUsernameAndMetodoEntregaOrderByFechaPedidoDesc(
                        username,
                        MetodoEntrega.ENVIO_DOMICILIO
                )
                .stream()
                .map(this::convertirADTO)
                .toList();
    }

    // =========================================================
    // ADMIN - ACTUALIZAR ENVÍO
    // =========================================================

    /*
     * Mueve el envío dentro del circuito
     *
     * PENDIENTE -> PREPARANDO -> DESPACHADO -> ENTREGADO
     *
     * y de paso mantiene sincronizado el estado general
     * del pedido.
     */

    @Transactional
    public EnvioResponseDTO actualizarEnvio(
            Long pedidoId,
            ActualizarEnvioDTO dto
    ) {

        Pedido pedido =
                obtenerPedido(pedidoId);

        if (
                pedido.getMetodoEntrega() !=
                MetodoEntrega.ENVIO_DOMICILIO
        ) {

            throw new BadRequestException(
                    "El pedido no tiene envío a domicilio."
            );
        }

        if (dto == null) {

            throw new BadRequestException(
                    "No se recibieron datos del envío."
            );
        }

        BigDecimal costoCotizado = dto.getCostoEnvio();

        if (costoCotizado != null) {

            if (costoCotizado.compareTo(BigDecimal.ZERO) < 0) {

                throw new BadRequestException(
                        "El costo del envío no puede ser negativo."
                );
            }

            BigDecimal costoActual = pedido.getCostoEnvio() == null
                    ? BigDecimal.ZERO
                    : pedido.getCostoEnvio();

            if (costoActual.compareTo(costoCotizado) != 0
                    && (pedido.getEstadoPago() == EstadoPago.APROBADO
                            || pedido.getMercadoPagoPreferenceId() != null
                            || pedido.getComprobanteTransferencia() != null)) {

                throw new BadRequestException(
                        "No se puede cambiar el costo del envío después de iniciar o aprobar el pago."
                );
            }

            pedido.setCostoEnvio(costoCotizado);
            pedido.setTotal(
                    (pedido.getSubtotalProductos() == null
                            ? BigDecimal.ZERO
                            : pedido.getSubtotalProductos())
                            .add(costoCotizado)
            );
            pedido.setEnvioCotizado(true);
        }

        // =====================================================
        // CÓDIGO DE SEGUIMIENTO
        // =====================================================

        String codigoSeguimiento =
                limpiarTexto(
                        dto.getCodigoSeguimiento()
                );

        if (codigoSeguimiento != null) {

            pedido.setCodigoSeguimiento(
                    codigoSeguimiento
            );
        }

        // =====================================================
        // ESTADO
        // =====================================================

        /*
         * Si no mandan estado es porque solamente están
         * cargando o corrigiendo el seguimiento.
         */
        if (dto.getEstadoEnvio() != null) {

            aplicarEstado(
                    pedido,
                    dto.getEstadoEnvio()
            );
        }

        return convertirADTO(
                pedidoRepository.save(pedido)
        );
    }

    // =========================================================
    // APLICAR ESTADO
    // =========================================================

    private void aplicarEstado(
            Pedido pedido,
            EstadoEnvio nuevoEstado
    ) {

        if (
                nuevoEstado ==
                EstadoEnvio.NO_CORRESPONDE
        ) {

            throw new BadRequestException(
                    "NO_CORRESPONDE no es un estado válido para un envío a domicilio."
            );
        }

        EstadoEnvio estadoActual =
                pedido.getEstadoEnvio() != null
                        ? pedido.getEstadoEnvio()
                        : EstadoEnvio.PENDIENTE;

        if (estadoActual == nuevoEstado) {

            return;
        }

        if (
                orden(nuevoEstado) <
                orden(estadoActual)
        ) {

            throw new BadRequestException(
                    "El envío no puede volver de "
                            + texto(estadoActual)
                            + " a "
                            + texto(nuevoEstado)
                            + "."
            );
        }

        /*
         * No preparamos mercadería que todavía
         * no está paga.
         */
        if (
                pedido.getEstadoPago() !=
                EstadoPago.APROBADO
        ) {

            throw new BadRequestException(
                    "El pago del pedido todavía no está aprobado."
            );
        }

        if (
                nuevoEstado ==
                EstadoEnvio.DESPACHADO &&
                limpiarTexto(
                        pedido.getCodigoSeguimiento()
                ) == null
        ) {

            throw new BadRequestException(
                    "Cargá el código de seguimiento antes de despachar el pedido."
            );
        }

        pedido.setEstadoEnvio(nuevoEstado);

        // =====================================================
        // FECHAS
        // =====================================================

        LocalDateTime ahora =
                LocalDateTime.now();

        if (
                nuevoEstado ==
                EstadoEnvio.DESPACHADO &&
                pedido.getFechaDespacho() == null
        ) {

            pedido.setFechaDespacho(ahora);
        }

        if (
                nuevoEstado ==
                EstadoEnvio.ENTREGADO
        ) {

            /*
             * Si el admin salta de PREPARANDO a ENTREGADO
             * igual dejamos registrada la salida.
             */
            if (pedido.getFechaDespacho() == null) {

                pedido.setFechaDespacho(ahora);
            }

            if (pedido.getFechaEntrega() == null) {

                pedido.setFechaEntrega(ahora);
            }
        }

        // =====================================================
        // ESTADO GENERAL DEL PEDIDO
        // =====================================================

        sincronizarEstadoPedido(
                pedido,
                nuevoEstado
        );
    }

    // =========================================================
    // SINCRONIZAR PEDIDO
    // =========================================================

    private void sincronizarEstadoPedido(
            Pedido pedido,
            EstadoEnvio estadoEnvio
    ) {

        if (
                pedido.getEstado() ==
                EstadoPedido.CANCELADO
        ) {

            return;
        }

        switch (estadoEnvio) {

            case PREPARANDO ->
                    pedido.setEstado(
                            EstadoPedido.EN_PREPARACION
                    );

            case DESPACHADO ->
                    pedido.setEstado(
                            EstadoPedido.LISTO
                    );

            case ENTREGADO ->
                    pedido.setEstado(
                            EstadoPedido.ENTREGADO
                    );

            default -> {
                // PENDIENTE no mueve el estado del pedido
            }
        }
    }

    // =========================================================
    // ORDEN DEL CIRCUITO
    // =========================================================

    private int orden(
            EstadoEnvio estado
    ) {

        return switch (estado) {

            case NO_CORRESPONDE -> 0;
            case PENDIENTE -> 1;
            case PREPARANDO -> 2;
            case DESPACHADO -> 3;
            case ENTREGADO -> 4;
        };
    }

    private String texto(
            EstadoEnvio estado
    ) {

        return estado
                .name()
                .replace("_", " ")
                .toLowerCase();
    }

    // =========================================================
    // OBTENER PEDIDO
    // =========================================================

    private Pedido obtenerPedido(
            Long pedidoId
    ) {

        return pedidoRepository
                .findById(pedidoId)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Pedido no encontrado"
                                )
                );
    }

    // =========================================================
    // PEDIDO -> DTO
    // =========================================================

    private EnvioResponseDTO convertirADTO(
            Pedido pedido
    ) {

        EnvioResponseDTO dto =
                new EnvioResponseDTO();

        dto.setPedidoId(
                pedido.getId());

        dto.setFechaPedido(
                pedido.getFechaPedido());

        dto.setNombreCliente(
                pedido.getNombreCliente());

        dto.setTelefono(
                pedido.getTelefono());

        dto.setEmail(
                pedido.getEmail());

        dto.setDireccion(
                pedido.getDireccion());

        dto.setCiudad(
                pedido.getCiudad());

        dto.setProvincia(
                pedido.getProvincia());

        dto.setCodigoPostal(
                pedido.getCodigoPostal());

        dto.setMetodoEntrega(
                pedido.getMetodoEntrega());

        dto.setEstadoEnvio(
                pedido.getEstadoEnvio());

        dto.setCostoEnvio(
                pedido.getCostoEnvio()
        );

        dto.setEnvioCotizado(
                pedido.isEnvioCotizado()
                        || (pedido.getCostoEnvio() != null
                                && pedido.getCostoEnvio()
                                        .compareTo(BigDecimal.ZERO) > 0));

        dto.setArchivado(
                pedido.isArchivado());

        dto.setCodigoSeguimiento(
                pedido.getCodigoSeguimiento());

        dto.setFechaDespacho(
                pedido.getFechaDespacho());

        dto.setFechaEntrega(
                pedido.getFechaEntrega());

        dto.setEstado(
                pedido.getEstado());

        dto.setEstadoPago(
                pedido.getEstadoPago());

        dto.setMetodoPago(
                pedido.getMetodoPago());

        dto.setTotal(
                pedido.getTotal());

        dto.setSubtotalProductos(
                pedido.getSubtotalProductos());

        int cantidadItems = 0;
        List<DetallePedidoResponseDTO> detalles = new ArrayList<>();

        if (pedido.getDetalles() != null) {

            for (
                    DetallePedido detalle :
                    pedido.getDetalles()
            ) {

                if (detalle.getCantidad() != null) {

                    cantidadItems +=
                            detalle.getCantidad();
                }

                DetallePedidoResponseDTO detalleDTO =
                        new DetallePedidoResponseDTO();
                detalleDTO.setId(detalle.getId());
                detalleDTO.setCantidad(detalle.getCantidad());
                detalleDTO.setTalle(detalle.getTalle());
                detalleDTO.setColor(detalle.getColor());
                detalleDTO.setPrecioUnitario(detalle.getPrecioUnitario());
                detalleDTO.setSubtotal(detalle.getSubtotal());

                if (detalle.getTamanoEstampa() != null) {
                    detalleDTO.setTamanoEstampa(
                            detalle.getTamanoEstampa().name());
                }

                if (detalle.getProducto() != null) {
                    detalleDTO.setProductoId(
                            detalle.getProducto().getId());
                    detalleDTO.setProductoNombre(
                            detalle.getProducto().getNombre());
                    detalleDTO.setPesoGramos(
                            detalle.getProducto().getPesoGramos());
                    detalleDTO.setLargoEnvioCm(
                            detalle.getProducto().getLargoEnvioCm());
                    detalleDTO.setAnchoEnvioCm(
                            detalle.getProducto().getAnchoEnvioCm());
                    detalleDTO.setAltoEnvioCm(
                            detalle.getProducto().getAltoEnvioCm());
                }

                detalles.add(detalleDTO);
            }
        }

        dto.setCantidadItems(cantidadItems);
        dto.setDetalles(detalles);

        return dto;
    }

    // =========================================================
    // UTILIDADES
    // =========================================================

    private String limpiarTexto(
            String valor
    ) {

        if (valor == null) {

            return null;
        }

        String limpio =
                valor.trim();

        return limpio.isEmpty()
                ? null
                : limpio;
    }
}
