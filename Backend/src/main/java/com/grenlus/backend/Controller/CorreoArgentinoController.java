package com.grenlus.backend.Controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/envios/correo")
public class CorreoArgentinoController {

    private final String portalUrl;

    public CorreoArgentinoController(
            @Value("${correo-argentino.portal-url}") String portalUrl
    ) {
        this.portalUrl = portalUrl;
    }

    @GetMapping("/portal")
    public ResponseEntity<Map<String, String>> portal() {
        return ResponseEntity.ok(
                Map.of(
                        "proveedor", "Correo Argentino",
                        "nombre", "MiCorreo",
                        "url", portalUrl
                )
        );
    }

}