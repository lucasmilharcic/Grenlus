package com.grenlus.backend.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.grenlus.backend.Service.MercadoPagoService;

@RestController
@RequestMapping("/pagos/mercadopago")
public class MercadoPagoController {

    private final MercadoPagoService mercadoPagoService;

    public MercadoPagoController(
            MercadoPagoService mercadoPagoService) {

        this.mercadoPagoService =
                mercadoPagoService;
    }

    // =========================================================
    // CREAR PREFERENCIA
    // =========================================================

    @PostMapping("/preferencia")
    public ResponseEntity<Map<String, String>>
            crearPreferencia(

            @RequestParam Long pedidoId
    ) {

        return ResponseEntity.ok(
                mercadoPagoService
                        .crearPreferencia(
                                pedidoId
                        )
        );
    }

    // =========================================================
    // WEBHOOK
    // =========================================================

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody(required = false)
            JsonNode body,

            @RequestParam(
                    value = "id",
                    required = false
            )
            String idQuery,

            @RequestParam(
                    value = "data.id",
                    required = false
            )
            String dataIdQuery
    ) {

        String paymentId =
                obtenerPaymentId(
                        body,
                        idQuery,
                        dataIdQuery
                );

        /*
         * Si la notificación no es de payment
         * simplemente respondemos 200.
         */
        if (paymentId == null ||
                paymentId.isBlank()) {

            return ResponseEntity.ok().build();
        }

        mercadoPagoService
                .procesarPago(
                        paymentId
                );

        return ResponseEntity.ok().build();
    }

    private String obtenerPaymentId(
            JsonNode body,
            String idQuery,
            String dataIdQuery) {

        if (body != null) {

            JsonNode type =
                    body.get("type");

            /*
             * Ignoramos otros tipos de eventos.
             */
            if (type != null &&
                    !type.isNull() &&
                    !"payment".equalsIgnoreCase(
                            type.asText()
                    )) {

                return null;
            }

            JsonNode data =
                    body.get("data");

            if (data != null &&
                    !data.isNull()) {

                JsonNode id =
                        data.get("id");

                if (id != null &&
                        !id.isNull()) {

                    return id.asText();
                }
            }
        }

        if (dataIdQuery != null &&
                !dataIdQuery.isBlank()) {

            return dataIdQuery;
        }

        return idQuery;
    }
}