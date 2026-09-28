package com.avanibank.backend.controller;

import com.avanibank.backend.entity.Nominee;
import com.avanibank.backend.service.NomineeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nominees")
@CrossOrigin(origins = "*")
public class NomineeController {

    private final NomineeService nomineeService;

    public NomineeController(NomineeService nomineeService) {
        this.nomineeService = nomineeService;
    }

    // =========================
    // ADD NOMINEE
    // =========================

    @PostMapping("/customer/{customerId}")
    public ResponseEntity<Nominee> addNominee(
            @PathVariable Long customerId,
            @RequestBody Nominee nominee) {

        return new ResponseEntity<>(
                nomineeService.addNominee(customerId, nominee),
                HttpStatus.CREATED
        );
    }

    // =========================
    // GET CUSTOMER NOMINEES
    // =========================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Nominee>> getNomineesByCustomer(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                nomineeService.getNomineesByCustomer(customerId)
        );
    }

    // =========================
    // GET NOMINEE BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Nominee> getNomineeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                nomineeService.getNomineeById(id)
        );
    }

    // =========================
    // UPDATE NOMINEE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<Nominee> updateNominee(
            @PathVariable Long id,
            @RequestBody Nominee nominee) {

        return ResponseEntity.ok(
                nomineeService.updateNominee(id, nominee)
        );
    }

    // =========================
    // DELETE NOMINEE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNominee(
            @PathVariable Long id) {

        nomineeService.deleteNominee(id);

        return ResponseEntity.ok(
                "Nominee deleted successfully"
        );
    }
}