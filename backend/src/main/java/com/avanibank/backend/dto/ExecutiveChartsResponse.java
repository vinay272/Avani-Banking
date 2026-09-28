package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecutiveChartsResponse {

    private List<Map<String, Object>> revenueTrend;

    private List<Map<String, Object>> transactionVolume;

    private List<Map<String, Object>> loanDistribution;

    private List<Map<String, Object>> depositGrowth;

    private List<Map<String, Object>> fraudAnalysis;

    private List<Map<String, Object>> customerGrowth;
}