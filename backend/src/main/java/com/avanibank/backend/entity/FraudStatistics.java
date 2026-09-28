package com.avanibank.backend.entity;

public class FraudStatistics {

    private long totalAlerts;
    private long openAlerts;
    private long resolvedAlerts;

    private long criticalAlerts;
    private long highAlerts;
    private long mediumAlerts;
    private long lowAlerts;

    public FraudStatistics() {
    }

    public long getTotalAlerts() {
        return totalAlerts;
    }

    public void setTotalAlerts(long totalAlerts) {
        this.totalAlerts = totalAlerts;
    }

    public long getOpenAlerts() {
        return openAlerts;
    }

    public void setOpenAlerts(long openAlerts) {
        this.openAlerts = openAlerts;
    }

    public long getResolvedAlerts() {
        return resolvedAlerts;
    }

    public void setResolvedAlerts(long resolvedAlerts) {
        this.resolvedAlerts = resolvedAlerts;
    }

    public long getCriticalAlerts() {
        return criticalAlerts;
    }

    public void setCriticalAlerts(long criticalAlerts) {
        this.criticalAlerts = criticalAlerts;
    }

    public long getHighAlerts() {
        return highAlerts;
    }

    public void setHighAlerts(long highAlerts) {
        this.highAlerts = highAlerts;
    }

    public long getMediumAlerts() {
        return mediumAlerts;
    }

    public void setMediumAlerts(long mediumAlerts) {
        this.mediumAlerts = mediumAlerts;
    }

    public long getLowAlerts() {
        return lowAlerts;
    }

    public void setLowAlerts(long lowAlerts) {
        this.lowAlerts = lowAlerts;
    }
}