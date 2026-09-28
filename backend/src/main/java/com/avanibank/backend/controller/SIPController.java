package com.avanibank.backend.controller;

import com.avanibank.backend.entity.SIP;
import com.avanibank.backend.service.SIPService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sips")
@CrossOrigin(origins = "http://localhost:5173")
public class SIPController {

    private final SIPService sipService;

    public SIPController(SIPService sipService) {
        this.sipService = sipService;
    }

    // =========================
    // CREATE SIP
    // =========================

    @PostMapping
    public ResponseEntity<?> createSIP(
            @RequestParam Long accountId,
            @RequestParam BigDecimal monthlyAmount,
            @RequestParam BigDecimal expectedReturnRate,
            @RequestParam Integer tenureMonths,
            @RequestParam(required = false) String startDate,
            java.security.Principal principal
    ) {

        try {

            LocalDate parsedStartDate =
                    startDate == null || startDate.isBlank()
                            ? LocalDate.now()
                            : LocalDate.parse(startDate);

            SIP sip = sipService.createSIP(
                    principal.getName(),
                    accountId,
                    monthlyAmount,
                    expectedReturnRate,
                    tenureMonths,
                    parsedStartDate
            );

            return ResponseEntity.ok(
                    buildSIPResponse(sip)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to create SIP"
                    ));
        }
    }

    // =========================
    // GET ALL CUSTOMER SIPs
    // =========================

    @GetMapping
    public ResponseEntity<?> getSIPs(
            java.security.Principal principal
    ) {

        try {

            List<SIP> sips =
                    sipService.getCustomerSIPs(
                            principal.getName()
                    );

            return ResponseEntity.ok(
                    sips.stream()
                            .map(this::buildSIPResponse)
                            .toList()
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to fetch SIPs"
                    ));
        }
    }

    // =========================
    // GET ACTIVE SIPs
    // =========================

    @GetMapping("/active")
    public ResponseEntity<?> getActiveSIPs(
            java.security.Principal principal
    ) {

        try {

            List<SIP> sips =
                    sipService.getActiveSIPs(
                            principal.getName()
                    );

            return ResponseEntity.ok(
                    sips.stream()
                            .map(this::buildSIPResponse)
                            .toList()
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to fetch active SIPs"
                    ));
        }
    }

    // =========================
    // GET SIP BY ID
    // =========================

    @GetMapping("/{sipId}")
    public ResponseEntity<?> getSIPById(
            @PathVariable Long sipId,
            java.security.Principal principal
    ) {

        try {

            SIP sip =
                    sipService.getSIPById(
                            sipId,
                            principal.getName()
                    );

            return ResponseEntity.ok(
                    buildSIPResponse(sip)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "SIP not found"
                    ));
        }
    }

    // =========================
    // PAUSE SIP
    // =========================

    @PutMapping("/{sipId}/pause")
    public ResponseEntity<?> pauseSIP(
            @PathVariable Long sipId,
            java.security.Principal principal
    ) {

        try {

            SIP sip =
                    sipService.pauseSIP(
                            sipId,
                            principal.getName()
                    );

            return ResponseEntity.ok(
                    buildSIPResponse(sip)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to pause SIP"
                    ));
        }
    }

    // =========================
    // RESUME SIP
    // =========================

    @PutMapping("/{sipId}/resume")
    public ResponseEntity<?> resumeSIP(
            @PathVariable Long sipId,
            java.security.Principal principal
    ) {

        try {

            SIP sip =
                    sipService.resumeSIP(
                            sipId,
                            principal.getName()
                    );

            return ResponseEntity.ok(
                    buildSIPResponse(sip)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to resume SIP"
                    ));
        }
    }

    // =========================
    // CANCEL SIP
    // =========================

    @PutMapping("/{sipId}/cancel")
    public ResponseEntity<?> cancelSIP(
            @PathVariable Long sipId,
            java.security.Principal principal
    ) {

        try {

            SIP sip =
                    sipService.cancelSIP(
                            sipId,
                            principal.getName()
                    );

            return ResponseEntity.ok(
                    buildSIPResponse(sip)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unable to cancel SIP"
                    ));
        }
    }

    // =========================
    // BUILD RESPONSE
    // =========================

    private Map<String, Object> buildSIPResponse(SIP sip) {

        Map<String, Object> response =
                new HashMap<>();

        BigDecimal projectedValue =
                sipService.calculateProjectedValue(sip);

        BigDecimal projectedProfit =
                sipService.calculateProjectedProfit(sip);

        response.put("id", sip.getId());

        response.put(
                "accountId",
                sip.getAccount() != null
                        ? sip.getAccount().getId()
                        : null
        );

        response.put(
                "accountNumber",
                sip.getAccount() != null
                        ? sip.getAccount().getAccountNumber()
                        : null
        );

        response.put(
                "monthlyAmount",
                sip.getMonthlyAmount()
        );

        response.put(
                "expectedReturnRate",
                sip.getExpectedReturnRate()
        );

        response.put(
                "tenureMonths",
                sip.getTenureMonths()
        );

        response.put(
                "startDate",
                sip.getStartDate()
        );

        response.put(
                "nextInstallmentDate",
                sip.getNextInstallmentDate()
        );

        response.put(
                "maturityDate",
                sip.getMaturityDate()
        );

        response.put(
                "installmentsPaid",
                sip.getInstallmentsPaid()
        );

        response.put(
                "totalInvested",
                sip.getTotalInvested()
        );

        response.put(
                "frequency",
                sip.getFrequency()
        );

        response.put(
                "status",
                sip.getStatus()
        );

        response.put(
                "projectedValue",
                projectedValue
        );

        response.put(
                "projectedProfit",
                projectedProfit
        );

        response.put(
                "createdAt",
                sip.getCreatedAt()
        );

        response.put(
                "updatedAt",
                sip.getUpdatedAt()
        );

        return response;
    }
}