package com.grenlus.backend.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.grenlus.backend.DTO.RegisterRequest;
import com.grenlus.backend.Entity.Role;
import com.grenlus.backend.Entity.Usuario;
import com.grenlus.backend.Exception.ConflictException;
import com.grenlus.backend.Repository.UsuarioRepository;

class AuthServiceTest {

    private UsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        authService = new AuthService(
                mock(AuthenticationManager.class),
                usuarioRepository,
                passwordEncoder,
                mock(JwtTokenProvider.class)
        );
    }

    @Test
    void registraEmailNormalizadoEnMinusculas() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("  Cliente@Example.com ");
        request.setPassword("password");
        request.setNombre("Cliente");

        when(usuarioRepository.existsByUsernameIgnoreCase("cliente@example.com"))
                .thenReturn(false);
        when(passwordEncoder.encode("password"))
                .thenReturn("encoded-password");
        when(usuarioRepository.save(any(Usuario.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));

        Usuario creado = authService.register(request);

        assertThat(creado.getUsername()).isEqualTo("cliente@example.com");
        assertThat(creado.getPassword()).isEqualTo("encoded-password");
        assertThat(creado.getRoles()).contains(Role.ROLE_USER);
        verify(usuarioRepository).existsByUsernameIgnoreCase("cliente@example.com");
    }

    @Test
    void duplicateEmailReturnsConflictInsteadOfServerError() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("Cliente@Example.com");
        when(usuarioRepository.existsByUsernameIgnoreCase("cliente@example.com"))
                .thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Ya existe una cuenta con ese email");
    }

    @Test
    void duplicateEmailRaceAlsoReturnsConflictInsteadOfServerError() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("cliente@example.com");
        request.setPassword("password");

        when(usuarioRepository.existsByUsernameIgnoreCase("cliente@example.com"))
                .thenReturn(false, true);
        when(passwordEncoder.encode("password"))
                .thenReturn("encoded-password");
        when(usuarioRepository.save(any(Usuario.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate username"));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Ya existe una cuenta con ese email");
    }
}
