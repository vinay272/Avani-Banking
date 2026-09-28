package com.avanibank.backend.service;

import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class GeoLocationResolver {

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient;

    public GeoLocationResolver(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public GeoLocation resolve(String ipAddress) {

        if (ipAddress == null || ipAddress.isBlank()) {
            return GeoLocation.empty();
        }

        String ip = ipAddress.trim();

        // Localhost / local network addresses cannot be
        // resolved through a public IP geo-location service.
        if (isLocalOrPrivateIp(ip)) {
            return GeoLocation.empty();
        }

        try {
            String url = "https://ipwho.is/" + ip;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() != 200) {
                return GeoLocation.empty();
            }

            JsonNode root =
                    objectMapper.readTree(response.body());

            if (!root.path("success").asBoolean(false)) {
                return GeoLocation.empty();
            }

            String country = getText(root, "country");
            String region = getText(root, "region");
            String city = getText(root, "city");

            Double latitude =
                    getDouble(root, "latitude");

            Double longitude =
                    getDouble(root, "longitude");

            return new GeoLocation(
                    country,
                    region,
                    city,
                    latitude,
                    longitude
            );

        } catch (Exception exception) {

            // Geo-location must never prevent a customer
            // from logging into the banking application.
            return GeoLocation.empty();
        }
    }

    private String getText(JsonNode root, String field) {

        JsonNode node = root.get(field);

        if (node == null || node.isNull()) {
            return null;
        }

        String value = node.asText();

        return value == null || value.isBlank()
                ? null
                : value.trim();
    }

    private Double getDouble(JsonNode root, String field) {

        JsonNode node = root.get(field);

        if (node == null || node.isNull() || !node.isNumber()) {
            return null;
        }

        return node.asDouble();
    }

    private boolean isLocalOrPrivateIp(String ip) {

        if ("127.0.0.1".equals(ip)
                || "::1".equals(ip)
                || "0:0:0:0:0:0:0:1".equals(ip)) {
            return true;
        }

        // IPv4 private ranges
        if (ip.startsWith("10.")
                || ip.startsWith("192.168.")
                || ip.startsWith("169.254.")) {
            return true;
        }

        if (ip.startsWith("172.")) {

            String[] parts = ip.split("\\.");

            if (parts.length >= 2) {

                try {
                    int secondOctet =
                            Integer.parseInt(parts[1]);

                    if (secondOctet >= 16
                            && secondOctet <= 31) {
                        return true;
                    }

                } catch (NumberFormatException ignored) {
                    return true;
                }
            }
        }

        return false;
    }

    // =====================================================
    // GEO LOCATION RESULT
    // =====================================================

    public static class GeoLocation {

        private final String country;
        private final String region;
        private final String city;
        private final Double latitude;
        private final Double longitude;

        public GeoLocation(
                String country,
                String region,
                String city,
                Double latitude,
                Double longitude) {

            this.country = country;
            this.region = region;
            this.city = city;
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public static GeoLocation empty() {

            return new GeoLocation(
                    null,
                    null,
                    null,
                    null,
                    null
            );
        }

        public String getCountry() {
            return country;
        }

        public String getRegion() {
            return region;
        }

        public String getCity() {
            return city;
        }

        public Double getLatitude() {
            return latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public boolean isAvailable() {

            return country != null
                    || region != null
                    || city != null
                    || latitude != null
                    || longitude != null;
        }
    }
}