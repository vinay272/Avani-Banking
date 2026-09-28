package com.avanibank.backend.config;

import com.avanibank.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

        private final JwtService jwtService;

        public JwtAuthenticationFilter(JwtService jwtService) {
                this.jwtService = jwtService;
        }

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain)
                        throws ServletException, IOException {

                String authHeader = request.getHeader("Authorization");

                System.out.println(
                                "========== JWT FILTER ==========");

                System.out.println(
                                "REQUEST: "
                                                + request.getMethod()
                                                + " "
                                                + request.getRequestURI());

                System.out.println(
                                "AUTH HEADER PRESENT: "
                                                + (authHeader != null));

                // No Authorization header
                if (authHeader == null ||
                                !authHeader.startsWith("Bearer ")) {

                        System.out.println(
                                        "JWT: NO BEARER TOKEN");

                        filterChain.doFilter(
                                        request,
                                        response);

                        return;
                }

                String token = authHeader.substring(7);

                try {

                        boolean valid = jwtService.isTokenValid(token);

                        System.out.println(
                                        "JWT VALID: "
                                                        + valid);

                        if (valid) {

                                String email = jwtService.extractEmail(token);

                                System.out.println(
                                                "JWT EMAIL: "
                                                                + email);

                                String role = jwtService.extractRole(token);

String authority;

if (role == null || role.isBlank()) {
    /*
     * Existing customer JWTs do not contain a role claim.
     * Keep backward compatibility with existing customer login.
     */
    authority = "ROLE_CUSTOMER";
} else {
    authority = role.startsWith("ROLE_")
            ? role
            : "ROLE_" + role;
}

System.out.println("JWT ROLE/AUTHORITY: " + authority);

UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(
                email,
                null,
                List.of(
                        new SimpleGrantedAuthority(authority)
                )
        );

                                authentication.setDetails(
                                                new WebAuthenticationDetailsSource()
                                                                .buildDetails(request));

                                SecurityContextHolder
                                                .getContext()
                                                .setAuthentication(
                                                                authentication);
                                
                                System.out.println(
                                                "SECURITY CONTEXT: AUTHENTICATED");

                        } else {

                                System.out.println(
                                                "SECURITY CONTEXT: TOKEN INVALID");
                        }

                } catch (Exception e) {

                        System.out.println(
                                        "JWT ERROR: "
                                                        + e.getClass().getSimpleName()
                                                        + " - "
                                                        + e.getMessage());

                        SecurityContextHolder.clearContext();
                }

                filterChain.doFilter(
                                request,
                                response);
        }
}