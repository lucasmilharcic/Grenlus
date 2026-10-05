package com.grenlus.backend.Config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        private final JwtAuthenticationEntryPoint unauthorizedHandler;

        private final UserDetailsService userDetailsService;

        @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://localhost:5175}")
        private String allowedCorsOrigins;

        @Autowired
        public SecurityConfig(
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        JwtAuthenticationEntryPoint unauthorizedHandler,
                        UserDetailsService userDetailsService) {

                this.jwtAuthenticationFilter = jwtAuthenticationFilter;

                this.unauthorizedHandler = unauthorizedHandler;

                this.userDetailsService = userDetailsService;
        }

        @Bean
        public SecurityFilterChain filterChain(
                        HttpSecurity http) throws Exception {

                http
                                .cors(cors -> {
                                })

                                .csrf(
                                                csrf -> csrf.disable())

                                .exceptionHandling(
                                                ex -> ex.authenticationEntryPoint(
                                                                unauthorizedHandler))

                                .sessionManagement(
                                                session -> session.sessionCreationPolicy(
                                                                SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(
                                                auth -> auth

                                                                // =========================
                                                                // AUTH
                                                                // =========================

                                                                .requestMatchers(
                                                                                "/auth/**",
                                                                                "/uploads/**",
                                                                                "/v3/api-docs/**",
                                                                                "/swagger-ui/**",
                                                                                "/swagger-ui.html")
                                                                .permitAll()

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/archivos/imagen")
                                                                .permitAll()
                                                                // =========================
                                                                // IMÁGENES
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/uploads/**")
                                                                .permitAll()

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/archivos/disenos")
                                                                .permitAll()

                                                                // =========================
                                                                // PRODUCTOS PÚBLICOS
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/productos/**")
                                                                .permitAll()

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/indumentarias/**")
                                                                .permitAll()

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/carteleria/**")
                                                                .permitAll()

                                                                // =========================
                                                                // CREAR PEDIDO
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/pedidos")
                                                                .authenticated()

                                                                // =========================
                                                                // ENVÍOS
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/envios/correo/portal")
                                                                .hasRole("ADMIN")

                                                                /*
                                                                 * El seguimiento propio va antes
                                                                 * que las reglas de admin para que
                                                                 * no lo tape /envios/**.
                                                                 */
                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/envios/mis-envios")
                                                                .authenticated()

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/envios/**")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/envios/**")
                                                                .hasRole("ADMIN")

                                                                // =========================
                                                                // MERCADO PAGO PÚBLICO
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/pagos/mercadopago/preferencia")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/pagos/mercadopago/preferencia-invitado")
                                                                .permitAll()

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/pagos/mercadopago/preferencia-cuenta")
                                                                .authenticated()

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/pagos/mercadopago/webhook")
                                                                .permitAll()

                                                                // =========================
                                                                // TRANSFERENCIA PÚBLICA
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/pagos/transferencia/datos")
                                                                .permitAll()

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/pagos/transferencia/*/comprobante")
                                                                .authenticated()

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/pagos/transferencia/*/comprobante-invitado")
                                                                .permitAll()

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/pagos/transferencia/*/comprobante-cuenta")
                                                                .authenticated()

                                                                // =========================
                                                                // ADMIN PAGOS
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/pagos/*/aprobar-manual")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/pagos/transferencia/*/aprobar")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/pagos/transferencia/*/aprobar-manual")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/pagos/transferencia/*/rechazar")
                                                                .hasRole("ADMIN")

                                                                // =========================
                                                                // MIS COMPRAS
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/pedidos/invitado/**")
                                                                .permitAll()

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/pedidos/invitado/**")
                                                                .permitAll()

                                                                /*
                                                                 * Tiene que quedar antes del bloque
                                                                 * de admin, si no /pedidos/** deja
                                                                 * al cliente sin sus propias
                                                                 * compras.
                                                                 */
                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/pedidos/mis-compras")
                                                                .authenticated()

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/pedidos/mis-compras/**")
                                                                .authenticated()

                                                                // =========================
                                                                // ADMIN PEDIDOS
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/pedidos/**")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/pedidos/**")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.DELETE,
                                                                                "/pedidos/**")
                                                                .hasRole("ADMIN")

                                                                // =========================
                                                                // SOLICITUDES
                                                                // =========================

                                                                /*
                                                                 * El cliente debe poder pedir
                                                                 * cotización aunque no tenga cuenta.
                                                                 */
                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/solicitudes/**")
                                                                .permitAll()

                                                                .requestMatchers(
                                                                                HttpMethod.GET,
                                                                                "/solicitudes/**")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/solicitudes/**")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.DELETE,
                                                                                "/solicitudes/**")
                                                                .hasRole("ADMIN")

                                                                // =========================
                                                                // ADMIN INDUMENTARIA
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/indumentarias/**")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/indumentarias/**")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.DELETE,
                                                                                "/indumentarias/**")
                                                                .hasRole("ADMIN")

                                                                // =========================
                                                                // ADMIN CARTELERÍA
                                                                // =========================

                                                                .requestMatchers(
                                                                                HttpMethod.POST,
                                                                                "/carteleria/**")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.PUT,
                                                                                "/carteleria/**")
                                                                .hasRole("ADMIN")

                                                                .requestMatchers(
                                                                                HttpMethod.DELETE,
                                                                                "/carteleria/**")
                                                                .hasRole("ADMIN")

                                                                .anyRequest()
                                                                .authenticated());

                http.headers(
                                headers -> headers.frameOptions(
                                                frame -> frame.sameOrigin()));

                http.authenticationProvider(
                                authenticationProvider());

                http.addFilterBefore(
                                jwtAuthenticationFilter,
                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // =========================================================
        // CORS
        // =========================================================

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(
                                Arrays.stream(allowedCorsOrigins.split(","))
                                                .map(String::trim)
                                                .filter(origin -> !origin.isEmpty())
                                                .toList());

                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                "PATCH",
                                "DELETE",
                                                "OPTIONS"));

                configuration.setAllowedHeaders(
                                List.of("*"));

                configuration.setAllowCredentials(
                                true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }

        // =========================================================
        // AUTH PROVIDER
        // =========================================================

        @Bean
        public AuthenticationProvider authenticationProvider() {

                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

                authProvider.setUserDetailsService(
                                userDetailsService);

                authProvider.setPasswordEncoder(
                                passwordEncoder());

                return authProvider;
        }

        // =========================================================
        // PASSWORD
        // =========================================================

        @Bean
        public PasswordEncoder passwordEncoder() {

                return new BCryptPasswordEncoder();
        }

        // =========================================================
        // AUTH MANAGER
        // =========================================================

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration configuration)
                        throws Exception {

                return configuration
                                .getAuthenticationManager();
        }
}