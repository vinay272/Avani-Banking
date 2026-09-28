package com.avanibank.backend.controller;

import com.avanibank.backend.dto.LoginRequest;
import com.avanibank.backend.dto.LoginResponse;
import com.avanibank.backend.dto.NotificationRequest;
import com.avanibank.backend.dto.RegisterRequest;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.service.AuthService;
import com.avanibank.backend.service.CustomerService;
import com.avanibank.backend.service.JwtService;
import com.avanibank.backend.service.LoginSecurityService;
import com.avanibank.backend.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final CustomerService customerService;
    private final LoginSecurityService loginSecurityService;
    private final NotificationService notificationService;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            CustomerService customerService,
            LoginSecurityService loginSecurityService,
            NotificationService notificationService) {

        this.authService = authService;
        this.jwtService = jwtService;
        this.customerService = customerService;
        this.loginSecurityService = loginSecurityService;
        this.notificationService = notificationService;
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
        HttpServletRequest httpRequest) {

        Customer customer = authService.login(
                request.getEmail(),
                request.getPassword()
        );

        String ipAddress = extractClientIp(httpRequest);

        String userAgent =
        httpRequest.getHeader("User-Agent");

        loginSecurityService.analyzeLogin(
        customer,
        ipAddress,
        userAgent
        );

        String token = jwtService.generateToken(
                customer.getEmail()
        );

        NotificationRequest notificationRequest = new NotificationRequest();
        notificationRequest.setCustomerId(customer.getId());
        notificationRequest.setNotificationType("LOGIN_ALERT");
        notificationRequest.setChannel("IN_APP");
        notificationRequest.setTitle("New Login Detected");
        notificationRequest.setMessage(
        "A successful login was detected on your Avani Bank account."
        );

        notificationService.createNotification(notificationRequest);

        return ResponseEntity.ok(
                new LoginResponse(
                        "Login successful",
                        token,
                        customer
                )
        );
    }

    private String extractClientIp(HttpServletRequest request) {

    String forwardedFor = request.getHeader("X-Forwarded-For");

    if (forwardedFor != null && !forwardedFor.isBlank()) {

        // X-Forwarded-For format:
        // client, proxy1, proxy2
        String firstIp = forwardedFor.split(",")[0].trim();

        if (!firstIp.isBlank()) {
            return firstIp;
        }
    }

    return request.getRemoteAddr();
}

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<Customer> register(
            @RequestBody RegisterRequest request) {

        Customer customer =
                customerService.registerCustomer(request);

        return new ResponseEntity<>(
                customer,
                HttpStatus.CREATED
        );
    }
}