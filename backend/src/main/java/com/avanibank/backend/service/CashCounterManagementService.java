package com.avanibank.backend.service;

import com.avanibank.backend.dto.CashCounterRequest;
import com.avanibank.backend.dto.CashCounterResponse;
import com.avanibank.backend.entity.CashCounter;
import com.avanibank.backend.entity.Employee;
import com.avanibank.backend.repository.BranchRepository;
import com.avanibank.backend.repository.CashCounterRepository;
import com.avanibank.backend.repository.EmployeeRepository;
import com.avanibank.backend.security.StaffRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CashCounterManagementService {

    private final CashCounterRepository cashCounterRepository;
    private final BranchRepository branchRepository;
    private final EmployeeRepository employeeRepository;

    public CashCounterManagementService(
            CashCounterRepository cashCounterRepository,
            BranchRepository branchRepository,
            EmployeeRepository employeeRepository) {

        this.cashCounterRepository = cashCounterRepository;
        this.branchRepository = branchRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public CashCounterResponse createCounter(CashCounterRequest request) {

        if (cashCounterRepository.existsByCounterCode(request.getCounterCode())) {
            throw new RuntimeException("Counter code already exists");
        }

        validateBranch(request.getBranchCode());

        validateAssignedEmployee(
                request.getAssignedEmployeeCode(),
                request.getBranchCode()
        );

        BigDecimal openingBalance = request.getOpeningBalance();

        if (openingBalance == null || openingBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Opening balance cannot be negative");
        }

        CashCounter counter = new CashCounter();

        counter.setCounterCode(request.getCounterCode());
        counter.setCounterName(request.getCounterName());
        counter.setBranchCode(request.getBranchCode());
        counter.setAssignedEmployeeCode(request.getAssignedEmployeeCode());
        counter.setOpeningBalance(openingBalance);

        // Current balance starts with opening balance
        counter.setCurrentBalance(openingBalance);

        counter.setStatus("ACTIVE");

        CashCounter savedCounter = cashCounterRepository.save(counter);

        return new CashCounterResponse(savedCounter);
    }

    @Transactional(readOnly = true)
    public List<CashCounterResponse> getAllCounters() {

        return cashCounterRepository.findAll()
                .stream()
                .map(CashCounterResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CashCounterResponse getCounterById(Long id) {

        CashCounter counter = cashCounterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cash counter not found with id: " + id));

        return new CashCounterResponse(counter);
    }

    @Transactional(readOnly = true)
    public List<CashCounterResponse> getCountersByBranch(String branchCode) {

        validateBranch(branchCode);

        return cashCounterRepository
                .findByBranchCodeOrderByCreatedAtDesc(branchCode)
                .stream()
                .map(CashCounterResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CashCounterResponse> getCountersByStatus(String status) {

        if (!"ACTIVE".equalsIgnoreCase(status)
                && !"INACTIVE".equalsIgnoreCase(status)) {

            throw new RuntimeException(
                    "Invalid status. Use ACTIVE or INACTIVE"
            );
        }

        return cashCounterRepository
                .findByStatusOrderByCreatedAtDesc(status.toUpperCase())
                .stream()
                .map(CashCounterResponse::new)
                .toList();
    }

    @Transactional
    public CashCounterResponse updateCounter(
            Long id,
            CashCounterRequest request) {

        CashCounter counter = cashCounterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cash counter not found with id: " + id));

        if (!counter.getCounterCode().equals(request.getCounterCode())
                && cashCounterRepository.existsByCounterCode(request.getCounterCode())) {

            throw new RuntimeException("Counter code already exists");
        }

        validateBranch(request.getBranchCode());

        validateAssignedEmployee(
                request.getAssignedEmployeeCode(),
                request.getBranchCode()
        );

        BigDecimal openingBalance = request.getOpeningBalance();

        if (openingBalance == null
                || openingBalance.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException("Opening balance cannot be negative");
        }

        counter.setCounterCode(request.getCounterCode());
        counter.setCounterName(request.getCounterName());
        counter.setBranchCode(request.getBranchCode());
        counter.setAssignedEmployeeCode(request.getAssignedEmployeeCode());
        counter.setOpeningBalance(openingBalance);

        CashCounter updatedCounter = cashCounterRepository.save(counter);

        return new CashCounterResponse(updatedCounter);
    }

    @Transactional
    public CashCounterResponse updateStatus(Long id, String status) {

        CashCounter counter = cashCounterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cash counter not found with id: " + id));

        if (!"ACTIVE".equalsIgnoreCase(status)
                && !"INACTIVE".equalsIgnoreCase(status)) {

            throw new RuntimeException(
                    "Invalid status. Use ACTIVE or INACTIVE"
            );
        }

        counter.setStatus(status.toUpperCase());

        CashCounter updatedCounter = cashCounterRepository.save(counter);

        return new CashCounterResponse(updatedCounter);
    }

    @Transactional
    public CashCounterResponse assignCashier(
            Long id,
            String employeeCode) {

        CashCounter counter = cashCounterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cash counter not found with id: " + id));

        validateAssignedEmployee(
                employeeCode,
                counter.getBranchCode()
        );

        counter.setAssignedEmployeeCode(employeeCode);

        CashCounter updatedCounter = cashCounterRepository.save(counter);

        return new CashCounterResponse(updatedCounter);
    }

    private void validateBranch(String branchCode) {

        if (branchCode == null || branchCode.isBlank()) {
            throw new RuntimeException("Branch code is required");
        }

        if (!branchRepository.existsByBranchCode(branchCode)) {
            throw new RuntimeException(
                    "Branch not found: " + branchCode
            );
        }
    }

    private void validateAssignedEmployee(
            String employeeCode,
            String branchCode) {

        // Cashier assignment is optional
        if (employeeCode == null || employeeCode.isBlank()) {
            return;
        }

        Employee employee = employeeRepository
                .findByEmployeeCode(employeeCode)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found: " + employeeCode
                        ));

        if (!StaffRole.CASHIER.name()
                .equalsIgnoreCase(employee.getRole())) {

            throw new RuntimeException(
                    "Only CASHIER employees can be assigned to a cash counter"
            );
        }

        if (!branchCode.equalsIgnoreCase(employee.getBranchCode())) {

            throw new RuntimeException(
                    "Cashier and cash counter must belong to the same branch"
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(employee.getStatus())) {

            throw new RuntimeException(
                    "Only ACTIVE cashier can be assigned"
            );
        }
    }
}