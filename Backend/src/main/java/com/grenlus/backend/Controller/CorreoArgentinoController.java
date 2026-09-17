package com.grenlus.backend.Controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.Service.CorreoArgentinoService;

@RestController
@RequestMapping("/envios/correo")
public class CorreoArgentinoController {

    private final CorreoArgentinoService correoArgentinoService;

    public CorreoArgentinoController(
            CorreoArgentinoService correoArgentinoService
    ) {

        this.correoArgentinoService =
                correoArgentinoService;
    }

    // =========================================================
    // TEST DE CREDENCIALES
    // =========================================================

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>>
            probarConexion() {

        boolean conectado =
                correoArgentinoService
                        .validarCredenciales();

        Map<String, Object> respuesta =
                new LinkedHashMap<>();

        respuesta.put(
                "proveedor",
                "Correo Argentino"
        );

        respuesta.put(
                "servicio",
                "PAQ.AR"
        );

        respuesta.put(
                "conectado",
                conectado
        );

        respuesta.put(
                "mensaje",
                "Credenciales PAQ.AR válidas."
        );

        return ResponseEntity.ok(
                respuesta
        );
    }
}