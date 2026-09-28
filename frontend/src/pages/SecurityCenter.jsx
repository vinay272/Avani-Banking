import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

function SecurityCenter() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveStatus, setLiveStatus] = useState("Connecting...");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const streamReaderRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const loadSecurityData = useCallback(async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [alertsResponse, countResponse] = await Promise.all([
        fetch(`${API_BASE}/fraud/alerts`, {
          headers: getHeaders(),
        }),
        fetch(`${API_BASE}/fraud/alerts/open/count`, {
          headers: getHeaders(),
        }),
      ]);

      if (alertsResponse.status === 401 || countResponse.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!alertsResponse.ok) {
        throw new Error("Unable to load security alerts");
      }

      const alertData = await alertsResponse.json();

      let countData = 0;

      if (countResponse.ok) {
        countData = await countResponse.json();
      }

      setAlerts(Array.isArray(alertData) ? alertData : []);
      setOpenCount(Number(countData) || 0);
    } catch (err) {
      setError(err.message || "Unable to load security information");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  // Real-time fraud alert stream
  useEffect(() => {
    const token = getToken();

    if (!token) return;

    let cancelled = false;

    const connectStream = async () => {
      try {
        setLiveStatus("Connecting...");

        const response = await fetch(`${API_BASE}/fraud/alerts/stream`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
        });

        if (!response.ok || !response.body) {
          throw new Error("Live alert connection failed");
        }

        setLiveStatus("Live");

        const reader = response.body.getReader();
        streamReaderRef.current = reader;

        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { value, done } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const eventBlock of events) {
            const lines = eventBlock.split("\n");

            let eventName = "";
            let eventData = "";

            lines.forEach((line) => {
              if (line.startsWith("event:")) {
                eventName = line.substring(6).trim();
              }

              if (line.startsWith("data:")) {
                eventData += line.substring(5).trim();
              }
            });

            if (eventName === "FRAUD_ALERT" && eventData) {
              try {
                const notification = JSON.parse(eventData);

                setAlerts((previous) => [
                  notification,
                  ...previous,
                ]);

                setOpenCount((previous) => previous + 1);
              } catch {
                // Ignore malformed SSE notification
              }
            }
          }
        }
      } catch {
        if (!cancelled) {
          setLiveStatus("Offline");
        }
      }
    };

    connectStream();

    return () => {
      cancelled = true;

      if (streamReaderRef.current) {
        streamReaderRef.current.cancel().catch(() => {});
        streamReaderRef.current = null;
      }
    };
  }, []);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatAlertType = (value) => {
    if (!value) return "Security Alert";

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getRiskClass = (risk) => {
    switch (String(risk || "").toUpperCase()) {
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

  const getRiskScore = (alert) => {
    if (alert?.riskScore === null || alert?.riskScore === undefined) {
      return 0;
    }

    return Number(alert.riskScore);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
            
          <div>
            <div style={styles.brand}>AVANI BANK</div>
            <div style={styles.headerLabel}>
              DIGITAL BANKING • SECURITY CENTER
            </div>
          </div>

          <button
            style={styles.backButton}
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        {/* Title */}
        <div style={styles.titleSection}>
          <div>
            <h1 style={styles.title}>Security Center</h1>
            <p style={styles.subtitle}>
              Monitor your account security, fraud alerts and suspicious
              activity in real time.
            </p>
          </div>

          <button
            style={styles.refreshButton}
            onClick={loadSecurityData}
            disabled={loading}
          >
            ↻ {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Security Overview */}
        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>🛡️</div>
            <div>
              <div style={styles.cardLabel}>Security Status</div>
              <div style={styles.cardValue}>
                {openCount > 0 ? "Attention Required" : "Protected"}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>⚠️</div>
            <div>
              <div style={styles.cardLabel}>Open Alerts</div>
              <div style={styles.cardValue}>{openCount}</div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>🔴</div>
            <div>
              <div style={styles.cardLabel}>Critical Alerts</div>
              <div style={styles.cardValue}>
                {
                  alerts.filter(
                    (alert) =>
                      String(alert.riskLevel).toUpperCase() === "CRITICAL"
                  ).length
                }
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>📡</div>
            <div>
              <div style={styles.cardLabel}>Live Monitoring</div>
              <div
                style={{
                  ...styles.cardValue,
                  color:
                    liveStatus === "Live"
                      ? "#15803d"
                      : "#b45309",
                }}
              >
                {liveStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Security Status Banner */}
        <div
          style={{
            ...styles.statusBanner,
            background:
              openCount > 0 ? "#fff7ed" : "#f0fdf4",
            borderColor:
              openCount > 0 ? "#fed7aa" : "#bbf7d0",
          }}
        >
          <div style={styles.statusIcon}>
            {openCount > 0 ? "⚠️" : "✓"}
          </div>

          <div>
            <div style={styles.statusTitle}>
              {openCount > 0
                ? "Security alerts need your attention"
                : "Your account is currently secure"}
            </div>

            <div style={styles.statusText}>
              {openCount > 0
                ? `You currently have ${openCount} open security alert${
                    openCount === 1 ? "" : "s"
                  }. Review the alerts below.`
                : "No open fraud alerts are currently associated with your account."}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Security & Fraud Alerts</h2>
              <p style={styles.sectionSubtitle}>
                Alerts detected by Avani Bank's fraud risk engine.
              </p>
            </div>

            <span style={styles.liveBadge}>
              <span style={styles.liveDot}></span>
              {liveStatus === "Live" ? "REAL-TIME" : "MONITORING"}
            </span>
          </div>

          {loading ? (
            <div style={styles.emptyState}>Loading security alerts...</div>
          ) : alerts.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>✓</div>
              <h3>No Security Alerts</h3>
              <p>
                We haven't detected any suspicious activity on your
                account.
              </p>
            </div>
          ) : (
            <div style={styles.alertList}>
              {alerts.map((alert, index) => {
                const risk = String(
                  alert.riskLevel || "LOW"
                ).toUpperCase();

                return (
                  <div
                    key={
                      alert.id ||
                      `${alert.detectedAt}-${index}`
                    }
                    style={styles.alertCard}
                  >
                    <div style={styles.alertTop}>
                      <div>
                        <div style={styles.alertType}>
                          {formatAlertType(alert.alertType)}
                        </div>

                        <div style={styles.alertDate}>
                          Detected {formatDate(alert.detectedAt)}
                        </div>
                      </div>

                      <span
                        className={`risk-badge ${getRiskClass(risk)}`}
                        style={styles.riskBadge}
                      >
                        {risk}
                      </span>
                    </div>

                    <div style={styles.alertBody}>
                      <div>
                        <span style={styles.infoLabel}>Risk Score</span>
                        <strong>
                          {getRiskScore(alert).toFixed(2)}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.infoLabel}>Type</span>
                        <strong>
                          {alert.transactionType || "LOGIN"}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.infoLabel}>Status</span>
                        <strong>
                          {alert.status || "OPEN"}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.infoLabel}>Location</span>
                        <strong>
                          {alert.location || "Not available"}
                        </strong>
                      </div>
                    </div>

                    <p style={styles.description}>
                      {alert.description ||
                        "Suspicious activity was detected by the security monitoring system."}
                    </p>

                    <button
                      style={styles.viewButton}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      View Details →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div style={styles.tipsSection}>
          <h2 style={styles.sectionTitle}>Security Tips</h2>

          <div style={styles.tipsGrid}>
            <div style={styles.tip}>
              <span>🔐</span>
              <div>
                <strong>Protect your credentials</strong>
                <p>
                  Never share your password, OTP or banking credentials.
                </p>
              </div>
            </div>

            <div style={styles.tip}>
              <span>📱</span>
              <div>
                <strong>Use trusted devices</strong>
                <p>
                  Avoid logging into your account from unknown devices.
                </p>
              </div>
            </div>

            <div style={styles.tip}>
              <span>🚨</span>
              <div>
                <strong>Report suspicious activity</strong>
                <p>
                  Contact Avani Bank immediately if you notice unusual
                  activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedAlert && (
        <div
          style={styles.overlay}
          onClick={() => setSelectedAlert(null)}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalLabel}>SECURITY ALERT</div>
                <h2 style={styles.modalTitle}>
                  {formatAlertType(selectedAlert.alertType)}
                </h2>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setSelectedAlert(null)}
              >
                ×
              </button>
            </div>

            <div style={styles.modalGrid}>
              <div>
                <span style={styles.infoLabel}>Risk Level</span>
                <strong>
                  {selectedAlert.riskLevel || "LOW"}
                </strong>
              </div>

              <div>
                <span style={styles.infoLabel}>Risk Score</span>
                <strong>
                  {getRiskScore(selectedAlert).toFixed(2)}
                </strong>
              </div>

              <div>
                <span style={styles.infoLabel}>Status</span>
                <strong>
                  {selectedAlert.status || "OPEN"}
                </strong>
              </div>

              <div>
                <span style={styles.infoLabel}>Transaction Type</span>
                <strong>
                  {selectedAlert.transactionType || "LOGIN"}
                </strong>
              </div>

              <div>
                <span style={styles.infoLabel}>Location</span>
                <strong>
                  {selectedAlert.location || "Not available"}
                </strong>
              </div>

              <div>
                <span style={styles.infoLabel}>Detected At</span>
                <strong>
                  {formatDate(selectedAlert.detectedAt)}
                </strong>
              </div>

              {selectedAlert.transactionId && (
                <div>
                  <span style={styles.infoLabel}>Transaction ID</span>
                  <strong>{selectedAlert.transactionId}</strong>
                </div>
              )}
            </div>

            <div style={styles.descriptionBox}>
              <span style={styles.infoLabel}>Description</span>
              <p>
                {selectedAlert.description ||
                  "No additional description available."}
              </p>
            </div>

            <button
              style={styles.modalButton}
              onClick={() => setSelectedAlert(null)}
            >
              Close
            </button>
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
    padding: "24px 32px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
  },

  header: {
    maxHeight: "100px",
    borderRadius:"18px",
    background:"linear-gradient(135deg, #102354 0%, #173b8c 58%, #2457c6 100%)",
    color: "#ffffff",
    padding: "28px 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    boxSizing: "border-box",
    boxShadow: "0 10px 30px rgba(18,51,120,0.14)",
  },

  brand: {
    fontSize: "22px",
    fontWeight: "600",
    letterSpacing: "2px",
    color: "#ffffff",
  },

 

  headerLabel: {
    marginTop: "4px",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "1.2px",
    color: "#c0c9d7",
  },

  backButton: {
    border: "1px solid #d1d5db",
    background: "#fbfcfc",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#173b8c",
    fontWeight: "600",
  },

  titleSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
    color:"#ffffff",
  },

  title: {
    margin: 20,
    fontSize: "32px",
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  refreshButton: {
    border: "none",
    background: "#1e3a8a",
    color: "#ffffff",
    padding: "11px 18px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },

  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "13px 16px",
    borderRadius: "9px",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "13px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
  },

  cardIcon: {
    fontSize: "25px",
  },

  cardLabel: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "5px",
  },

  cardValue: {
    fontSize: "19px",
    fontWeight: "800",
    color: "#111827",
  },

  statusBanner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 20px",
    border: "1px solid",
    borderRadius: "12px",
    marginBottom: "24px",
  },

  statusIcon: {
    fontSize: "27px",
  },

  statusTitle: {
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: "4px",
  },

  statusText: {
    fontSize: "13px",
    color: "#64748b",
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
    marginBottom: "24px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "21px",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    color: "#15803d",
  },

  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  emptyState: {
    textAlign: "center",
    padding: "55px 20px",
    color: "#64748b",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    margin: "0 auto 12px",
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    fontWeight: "800",
  },

  alertList: {
    display: "grid",
    gap: "14px",
  },

  alertCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "11px",
    padding: "18px",
    background: "#ffffff",
  },

  alertTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  alertType: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#111827",
  },

  alertDate: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#64748b",
  },

  riskBadge: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
  },

  alertBody: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginTop: "18px",
    paddingTop: "15px",
    borderTop: "1px solid #f1f5f9",
  },

  infoLabel: {
    display: "block",
    fontSize: "10px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: "4px",
    fontWeight: "700",
  },

  description: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#475569",
    margin: "16px 0 12px",
  },

  viewButton: {
    border: "none",
    background: "transparent",
    color: "#1d4ed8",
    padding: 0,
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  tipsSection: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
  },

  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginTop: "18px",
  },

  tip: {
    display: "flex",
    gap: "12px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "10px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "650px",
    background: "#ffffff",
    borderRadius: "15px",
    padding: "26px",
    boxSizing: "border-box",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },

  modalLabel: {
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    color: "#64748b",
  },

  modalTitle: {
    margin: "5px 0 0",
    fontSize: "24px",
    color: "#111827",
  },

  closeButton: {
    border: "none",
    background: "#f1f5f9",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    fontSize: "22px",
    cursor: "pointer",
  },

  modalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "18px",
  },

  descriptionBox: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "15px",
    marginTop: "22px",
  },

  modalButton: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#1e3a8a",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default SecurityCenter;