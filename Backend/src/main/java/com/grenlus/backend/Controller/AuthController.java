package com.grenlus.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.DTO.AuthRequest;
import com.grenlus.backend.DTO.AuthResponse;
import com.grenlus.backend.DTO.RegisterRequest;
import com.grenlus.backend.DTO.UsuarioSesionDTO;
import com.grenlus.backend.Entity.Usuario;
import com.grenlus.backend.Service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(
            AuthService authService
    ) {

        this.authService =
                authService;
    }

    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody
            AuthRequest req
    ) {

        AuthResponse response =
                authService.authenticate(
                        req.getUsername(),
                        req.getPassword()
                );

        return ResponseEntity.ok(
                response
        );
    }

    // =========================================================
    // REGISTRO
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<Usuario> register(
            @Valid
            @RequestBody
            RegisterRequest req
    ) {

        Usuario usuario =
                authService.register(
                        req
                );

        return ResponseEntity.ok(
                usuario
        );
    }

    // =========================================================
    // USUARIO ACTUAL
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<UsuarioSesionDTO> me(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                !authentication.isAuthenticated()
        ) {

            return ResponseEntity
                    .status(401)
                    .build();
        }

        List<String> roles =
                authentication
                        .getAuthorities()
                        .stream()
                        .map(
                                autoridad ->
                                        autoridad.getAuthority()
                        )
                        .toList();

        UsuarioSesionDTO response =
                new UsuarioSesionDTO(
                        authentication.getName(),
                        roles
                );

        return ResponseEntity.ok(
                response
        );
    }
}