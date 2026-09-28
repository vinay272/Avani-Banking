package com.avanibank.backend.controller;

import com.avanibank.backend.dto.BranchAppointmentRequest;
import com.avanibank.backend.dto.ChatMessageRequest;
import com.avanibank.backend.dto.ComplaintRequest;
import com.avanibank.backend.dto.FeedbackRequest;
import com.avanibank.backend.dto.ServiceRequestCreateRequest;
import com.avanibank.backend.entity.BranchAppointment;
import com.avanibank.backend.entity.Complaint;
import com.avanibank.backend.entity.Feedback;
import com.avanibank.backend.entity.ServiceRequest;
import com.avanibank.backend.entity.SupportChatMessage;
import com.avanibank.backend.service.BankingChatbotService;
import com.avanibank.backend.service.CustomerSupportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerSupportController {

    private final CustomerSupportService customerSupportService;
    private final BankingChatbotService bankingChatbotService;

    public CustomerSupportController(
            CustomerSupportService customerSupportService,
            BankingChatbotService bankingChatbotService
    ) {
        this.customerSupportService = customerSupportService;
        this.bankingChatbotService = bankingChatbotService;
    }

    // ==================== COMPLAINTS ====================

    @PostMapping("/complaints")
    public ResponseEntity<Complaint> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.createComplaint(
                        authentication.getName(),
                        request
                )
        );
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getComplaints(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.getCustomerComplaints(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<Complaint> getComplaint(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.getComplaint(
                        authentication.getName(),
                        id
                )
        );
    }

    // ==================== SERVICE REQUESTS ====================

    @PostMapping("/service-requests")
    public ResponseEntity<ServiceRequest> createServiceRequest(
            @Valid @RequestBody ServiceRequestCreateRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.createServiceRequest(
                        authentication.getName(),
                        request
                )
        );
    }

    @GetMapping("/service-requests")
    public ResponseEntity<List<ServiceRequest>> getServiceRequests(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.getCustomerServiceRequests(
                        authentication.getName()
                )
        );
    }

    // ==================== APPOINTMENTS ====================

    @PostMapping("/appointments")
    public ResponseEntity<BranchAppointment> bookAppointment(
            @Valid @RequestBody BranchAppointmentRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.bookAppointment(
                        authentication.getName(),
                        request
                )
        );
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<BranchAppointment>> getAppointments(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.getCustomerAppointments(
                        authentication.getName()
                )
        );
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<BranchAppointment> cancelAppointment(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.cancelAppointment(
                        authentication.getName(),
                        id
                )
        );
    }

    // ==================== FEEDBACK ====================

    @PostMapping("/feedback")
    public ResponseEntity<Feedback> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.submitFeedback(
                        authentication.getName(),
                        request
                )
        );
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<Feedback>> getFeedback(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.getCustomerFeedback(
                        authentication.getName()
                )
        );
    }

    // ==================== LIVE CHAT ====================

    @PostMapping("/chat/messages")
    public ResponseEntity<SupportChatMessage> sendChatMessage(
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.sendCustomerMessage(
                        authentication.getName(),
                        request
                )
        );
    }

    @GetMapping("/chat/{sessionId}")
    public ResponseEntity<List<SupportChatMessage>> getChat(
            @PathVariable String sessionId,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerSupportService.getCustomerChat(
                        authentication.getName(),
                        sessionId
                )
        );
    }

    // ==================== AI BANKING CHATBOT ====================

    @PostMapping("/chatbot")
    public ResponseEntity<Map<String, String>> chatbot(
            @RequestBody Map<String, String> request
    ) {

        String message = request.get("message");

        String response = bankingChatbotService.getResponse(message);

        Map<String, String> result = new HashMap<>();

        result.put("message", message);
        result.put("response", response);

        return ResponseEntity.ok(result);
    }
}