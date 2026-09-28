package com.avanibank.backend.controller;

import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.entity.FraudStatistics;
import com.avanibank.backend.service.FraudAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/fraud")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminFraudController {

    private final FraudAlertService fraudAlertService;

    public AdminFraudController(
            FraudAlertService fraudAlertService
    ) {
        this.fraudAlertService = fraudAlertService;
    }

    /*
     * Get all fraud alerts.
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<FraudAlert>> getAllAlerts() {

        return ResponseEntity.ok(
                fraudAlertService.getAllFraudAlerts()
        );
    }

    /*
     * Get alerts by risk level.
     *
     * Example:
     * /api/admin/fraud/alerts/risk/HIGH
     */
    @GetMapping("/alerts/risk/{riskLevel}")
    public ResponseEntity<List<FraudAlert>> getByRiskLevel(
            @PathVariable String riskLevel
    ) {

        return ResponseEntity.ok(
                fraudAlertService.getAlertsByRiskLevel(
                        riskLevel.toUpperCase()
                )
        );
    }

    /*
     * Get alerts by alert type.
     *
     * Example:
     * /api/admin/fraud/alerts/type/VELOCITY_CHECK
     */
    @GetMapping("/alerts/type/{alertType}")
    public ResponseEntity<List<FraudAlert>> getByAlertType(
            @PathVariable String alertType
    ) {

        return ResponseEntity.ok(
                fraudAlertService.getAlertsByType(
                        alertType.toUpperCase()
                )
        );
    }

    /*
     * Resolve a fraud alert.
     */
    @PutMapping("/alerts/{alertId}/resolve")
    public ResponseEntity<FraudAlert> resolveAlert(
            @PathVariable Long alertId,
            @RequestParam String resolutionNote
    ) {

        return ResponseEntity.ok(
                fraudAlertService.resolveAlert(
                        alertId,
                        resolutionNote
                )
        );
    }

    @GetMapping("/statistics")
        public ResponseEntity<FraudStatistics> getFraudStatistics() {

    return ResponseEntity.ok(
            fraudAlertService.getFraudStatistics()
    );
    }

}