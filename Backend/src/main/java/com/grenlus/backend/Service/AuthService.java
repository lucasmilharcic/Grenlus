package com.grenlus.backend.Service;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.grenlus.backend.DTO.AuthResponse;
import com.grenlus.backend.DTO.RegisterRequest;
import com.grenlus.backend.Entity.Role;
import com.grenlus.backend.Entity.Usuario;
import com.grenlus.backend.Repository.UsuarioRepository;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    public AuthService(
            AuthenticationManager authenticationManager,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {

        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse authenticate(String username, String password) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                username,
                                password
                        )
                );

        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token);
    }

    public Usuario register(RegisterRequest req) {

        if (usuarioRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("El usuario ya existe");
        }

        Usuario usuario = new Usuario();

        usuario.setUsername(req.getUsername());

        usuario.setPassword(
                passwordEncoder.encode(req.getPassword())
        );

        usuario.setNombre(req.getNombre());

        usuario.setActivo(true);

        Set<Role> roles = new HashSet<>();
        roles.add(Role.ROLE_USER);

        usuario.setRoles(roles);

        return usuarioRepository.save(usuario);
    }
}