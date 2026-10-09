package com.grenlus.backend.Exception;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/*
 * Una direccion inexistente caia en el manejador generico
 * y volvia como 500 "Ha ocurrido un error inesperado", lo
 * que hace buscar una falla del servidor que no existe.
 */
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    @Test
    void unaDireccionInexistenteEs404YNo500() {

        ResponseEntity<ApiErrorResponse> respuesta =
                handler.handleNoEncontrado(
                        new NoResourceFoundException(
                                HttpMethod.GET,
                                "/indumentarias/2/colores"));

        assertThat(respuesta.getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        assertThat(respuesta.getBody().getMessage())
                .contains("no existe");

        assertThat(respuesta.getBody().getMessage())
                .doesNotContain("inesperado");
    }

    @Test
    void elMetodoEquivocadoEs405() {

        ResponseEntity<ApiErrorResponse> respuesta =
                handler.handleMetodoNoSoportado(
                        new HttpRequestMethodNotSupportedException("DELETE"));

        assertThat(respuesta.getStatusCode())
                .isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);

        assertThat(respuesta.getBody().getMessage())
                .contains("DELETE");
    }

    @Test
    void elRestoSigueSiendo500() {

        ResponseEntity<ApiErrorResponse> respuesta =
                handler.handleGenericException(
                        new IllegalStateException("algo se rompio"));

        assertThat(respuesta.getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
