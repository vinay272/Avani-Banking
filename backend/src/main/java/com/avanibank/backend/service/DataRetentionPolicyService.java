package com.avanibank.backend.service;

import com.avanibank.backend.dto.DataRetentionDryRunRequest;
import com.avanibank.backend.dto.DataRetentionPolicyRequest;
import com.avanibank.backend.entity.AuditLog;
import com.avanibank.backend.entity.DataRetentionPolicy;
import com.avanibank.backend.repository.AuditLogRepository;
import com.avanibank.backend.repository.DataRetentionPolicyRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DataRetentionPolicyService {

    private final DataRetentionPolicyRepository
            policyRepository;

    private final AuditLogRepository
            auditLogRepository;

    public DataRetentionPolicyService(
            DataRetentionPolicyRepository policyRepository,
            AuditLogRepository auditLogRepository) {

        this.policyRepository =
                policyRepository;

        this.auditLogRepository =
                auditLogRepository;
    }

    // =====================================================
    // CREATE POLICY
    // =====================================================

    @Transactional
    public DataRetentionPolicy createPolicy(
            DataRetentionPolicyRequest request) {

        if (policyRepository.existsByPolicyNameIgnoreCase(
                request.getPolicyName())) {

            throw new RuntimeException(
                    "Retention policy with this name already exists"
            );
        }

        if (request.getRetentionDays() == null
                || request.getRetentionDays() < 1) {

            throw new RuntimeException(
                    "Retention days must be greater than 0"
            );
        }

        DataRetentionPolicy policy =
                new DataRetentionPolicy();

        policy.setPolicyName(
                request.getPolicyName().trim()
        );

        policy.setDataType(
                request.getDataType().trim().toUpperCase()
        );

        policy.setRetentionDays(
                request.getRetentionDays()
        );

        policy.setRetentionAction(
                request.getRetentionAction()
                        .trim()
                        .toUpperCase()
        );

        policy.setStatus(
                request.getStatus() == null
                        || request.getStatus().isBlank()
                        ? "ACTIVE"
                        : request.getStatus()
                                .trim()
                                .toUpperCase()
        );

        policy.setDescription(
                request.getDescription()
        );

        return policyRepository.save(policy);
    }

    // =====================================================
    // GET ALL POLICIES
    // =====================================================

    @Transactional(readOnly = true)
    public List<DataRetentionPolicy>
    getAllPolicies() {

        return policyRepository
                .findAll();
    }

    // =====================================================
    // UPDATE POLICY
    // =====================================================

    @Transactional
    public DataRetentionPolicy updatePolicy(
            Long id,
            DataRetentionPolicyRequest request) {

        DataRetentionPolicy policy =
                policyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Retention policy not found"
                                )
                        );

        if (request.getRetentionDays() == null
                || request.getRetentionDays() < 1) {

            throw new RuntimeException(
                    "Retention days must be greater than 0"
            );
        }

        policy.setPolicyName(
                request.getPolicyName().trim()
        );

        policy.setDataType(
                request.getDataType().trim().toUpperCase()
        );

        policy.setRetentionDays(
                request.getRetentionDays()
        );

        policy.setRetentionAction(
                request.getRetentionAction()
                        .trim()
                        .toUpperCase()
        );

        policy.setStatus(
                request.getStatus() == null
                        || request.getStatus().isBlank()
                        ? "ACTIVE"
                        : request.getStatus()
                                .trim()
                                .toUpperCase()
        );

        policy.setDescription(
                request.getDescription()
        );

        return policyRepository.save(policy);
    }

    // =====================================================
    // SAFE DRY RUN
    // =====================================================

    @Transactional(readOnly = true)
    public Map<String, Object> dryRun(
            DataRetentionDryRunRequest request) {

        String dataType =
                request.getDataType()
                        .trim()
                        .toUpperCase();

        int retentionDays =
                request.getRetentionDays();

        LocalDateTime cutoffDate =
                LocalDateTime.now()
                        .minusDays(retentionDays);

        long eligibleRecords = 0;

        /*
         * Currently Audit Logs are the compliance dataset
         * directly available for retention evaluation.
         *
         * No records are deleted here.
         */

        if ("AUDIT_LOG".equals(dataType)
                || "AUDIT_LOGS".equals(dataType)) {

            eligibleRecords =
                    auditLogRepository.findAll()
                            .stream()
                            .filter(log ->
                                    log.getCreatedAt() != null
                                            && log.getCreatedAt()
                                            .isBefore(cutoffDate))
                            .count();
        }

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "dataType",
                dataType
        );

        result.put(
                "retentionDays",
                retentionDays
        );

        result.put(
                "cutoffDate",
                cutoffDate
        );

        result.put(
                "eligibleRecords",
                eligibleRecords
        );

        result.put(
                "action",
                "DRY_RUN_ONLY"
        );

        result.put(
                "message",
                "No records were deleted or modified."
        );

        return result;
    }
}