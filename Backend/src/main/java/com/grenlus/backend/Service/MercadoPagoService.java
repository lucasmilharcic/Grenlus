package com.grenlus.backend.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grenlus.backend.Entity.DetallePedido;
import com.grenlus.backend.Entity.EstadoPago;
import com.grenlus.backend.Entity.EstadoPedido;
import com.grenlus.backend.Entity.MetodoPago;
import com.grenlus.backend.Entity.Pedido;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Exception.PagoNoDisponibleException;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Repository.PedidoRepository;

@Service
public class MercadoPagoService {

    private final PedidoRepository pedidoRepository;

    private final RestClient mercadoPagoClient;

    private final String accessToken;

    private final String frontendUrl;

    private final String backendPublicUrl;

    public MercadoPagoService(
            PedidoRepository pedidoRepository,
            @Value("${mercadopago.access-token:}") String accessToken,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${app.backend-public-url:}") String backendPublicUrl) {

        this.pedidoRepository = pedidoRepository;

        this.accessToken = accessToken;

        this.frontendUrl = quitarBarraFinal(frontendUrl);

        this.backendPublicUrl =
                quitarBarraFinal(backendPublicUrl);

        this.mercadoPagoClient =
                RestClient.builder()
                        .baseUrl(
                                "https://api.mercadopago.com"
                        )
                        .defaultHeader(
                                HttpHeaders.CONTENT_TYPE,
                                MediaType.APPLICATION_JSON_VALUE
                        )
                        .build();
    }

    // =========================================================
    // CREAR PREFERENCIA
    // =========================================================

    @Transactional
    public Map<String, String> crearPreferencia(
            Long pedidoId) {

        validarConfiguracion();

        Pedido pedido =
                pedidoRepository.findById(pedidoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pedido no encontrado"
                                )
                        );

        if (pedido.getMetodoPago()
                != MetodoPago.MERCADO_PAGO) {

            throw new BadRequestException(
                    "El pedido no utiliza Mercado Pago."
            );
        }

        if (pedido.getTotal() == null ||
                pedido.getTotal()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new BadRequestException(
                    "El pedido no tiene un total válido."
            );
        }

        /*
         * Si ya creamos una preferencia,
         * devolvemos la existente.
         */
        if (pedido.getMercadoPagoUrl() != null &&
                !pedido.getMercadoPagoUrl().isBlank()) {

            return Map.of(
                    "pedidoId",
                    pedido.getId().toString(),

                    "preferenceId",
                    pedido.getMercadoPagoPreferenceId(),

                    "url",
                    pedido.getMercadoPagoUrl()
            );
        }

        List<Map<String, Object>> items =
                new ArrayList<>();

        for (DetallePedido detalle :
                pedido.getDetalles()) {

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "id",
                    detalle.getProducto()
                            .getId()
                            .toString()
            );

            item.put(
                    "title",
                    detalle.getProducto()
                            .getNombre()
            );

            item.put(
                    "quantity",
                    detalle.getCantidad()
            );

            item.put(
                    "currency_id",
                    "ARS"
            );

            /*
             * Precio que YA calculó el backend
             * al crear el Pedido.
             */
            item.put(
                    "unit_price",
                    detalle.getPrecioUnitario()
            );

            items.add(item);
        }

        /*
         * Si el pedido tiene costo de envío, lo agregamos
         * como un ítem más de Mercado Pago.
         *
         * Así la suma de los items coincide exactamente
         * con pedido.getTotal(), que luego validamos
         * cuando llega el webhook.
         */
        if (pedido.getCostoEnvio() != null &&
                pedido.getCostoEnvio()
                        .compareTo(BigDecimal.ZERO) > 0) {

            Map<String, Object> envioItem =
                    new LinkedHashMap<>();

            envioItem.put(
                    "id",
                    "envio"
            );

            envioItem.put(
                    "title",
                    "Envío a domicilio"
            );

            envioItem.put(
                    "quantity",
                    1
            );

            envioItem.put(
                    "currency_id",
                    "ARS"
            );

            envioItem.put(
                    "unit_price",
                    pedido.getCostoEnvio()
            );

            items.add(envioItem);
        }

        Map<String, Object> backUrls =
                new LinkedHashMap<>();

        backUrls.put(
                "success",
                frontendUrl
                        + "/pago/resultado?estado=success"
        );

        backUrls.put(
                "pending",
                frontendUrl
                        + "/pago/resultado?estado=pending"
        );

        backUrls.put(
                "failure",
                frontendUrl
                        + "/pago/resultado?estado=failure"
        );

        Map<String, Object> request =
                new LinkedHashMap<>();

        request.put(
                "items",
                items
        );

        /*
         * Esto es fundamental.
         *
         * Mercado Pago conserva este valor
         * en el pago y después podemos saber
         * a qué Pedido de Grenlus corresponde.
         */
        request.put(
                "external_reference",
                pedido.getId().toString()
        );

        request.put(
                "back_urls",
                backUrls
        );

        request.put(
                "auto_return",
                "approved"
        );

        /*
         * Solo enviamos notification_url
         * cuando tenemos una URL pública.
         *
         * localhost no puede recibir
         * webhooks desde Mercado Pago.
         */
        if (backendPublicUrl != null &&
                !backendPublicUrl.isBlank()) {

            request.put(
                    "notification_url",
                    backendPublicUrl
                            + "/pagos/mercadopago/webhook"
            );
        }

        JsonNode respuesta;

        try {

            respuesta =
                    mercadoPagoClient
                            .post()
                            .uri(
                                    "/checkout/preferences"
                            )
                            .header(
                                    HttpHeaders.AUTHORIZATION,
                                    "Bearer " + accessToken
                            )
                            .body(request)
                            .retrieve()
                            .body(JsonNode.class);

        } catch (Exception e) {

            throw errorDeMercadoPago(
                    "No se pudo crear el pago en Mercado Pago",
                    e
            );
        }

        if (respuesta == null) {

            throw new PagoNoDisponibleException(
                    "Mercado Pago devolvió una respuesta vacía."
            );
        }

        String preferenceId =
                leerTexto(
                        respuesta,
                        "id"
                );

        String initPoint =
                leerTexto(
                        respuesta,
                        "init_point"
                );

        if (preferenceId == null ||
                initPoint == null) {

            throw new PagoNoDisponibleException(
                    "Mercado Pago no devolvió los datos necesarios para iniciar el pago."
            );
        }

        pedido.setMercadoPagoPreferenceId(
                preferenceId
        );

        pedido.setMercadoPagoUrl(
                initPoint
        );

        pedidoRepository.save(pedido);

        return Map.of(
                "pedidoId",
                pedido.getId().toString(),

                "preferenceId",
                preferenceId,

                "url",
                initPoint
        );
    }

    // =========================================================
    // PROCESAR WEBHOOK
    // =========================================================

    @Transactional
    public void procesarPago(
            String paymentId) {

        if (paymentId == null ||
                paymentId.isBlank()) {

            throw new BadRequestException(
                    "Payment ID vacío."
            );
        }

        validarConfiguracion();

        JsonNode pago;

        try {

            pago =
                    mercadoPagoClient
                            .get()
                            .uri(
                                    "/v1/payments/{id}",
                                    paymentId
                            )
                            .header(
                                    HttpHeaders.AUTHORIZATION,
                                    "Bearer " + accessToken
                            )
                            .retrieve()
                            .body(JsonNode.class);

        } catch (Exception e) {

            throw errorDeMercadoPago(
                    "No se pudo consultar el pago en Mercado Pago",
                    e
            );
        }

        if (pago == null) {

            throw new PagoNoDisponibleException(
                    "Mercado Pago devolvió un pago vacío."
            );
        }

        String externalReference =
                leerTexto(
                        pago,
                        "external_reference"
                );

        if (externalReference == null ||
                externalReference.isBlank()) {

            throw new BadRequestException(
                    "El pago no tiene referencia al pedido."
            );
        }

        Long pedidoId;

        try {

            pedidoId =
                    Long.valueOf(
                            externalReference
                    );

        } catch (NumberFormatException e) {

            throw new BadRequestException(
                    "Referencia de pedido inválida."
            );
        }

        Pedido pedido =
                pedidoRepository.findById(pedidoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Pedido asociado al pago no encontrado."
                                )
                        );

        /*
         * Seguridad adicional:
         * solamente un pedido de Mercado Pago
         * puede ser actualizado por este flujo.
         */
        if (pedido.getMetodoPago()
                != MetodoPago.MERCADO_PAGO) {

            throw new BadRequestException(
                    "El pago no corresponde a un pedido de Mercado Pago."
            );
        }

        BigDecimal importeMercadoPago =
                leerDecimal(
                        pago,
                        "transaction_amount"
                );

        /*
         * No marcamos nada como pagado si
         * Mercado Pago devuelve otro monto.
         */
        if (importeMercadoPago == null ||
                pedido.getTotal() == null ||
                importeMercadoPago
                        .compareTo(
                                pedido.getTotal()
                        ) != 0) {

            throw new BadRequestException(
                    "El importe informado por Mercado Pago no coincide con el total del pedido."
            );
        }

        String status =
                leerTexto(
                        pago,
                        "status"
                );

        pedido.setMercadoPagoPaymentId(
                paymentId
        );

        actualizarEstados(
                pedido,
                status
        );

        pedidoRepository.save(pedido);
    }

    // =========================================================
    // ACTUALIZAR ESTADOS
    // =========================================================

    private void actualizarEstados(
            Pedido pedido,
            String status) {

        if (status == null) {

            pedido.setEstadoPago(
                    EstadoPago.PENDIENTE
            );

            return;
        }

        switch (status.toLowerCase()) {

            case "approved" -> {

                pedido.setEstadoPago(
                        EstadoPago.APROBADO
                );

                /*
                 * Ya está pago.
                 * Ahora el negocio puede prepararlo.
                 */
                pedido.setEstado(
                        EstadoPedido.PAGADO
                );
            }

            case "rejected" ->

                    pedido.setEstadoPago(
                            EstadoPago.RECHAZADO
                    );

            case "cancelled" ->

                    pedido.setEstadoPago(
                            EstadoPago.CANCELADO
                    );

            /*
             * pending e in_process
             * siguen esperando acreditación.
             */
            default ->

                    pedido.setEstadoPago(
                            EstadoPago.PENDIENTE
                    );
        }
    }

    // =========================================================
    // UTILIDADES
    // =========================================================

    private void validarConfiguracion() {

        if (accessToken == null ||
                accessToken.isBlank()) {

            throw new PagoNoDisponibleException(
                    "Mercado Pago no está configurado: falta el token de acceso (MP_ACCESS_TOKEN)."
            );
        }
    }

    // =========================================================
    // ERRORES DE LA API
    // =========================================================

    /*
     * Traduce el fallo de una llamada a Mercado Pago a un
     * mensaje que diga qué pasó, en vez del error genérico.
     *
     * Si MP respondió, usamos su código y su "message"
     * (ej: 401 "invalid access token"). Si ni respondió,
     * es un problema de conexión.
     */
    private PagoNoDisponibleException errorDeMercadoPago(
            String accion,
            Exception e) {

        if (e instanceof RestClientResponseException respuestaError) {

            int status =
                    respuestaError.getStatusCode().value();

            String detalle =
                    leerMensajeDeError(
                            respuestaError.getResponseBodyAsString()
                    );

            if (status == 401 || status == 403) {

                return new PagoNoDisponibleException(
                        accion + ": Mercado Pago rechazó el token de acceso ("
                                + status + (detalle != null ? " - " + detalle : "")
                                + "). Revisá MP_ACCESS_TOKEN.",
                        e
                );
            }

            return new PagoNoDisponibleException(
                    accion + ": Mercado Pago respondió "
                            + status
                            + (detalle != null ? " - " + detalle : "")
                            + ".",
                    e
            );
        }

        if (e instanceof ResourceAccessException) {

            return new PagoNoDisponibleException(
                    accion + ": no se pudo conectar con Mercado Pago.",
                    e
            );
        }

        return new PagoNoDisponibleException(
                accion + ".",
                e
        );
    }

    private String leerMensajeDeError(
            String cuerpo) {

        if (cuerpo == null ||
                cuerpo.isBlank()) {

            return null;
        }

        try {

            JsonNode json =
                    new ObjectMapper().readTree(cuerpo);

            String mensaje =
                    leerTexto(
                            json,
                            "message"
                    );

            return mensaje != null && !mensaje.isBlank()
                    ? mensaje
                    : null;

        } catch (Exception ignorado) {

            // Cuerpo que no es JSON: no lo mostramos al cliente
            return null;
        }
    }

    private String leerTexto(
            JsonNode node,
            String campo) {

        JsonNode valor =
                node.get(campo);

        if (valor == null ||
                valor.isNull()) {

            return null;
        }

        return valor.asText();
    }

    private BigDecimal leerDecimal(
            JsonNode node,
            String campo) {

        JsonNode valor =
                node.get(campo);

        if (valor == null ||
                valor.isNull() ||
                !valor.isNumber()) {

            return null;
        }

        return valor.decimalValue();
    }

    private static String quitarBarraFinal(
            String valor) {

        if (valor == null) {
            return null;
        }

        String resultado =
                valor.trim();

        while (resultado.endsWith("/")) {

            resultado =
                    resultado.substring(
                            0,
                            resultado.length() - 1
                    );
        }

        return resultado;
    }
}