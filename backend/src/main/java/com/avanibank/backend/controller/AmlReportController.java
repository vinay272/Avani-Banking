package com.avanibank.backend.controller;

import com.avanibank.backend.service.AmlReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/compliance")
@CrossOrigin(origins = "http://localhost:5173")
public class AmlReportController {

    private final AmlReportService amlReportService;

    public AmlReportController(
            AmlReportService amlReportService) {

        this.amlReportService = amlReportService;
    }

    @GetMapping("/aml")
    public ResponseEntity<Map<String, Object>> getAmlReport() {

        return ResponseEntity.ok(
                amlReportService.getAmlReport()
        );
    }
}
