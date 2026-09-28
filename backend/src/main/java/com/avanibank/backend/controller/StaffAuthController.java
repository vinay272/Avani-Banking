package com.avanibank.backend.controller;

import com.avanibank.backend.dto.StaffLoginRequest;
import com.avanibank.backend.dto.StaffLoginResponse;
import com.avanibank.backend.entity.Employee;
import com.avanibank.backend.service.JwtService;
import com.avanibank.backend.service.StaffAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:5173")
public class StaffAuthController {

    private final StaffAuthService staffAuthService;
    private final JwtService jwtService;

    public StaffAuthController(
            StaffAuthService staffAuthService,
            JwtService jwtService
    ) {
        this.staffAuthService = staffAuthService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<StaffLoginResponse> login(
            @RequestBody StaffLoginRequest request
    ) {

        Employee employee = staffAuthService.login(
                request.getEmail(),
                request.getPassword()
        );

        String token = jwtService.generateToken(
                employee.getEmail(),
                employee.getRole()
        );

        StaffLoginResponse response =
                new StaffLoginResponse(
                        "Staff login successful",
                        token,
                        employee.getId(),
                        employee.getEmployeeCode(),
                        employee.getFullName(),
                        employee.getEmail(),
                        employee.getRole(),
                        employee.getBranchCode()
                );

        return ResponseEntity.ok(response);
    }
}