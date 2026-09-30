import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

function AdminFraudDashboard() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [riskFilter, setRiskFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolving, setResolving] = useState(false);

  const token = localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    await Promise.all([
      fetchAlerts(),
      fetchStatistics(),
    ]);

    setLoading(false);
  };

  const fetchAlerts = async () => {
    try {
      setError("");

      let url = `${API_BASE}/admin/fraud/alerts`;

      if (riskFilter) {
        url = `${API_BASE}/admin/fraud/alerts/risk/${riskFilter}`;
      }

      if (typeFilter) {
        url = `${API_BASE}/admin/fraud/alerts/type/${typeFilter}`;
      }

      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (response.status === 401 || response.status === 403) {
        setError(
          "Admin access required. Please login with BANK_ADMIN or SUPER_ADMIN."
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load fraud alerts.");
      }

      const data = await response.json();

      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Admin fraud alerts error:", err);
      setError(err.message || "Unable to load fraud alerts.");
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);

      const response = await fetch(
        `${API_BASE}/admin/fraud/statistics`,
        {
          headers: getHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load fraud statistics.");
      }

      const data = await response.json();

      setStatistics(data);
    } catch (err) {
      console.error("Fraud statistics error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);

    await Promise.all([
      fetchAlerts(),
      fetchStatistics(),
    ]);

    setLoading(false);
  };

  const resolveAlert = async () => {
    if (!selectedAlert) return;

    try {
      setResolving(true);

      const response = await fetch(
        `${API_BASE}/admin/fraud/alerts/${selectedAlert.id}/resolve?resolutionNote=${encodeURIComponent(
          resolutionNote
        )}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        setError("You do not have permission to resolve this alert.");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to resolve fraud alert.");
      }

      setSelectedAlert(null);
      setResolutionNote("");

      await refreshDashboard();
    } catch (err) {
      console.error("Resolve alert error:", err);
      setError(err.message || "Unable to resolve alert.");
    } finally {
      setResolving(false);
    }
  };

  const totalAlerts = useMemo(() => {
    return Number(
      statistics?.totalAlerts ??
        statistics?.total ??
        statistics?.totalFraudAlerts ??
        alerts.length
    );
  }, [statistics, alerts]);

  const openAlerts = useMemo(() => {
    if (statistics?.openAlerts !== undefined) {
      return Number(statistics.openAlerts);
    }

    return alerts.filter(
      (alert) =>
        String(alert.status).toUpperCase() === "OPEN"
    ).length;
  }, [statistics, alerts]);

  const criticalAlerts = useMemo(() => {
    if (statistics?.criticalAlerts !== undefined) {
      return Number(statistics.criticalAlerts);
    }

    return alerts.filter(
      (alert) =>
        String(alert.riskLevel).toUpperCase() === "CRITICAL"
    ).length;
  }, [statistics, alerts]);

  const highAlerts = useMemo(() => {
    if (statistics?.highRiskAlerts !== undefined) {
      return Number(statistics.highRiskAlerts);
    }

    if (statistics?.highAlerts !== undefined) {
      return Number(statistics.highAlerts);
    }

    return alerts.filter(
      (alert) =>
        String(alert.riskLevel).toUpperCase() === "HIGH"
    ).length;
  }, [statistics, alerts]);

  const mediumAlerts = useMemo(() => {
    if (statistics?.mediumRiskAlerts !== undefined) {
      return Number(statistics.mediumRiskAlerts);
    }

    if (statistics?.mediumAlerts !== undefined) {
      return Number(statistics.mediumAlerts);
    }

    return alerts.filter(
      (alert) =>
        String(alert.riskLevel).toUpperCase() === "MEDIUM"
    ).length;
  }, [statistics, alerts]);

  const resolvedAlerts = useMemo(() => {
    if (statistics?.resolvedAlerts !== undefined) {
      return Number(statistics.resolvedAlerts);
    }

    return alerts.filter(
      (alert) =>
        String(alert.status).toUpperCase() === "RESOLVED"
    ).length;
  }, [statistics, alerts]);

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskClass = (risk) => {
    switch (String(risk).toUpperCase()) {
      case "CRITICAL":
        return "critical";

      case "HIGH":
        return "high";

      case "MEDIUM":
        return "medium";

      default:
        return "low";
    }
  };

  const formatAlertType = (type) => {
    return String(type || "N/A")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleRiskChange = async (value) => {
    setRiskFilter(value);
    setTypeFilter("");

    setLoading(true);

    let url = `${API_BASE}/admin/fraud/alerts`;

    if (value) {
      url = `${API_BASE}/admin/fraud/alerts/risk/${value}`;
    }

    try {
      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to filter alerts.");
      }

      const data = await response.json();

      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to filter alerts.");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = async (value) => {
    setTypeFilter(value);
    setRiskFilter("");

    setLoading(true);

    let url = `${API_BASE}/admin/fraud/alerts`;

    if (value) {
      url = `${API_BASE}/admin/fraud/alerts/type/${value}`;
    }

    try {
      const response = await fetch(url, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Unable to filter alerts.");
      }

      const data = await response.json();

      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to filter alerts.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setRiskFilter("");
    setTypeFilter("");

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/admin/fraud/alerts`,
        {
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load alerts.");
      }

      const data = await response.json();

      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load alerts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="admin-fraud-page">
      {/* ================= HEADER ================= */}

      <header style={styles.navbar} className="admin-fraud-navbar">
        <div style={styles.brandArea} className="admin-fraud-brand">
          <div style={styles.brandIcon} className="admin-fraud-brand-icon">🛡️</div>

          <div>
            <div style={styles.brandName}>
              AVANI BANK
            </div>

            <div style={styles.brandSubtitle}>
              Security & Risk Management
            </div>
          </div>
        </div>

        <div style={styles.navRight} className="admin-fraud-nav-right">
          <span style={styles.adminBadge}>
            ADMIN SECURITY PANEL
          </span>

          <button
            style={styles.backButton}
            onClick={() => navigate("/admin/dashboard")}
          >
           ← Admin Dashboard
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main style={styles.container} className="admin-fraud-container">
        <section style={styles.heading} className="admin-fraud-heading">
          <div>
            <p style={styles.eyebrow}>
              SECURITY OPERATIONS
            </p>

            <h1 style={styles.title}>
              Fraud Detection & Risk Management
            </h1>

            <p style={styles.subtitle}>
              Monitor suspicious activity, investigate risk
              alerts and manage security incidents.
            </p>
          </div>

          <button
            style={styles.refreshButton}
            onClick={refreshDashboard}
          >
            ↻ Refresh
          </button>
        </section>

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* ================= KPI ================= */}

        <section style={styles.kpiGrid} className="admin-fraud-kpi">
          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>🔔</div>

            <div>
              <p style={styles.kpiLabel}>
                TOTAL ALERTS
              </p>

              <h2 style={styles.kpiValue}>
                {totalAlerts}
              </h2>

              <p style={styles.kpiSub}>
                All fraud incidents
              </p>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>⏳</div>

            <div>
              <p style={styles.kpiLabel}>
                OPEN ALERTS
              </p>

              <h2 style={styles.kpiValue}>
                {openAlerts}
              </h2>

              <p style={styles.kpiSub}>
                Require investigation
              </p>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div
              style={{
                ...styles.kpiIcon,
                background: "#fee2e2",
              }}
            >
              🚨
            </div>

            <div>
              <p style={styles.kpiLabel}>
                CRITICAL
              </p>

              <h2
                style={{
                  ...styles.kpiValue,
                  color: "#b91c1c",
                }}
              >
                {criticalAlerts}
              </h2>

              <p style={styles.kpiSub}>
                Highest risk
              </p>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div
              style={{
                ...styles.kpiIcon,
                background: "#fff1f2",
              }}
            >
              ⚠️
            </div>

            <div>
              <p style={styles.kpiLabel}>
                HIGH RISK
              </p>

              <h2
                style={{
                  ...styles.kpiValue,
                  color: "#dc2626",
                }}
              >
                {highAlerts}
              </h2>

              <p style={styles.kpiSub}>
                Priority incidents
              </p>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div
              style={{
                ...styles.kpiIcon,
                background: "#fff7ed",
              }}
            >
              ◉
            </div>

            <div>
              <p style={styles.kpiLabel}>
                MEDIUM RISK
              </p>

              <h2
                style={{
                  ...styles.kpiValue,
                  color: "#b7791f",
                }}
              >
                {mediumAlerts}
              </h2>

              <p style={styles.kpiSub}>
                Monitor closely
              </p>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div
              style={{
                ...styles.kpiIcon,
                background: "#ecfdf5",
              }}
            >
              ✓
            </div>

            <div>
              <p style={styles.kpiLabel}>
                RESOLVED
              </p>

              <h2
                style={{
                  ...styles.kpiValue,
                  color: "#16875a",
                }}
              >
                {resolvedAlerts}
              </h2>

              <p style={styles.kpiSub}>
                Closed incidents
              </p>
            </div>
          </div>
        </section>

        {/* ================= ALERTS ================= */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.eyebrow}>
                FRAUD MONITORING
              </p>

              <h2 style={styles.sectionTitle}>
                Fraud Alerts
              </h2>
            </div>
          </div>

          {/* FILTERS */}

          <div style={styles.filterBar} className="admin-fraud-filter-bar">
            <select
              value={riskFilter}
              onChange={(event) =>
                handleRiskChange(event.target.value)
              }
              style={styles.select}
            >
              <option value="">
                All Risk Levels
              </option>

              <option value="CRITICAL">
                Critical
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="LOW">
                Low
              </option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) =>
                handleTypeChange(event.target.value)
              }
              style={styles.select}
            >
              <option value="">
                All Alert Types
              </option>

              <option value="SUSPICIOUS_TRANSACTION">
                Suspicious Transaction
              </option>

              <option value="UNUSUAL_DEVICE">
                Unusual Device
              </option>

              <option value="GEO_LOCATION_RISK">
                Geo Location Risk
              </option>

              <option value="VELOCITY_CHECK">
                Velocity Check
              </option>

              <option value="ACCOUNT_TAKEOVER">
                Account Takeover
              </option>

              <option value="MONEY_LAUNDERING">
                Money Laundering
              </option>
            </select>

            <button
              style={styles.clearButton}
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          <div style={styles.tableCard}>
            {loading ? (
              <div style={styles.tableLoading}>
                <div style={styles.loader}></div>
                Loading fraud alerts...
              </div>
            ) : alerts.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  ✓
                </div>

                <h3>No fraud alerts found</h3>

                <p>
                  There are no alerts matching the
                  selected filters.
                </p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ALERT ID</th>
                      <th>CUSTOMER</th>
                      <th>ALERT TYPE</th>
                      <th>RISK</th>
                      <th>SCORE</th>
                      <th>TRANSACTION</th>
                      <th>LOCATION</th>
                      <th>STATUS</th>
                      <th>DETECTED</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          <strong>
                            #{alert.id}
                          </strong>
                        </td>

                        <td>
                          <div style={styles.customerCell}>
                            <div style={styles.customerAvatar}>
                              {(
                                alert.customer?.fullName ||
                                alert.customer?.email ||
                                "C"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div style={styles.customerName}>
                                {alert.customer?.fullName ||
                                  alert.customer?.email ||
                                  "Customer"}
                              </div>

                              <div style={styles.customerEmail}>
                                {alert.customer?.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={styles.alertType}>
                            {formatAlertType(
                              alert.alertType
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            style={{
                              ...styles.riskBadge,
                              ...styles[
                                getRiskClass(
                                  alert.riskLevel
                                )
                              ],
                            }}
                          >
                            {alert.riskLevel}
                          </span>
                        </td>

                        <td>
                          <strong style={styles.score}>
                            {Number(
                              alert.riskScore || 0
                            ).toFixed(0)}
                          </strong>
                        </td>

                        <td>
                          {alert.transactionType || "LOGIN"}
                        </td>

                        <td>
                          {alert.location || "N/A"}
                        </td>

                        <td>
                          <span
                            style={
                              String(alert.status).toUpperCase() ===
                              "RESOLVED"
                                ? styles.resolvedBadge
                                : styles.openBadge
                            }
                          >
                            {alert.status || "OPEN"}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            alert.detectedAt ||
                              alert.createdAt
                          )}
                        </td>

                        <td>
                          <button
                            style={styles.actionButton}
                            onClick={() =>
                              setSelectedAlert(alert)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
        {/* ================= RISK ANALYTICS ================= */}

<section style={styles.analyticsSection} className="admin-fraud-analytics-section">
  <div style={styles.sectionHeader}>
    <div>
      <p style={styles.eyebrow}>
        SECURITY INTELLIGENCE
      </p>

      <h2 style={styles.sectionTitle}>
        Fraud Risk Analytics
      </h2>
    </div>
  </div>

  <div style={styles.analyticsGrid} className="admin-fraud-analytics">

    {/* RISK DISTRIBUTION */}

    <div style={styles.analyticsCard}>
      <h3 style={styles.analyticsTitle}>
        Risk Distribution
      </h3>

      {[
        {
          label: "Critical",
          value: criticalAlerts,
          className: "critical",
        },
        {
          label: "High",
          value: highAlerts,
          className: "high",
        },
        {
          label: "Medium",
          value: mediumAlerts,
          className: "medium",
        },
        {
          label: "Low",
          value: Number(
            statistics?.lowAlerts || 0
          ),
          className: "low",
        },
      ].map((item) => (
        <div
          key={item.label}
          style={styles.analyticsRow}
        >
          <div style={styles.analyticsRowLeft}>
            <span
              style={{
                ...styles.analyticsDot,
                ...styles[item.className],
              }}
            ></span>

            <span>{item.label}</span>
          </div>

          <strong>{item.value}</strong>
        </div>
      ))}
    </div>

    {/* ALERT TYPE DISTRIBUTION */}

    <div style={styles.analyticsCard}>
      <h3 style={styles.analyticsTitle}>
        Alert Types
      </h3>

      {[
        "SUSPICIOUS_TRANSACTION",
        "UNUSUAL_DEVICE",
        "GEO_LOCATION_RISK",
        "VELOCITY_CHECK",
        "ACCOUNT_TAKEOVER",
        "MONEY_LAUNDERING",
      ].map((type) => {
        const count = alerts.filter(
          (alert) =>
            String(alert.alertType).toUpperCase() === type
        ).length;

        return (
          <div
            key={type}
            style={styles.analyticsRow}
          >
            <span>
              {formatAlertType(type)}
            </span>

            <strong>{count}</strong>
          </div>
        );
      })}
    </div>

    {/* TRANSACTION RISK */}

    <div style={styles.analyticsCard}>
      <h3 style={styles.analyticsTitle}>
        Transaction Risk
      </h3>

      {[
        "TRANSFER",
        "UPI",
        "NEFT",
        "RTGS",
        "IMPS",
      ].map((type) => {
        const count = alerts.filter(
          (alert) =>
            String(
              alert.transactionType
            ).toUpperCase() === type
        ).length;

        return (
          <div
            key={type}
            style={styles.analyticsRow}
          >
            <span>{type}</span>

            <strong>{count}</strong>
          </div>
        );
      })}
    </div>

    {/* LOGIN / SECURITY RISK */}

    <div style={styles.analyticsCard}>
      <h3 style={styles.analyticsTitle}>
        Login & Security Risk
      </h3>

      {[
        "UNUSUAL_DEVICE",
        "ACCOUNT_TAKEOVER",
        "GEO_LOCATION_RISK",
      ].map((type) => {
        const count = alerts.filter(
          (alert) =>
            String(alert.alertType).toUpperCase() === type
        ).length;

        return (
          <div
            key={type}
            style={styles.analyticsRow}
          >
            <span>
              {formatAlertType(type)}
            </span>

            <strong>{count}</strong>
          </div>
        );
      })}
    </div>

  </div>
</section>

{/* ================= CUSTOMER SUPPORT ================= */}

<section style={styles.section}>
  <div style={styles.sectionHeader}>
    <div>
      <p style={styles.eyebrow}>
        CUSTOMER SERVICE
      </p>

      <h2 style={styles.sectionTitle}>
        Customer Support
      </h2>
    </div>
  </div>

  <button
    type="button"
    style={{
      ...styles.analyticsCard,
      width: "100%",
      textAlign: "left",
      cursor: "pointer",
      border: "1px solid #e8ecf2",
    }}
    onClick={() => navigate("/admin/customer-support")}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "12px",
          background: "#eef7f5",
          color: "#16806b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          flexShrink: 0,
        }}
      >
        💬
      </div>

      <div>
        <h3
          style={{
            margin: "0 0 5px",
            fontSize: "14px",
            color: "#243452",
          }}
        >
          Customer Support Portal
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: "10px",
            color: "#8993a8",
          }}
        >
          Manage complaints, service requests, appointments,
          feedback and customer live chat.
        </p>
      </div>

      <span
        style={{
          marginLeft: "auto",
          fontSize: "18px",
          color: "#2457c6",
        }}
      >
        →
      </span>
    </div>
  </button>
</section>

{/* ================= REPORTS & ANALYTICS ================= */}

<section style={styles.section}>
  <div style={styles.sectionHeader}>
    <div>
      <p style={styles.eyebrow}>
        EXECUTIVE INTELLIGENCE
      </p>

      <h2 style={styles.sectionTitle}>
        Reports & Analytics
      </h2>
    </div>
  </div>

  <button
    type="button"
    style={{
      ...styles.analyticsCard,
      width: "100%",
      textAlign: "left",
      cursor: "pointer",
      border: "1px solid #e8ecf2",
    }}
    onClick={() => navigate("/admin/reports")}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "12px",
          background: "#eef4ff",
          color: "#2457c6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          flexShrink: 0,
        }}
      >
        📊
      </div>

      <div>
        <h3
          style={{
            margin: "0 0 5px",
            fontSize: "14px",
            color: "#243452",
          }}
        >
          Executive Dashboard & Reports
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: "10px",
            color: "#8993a8",
          }}
        >
          View banking KPIs, financial reports,
          compliance reports and executive analytics.
        </p>
      </div>

      <span
        style={{
          marginLeft: "auto",
          fontSize: "18px",
          color: "#2457c6",
        }}
      >
        →
      </span>
    </div>
  </button>
</section>
      </main>

      {/* ================= ALERT DETAILS MODAL ================= */}

      {selectedAlert && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedAlert(null)}
        >
          <div
            style={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div style={styles.modalHeader}>
              <div>
                <p style={styles.eyebrow}>
                  SECURITY INCIDENT
                </p>

                <h2 style={styles.modalTitle}>
                  Alert #{selectedAlert.id}
                </h2>
              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setSelectedAlert(null)
                }
              >
                ×
              </button>
            </div>

            <div style={styles.detailGrid} className="admin-fraud-detail-grid">
              <div>
                <span style={styles.detailLabel}>
                  CUSTOMER
                </span>

                <strong>
                  {selectedAlert.customer?.fullName ||
                    selectedAlert.customer?.email ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  ALERT TYPE
                </span>

                <strong>
                  {formatAlertType(
                    selectedAlert.alertType
                  )}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  RISK LEVEL
                </span>

                <strong>
                  {selectedAlert.riskLevel || "N/A"}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  RISK SCORE
                </span>

                <strong>
                  {Number(
                    selectedAlert.riskScore || 0
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  TRANSACTION TYPE
                </span>

                <strong>
                  {selectedAlert.transactionType ||
                    "LOGIN"}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  LOCATION
                </span>

                <strong>
                  {selectedAlert.location || "N/A"}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  STATUS
                </span>

                <strong>
                  {selectedAlert.status || "OPEN"}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  TRANSACTION ID
                </span>

                <strong>
                  {selectedAlert.transactionId ||
                    "N/A"}
                </strong>
              </div>
            </div>

            <div style={styles.descriptionBox}>
              <span style={styles.detailLabel}>
                DESCRIPTION
              </span>

              <p>
                {selectedAlert.description ||
                  "No description available."}
              </p>
            </div>

            {String(selectedAlert.status).toUpperCase() ===
              "OPEN" && (
              <div style={styles.resolveSection}>
                <span style={styles.detailLabel}>
                  RESOLUTION NOTE
                </span>

                <textarea
                  value={resolutionNote}
                  onChange={(event) =>
                    setResolutionNote(
                      event.target.value
                    )
                  }
                  placeholder="Enter investigation/resolution note..."
                  style={styles.textarea}
                  rows={4}
                />

                <button
                  style={styles.resolveButton}
                  onClick={resolveAlert}
                  disabled={resolving}
                >
                  {resolving
                    ? "Resolving..."
                    : "✓ Resolve Alert"}
                </button>
              </div>
            )}

            <div style={styles.detectedBox}>
              Detected:{" "}
              {formatDate(
                selectedAlert.detectedAt ||
                  selectedAlert.createdAt
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "25px 32px ",
    color: "#172033",
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
  },

  navbar: {
    height: "100px",
    borderRadius: "18px",
    background:"linear-gradient(135deg, #102354 0%, #173b8c 58%, #2457c6 100%)",
    borderBottom: "1px solid #e8ecf2",
    padding: "0 5%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  brandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg,#102354,#2457c6)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  brandName: {
    fontSize: "15px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#ffffff",
  },

  brandSubtitle: {
    marginTop: "2px",
    fontSize: "10px",
    color: "#bec5d6",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  adminBadge: {
    background: "#eef4ff",
    color: "#2457c6",
    padding: "8px 11px",
    borderRadius: "16px",
    fontSize: "9px",
    fontWeight: "800",
  },

  backButton: {
    border: "1px solid #dfe5ef",
    background: "#fff",
    color: "#35527f",
    borderRadius: "9px",
    padding: "9px 14px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  container: {
    width: "100%",
    maxWidth: "1380px",
    margin: "0 auto",
    padding: "35px 24px 60px",
    boxSizing: "border-box",
  },

  heading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "25px",
  },

  eyebrow: {
    margin: 0,
    fontSize: "9px",
    color: "#5572af",
    letterSpacing: "1.5px",
    fontWeight: "800",
  },

  title: {
    margin: "5px 0 7px",
    fontSize: "31px",
    color: "#15213d",
  },

  subtitle: {
    margin: 0,
    color: "#7d879b",
    fontSize: "13px",
  },

  refreshButton: {
    border: "1px solid #dfe5ef",
    background: "#fff",
    color: "#2457c6",
    borderRadius: "9px",
    padding: "10px 15px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  errorBox: {
    background: "#fff1f1",
    border: "1px solid #f2c4c4",
    color: "#a52d2d",
    padding: "12px 15px",
    borderRadius: "10px",
    fontSize: "11px",
    marginBottom: "18px",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(6,minmax(0,1fr))",
    gap: "12px",
  },

  kpiCard: {
    background: "#fff",
    border: "1px solid #e8ecf2",
    borderRadius: "15px",
    padding: "17px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    boxShadow:
      "0 6px 20px rgba(24,43,83,.035)",
  },

  kpiIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#eef4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  kpiLabel: {
    margin: 0,
    fontSize: "7px",
    color: "#8b94a7",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  kpiValue: {
    margin: "4px 0 2px",
    fontSize: "20px",
    color: "#182440",
  },

  kpiSub: {
    margin: 0,
    fontSize: "8px",
    color: "#9aa2b2",
  },

  section: {
    marginTop: "32px",
  },

  sectionHeader: {
    marginBottom: "13px",
  },

  sectionTitle: {
    margin: "4px 0 0",
    fontSize: "20px",
    color: "#17233f",
  },

  filterBar: {
    background: "#fff",
    border: "1px solid #e8ecf2",
    borderRadius: "14px 14px 0 0",
    padding: "13px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  select: {
    border: "1px solid #dfe5ef",
    background: "#fff",
    color: "#394866",
    borderRadius: "8px",
    padding: "9px 11px",
    fontSize: "10px",
    outline: "none",
  },

  clearButton: {
    border: "none",
    background: "#f1f4f8",
    color: "#526078",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  tableCard: {
    background: "#fff",
    border: "1px solid #e8ecf2",
    borderTop: "none",
    borderRadius: "0 0 14px 14px",
    overflow: "hidden",
    boxShadow:
      "0 6px 22px rgba(24,43,83,.035)",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },

//   table th: {
//     background: "#f8f9fc",
//     padding: "12px 13px",
//     textAlign: "left",
//     fontSize: "8px",
//     letterSpacing: "0.7px",
//     color: "#8993a8",
//     fontWeight: "800",
//     borderBottom: "1px solid #e8ecf2",
//   },

//   table td: {
//     padding: "13px",
//     fontSize: "9px",
//     color: "#4d5870",
//     borderBottom: "1px solid #edf0f5",
//     verticalAlign: "middle",
//   },

  customerCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  customerAvatar: {
    width: "29px",
    height: "29px",
    borderRadius: "9px",
    background: "#edf3ff",
    color: "#2457c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
  },

  customerName: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#263452",
  },

  customerEmail: {
    marginTop: "2px",
    fontSize: "8px",
    color: "#99a1b0",
  },

  alertType: {
    fontSize: "9px",
    fontWeight: "700",
    color: "#354461",
  },

  riskBadge: {
    display: "inline-block",
    padding: "4px 7px",
    borderRadius: "10px",
    fontSize: "7px",
    fontWeight: "800",
  },

  critical: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  high: {
    background: "#fff1f2",
    color: "#dc2626",
  },

  medium: {
    background: "#fff7ed",
    color: "#b7791f",
  },

  low: {
    background: "#ecfdf5",
    color: "#16875a",
  },

  score: {
    color: "#24365f",
    fontSize: "12px",
  },

  openBadge: {
    background: "#fff7ed",
    color: "#b7791f",
    padding: "4px 7px",
    borderRadius: "9px",
    fontSize: "7px",
    fontWeight: "800",
  },

  resolvedBadge: {
    background: "#ecfdf5",
    color: "#16875a",
    padding: "4px 7px",
    borderRadius: "9px",
    fontSize: "7px",
    fontWeight: "800",
  },

  actionButton: {
    border: "1px solid #dce3ef",
    background: "#fff",
    color: "#2457c6",
    borderRadius: "7px",
    padding: "6px 9px",
    fontSize: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },

  tableLoading: {
    minHeight: "220px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#7e889b",
    fontSize: "11px",
  },

  loader: {
    width: "18px",
    height: "18px",
    border: "2px solid #dce4f2",
    borderTop: "2px solid #2457c6",
    borderRadius: "50%",
    animation: "adminFraudSpin .8s linear infinite",
  },

  emptyState: {
    padding: "70px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    margin: "0 auto",
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    background: "#ecfdf5",
    color: "#16875a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,20,40,.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "720px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxSizing: "border-box",
    boxShadow:
      "0 25px 70px rgba(0,0,0,.2)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    paddingBottom: "18px",
    borderBottom: "1px solid #edf0f5",
  },

  modalTitle: {
    margin: "5px 0 0",
    fontSize: "20px",
    color: "#182440",
  },

  closeButton: {
    width: "32px",
    height: "32px",
    border: "none",
    background: "#f2f4f8",
    borderRadius: "8px",
    fontSize: "21px",
    color: "#667085",
    cursor: "pointer",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: "19px",
    padding: "20px 0",
  },

  detailLabel: {
    display: "block",
    fontSize: "8px",
    letterSpacing: "1px",
    color: "#929bad",
    fontWeight: "800",
    marginBottom: "5px",
  },

  descriptionBox: {
    background: "#f7f9fc",
    borderRadius: "11px",
    padding: "14px",
  },

  resolveSection: {
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "1px solid #edf0f5",
  },

  textarea: {
    width: "100%",
    border: "1px solid #dfe5ef",
    borderRadius: "9px",
    padding: "10px",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "11px",
    outline: "none",
  },

  resolveButton: {
    marginTop: "10px",
    border: "none",
    background:
      "linear-gradient(135deg,#173b8c,#2563c7)",
    color: "#fff",
    borderRadius: "9px",
    padding: "10px 15px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  detectedBox: {
    marginTop: "15px",
    fontSize: "9px",
    color: "#8993a8",
  },

  analyticsSection: {
  marginTop: "32px",
},

analyticsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(2,minmax(0,1fr))",
  gap: "14px",
},

analyticsCard: {
  background: "#fff",
  border: "1px solid #e8ecf2",
  borderRadius: "15px",
  padding: "19px",
  boxShadow: "0 6px 22px rgba(24,43,83,.035)",
},

analyticsTitle: {
  margin: "0 0 16px",
  fontSize: "13px",
  color: "#243452",
},

analyticsRow: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "15px",
  padding: "10px 0",
  borderBottom: "1px solid #edf0f5",
  fontSize: "10px",
  color: "#657188",
},

analyticsRowLeft: {
  display: "flex",
  alignItems: "center",
  gap: "8px",
},

analyticsDot: {
  width: "9px",
  height: "9px",
  borderRadius: "50%",
  display: "inline-block",
},
};

const styleSheet = document.createElement("style");

styleSheet.innerHTML = `
  @keyframes adminFraudSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1000px) {
    .admin-fraud-kpi {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 700px) {
    .admin-fraud-kpi {
      grid-template-columns: repeat(2, 1fr);
    }
  }
    @media (max-width: 700px) {
  .admin-fraud-analytics {
    grid-template-columns: 1fr;
  }
}

  @media (max-width: 1000px) {
    .admin-fraud-page {
      padding: 18px 20px;
    }

    .admin-fraud-navbar {
      height: auto !important;
      min-height: 86px;
      padding: 16px 22px !important;
      flex-wrap: wrap;
    }

    .admin-fraud-nav-right {
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .admin-fraud-kpi {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 700px) {
    .admin-fraud-page {
      padding: 12px;
      overflow-x: hidden;
    }

    .admin-fraud-navbar {
      border-radius: 14px;
      padding: 14px !important;
      gap: 12px;
      align-items: flex-start;
    }

    .admin-fraud-brand {
      width: 100%;
      min-width: 0;
    }

    .admin-fraud-nav-right {
      width: 100%;
      justify-content: stretch;
      align-items: stretch;
      gap: 8px;
    }

    .admin-fraud-nav-right .admin-fraud-back-button {
      flex: 1;
    }

    .admin-fraud-container {
      padding: 24px 4px 40px !important;
    }

    .admin-fraud-heading {
      flex-direction: column;
      align-items: stretch !important;
      gap: 14px !important;
    }

    .admin-fraud-heading button {
      width: 100%;
    }

    .admin-fraud-kpi {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 9px !important;
    }

    .admin-fraud-filter-bar {
      flex-direction: column;
      align-items: stretch !important;
    }

    .admin-fraud-filter-bar select,
    .admin-fraud-filter-bar button {
      width: 100%;
      box-sizing: border-box;
    }

    .admin-fraud-analytics {
      grid-template-columns: 1fr !important;
    }

    .admin-fraud-modal {
      max-height: 94vh !important;
      padding: 18px !important;
      border-radius: 14px !important;
    }

    .admin-fraud-detail-grid {
      grid-template-columns: 1fr !important;
      gap: 14px !important;
    }
  }

  @media (max-width: 480px) {
    .admin-fraud-page {
      padding: 8px;
    }

    .admin-fraud-navbar {
      padding: 12px !important;
    }

    .admin-fraud-brand {
      gap: 9px;
    }

    .admin-fraud-brand .admin-fraud-brand-icon {
      width: 38px;
      height: 38px;
    }

    .admin-fraud-nav-right {
      flex-direction: column;
    }

    .admin-fraud-nav-right > * {
      width: 100%;
      box-sizing: border-box;
      text-align: center;
    }

    .admin-fraud-kpi {
      grid-template-columns: 1fr !important;
    }

    .admin-fraud-kpi > div {
      min-width: 0;
    }

    .admin-fraud-modal {
      padding: 15px !important;
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default AdminFraudDashboard;