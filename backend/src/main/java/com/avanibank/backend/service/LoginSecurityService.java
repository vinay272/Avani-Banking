package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.entity.LoginActivity;
import com.avanibank.backend.repository.FraudAlertRepository;
import com.avanibank.backend.repository.LoginActivityRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LoginSecurityService {

        private final LoginActivityRepository loginActivityRepository;
        private final FraudAlertRepository fraudAlertRepository;
        private final GeoLocationResolver geoLocationResolver;

        public LoginSecurityService(

                        LoginActivityRepository loginActivityRepository,

                        FraudAlertRepository fraudAlertRepository,

                        GeoLocationResolver geoLocationResolver) {

                this.loginActivityRepository = loginActivityRepository;

                this.fraudAlertRepository = fraudAlertRepository;

                this.geoLocationResolver = geoLocationResolver;
        }

        // =====================================================
        // ANALYZE CUSTOMER LOGIN
        // =====================================================

        @Transactional
        public void analyzeLogin(
                        Customer customer,
                        String ipAddress,
                        String userAgent) {

                if (customer == null) {
                        return;
                }

                if (ipAddress == null || ipAddress.isBlank()) {
                        ipAddress = "UNKNOWN";
                }

                if (userAgent == null || userAgent.isBlank()) {
                        userAgent = "UNKNOWN";
                }

                ipAddress = ipAddress.trim();
                userAgent = userAgent.trim();

                // =================================================
                // RESOLVE GEO LOCATION
                // =================================================

                GeoLocationResolver.GeoLocation currentLocation = geoLocationResolver.resolve(ipAddress);

                // =================================================
                // CHECK PREVIOUS LOGIN HISTORY
                // =================================================

                boolean knownIp = loginActivityRepository
                                .existsByCustomerIdAndIpAddress(
                                                customer.getId(),
                                                ipAddress);

                boolean knownDevice = loginActivityRepository
                                .existsByCustomerIdAndUserAgent(
                                                customer.getId(),
                                                userAgent);

                // =================================================
                // UNUSUAL LOGIN DETECTION
                // =================================================

                boolean unusualIp = !knownIp;
                boolean unusualDevice = !knownDevice;

                /*
                 * First-ever login should establish the
                 * customer's normal login profile.
                 *
                 * Therefore we create an alert only when
                 * login history already exists.
                 */

                java.util.Optional<LoginActivity> previousLogin = loginActivityRepository
                                .findFirstByCustomerIdOrderByLoginAtDesc(
                                                customer.getId());

                boolean hasPreviousLogin = previousLogin.isPresent();

                // =================================================
                // COMPARE PREVIOUS GEO LOCATION
                // =================================================

                boolean unusualLocation = false;

                if (hasPreviousLogin
                                && currentLocation.isAvailable()) {

                        LoginActivity previousActivity = previousLogin.get();

                        String previousCountry = previousActivity.getCountry();

                        String previousRegion = previousActivity.getRegion();

                        String previousCity = previousActivity.getCity();

                        if (previousCountry != null
                                        && !previousCountry.equalsIgnoreCase(
                                                        currentLocation.getCountry() == null
                                                                        ? ""
                                                                        : currentLocation.getCountry())) {

                                unusualLocation = true;

                        } else if (previousRegion != null
                                        && !previousRegion.equalsIgnoreCase(
                                                        currentLocation.getRegion() == null
                                                                        ? ""
                                                                        : currentLocation.getRegion())) {

                                unusualLocation = true;

                        } else if (previousCity != null
                                        && !previousCity.equalsIgnoreCase(
                                                        currentLocation.getCity() == null
                                                                        ? ""
                                                                        : currentLocation.getCity())) {

                                unusualLocation = true;
                        }
                }

                if (hasPreviousLogin
                                && unusualIp
                                && unusualDevice) {

                        FraudAlert alert = new FraudAlert();

                        alert.setCustomer(customer);

                        alert.setAlertType(
                                        "ACCOUNT_TAKEOVER");

                        alert.setRiskLevel(
                                        "HIGH");

                        alert.setRiskScore(
                                        java.math.BigDecimal.valueOf(70));

                        alert.setDescription(
                                        "Unusual login detected from a new IP address "
                                                        + "and a new device. Possible account takeover.");

                        alert.setTransactionId(null);

                        alert.setTransactionType(
                                        "LOGIN");

                        alert.setLocation(
                                        ipAddress);

                        alert.setStatus(
                                        "OPEN");

                        fraudAlertRepository.save(alert);

                } else if (hasPreviousLogin
                                && (unusualIp || unusualDevice)) {

                        FraudAlert alert = new FraudAlert();

                        alert.setCustomer(customer);

                        /*
                         * New IP indicates a possible location/network change.
                         * New device is handled separately.
                         */
                        alert.setAlertType(
                                        unusualIp
                                                        ? "GEO_LOCATION_RISK"
                                                        : "UNUSUAL_DEVICE");

                        alert.setRiskLevel(
                                        "MEDIUM");

                        alert.setRiskScore(
                                        java.math.BigDecimal.valueOf(
                                                        unusualIp ? 50 : 40));

                        if (unusualIp) {
                                String locationDetails = "unknown location";

                                if (currentLocation.isAvailable()) {
                                        StringBuilder locationBuilder = new StringBuilder();

                                        if (currentLocation.getCity() != null) {
                                                locationBuilder.append(currentLocation.getCity());
                                        }

                                        if (currentLocation.getRegion() != null) {
                                                if (locationBuilder.length() > 0) {
                                                        locationBuilder.append(", ");
                                                }
                                                locationBuilder.append(currentLocation.getRegion());
                                        }

                                        if (currentLocation.getCountry() != null) {
                                                if (locationBuilder.length() > 0) {
                                                        locationBuilder.append(", ");
                                                }
                                                locationBuilder.append(currentLocation.getCountry());
                                        }

                                        if (locationBuilder.length() > 0) {
                                                locationDetails = locationBuilder.toString();
                                        }
                                }

                                alert.setDescription(
                                                "Customer login detected from a previously unseen "
                                                                + "network/location: "
                                                                + locationDetails
                                                                + " (IP: "
                                                                + ipAddress
                                                                + ").");
                        } else {
                                alert.setDescription(
                                                "Customer login detected from a "
                                                                + "previously unseen device.");
                        }

                        alert.setTransactionId(null);

                        alert.setTransactionType(
                                        "LOGIN");

                        /*
                         * For now IP address acts as the location/network
                         * identifier. Real city/country geo lookup will
                         * be added in the next step.
                         */
                        if (unusualIp && currentLocation.isAvailable()) {
                                StringBuilder locationBuilder = new StringBuilder();

                                if (currentLocation.getCity() != null) {
                                        locationBuilder.append(currentLocation.getCity());
                                }

                                if (currentLocation.getRegion() != null) {
                                        if (locationBuilder.length() > 0) {
                                                locationBuilder.append(", ");
                                        }
                                        locationBuilder.append(currentLocation.getRegion());
                                }

                                if (currentLocation.getCountry() != null) {
                                        if (locationBuilder.length() > 0) {
                                                locationBuilder.append(", ");
                                        }
                                        locationBuilder.append(currentLocation.getCountry());
                                }

                                alert.setLocation(
                                                locationBuilder.length() > 0
                                                                ? locationBuilder + " | IP: " + ipAddress
                                                                : ipAddress);
                        } else {
                                alert.setLocation(ipAddress);
                        }

                        alert.setStatus(
                                        "OPEN");

                        fraudAlertRepository.save(alert);
                }

                // =================================================
                // SAVE LOGIN ACTIVITY
                // =================================================

                LoginActivity loginActivity = new LoginActivity();

                loginActivity.setCustomer(customer);

                loginActivity.setIpAddress(ipAddress);

                loginActivity.setUserAgent(userAgent);

                // =================================================
                // SAVE GEO LOCATION
                // =================================================

                if (currentLocation.isAvailable()) {

                        loginActivity.setCountry(
                                        currentLocation.getCountry());

                        loginActivity.setRegion(
                                        currentLocation.getRegion());

                        loginActivity.setCity(
                                        currentLocation.getCity());

                        loginActivity.setLatitude(
                                        currentLocation.getLatitude());

                        loginActivity.setLongitude(
                                        currentLocation.getLongitude());
                }

                loginActivityRepository.save(
                                loginActivity);
        }
}