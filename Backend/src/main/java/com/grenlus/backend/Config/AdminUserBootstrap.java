package com.grenlus.backend.Config;

import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.grenlus.backend.Entity.Role;
import com.grenlus.backend.Entity.Usuario;
import com.grenlus.backend.Repository.UsuarioRepository;

/**
 * Bootstrap that ensures an initial admin user exists.
 *
 * - Runs once when the application is ready (ApplicationReadyEvent)
 * - Checks for username "admin" and creates it if missing
 * - Uses PasswordEncoder to store the password with BCrypt
 */
@Component
public class AdminUserBootstrap {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserBootstrap(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void createInitialAdminIfMissing() {

        System.out.println("===== ADMIN BOOTSTRAP EJECUTÁNDOSE =====");

        if (usuarioRepository.findByUsername("admin").isPresent()) {
            System.out.println("El admin ya existe");
            return;
        }

        Usuario admin = new Usuario();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setNombre("Administrador");
        admin.setActivo(true);
        admin.setRoles(Set.of(Role.ROLE_ADMIN));
        admin.setFechaRegistro(LocalDateTime.now());

        usuarioRepository.save(admin);

        System.out.println("ADMIN CREADO CORRECTAMENTE");
    }
}
