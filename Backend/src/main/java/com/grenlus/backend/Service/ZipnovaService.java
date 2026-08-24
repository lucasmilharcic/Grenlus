package com.grenlus.backend.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grenlus.backend.DTO.CotizacionEnvioResponseDTO;
import com.grenlus.backend.DTO.CotizarEnvioDTO;
import com.grenlus.backend.DTO.ItemCotizacionEnvioDTO;
import com.grenlus.backend.DTO.OpcionEnvioDTO;
import com.grenlus.backend.Entity.Producto;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Repository.ProductoRepository;

@Service
public class ZipnovaService {

        private final ProductoRepository productoRepository;

        private final RestClient restClient;

        private final ObjectMapper objectMapper;

        @Value("${zipnova.api-key}")
        private String apiKey;

        @Value("${zipnova.api-secret}")
        private String apiSecret;

        @Value("${zipnova.account-id}")
        private Long accountId;

        @Value("${zipnova.origin-id}")
        private Long originId;

        public ZipnovaService(
                        ProductoRepository productoRepository,
                        ObjectMapper objectMapper,
                        RestClient.Builder restClientBuilder,
                        @Value("${zipnova.api-url}") String apiUrl) {

                this.productoRepository = productoRepository;

                this.objectMapper = objectMapper;

                this.restClient = restClientBuilder
                                .baseUrl(apiUrl)
                                .build();
        }

        // =========================================================
        // COTIZAR
        // =========================================================

        public CotizacionEnvioResponseDTO cotizar(
                        CotizarEnvioDTO dto) {

                validarConfiguracion();

                validarSolicitud(dto);

                List<Map<String, Object>> itemsZipnova = construirItems(
                                dto.getItems());

                Map<String, Object> destination = new LinkedHashMap<>();

                destination.put(
                                "city",
                                dto.getLocalidad().trim());

                destination.put(
                                "state",
                                dto.getProvincia().trim());

                destination.put(
                                "zipcode",
                                dto.getCodigoPostal().trim());

                destination.put(
                                "country",
                                "AR");

                Map<String, Object> body = new LinkedHashMap<>();

                body.put(
                                "account_id",
                                accountId);

                body.put(
                                "origin_id",
                                originId);

                body.put(
                                "declared_value",
                                obtenerValorDeclarado(dto));

                body.put(
                                "destination",
                                destination);

                body.put(
                                "items",
                                itemsZipnova);

                body.put(
                                "type_packaging",
                                "dynamic");

                body.put(
                                "source",
                                "grenlus");

                String respuesta;

                try {

                        respuesta = restClient
                                        .post()
                                        .uri("/shipments/quote")
                                        .header(
                                                        HttpHeaders.AUTHORIZATION,
                                                        crearBasicAuth())
                                        .contentType(
                                                        MediaType.APPLICATION_JSON)
                                        .accept(
                                                        MediaType.APPLICATION_JSON)
                                        .body(body)
                                        .retrieve()
                                        .body(String.class);

                } catch (Exception e) {

                        throw new BadRequestException(
                                        "No se pudo obtener la cotización de envío de Zipnova.");
                }

                if (respuesta == null ||
                                respuesta.isBlank()) {

                        throw new BadRequestException(
                                        "Zipnova no devolvió una cotización.");
                }

                return convertirRespuesta(
                                respuesta,
                                dto);
        }

        // =========================================================
        // ITEMS
        // =========================================================

        private List<Map<String, Object>> construirItems(
                        List<ItemCotizacionEnvioDTO> items) {

                List<Map<String, Object>> resultado = new ArrayList<>();

                for (ItemCotizacionEnvioDTO item : items) {

                        if (item == null ||
                                        item.getProductoId() == null) {

                                throw new BadRequestException(
                                                "Hay un producto inválido en el carrito.");
                        }

                        int cantidad = item.getCantidad() == null
                                        ? 1
                                        : item.getCantidad();

                        if (cantidad <= 0) {

                                throw new BadRequestException(
                                                "La cantidad del producto debe ser mayor a cero.");
                        }

                        Producto producto = productoRepository
                                        .findById(
                                                        item.getProductoId())
                                        .orElseThrow(() -> new BadRequestException(
                                                        "Producto no encontrado: "
                                                                        + item.getProductoId()));

                        validarDatosLogisticos(
                                        producto);

                        /*
                         * Mandamos una entrada por unidad.
                         *
                         * Esto permite que Zipnova haga el
                         * empaquetado dinámico.
                         */
                        for (int unidad = 0; unidad < cantidad; unidad++) {

                                Map<String, Object> itemZipnova = new LinkedHashMap<>();

                                itemZipnova.put(
                                                "sku",
                                                "GRENLUS-"
                                                                + producto.getId()
                                                                + "-"
                                                                + (unidad + 1));

                                itemZipnova.put(
                                                "description",
                                                producto.getNombre());

                                itemZipnova.put(
                                                "weight",
                                                producto.getPesoGramos());

                                itemZipnova.put(
                                                "length",
                                                producto.getLargoEnvioCm());

                                itemZipnova.put(
                                                "width",
                                                producto.getAnchoEnvioCm());

                                itemZipnova.put(
                                                "height",
                                                producto.getAltoEnvioCm());

                                /*
                                 * 1 = clasificación General.
                                 */
                                itemZipnova.put(
                                                "classification_id",
                                                1);

                                resultado.add(
                                                itemZipnova);
                        }
                }

                return resultado;
        }

        // =========================================================
        // RESPUESTA ZIPNOVA
        // =========================================================

        private CotizacionEnvioResponseDTO convertirRespuesta(
                        String respuesta,
                        CotizarEnvioDTO dto) {

                try {

                        JsonNode root = objectMapper.readTree(
                                        respuesta);

                        JsonNode allResults = root.path(
                                        "all_results");

                        CotizacionEnvioResponseDTO response = new CotizacionEnvioResponseDTO();

                        JsonNode destination = root.path(
                                        "destination");

                        response.setCodigoPostal(
                                        destination
                                                        .path("zipcode")
                                                        .asText(
                                                                        dto.getCodigoPostal()));

                        response.setLocalidad(
                                        destination
                                                        .path("city")
                                                        .asText(
                                                                        dto.getLocalidad()));

                        response.setProvincia(
                                        destination
                                                        .path("state")
                                                        .asText(
                                                                        dto.getProvincia()));

                        List<OpcionEnvioDTO> opciones = new ArrayList<>();

                        if (allResults.isArray()) {

                                for (JsonNode result : allResults) {

                                        /*
                                         * Zipnova puede devolver resultados
                                         * no seleccionables.
                                         */
                                        if (!result
                                                        .path("selectable")
                                                        .asBoolean(false)) {

                                                continue;
                                        }

                                        JsonNode carrier = result.path(
                                                        "carrier");

                                        JsonNode service = result.path(
                                                        "service_type");

                                        JsonNode delivery = result.path(
                                                        "delivery_time");

                                        JsonNode amounts = result.path(
                                                        "amounts");

                                        System.out.println(
                                                        "\n================ ZIPNOVA ================");

                                        System.out.println(
                                                        "CARRIER: " +
                                                                        carrier.path("name").asText());

                                        System.out.println(
                                                        "LOGISTIC TYPE: " +
                                                                        result.path("logistic_type").asText());

                                        System.out.println(
                                                        "SERVICE: " +
                                                                        service.path("name").asText());

                                        System.out.println(
                                                        "AMOUNTS:");

                                        System.out.println(
                                                        amounts.toPrettyString());

                                        System.out.println(
                                                        "=========================================\n");

                                        Long carrierId = carrier
                                                        .path("id")
                                                        .isNumber()
                                                                        ? carrier
                                                                                        .path("id")
                                                                                        .asLong()
                                                                        : null;

                                        String carrierNombre = carrier
                                                        .path("name")
                                                        .asText("");

                                        String carrierLogo = carrier
                                                        .path("logo")
                                                        .asText(null);

                                        String logisticType = result
                                                        .path("logistic_type")
                                                        .asText("");

                                        String serviceType = service
                                                        .path("code")
                                                        .asText("");

                                        String serviceNombre = service
                                                        .path("name")
                                                        .asText("");

                                        BigDecimal precio = amounts
                                                        .path("price_incl_tax")
                                                        .decimalValue();

                                        Integer diasMin = delivery
                                                        .path("min")
                                                        .isNumber()
                                                                        ? delivery
                                                                                        .path("min")
                                                                                        .asInt()
                                                                        : null;

                                        Integer diasMax = delivery
                                                        .path("max")
                                                        .isNumber()
                                                                        ? delivery
                                                                                        .path("max")
                                                                                        .asInt()
                                                                        : null;

                                        String opcionId = String.valueOf(
                                                        carrierId)
                                                        + ":"
                                                        + logisticType
                                                        + ":"
                                                        + serviceType;

                                        OpcionEnvioDTO opcion = new OpcionEnvioDTO(
                                                        opcionId,
                                                        carrierId,
                                                        carrierNombre,
                                                        carrierLogo,
                                                        logisticType,
                                                        serviceType,
                                                        serviceNombre,
                                                        precio,
                                                        diasMin,
                                                        diasMax);

                                        opciones.add(
                                                        opcion);
                                }
                        }

                        if (opciones.isEmpty()) {

                                throw new BadRequestException(
                                                "No hay opciones de envío disponibles para ese destino.");
                        }

                        response.setOpciones(
                                        opciones);

                        return response;

                } catch (BadRequestException e) {

                        throw e;

                } catch (Exception e) {

                        throw new BadRequestException(
                                        "No se pudo interpretar la respuesta de Zipnova.");
                }
        }

        // =========================================================
        // VALIDACIONES
        // =========================================================

        private void validarSolicitud(
                        CotizarEnvioDTO dto) {

                if (dto == null) {

                        throw new BadRequestException(
                                        "Los datos de envío son obligatorios.");
                }

                if (dto.getCodigoPostal() == null ||
                                dto.getCodigoPostal().isBlank()) {

                        throw new BadRequestException(
                                        "Ingresá el código postal.");
                }

                if (dto.getProvincia() == null ||
                                dto.getProvincia().isBlank()) {

                        throw new BadRequestException(
                                        "Ingresá la provincia.");
                }

                if (dto.getLocalidad() == null ||
                                dto.getLocalidad().isBlank()) {

                        throw new BadRequestException(
                                        "Ingresá la localidad.");
                }

                if (dto.getItems() == null ||
                                dto.getItems().isEmpty()) {

                        throw new BadRequestException(
                                        "El carrito no tiene productos para cotizar.");
                }
        }

        private void validarDatosLogisticos(
                        Producto producto) {

                if (producto.getPesoGramos() == null ||
                                producto.getPesoGramos() <= 0) {

                        throw new BadRequestException(
                                        "El producto "
                                                        + producto.getNombre()
                                                        + " no tiene un peso de envío configurado.");
                }

                if (producto.getLargoEnvioCm() == null ||
                                producto.getLargoEnvioCm() <= 0 ||
                                producto.getAnchoEnvioCm() == null ||
                                producto.getAnchoEnvioCm() <= 0 ||
                                producto.getAltoEnvioCm() == null ||
                                producto.getAltoEnvioCm() <= 0) {

                        throw new BadRequestException(
                                        "El producto "
                                                        + producto.getNombre()
                                                        + " no tiene dimensiones de envío configuradas.");
                }
        }

        private void validarConfiguracion() {

                if (apiKey == null ||
                                apiKey.isBlank()) {

                        throw new BadRequestException(
                                        "ZIPNOVA_API_KEY no está configurada.");
                }

                if (apiSecret == null ||
                                apiSecret.isBlank()) {

                        throw new BadRequestException(
                                        "ZIPNOVA_API_SECRET no está configurada.");
                }

                if (accountId == null ||
                                accountId <= 0) {

                        throw new BadRequestException(
                                        "ZIPNOVA_ACCOUNT_ID no está configurado.");
                }

                if (originId == null ||
                                originId <= 0) {

                        throw new BadRequestException(
                                        "ZIPNOVA_ORIGIN_ID no está configurado.");
                }
        }

        // =========================================================
        // AUTH
        // =========================================================

        private String crearBasicAuth() {

                String credenciales = apiKey
                                + ":"
                                + apiSecret;

                String encoded = Base64
                                .getEncoder()
                                .encodeToString(
                                                credenciales
                                                                .getBytes(
                                                                                StandardCharsets.UTF_8));

                return "Basic " + encoded;
        }

        private BigDecimal obtenerValorDeclarado(
                        CotizarEnvioDTO dto) {

                if (dto.getValorDeclarado() == null ||
                                dto.getValorDeclarado()
                                                .compareTo(
                                                                BigDecimal.ZERO) < 0) {

                        return BigDecimal.ZERO;
                }

                return dto.getValorDeclarado();
        }
}