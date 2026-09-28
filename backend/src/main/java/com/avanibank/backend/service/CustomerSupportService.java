package com.avanibank.backend.service;

import com.avanibank.backend.dto.BranchAppointmentRequest;
import com.avanibank.backend.dto.ChatMessageRequest;
import com.avanibank.backend.dto.ComplaintRequest;
import com.avanibank.backend.dto.FeedbackRequest;
import com.avanibank.backend.dto.ServiceRequestCreateRequest;
import com.avanibank.backend.entity.BranchAppointment;
import com.avanibank.backend.entity.Complaint;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Feedback;
import com.avanibank.backend.entity.ServiceRequest;
import com.avanibank.backend.entity.SupportChatMessage;
import com.avanibank.backend.repository.BranchAppointmentRepository;
import com.avanibank.backend.repository.ComplaintRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.FeedbackRepository;
import com.avanibank.backend.repository.ServiceRequestRepository;
import com.avanibank.backend.repository.SupportChatMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CustomerSupportService {

    private final CustomerRepository customerRepository;
    private final ComplaintRepository complaintRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final BranchAppointmentRepository branchAppointmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final SupportChatMessageRepository supportChatMessageRepository;

    public CustomerSupportService(
            CustomerRepository customerRepository,
            ComplaintRepository complaintRepository,
            ServiceRequestRepository serviceRequestRepository,
            BranchAppointmentRepository branchAppointmentRepository,
            FeedbackRepository feedbackRepository,
            SupportChatMessageRepository supportChatMessageRepository
    ) {
        this.customerRepository = customerRepository;
        this.complaintRepository = complaintRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.branchAppointmentRepository = branchAppointmentRepository;
        this.feedbackRepository = feedbackRepository;
        this.supportChatMessageRepository = supportChatMessageRepository;
    }

    private Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    // ==================== COMPLAINTS ====================

    public Complaint createComplaint(String email, ComplaintRequest request) {

        Customer customer = getCustomerByEmail(email);

        Complaint complaint = new Complaint();

        complaint.setTicketNumber(generateNumber("CMP"));
        complaint.setCustomer(customer);
        complaint.setSubject(request.getSubject());
        complaint.setCategory(request.getCategory());
        complaint.setDescription(request.getDescription());

        if (request.getPriority() == null || request.getPriority().isBlank()) {
            complaint.setPriority("MEDIUM");
        } else {
            complaint.setPriority(request.getPriority().toUpperCase());
        }

        complaint.setStatus("OPEN");

        return complaintRepository.save(complaint);
    }

    @Transactional(readOnly = true)
    public List<Complaint> getCustomerComplaints(String email) {

        Customer customer = getCustomerByEmail(email);

        return complaintRepository
                .findByCustomerIdOrderByCreatedAtDesc(customer.getId());
    }

    @Transactional(readOnly = true)
    public Complaint getComplaint(String email, Long id) {

        Customer customer = getCustomerByEmail(email);

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (!complaint.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Access denied");
        }

        return complaint;
    }

    // ==================== SERVICE REQUESTS ====================

    public ServiceRequest createServiceRequest(
            String email,
            ServiceRequestCreateRequest request
    ) {

        Customer customer = getCustomerByEmail(email);

        ServiceRequest serviceRequest = new ServiceRequest();

        serviceRequest.setRequestNumber(generateNumber("SR"));
        serviceRequest.setCustomer(customer);
        serviceRequest.setRequestType(request.getRequestType());
        serviceRequest.setDescription(request.getDescription());
        serviceRequest.setStatus("REQUESTED");

        return serviceRequestRepository.save(serviceRequest);
    }

    @Transactional(readOnly = true)
    public List<ServiceRequest> getCustomerServiceRequests(String email) {

        Customer customer = getCustomerByEmail(email);

        return serviceRequestRepository
                .findByCustomerIdOrderByCreatedAtDesc(customer.getId());
    }

    // ==================== APPOINTMENTS ====================

    public BranchAppointment bookAppointment(
            String email,
            BranchAppointmentRequest request
    ) {

        Customer customer = getCustomerByEmail(email);

        boolean alreadyBooked =
                branchAppointmentRepository
                        .existsByBranchCodeAndAppointmentDateAndAppointmentTimeAndStatusNot(
                                request.getBranchCode(),
                                request.getAppointmentDate(),
                                request.getAppointmentTime(),
                                "CANCELLED"
                        );

        if (alreadyBooked) {
            throw new RuntimeException(
                    "This appointment slot is already booked"
            );
        }

        BranchAppointment appointment = new BranchAppointment();

        appointment.setAppointmentNumber(generateNumber("APT"));
        appointment.setCustomer(customer);
        appointment.setBranchCode(request.getBranchCode());
        appointment.setBranchName(request.getBranchName());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setPurpose(request.getPurpose());
        appointment.setStatus("BOOKED");

        return branchAppointmentRepository.save(appointment);
    }

    @Transactional(readOnly = true)
    public List<BranchAppointment> getCustomerAppointments(String email) {

        Customer customer = getCustomerByEmail(email);

        return branchAppointmentRepository
                .findByCustomerIdOrderByAppointmentDateDescAppointmentTimeDesc(
                        customer.getId()
                );
    }

    public BranchAppointment cancelAppointment(
            String email,
            Long id
    ) {

        Customer customer = getCustomerByEmail(email);

        BranchAppointment appointment =
                branchAppointmentRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Appointment not found"
                                )
                        );

        if (!appointment.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Access denied");
        }

        if ("CANCELLED".equalsIgnoreCase(appointment.getStatus())) {
            throw new RuntimeException("Appointment is already cancelled");
        }

        appointment.setStatus("CANCELLED");

        return branchAppointmentRepository.save(appointment);
    }

    // ==================== FEEDBACK ====================

    public Feedback submitFeedback(
            String email,
            FeedbackRequest request
    ) {

        if (request.getRating() == null ||
                request.getRating() < 1 ||
                request.getRating() > 5) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        Customer customer = getCustomerByEmail(email);

        Feedback feedback = new Feedback();

        feedback.setCustomer(customer);
        feedback.setRating(request.getRating());
        feedback.setCategory(request.getCategory());
        feedback.setComments(request.getComments());

        return feedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public List<Feedback> getCustomerFeedback(String email) {

        Customer customer = getCustomerByEmail(email);

        return feedbackRepository
                .findByCustomerIdOrderByCreatedAtDesc(customer.getId());
    }

    // ==================== LIVE CHAT ====================

    public SupportChatMessage sendCustomerMessage(
            String email,
            ChatMessageRequest request
    ) {

        Customer customer = getCustomerByEmail(email);

        SupportChatMessage message = new SupportChatMessage();

        message.setCustomer(customer);
        message.setSessionId(request.getSessionId());
        message.setSenderType("CUSTOMER");
        message.setMessage(request.getMessage());

        return supportChatMessageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<SupportChatMessage> getCustomerChat(
            String email,
            String sessionId
    ) {

        Customer customer = getCustomerByEmail(email);

        return supportChatMessageRepository
                .findByCustomerIdAndSessionIdOrderByCreatedAtAsc(
                        customer.getId(),
                        sessionId
                );
    }

    public SupportChatMessage sendSupportReply(
            Long customerId,
            ChatMessageRequest request
    ) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(
                        () -> new RuntimeException("Customer not found")
                );

        SupportChatMessage message = new SupportChatMessage();

        message.setCustomer(customer);
        message.setSessionId(request.getSessionId());
        message.setSenderType("SUPPORT");
        message.setMessage(request.getMessage());

        return supportChatMessageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<SupportChatMessage> getCustomerChatForSupport(
            Long customerId,
            String sessionId
    ) {

        return supportChatMessageRepository
                .findByCustomerIdAndSessionIdOrderByCreatedAtAsc(
                        customerId,
                        sessionId
                );
    }

    // ==================== SUPPORT STAFF - COMPLAINTS ====================

    @Transactional(readOnly = true)
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Complaint> getComplaintsByStatus(String status) {
        return complaintRepository
                .findByStatusOrderByCreatedAtDesc(status.toUpperCase());
    }

    public Complaint updateComplaint(
            Long id,
            String status,
            String assignedTo,
            String resolutionNote
    ) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Complaint not found")
                );

        if (status != null && !status.isBlank()) {
            complaint.setStatus(status.toUpperCase());
        }

        if (assignedTo != null && !assignedTo.isBlank()) {
            complaint.setAssignedTo(assignedTo);
        }

        if (resolutionNote != null && !resolutionNote.isBlank()) {
            complaint.setResolutionNote(resolutionNote);
        }

        if ("RESOLVED".equalsIgnoreCase(complaint.getStatus())) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        return complaintRepository.save(complaint);
    }

    // ==================== SUPPORT STAFF - SERVICE REQUESTS ====================

    @Transactional(readOnly = true)
    public List<ServiceRequest> getAllServiceRequests() {
        return serviceRequestRepository.findAll();
    }

    public ServiceRequest updateServiceRequest(
            Long id,
            String status,
            String responseNote
    ) {

        ServiceRequest request = serviceRequestRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Service request not found"
                        )
                );

        if (status != null && !status.isBlank()) {
            request.setStatus(status.toUpperCase());
        }

        if (responseNote != null && !responseNote.isBlank()) {
            request.setResponseNote(responseNote);
        }

        if ("COMPLETED".equalsIgnoreCase(request.getStatus())) {
            request.setCompletedAt(LocalDateTime.now());
        }

        return serviceRequestRepository.save(request);
    }

    // ==================== SUPPORT STAFF - APPOINTMENTS ====================

    @Transactional(readOnly = true)
    public List<BranchAppointment> getAllAppointments() {
        return branchAppointmentRepository.findAll();
    }

    public BranchAppointment updateAppointmentStatus(
            Long id,
            String status
    ) {

        BranchAppointment appointment =
                branchAppointmentRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Appointment not found"
                                )
                        );

        if (status == null || status.isBlank()) {
            throw new RuntimeException("Appointment status is required");
        }

        appointment.setStatus(status.toUpperCase());

        return branchAppointmentRepository.save(appointment);
    }

    // ==================== SUPPORT STAFF - FEEDBACK ====================

    @Transactional(readOnly = true)
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    // ==================== SUPPORT CHAT ====================

    // @Transactional(readOnly = true)
    // public List<SupportChatMessage> getAllChatMessages() {
    //     return supportChatMessageRepository
    //             .findByCustomerIdOrderByCreatedAtDesc(
    //                     null
    //             );
    // }

    private String generateNumber(String prefix) {

        return prefix + "-"
                + UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase();
    }
}