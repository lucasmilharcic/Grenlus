package com.grenlus.backend.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.grenlus.backend.Exception.BadRequestException;

@Service
public class CorreoArgentinoService {

    private final RestClient restClient;

    private final String apiKey;

    private final String agreement;

    public CorreoArgentinoService(
            RestClient.Builder restClientBuilder,
            @Value("${correo-argentino.api-url}") String apiUrl,
            @Value("${correo-argentino.api-key}") String apiKey,
            @Value("${correo-argentino.agreement}") String agreement
    ) {

        this.apiKey = apiKey;
        this.agreement = agreement;

        this.restClient = restClientBuilder
                .baseUrl(apiUrl)
                .build();
    }

    // =========================================================
    // VALIDAR CREDENCIALES
    // =========================================================

    public boolean validarCredenciales() {

        validarConfiguracion();

        try {

            restClient
                    .get()
                    .uri("/v1/auth")
                    .header(
                            "Authorization",
                            "Apikey " + apiKey
                    )
                    .header(
                            "agreement",
                            agreement
                    )
                    .retrieve()
                    .toBodilessEntity();

            return true;

        } catch (RestClientResponseException e) {

            String cuerpo = e.getResponseBodyAsString();

            if (
                    cuerpo == null
                    || cuerpo.isBlank()
            ) {
                cuerpo = "Sin detalle";
            }

            throw new BadRequestException(
                    "Correo Argentino respondió HTTP "
                    + e.getStatusCode().value()
                    + ". Respuesta: "
                    + cuerpo
            );

        } catch (Exception e) {

            throw new BadRequestException(
                    "No se pudo conectar con Correo Argentino. "
                    + "Detalle: "
                    + e.getMessage()
            );
        }
    }

    // =========================================================
    // CONFIGURACIÓN
    // =========================================================

    private void validarConfiguracion() {

        if (
                apiKey == null
                || apiKey.isBlank()
        ) {

            throw new BadRequestException(
                    "CORREO_ARGENTINO_API_KEY no está configurada."
            );
        }

        if (
                agreement == null
                || agreement.isBlank()
        ) {

            throw new BadRequestException(
                    "CORREO_ARGENTINO_AGREEMENT no está configurado."
            );
        }
    }
}