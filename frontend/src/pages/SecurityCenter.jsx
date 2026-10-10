import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080/api";

function SecurityCenter() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("avani-theme") === "dark"
  );

  useEffect(() => {
    const syncTheme = () =>
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    window.addEventListener("storage", syncTheme);
    syncTheme();
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const darkOverrides = {
    page: { background: "#0f172a", color: "#e2e8f0" },
    title: { color: "#f8fafc" },
    subtitle: { color: "#cbd5e1" },
    error: { background: "#451a1a", borderColor: "#7f1d1d", color: "#fecaca" },
    card: { background: "#1e293b", borderColor: "#334155", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" },
    cardLabel: { color: "#cbd5e1" },
    cardValue: { color: "#f8fafc" },
    statusBanner: { background: "#1e293b", borderColor: "#475569" },
    statusTitle: { color: "#f8fafc" },
    statusText: { color: "#cbd5e1" },
    section: { background: "#1e293b", borderColor: "#334155", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" },
    sectionTitle: { color: "#f1f5f9" },
    sectionSubtitle: { color: "#cbd5e1" },
    emptyState: { color: "#cbd5e1" },
    alertCard: { background: "#172033", borderColor: "#334155" },
    alertType: { color: "#f8fafc" },
    alertDate: { color: "#cbd5e1" },
    infoLabel: { color: "#94a3b8" },
    description: { color: "#cbd5e1" },
    tipsSection: { background: "#1e293b", borderColor: "#334155" },
    tip: { background: "#172033", color: "#e2e8f0" },
    overlay: { background: "rgba(2,6,23,0.78)" },
    modal: { background: "#1e293b", color: "#e2e8f0" },
    modalLabel: { color: "#cbd5e1" },
    modalTitle: { color: "#f8fafc" },
    closeButton: { background: "#334155", color: "#f8fafc" },
    descriptionBox: { background: "#172033", color: "#e2e8f0" },
  };

  const getThemeStyle = (name) => ({
    ...(styles[name] || {}),
    ...(darkMode ? (darkOverrides[name] || {}) : {}),
  });

  const [alerts, setAlerts] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveStatus, setLiveStatus] = useState("Connecting...");
  const [selectedAlert, setSelectedAlert] = useState(null);

  // =========================
  // RESPONSIVE VIEW
  // =========================

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 700
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <div style={{ ...getThemeStyle("page"), ...(isMobile ? responsiveStyles.page : {}) }}>
      <div style={{ ...getThemeStyle("container"), ...(isMobile ? responsiveStyles.container : {}) }}>
        {/* Header */}
        <div style={{ ...styles.header, ...(isMobile ? responsiveStyles.header : {}) }}>
            
          <div>
            <div style={getThemeStyle("brand")}>AVANI BANK</div>
            <div style={getThemeStyle("headerLabel")}>
              DIGITAL BANKING • SECURITY CENTER
            </div>
          </div>

          <button
            style={{ ...styles.backButton, ...(isMobile ? responsiveStyles.backButton : {}) }}
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        {/* Title */}
        <div style={{ ...getThemeStyle("titleSection"), ...(isMobile ? responsiveStyles.titleSection : {}) }}>
          <div>
            <h1 style={getThemeStyle("title")}>Security Center</h1>
            <p style={getThemeStyle("subtitle")}>
              Monitor your account security, fraud alerts and suspicious
              activity in real time.
            </p>
          </div>

          <button
            style={{ ...getThemeStyle("refreshButton"), ...(isMobile ? responsiveStyles.refreshButton : {}) }}
            onClick={loadSecurityData}
            disabled={loading}
          >
            ↻ {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <div style={getThemeStyle("error")}>{error}</div>}

        {/* Security Overview */}
        <div style={{ ...getThemeStyle("grid"), ...(isMobile ? responsiveStyles.grid : {}) }}>
          <div style={getThemeStyle("card")}>
            <div style={getThemeStyle("cardIcon")}>🛡️</div>
            <div>
              <div style={getThemeStyle("cardLabel")}>Security Status</div>
              <div style={getThemeStyle("cardValue")}>
                {openCount > 0 ? "Attention Required" : "Protected"}
              </div>
            </div>
          </div>

          <div style={getThemeStyle("card")}>
            <div style={getThemeStyle("cardIcon")}>⚠️</div>
            <div>
              <div style={getThemeStyle("cardLabel")}>Open Alerts</div>
              <div style={getThemeStyle("cardValue")}>{openCount}</div>
            </div>
          </div>

          <div style={getThemeStyle("card")}>
            <div style={getThemeStyle("cardIcon")}>🔴</div>
            <div>
              <div style={getThemeStyle("cardLabel")}>Critical Alerts</div>
              <div style={getThemeStyle("cardValue")}>
                {
                  alerts.filter(
                    (alert) =>
                      String(alert.riskLevel).toUpperCase() === "CRITICAL"
                  ).length
                }
              </div>
            </div>
          </div>

          <div style={getThemeStyle("card")}>
            <div style={getThemeStyle("cardIcon")}>📡</div>
            <div>
              <div style={getThemeStyle("cardLabel")}>Live Monitoring</div>
              <div
                style={{
                  ...getThemeStyle("cardValue"),
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
            ...getThemeStyle("statusBanner"),
            background: darkMode
              ? (openCount > 0 ? "#422006" : "#123323")
              : (openCount > 0 ? "#fff7ed" : "#f0fdf4"),
            borderColor: darkMode
              ? (openCount > 0 ? "#92400e" : "#166534")
              : (openCount > 0 ? "#fed7aa" : "#bbf7d0"),
          }}
        >
          <div style={getThemeStyle("statusIcon")}>
            {openCount > 0 ? "⚠️" : "✓"}
          </div>

          <div>
            <div style={getThemeStyle("statusTitle")}>
              {openCount > 0
                ? "Security alerts need your attention"
                : "Your account is currently secure"}
            </div>

            <div style={getThemeStyle("statusText")}>
              {openCount > 0
                ? `You currently have ${openCount} open security alert${
                    openCount === 1 ? "" : "s"
                  }. Review the alerts below.`
                : "No open fraud alerts are currently associated with your account."}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div style={{ ...getThemeStyle("section"), ...(isMobile ? responsiveStyles.section : {}) }}>
          <div style={{ ...getThemeStyle("sectionHeader"), ...(isMobile ? responsiveStyles.sectionHeader : {}) }}>
            <div>
              <h2 style={getThemeStyle("sectionTitle")}>Security & Fraud Alerts</h2>
              <p style={getThemeStyle("sectionSubtitle")}>
                Alerts detected by Avani Bank's fraud risk engine.
              </p>
            </div>

            <span style={getThemeStyle("liveBadge")}>
              <span style={getThemeStyle("liveDot")}></span>
              {liveStatus === "Live" ? "REAL-TIME" : "MONITORING"}
            </span>
          </div>

          {loading ? (
            <div style={getThemeStyle("emptyState")}>Loading security alerts...</div>
          ) : alerts.length === 0 ? (
            <div style={getThemeStyle("emptyState")}>
              <div style={getThemeStyle("emptyIcon")}>✓</div>
              <h3>No Security Alerts</h3>
              <p>
                We haven't detected any suspicious activity on your
                account.
              </p>
            </div>
          ) : (
            <div style={getThemeStyle("alertList")}>
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
                    style={getThemeStyle("alertCard")}
                  >
                    <div style={{ ...getThemeStyle("alertTop"), ...(isMobile ? responsiveStyles.alertTop : {}) }}>
                      <div>
                        <div style={getThemeStyle("alertType")}>
                          {formatAlertType(alert.alertType)}
                        </div>

                        <div style={getThemeStyle("alertDate")}>
                          Detected {formatDate(alert.detectedAt)}
                        </div>
                      </div>

                      <span
                        className={`risk-badge ${getRiskClass(risk)}`}
                        style={getThemeStyle("riskBadge")}
                      >
                        {risk}
                      </span>
                    </div>

                    <div style={{ ...getThemeStyle("alertBody"), ...(isMobile ? responsiveStyles.alertBody : {}) }}>
                      <div>
                        <span style={getThemeStyle("infoLabel")}>Risk Score</span>
                        <strong>
                          {getRiskScore(alert).toFixed(2)}
                        </strong>
                      </div>

                      <div>
                        <span style={getThemeStyle("infoLabel")}>Type</span>
                        <strong>
                          {alert.transactionType || "LOGIN"}
                        </strong>
                      </div>

                      <div>
                        <span style={getThemeStyle("infoLabel")}>Status</span>
                        <strong>
                          {alert.status || "OPEN"}
                        </strong>
                      </div>

                      <div>
                        <span style={getThemeStyle("infoLabel")}>Location</span>
                        <strong>
                          {alert.location || "Not available"}
                        </strong>
                      </div>
                    </div>

                    <p style={getThemeStyle("description")}>
                      {alert.description ||
                        "Suspicious activity was detected by the security monitoring system."}
                    </p>

                    <button
                      style={getThemeStyle("viewButton")}
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
        <div style={{ ...getThemeStyle("tipsSection"), ...(isMobile ? responsiveStyles.tipsSection : {}) }}>
          <h2 style={getThemeStyle("sectionTitle")}>Security Tips</h2>

          <div style={{ ...getThemeStyle("tipsGrid"), ...(isMobile ? responsiveStyles.tipsGrid : {}) }}>
            <div style={{ ...getThemeStyle("tip"), ...(isMobile ? responsiveStyles.tip : {}) }}>
              <span>🔐</span>
              <div>
                <strong>Protect your credentials</strong>
                <p>
                  Never share your password, OTP or banking credentials.
                </p>
              </div>
            </div>

            <div style={{ ...getThemeStyle("tip"), ...(isMobile ? responsiveStyles.tip : {}) }}>
              <span>📱</span>
              <div>
                <strong>Use trusted devices</strong>
                <p>
                  Avoid logging into your account from unknown devices.
                </p>
              </div>
            </div>

            <div style={{ ...getThemeStyle("tip"), ...(isMobile ? responsiveStyles.tip : {}) }}>
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
          style={{ ...getThemeStyle("overlay"), ...(isMobile ? responsiveStyles.overlay : {}) }}
          onClick={() => setSelectedAlert(null)}
        >
          <div
            style={{ ...getThemeStyle("modal"), ...(isMobile ? responsiveStyles.modal : {}) }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ ...getThemeStyle("modalHeader"), ...(isMobile ? responsiveStyles.modalHeader : {}) }}>
              <div>
                <div style={getThemeStyle("modalLabel")}>SECURITY ALERT</div>
                <h2 style={getThemeStyle("modalTitle")}>
                  {formatAlertType(selectedAlert.alertType)}
                </h2>
              </div>

              <button
                style={{ ...getThemeStyle("closeButton"), ...(isMobile ? responsiveStyles.closeButton : {}) }}
                onClick={() => setSelectedAlert(null)}
              >
                ×
              </button>
            </div>

            <div style={{ ...getThemeStyle("modalGrid"), ...(isMobile ? responsiveStyles.modalGrid : {}) }}>
              <div>
                <span style={getThemeStyle("infoLabel")}>Risk Level</span>
                <strong>
                  {selectedAlert.riskLevel || "LOW"}
                </strong>
              </div>

              <div>
                <span style={getThemeStyle("infoLabel")}>Risk Score</span>
                <strong>
                  {getRiskScore(selectedAlert).toFixed(2)}
                </strong>
              </div>

              <div>
                <span style={getThemeStyle("infoLabel")}>Status</span>
                <strong>
                  {selectedAlert.status || "OPEN"}
                </strong>
              </div>

              <div>
                <span style={getThemeStyle("infoLabel")}>Transaction Type</span>
                <strong>
                  {selectedAlert.transactionType || "LOGIN"}
                </strong>
              </div>

              <div>
                <span style={getThemeStyle("infoLabel")}>Location</span>
                <strong>
                  {selectedAlert.location || "Not available"}
                </strong>
              </div>

              <div>
                <span style={getThemeStyle("infoLabel")}>Detected At</span>
                <strong>
                  {formatDate(selectedAlert.detectedAt)}
                </strong>
              </div>

              {selectedAlert.transactionId && (
                <div>
                  <span style={getThemeStyle("infoLabel")}>Transaction ID</span>
                  <strong>{selectedAlert.transactionId}</strong>
                </div>
              )}
            </div>

            <div style={getThemeStyle("descriptionBox")}>
              <span style={getThemeStyle("infoLabel")}>Description</span>
              <p>
                {selectedAlert.description ||
                  "No additional description available."}
              </p>
            </div>

            <button
              style={getThemeStyle("modalButton")}
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

const responsiveStyles = {
  page: {
    padding: "14px 10px 24px",
  },

  container: {
    maxWidth: "100%",
  },

  header: {
    maxHeight: "none",
    padding: "18px 16px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
    borderRadius: "15px",
  },

  titleSection: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
    marginBottom: "18px",
  },

  backButton: {
    width: "100%",
    padding: "11px 14px",
    textAlign: "center",
  },

  refreshButton: {
    width: "100%",
    padding: "11px 14px",
  },

  grid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
  },

  statusBanner: {
    alignItems: "flex-start",
    gap: "11px",
    padding: "15px",
  },

  section: {
    padding: "16px 13px",
    borderRadius: "13px",
    marginBottom: "16px",
  },

  sectionHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "16px",
  },

  alertCard: {
    padding: "15px",
  },

  alertTop: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
  },

  alertBody: {
    gridTemplateColumns: "1fr",
    gap: "11px",
    marginTop: "15px",
    paddingTop: "13px",
  },

  tipsSection: {
    padding: "16px 13px",
  },

  tipsGrid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
  },

  tip: {
    alignItems: "flex-start",
    padding: "13px",
  },

  overlay: {
    padding: "10px",
    alignItems: "center",
  },

  modal: {
    maxWidth: "100%",
    width: "100%",
    padding: "18px 15px",
    borderRadius: "13px",
    maxHeight: "92vh",
  },

  modalHeader: {
    gap: "10px",
    marginBottom: "18px",
  },

  closeButton: {
    flexShrink: 0,
  },

  modalGrid: {
    gridTemplateColumns: "1fr",
    gap: "13px",
  },
};

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