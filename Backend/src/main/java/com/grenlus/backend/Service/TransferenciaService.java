package com.grenlus.backend.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.grenlus.backend.Entity.EstadoPago;
import com.grenlus.backend.Entity.EstadoPedido;
import com.grenlus.backend.Entity.MetodoEntrega;
import com.grenlus.backend.Entity.MetodoPago;
import com.grenlus.backend.Entity.Pedido;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Repository.PedidoRepository;

@Service
public class TransferenciaService {

    private final PedidoRepository pedidoRepository;

    private final FileStorageService fileStorageService;

    private final String alias;

    private final String cbu;

    private final String titular;

    public TransferenciaService(
            PedidoRepository pedidoRepository,
            FileStorageService fileStorageService,

            @Value("${transferencia.alias:}")
            String alias,

            @Value("${transferencia.cbu:}")
            String cbu,

            @Value("${transferencia.titular:}")
            String titular) {

        this.pedidoRepository =
                pedidoRepository;

        this.fileStorageService =
                fileStorageService;

        this.alias = alias;

        this.cbu = cbu;

        this.titular = titular;
    }

    // =========================================================
    // DATOS BANCARIOS
    // =========================================================

    public Map<String, String> obtenerDatos() {

        Map<String, String> datos =
                new LinkedHashMap<>();

        datos.put(
                "alias",
                alias != null ? alias : ""
        );

        datos.put(
                "cbu",
                cbu != null ? cbu : ""
        );

        datos.put(
                "titular",
                titular != null ? titular : ""
        );

        return datos;
    }

    // =========================================================
    // SUBIR COMPROBANTE
    // =========================================================

    @Transactional
    public Map<String, String> subirComprobante(
            Long pedidoId,
            MultipartFile archivo) {

        Pedido pedido =
                pedidoRepository.findById(pedidoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pedido no encontrado"
                                )
                        );

        if (pedido.getMetodoPago()
                != MetodoPago.TRANSFERENCIA) {

            throw new BadRequestException(
                    "Este pedido no utiliza transferencia bancaria."
            );
        }

        if (pedido.getMetodoEntrega() == MetodoEntrega.ENVIO_DOMICILIO
                && !pedido.isEnvioCotizado()
                && (pedido.getCostoEnvio() == null
                        || pedido.getCostoEnvio().compareTo(BigDecimal.ZERO) <= 0)) {

            throw new BadRequestException(
                    "El envío todavía no fue cotizado. Esperá a recibir el total antes de pagar."
            );
        }

        if (archivo == null ||
                archivo.isEmpty()) {

            throw new BadRequestException(
                    "Debés seleccionar un comprobante."
            );
        }

        String contentType =
                archivo.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new BadRequestException(
                    "El comprobante debe ser una imagen."
            );
        }

        long maximo =
                15L * 1024L * 1024L;

        if (archivo.getSize() > maximo) {

            throw new BadRequestException(
                    "El comprobante no puede superar los 15 MB."
            );
        }

        String ruta =
                fileStorageService
                        .guardar(archivo);

        pedido.setComprobanteTransferencia(
                ruta
        );

        /*
         * Sigue pendiente.
         * El admin tiene que verificar
         * que el dinero realmente llegó.
         */
        pedido.setEstadoPago(
                EstadoPago.PENDIENTE
        );

        pedidoRepository.save(pedido);

        return Map.of(
                "ruta",
                ruta,

                "mensaje",
                "Comprobante enviado correctamente."
        );
    }

    // =========================================================
    // APROBAR TRANSFERENCIA
    // =========================================================

    @Transactional
    public void aprobarTransferencia(
            Long pedidoId) {

        Pedido pedido =
                pedidoRepository.findById(pedidoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pedido no encontrado"
                                )
                        );

        if (pedido.getMetodoPago()
                != MetodoPago.TRANSFERENCIA) {

            throw new BadRequestException(
                    "El pedido no utiliza transferencia bancaria."
            );
        }

        validarEnvioCotizadoAntesDeAprobar(pedido);

        if (pedido.getEstadoPago() != EstadoPago.PENDIENTE) {

            throw new BadRequestException(
                    "Solo se pueden aprobar pagos pendientes."
            );
        }

        if (pedido.getComprobanteTransferencia() == null) {

            throw new BadRequestException(
                    "El pedido no tiene comprobante de transferencia."
            );
        }

        marcarPagoAprobado(pedido);
    }

    @Transactional
    public void aprobarPagoManualmente(
            Long pedidoId) {

        Pedido pedido =
                pedidoRepository.findById(pedidoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pedido no encontrado"
                                )
                        );

        validarEnvioCotizadoAntesDeAprobar(pedido);

        if (pedido.getEstadoPago() != EstadoPago.PENDIENTE) {

            throw new BadRequestException(
                    "Solo se pueden aprobar pagos pendientes."
            );
        }

        marcarPagoAprobado(pedido);
    }

    private void validarEnvioCotizadoAntesDeAprobar(
            Pedido pedido) {

        if (pedido.getEstado() == EstadoPedido.CANCELADO) {

            throw new BadRequestException(
                    "No se puede aprobar el pago de un pedido cancelado."
            );
        }

        if (pedido.getMetodoEntrega() == MetodoEntrega.ENVIO_DOMICILIO
                && !pedido.isEnvioCotizado()
                && (pedido.getCostoEnvio() == null
                        || pedido.getCostoEnvio().compareTo(BigDecimal.ZERO) <= 0)) {

            throw new BadRequestException(
                    "No se puede aprobar el pago antes de cotizar el envío."
            );
        }
    }

    private void marcarPagoAprobado(Pedido pedido) {

        pedido.setEstadoPago(
                EstadoPago.APROBADO
        );

        pedido.setEstado(
                EstadoPedido.PAGADO
        );

        pedidoRepository.save(pedido);
    }

    // =========================================================
    // RECHAZAR TRANSFERENCIA
    // =========================================================

    @Transactional
    public void rechazarTransferencia(
            Long pedidoId) {

        Pedido pedido =
                pedidoRepository.findById(pedidoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pedido no encontrado"
                                )
                        );

        if (pedido.getMetodoPago()
                != MetodoPago.TRANSFERENCIA) {

            throw new BadRequestException(
                    "El pedido no utiliza transferencia bancaria."
            );
        }

        pedido.setEstadoPago(
                EstadoPago.RECHAZADO
        );

        pedidoRepository.save(pedido);
    }
}