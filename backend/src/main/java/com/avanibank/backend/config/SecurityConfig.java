package com.avanibank.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        public SecurityConfig(
                        JwtAuthenticationFilter jwtAuthenticationFilter) {

                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        // =====================================================
        // PASSWORD ENCODER
        // =====================================================

        @Bean
        public PasswordEncoder passwordEncoder() {

                return new BCryptPasswordEncoder();
        }

        // =====================================================
        // CORS CONFIGURATION
        // =====================================================

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                // Frontend URL
                configuration.setAllowedOrigins(
                                List.of("http://localhost:5173"));

                // Allowed HTTP methods
                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "DELETE",
                                                "PATCH",
                                                "OPTIONS"));

                // Allowed request headers
                configuration.setAllowedHeaders(
                                List.of(
                                                "Authorization",
                                                "Content-Type",
                                                "Accept",
                                                "Origin",
                                                "X-Requested-With"));

                // Allow JWT Authorization header
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }

        // =====================================================
        // SECURITY FILTER CHAIN
        // =====================================================

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http

                                // -------------------------------------------------
                                // CSRF
                                // -------------------------------------------------

                                .csrf(csrf -> csrf.disable())

                                // -------------------------------------------------
                                // CORS
                                // -------------------------------------------------

                                .cors(cors -> cors.configurationSource(
                                                corsConfigurationSource()))

                                // -------------------------------------------------
                                // SESSION
                                // -------------------------------------------------

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                // -------------------------------------------------
                                // AUTHORIZATION
                                // -------------------------------------------------

                                .authorizeHttpRequests(auth -> auth

                                                // Preflight request
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                                // Login / Register
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/api/staff/login").permitAll()

                                                // Customer APIs
                                                .requestMatchers("/api/customers/**").authenticated()
                                                .requestMatchers(HttpMethod.GET, "/api/fixed-deposit-plans").permitAll()

                                                .requestMatchers("/api/admin/**")
                                                .hasAnyRole("SUPER_ADMIN", "BANK_ADMIN")

                                                .requestMatchers("/api/cash-deposits/**")
                                                .hasRole("CASHIER")

                                                .requestMatchers("/api/auditor/**")
                                                .hasAnyRole("SUPER_ADMIN", "BANK_ADMIN", "AUDITOR")

                                                .requestMatchers("/api/branch-manager/**")
                                                .hasAnyRole("SUPER_ADMIN", "BANK_ADMIN", "BRANCH_MANAGER")
                                                // Everything else
                                                .anyRequest().authenticated())

                                // -------------------------------------------------
                                // JWT FILTER
                                // -------------------------------------------------

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}