package com.avanibank.backend.controller;

import com.avanibank.backend.dto.ChatMessageRequest;
import com.avanibank.backend.entity.BranchAppointment;
import com.avanibank.backend.entity.Complaint;
import com.avanibank.backend.entity.Feedback;
import com.avanibank.backend.entity.ServiceRequest;
import com.avanibank.backend.entity.SupportChatMessage;
import com.avanibank.backend.service.CustomerSupportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/support")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminCustomerSupportController {

    private final CustomerSupportService customerSupportService;

    public AdminCustomerSupportController(
            CustomerSupportService customerSupportService
    ) {
        this.customerSupportService = customerSupportService;
    }

    // ==================== COMPLAINTS ====================

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints(
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.getAllComplaints()
        );
    }

    @GetMapping("/complaints/status/{status}")
    public ResponseEntity<List<Complaint>> getComplaintsByStatus(
            @PathVariable String status,
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.getComplaintsByStatus(status)
        );
    }

    @PutMapping("/complaints/{id}")
    public ResponseEntity<Complaint> updateComplaint(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String resolutionNote,
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.updateComplaint(
                        id,
                        status,
                        assignedTo,
                        resolutionNote
                )
        );
    }

    // ==================== SERVICE REQUESTS ====================

    @GetMapping("/service-requests")
    public ResponseEntity<List<ServiceRequest>> getAllServiceRequests(
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.getAllServiceRequests()
        );
    }

    @PutMapping("/service-requests/{id}")
    public ResponseEntity<ServiceRequest> updateServiceRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String responseNote,
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.updateServiceRequest(
                        id,
                        status,
                        responseNote
                )
        );
    }

    // ==================== APPOINTMENTS ====================

    @GetMapping("/appointments")
    public ResponseEntity<List<BranchAppointment>> getAllAppointments(
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.getAllAppointments()
        );
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<BranchAppointment> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.updateAppointmentStatus(
                        id,
                        status
                )
        );
    }

    // ==================== FEEDBACK ====================

    @GetMapping("/feedback")
    public ResponseEntity<List<Feedback>> getAllFeedback(
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.getAllFeedback()
        );
    }

    // ==================== LIVE CHAT ====================

    @GetMapping("/chat/{customerId}/{sessionId}")
    public ResponseEntity<List<SupportChatMessage>> getCustomerChat(
            @PathVariable Long customerId,
            @PathVariable String sessionId,
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.getCustomerChatForSupport(
                        customerId,
                        sessionId
                )
        );
    }

    @PostMapping("/chat/{customerId}/reply")
    public ResponseEntity<SupportChatMessage> sendSupportReply(
            @PathVariable Long customerId,
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication
    ) {

        requireSupportStaff(authentication);

        return ResponseEntity.ok(
                customerSupportService.sendSupportReply(
                        customerId,
                        request
                )
        );
    }

    // ==================== ROLE CHECK ====================

    private void requireSupportStaff(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException("Authentication required");
        }

        boolean allowed = authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> {

                    String role = authority.getAuthority();

                    return role.equals("ROLE_SUPER_ADMIN")
                            || role.equals("ROLE_BANK_ADMIN")
                            || role.equals("ROLE_CUSTOMER_SUPPORT")
                            || role.equals("SUPER_ADMIN")
                            || role.equals("BANK_ADMIN")
                            || role.equals("CUSTOMER_SUPPORT");
                });

        if (!allowed) {
            throw new RuntimeException(
                    "Access denied. Customer support staff privileges required."
            );
        }
    }
}