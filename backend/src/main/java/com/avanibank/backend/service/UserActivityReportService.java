package com.avanibank.backend.service;

import com.avanibank.backend.dto.UserActivityReportResponse;
import com.avanibank.backend.entity.LoginActivity;
import com.avanibank.backend.repository.LoginActivityRepository;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserActivityReportService {

    private final LoginActivityRepository loginActivityRepository;

    public UserActivityReportService(
            LoginActivityRepository loginActivityRepository) {

        this.loginActivityRepository =
                loginActivityRepository;
    }

    // =====================================================
    // USER ACTIVITY REPORT
    // =====================================================

    public UserActivityReportResponse getReport() {

        List<LoginActivity> activities =
                loginActivityRepository.findAll();

        long totalLoginActivities =
                activities.size();

        // =================================================
        // UNIQUE CUSTOMERS
        // =================================================

        Set<Long> customerIds =
                activities.stream()
                        .filter(activity ->
                                activity.getCustomer() != null
                                        && activity.getCustomer().getId() != null)
                        .map(activity ->
                                activity.getCustomer().getId())
                        .collect(Collectors.toSet());

        long uniqueCustomers =
                customerIds.size();

        // =================================================
        // UNIQUE IP ADDRESSES
        // =================================================

        Set<String> ipAddresses =
                activities.stream()
                        .map(LoginActivity::getIpAddress)
                        .filter(ip ->
                                ip != null
                                        && !ip.isBlank()
                                        && !"UNKNOWN".equalsIgnoreCase(ip))
                        .collect(Collectors.toSet());

        long uniqueIpAddresses =
                ipAddresses.size();

        // =================================================
        // LOCATION ACTIVITIES
        // =================================================

        long unusualLocationActivities =
                activities.stream()
                        .filter(this::hasLocation)
                        .filter(activity ->
                                activity.getCity() != null
                                        || activity.getRegion() != null
                                        || activity.getCountry() != null)
                        .count();

        // =================================================
        // LOCATION SUMMARY
        // =================================================

        Map<String, Long> locationSummary =
                activities.stream()
                        .map(this::getLocationLabel)
                        .collect(Collectors.groupingBy(
                                location -> location,
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // =================================================
        // SAFE ACTIVITY RECORDS
        // =================================================

        List<Map<String, Object>> activityRecords =
                activities.stream()
                        .map(this::toSafeMap)
                        .toList();

        UserActivityReportResponse response =
                new UserActivityReportResponse();

        response.setTotalLoginActivities(
                totalLoginActivities);

        response.setUniqueCustomers(
                uniqueCustomers);

        response.setUniqueIpAddresses(
                uniqueIpAddresses);

        response.setUnusualLocationActivities(
                unusualLocationActivities);

        response.setLocationSummary(
                locationSummary);

        response.setActivities(
                activityRecords);

        return response;
    }

    // =====================================================
    // LOCATION CHECK
    // =====================================================

    private boolean hasLocation(
            LoginActivity activity) {

        return activity.getCity() != null
                || activity.getRegion() != null
                || activity.getCountry() != null;
    }

    // =====================================================
    // LOCATION LABEL
    // =====================================================

    private String getLocationLabel(
            LoginActivity activity) {

        String city =
                activity.getCity();

        String region =
                activity.getRegion();

        String country =
                activity.getCountry();

        if (city != null && !city.isBlank()) {

            if (region != null && !region.isBlank()) {
                return city + ", " + region;
            }

            return city;
        }

        if (region != null && !region.isBlank()) {
            return region;
        }

        if (country != null && !country.isBlank()) {
            return country;
        }

        return "UNKNOWN";
    }

    // =====================================================
    // SAFE ACTIVITY MAP
    // =====================================================

    private Map<String, Object> toSafeMap(
            LoginActivity activity) {

        Map<String, Object> map =
                new LinkedHashMap<>();

        map.put(
                "id",
                activity.getId()
        );

        if (activity.getCustomer() != null) {

            map.put(
                    "customerId",
                    activity.getCustomer().getId()
            );

            map.put(
                    "customerName",
                    activity.getCustomer().getFullName()
            );

            map.put(
                    "customerEmail",
                    activity.getCustomer().getEmail()
            );
        }

        map.put(
                "ipAddress",
                activity.getIpAddress()
        );

        map.put(
                "userAgent",
                activity.getUserAgent()
        );

        map.put(
                "country",
                activity.getCountry()
        );

        map.put(
                "region",
                activity.getRegion()
        );

        map.put(
                "city",
                activity.getCity()
        );

        map.put(
                "loginAt",
                activity.getLoginAt()
        );

        return map;
    }
}