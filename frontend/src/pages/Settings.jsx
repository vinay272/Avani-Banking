import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("avani-theme") === "dark"
  );

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    };
    window.addEventListener("storage", syncTheme);
    window.addEventListener("avani-theme-change", syncTheme);
    syncTheme();
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("avani-theme-change", syncTheme);
    };
  }, []);

  const themedStyles = darkMode
    ? {
        ...styles,
        page: { ...styles.page, background: "#0b1220", color: "#e5e7eb" },
        container: { ...styles.container },
        header: styles.header,
        headerButton: styles.headerButton,
        profileButton: styles.profileButton,
        card: { ...styles.card, background: "#111c2e", border: "1px solid #263449", boxShadow: "0 8px 30px rgba(0,0,0,0.18)" },
        cardTitle: { ...styles.cardTitle, color: "#f1f5f9" },
        cardSubtitle: { ...styles.cardSubtitle, color: "#a6b4c8" },
        accountItem: { ...styles.accountItem, background: "#172438", border: "1px solid #2b3b52" },
        label: { ...styles.label, color: "#a6b4c8" },
        value: { ...styles.value, color: "#e5edf7" },
        settingRow: { ...styles.settingRow, borderTop: "1px solid #29384d" },
        settingTitle: { ...styles.settingTitle, color: "#e5edf7" },
        settingDescription: { ...styles.settingDescription, color: "#a6b4c8" },
        settingIcon: { ...styles.settingIcon, background: "#22334c" },
        actionButton: { ...styles.actionButton, background: "#1b2b45", border: "1px solid #344b6c", color: "#c6d8ff" },
        quickCard: { ...styles.quickCard, background: "#172438", border: "1px solid #2b3b52" },
        quickTitle: { ...styles.quickTitle, color: "#e5edf7" },
        quickText: { ...styles.quickText, color: "#a6b4c8" },
        arrow: { ...styles.arrow, color: "#9bbcff" },
        logoutCard: { ...styles.logoutCard, background: "#111c2e", border: "1px solid #57353b" },
        logoutTitle: { ...styles.logoutTitle, color: "#f1f5f9" },
        logoutText: { ...styles.logoutText, color: "#a6b4c8" },
        loadingTitle: { ...styles.loadingTitle, color: "#f1f5f9" },
        loadingText: { ...styles.loadingText, color: "#a6b4c8" },
      }
    : styles;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const [transactionNotifications, setTransactionNotifications] =
    useState(true);

  const [securityNotifications, setSecurityNotifications] =
    useState(true);

  const [message, setMessage] = useState("");

  // =========================
  // LOAD CUSTOMER
  // =========================

  useEffect(() => {
    const fetchCustomer = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:8080/api/customers/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load account information.");
        }

        const data = await response.json();

        setCustomer(data);

        localStorage.setItem(
          "customer",
          JSON.stringify(data)
        );
      } catch (error) {
        console.error("Settings Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();

    // Load saved preferences
    const transactionPreference =
      localStorage.getItem("transactionNotifications");

    const securityPreference =
      localStorage.getItem("securityNotifications");

    if (transactionPreference !== null) {
      setTransactionNotifications(
        transactionPreference === "true"
      );
    }

    if (securityPreference !== null) {
      setSecurityNotifications(
        securityPreference === "true"
      );
    }
  }, [navigate]);

  // =========================
  // NOTIFICATION SETTINGS
  // =========================

  const handleTransactionNotification = () => {
    const newValue = !transactionNotifications;

    setTransactionNotifications(newValue);

    localStorage.setItem(
      "transactionNotifications",
      String(newValue)
    );

    showMessage(
      newValue
        ? "Transaction notifications enabled."
        : "Transaction notifications disabled."
    );
  };

  const handleSecurityNotification = () => {
    const newValue = !securityNotifications;

    setSecurityNotifications(newValue);

    localStorage.setItem(
      "securityNotifications",
      String(newValue)
    );

    showMessage(
      newValue
        ? "Security notifications enabled."
        : "Security notifications disabled."
    );
  };

  // =========================
  // MESSAGE
  // =========================

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");

    navigate("/login");
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={{ ...themedStyles.page, ...(isMobile ? responsiveStyles.page : {}) }}>
        <div style={themedStyles.loading}>
          <div style={themedStyles.loadingIcon}>⟳</div>

          <h2 style={themedStyles.loadingTitle}>
            Loading Settings
          </h2>

          <p style={themedStyles.loadingText}>
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...themedStyles.page, ...(isMobile ? responsiveStyles.page : {}) }}>
      <div style={{ ...themedStyles.container, ...(isMobile ? responsiveStyles.container : {}) }}>

        {/* =========================
            HEADER
        ========================= */}

        <div style={{ ...themedStyles.header, ...(isMobile ? responsiveStyles.header : {}) }}>

          <div>
            <p style={themedStyles.smallTitle}>
              AVANI BANK
            </p>

            <h1 style={themedStyles.title}>
              Settings
            </h1>

            <p style={themedStyles.subtitle}>
              Manage your account preferences and security.
            </p>
          </div>

          <div style={{ ...themedStyles.headerActions, ...(isMobile ? responsiveStyles.headerActions : {}) }}>

            <button
              onClick={() => navigate("/dashboard")}
              style={{ ...themedStyles.headerButton, ...(isMobile ? responsiveStyles.headerButton : {}) }}
            >
              ← Dashboard
            </button>

            <button
              onClick={() => navigate("/profile")}
              style={{ ...themedStyles.profileButton, ...(isMobile ? responsiveStyles.profileButton : {}) }}
            >
              👤 Profile
            </button>

          </div>

        </div>

        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {message && (
          <div style={themedStyles.message}>
            ✓ {message}
          </div>
        )}

        {/* =========================
            ACCOUNT OVERVIEW
        ========================= */}

        <div style={{ ...themedStyles.card, ...(isMobile ? responsiveStyles.card : {}) }}>

          <div style={{ ...themedStyles.cardHeader, ...(isMobile ? responsiveStyles.cardHeader : {}) }}>

            <div>
              <h2 style={themedStyles.cardTitle}>
                Account Overview
              </h2>

              <p style={themedStyles.cardSubtitle}>
                Your current account information
              </p>
            </div>

            <div style={themedStyles.iconBox}>
              🏦
            </div>

          </div>

          <div style={{ ...themedStyles.accountGrid, ...(isMobile ? responsiveStyles.accountGrid : {}) }}>

            <div style={themedStyles.accountItem}>
              <span style={themedStyles.label}>
                Account Holder
              </span>

              <strong style={themedStyles.value}>
                {customer?.fullName || "N/A"}
              </strong>
            </div>

            <div style={themedStyles.accountItem}>
              <span style={themedStyles.label}>
                Account Number
              </span>

              <strong style={themedStyles.value}>
                {customer?.accountNumber || "N/A"}
              </strong>
            </div>

            <div style={themedStyles.accountItem}>
              <span style={themedStyles.label}>
                Account Type
              </span>

              <strong style={themedStyles.value}>
                {customer?.accountType || "N/A"}
              </strong>
            </div>

            <div style={themedStyles.accountItem}>
              <span style={themedStyles.label}>
                Account Status
              </span>

              <strong
                style={{
                  ...themedStyles.value,
                   ...(isMobile ? responsiveStyles.value : {}),
                   color:
                    customer?.status === "ACTIVE"
                      ? "#168653"
                      : "#d13c3c",
                }}
              >
                ● {customer?.status || "UNKNOWN"}
              </strong>
            </div>

          </div>

        </div>

        {/* =========================
            SECURITY
        ========================= */}

        <div style={{ ...themedStyles.card, ...(isMobile ? responsiveStyles.card : {}) }}>

          <div style={{ ...themedStyles.cardHeader, ...(isMobile ? responsiveStyles.cardHeader : {}) }}>

            <div>
              <h2 style={themedStyles.cardTitle}>
                Security
              </h2>

              <p style={themedStyles.cardSubtitle}>
                Keep your account secure
              </p>
            </div>

            <div style={themedStyles.securityIcon}>
              🔐
            </div>

          </div>

          <div style={{ ...themedStyles.settingRow, ...(isMobile ? responsiveStyles.settingRow : {}) }}>

            <div style={{ ...themedStyles.settingLeft, ...(isMobile ? responsiveStyles.settingLeft : {}) }}>

              <div style={themedStyles.settingIcon}>
                🔑
              </div>

              <div>
                <h3 style={themedStyles.settingTitle}>
                  Password
                </h3>

                <p style={themedStyles.settingDescription}>
                  Change your account password regularly
                  for better security.
                </p>
              </div>

            </div>

            <button
              onClick={() => navigate("/profile")}
              style={{ ...themedStyles.actionButton, ...(isMobile ? responsiveStyles.actionButton : {}) }}
            >
              Change Password →
            </button>

          </div>

          <div style={{ ...themedStyles.settingRow, ...(isMobile ? responsiveStyles.settingRow : {}) }}>

            <div style={{ ...themedStyles.settingLeft, ...(isMobile ? responsiveStyles.settingLeft : {}) }}>

              <div style={themedStyles.settingIcon}>
                🛡️
              </div>

              <div>
                <h3 style={themedStyles.settingTitle}>
                  Account Security
                </h3>

                <p style={themedStyles.settingDescription}>
                  Your account is protected with secure
                  authentication.
                </p>
              </div>

            </div>

            <span style={themedStyles.secureBadge}>
              ✓ Secure
            </span>

          </div>

        </div>

        {/* =========================
            NOTIFICATIONS
        ========================= */}

        <div style={{ ...themedStyles.card, ...(isMobile ? responsiveStyles.card : {}) }}>

          <div style={{ ...themedStyles.cardHeader, ...(isMobile ? responsiveStyles.cardHeader : {}) }}>

            <div>
              <h2 style={themedStyles.cardTitle}>
                Notifications
              </h2>

              <p style={themedStyles.cardSubtitle}>
                Manage your notification preferences
              </p>
            </div>

            <div style={themedStyles.iconBox}>
              🔔
            </div>

          </div>

          {/* Transaction Notification */}

          <div style={{ ...themedStyles.settingRow, ...(isMobile ? responsiveStyles.settingRow : {}) }}>

            <div style={{ ...themedStyles.settingLeft, ...(isMobile ? responsiveStyles.settingLeft : {}) }}>

              <div style={themedStyles.settingIcon}>
                💸
              </div>

              <div>
                <h3 style={themedStyles.settingTitle}>
                  Transaction Notifications
                </h3>

                <p style={themedStyles.settingDescription}>
                  Receive notifications about account
                  transactions.
                </p>
              </div>

            </div>

            <button
              onClick={handleTransactionNotification}
              style={{
                ...themedStyles.toggle,
                background:
                  transactionNotifications
                    ? "#173b8c"
                    : "#cbd5e1",
              }}
            >
              <span
                style={{
                  ...themedStyles.toggleCircle,
                  transform:
                    transactionNotifications
                      ? "translateX(22px)"
                      : "translateX(0)",
                }}
              />
            </button>

          </div>

          {/* Security Notification */}

          <div style={{ ...themedStyles.settingRow, ...(isMobile ? responsiveStyles.settingRow : {}) }}>

            <div style={{ ...themedStyles.settingLeft, ...(isMobile ? responsiveStyles.settingLeft : {}) }}>

              <div style={themedStyles.settingIcon}>
                🚨
              </div>

              <div>
                <h3 style={themedStyles.settingTitle}>
                  Security Notifications
                </h3>

                <p style={themedStyles.settingDescription}>
                  Receive important security alerts about
                  your account.
                </p>
              </div>

            </div>

            <button
              onClick={handleSecurityNotification}
              style={{
                ...themedStyles.toggle,
                background:
                  securityNotifications
                    ? "#173b8c"
                    : "#cbd5e1",
              }}
            >
              <span
                style={{
                  ...themedStyles.toggleCircle,
                  transform:
                    securityNotifications
                      ? "translateX(22px)"
                      : "translateX(0)",
                }}
              />
            </button>

          </div>

        </div>

        {/* =========================
            QUICK LINKS
        ========================= */}

        <div style={{ ...themedStyles.card, ...(isMobile ? responsiveStyles.card : {}) }}>

          <div style={{ ...themedStyles.cardHeader, ...(isMobile ? responsiveStyles.cardHeader : {}) }}>

            <div>
              <h2 style={themedStyles.cardTitle}>
                Quick Links
              </h2>

              <p style={themedStyles.cardSubtitle}>
                Quickly access your banking features
              </p>
            </div>

          </div>

          <div style={{ ...themedStyles.quickGrid, ...(isMobile ? responsiveStyles.quickGrid : {}) }}>

            <button
              onClick={() => navigate("/profile")}
              style={themedStyles.quickCard}
            >
              <div style={themedStyles.quickIcon}>
                👤
              </div>

              <div style={themedStyles.quickContent}>
                <h3 style={themedStyles.quickTitle}>
                  Profile & Account
                </h3>

                <p style={themedStyles.quickText}>
                  View your account details
                </p>
              </div>

              <span style={themedStyles.arrow}>
                →
              </span>
            </button>

            <button
              onClick={() =>
                navigate("/transactions")
              }
              style={themedStyles.quickCard}
            >
              <div style={themedStyles.quickIcon}>
                📋
              </div>

              <div style={themedStyles.quickContent}>
                <h3 style={themedStyles.quickTitle}>
                  Transaction History
                </h3>

                <p style={themedStyles.quickText}>
                  View all transactions
                </p>
              </div>

              <span style={themedStyles.arrow}>
                →
              </span>
            </button>

          </div>

        </div>

        {/* =========================
            LOGOUT
        ========================= */}

        <div style={{ ...themedStyles.logoutCard, ...(isMobile ? responsiveStyles.logoutCard : {}) }}>

          <div>
            <h3 style={themedStyles.logoutTitle}>
              Sign out of Avani Bank
            </h3>

            <p style={themedStyles.logoutText}>
              You will need to login again to access
              your account.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{ ...themedStyles.logoutAction, ...(isMobile ? responsiveStyles.logoutAction : {}) }}
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#172033",
    paddingBottom: "50px",
  },

  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "35px 20px",
    boxSizing: "border-box",
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

  smallTitle: {
    margin: 0,
    fontSize: "11px",
    letterSpacing: "2px",
    opacity: 0.7,
    fontWeight: "700",
  },

  title: {
    margin: "8px 0 5px",
    fontSize: "30px",
  },

  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#d7e2ff",
  },

  headerActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },

  headerButton: {
    border: "1px solid rgba(255,255,255,0.25)",
    background: "#ffffff",
    color: "#173b8c",
    borderRadius: "9px",
    padding: "10px 13px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  profileButton: {
    border: "none",
    background: "#ffffff",
    color: "#173b8c",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  message: {
    marginTop: "15px",
    padding: "12px 14px",
    background: "#eaf8f0",
    color: "#168653",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: "600",
  },

  card: {
    background: "white",
    marginTop: "18px",
    border: "1px solid #e9edf4",
    borderRadius: "18px",
    padding: "25px",
    boxShadow:
      "0 8px 30px rgba(20,35,70,0.05)",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "19px",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: "#8993a8",
  },

  iconBox: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#edf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  securityIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#eaf8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  accountGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  accountItem: {
    background: "#f8faff",
    border: "1px solid #edf1f7",
    borderRadius: "11px",
    padding: "15px",
  },

  label: {
    display: "block",
    fontSize: "10px",
    color: "#8993a8",
    marginBottom: "6px",
    fontWeight: "600",
  },

  value: {
    fontSize: "13px",
    color: "#25304a",
  },

  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "17px 0",
    borderTop: "1px solid #eef1f5",
  },

  settingLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
    minWidth: 0,
  },

  settingIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#f0f4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  settingTitle: {
    margin: 0,
    fontSize: "13px",
    color: "#25304a",
  },

  settingDescription: {
    margin: "5px 0 0",
    fontSize: "10px",
    color: "#8993a8",
    lineHeight: "1.5",
  },

  actionButton: {
    border: "1px solid #dbe4f5",
    background: "#f4f7ff",
    color: "#173b8c",
    borderRadius: "9px",
    padding: "10px 13px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  secureBadge: {
    padding: "7px 10px",
    borderRadius: "7px",
    background: "#eaf8f0",
    color: "#168653",
    fontSize: "10px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  toggle: {
    width: "46px",
    height: "25px",
    border: "none",
    borderRadius: "20px",
    padding: "2px",
    cursor: "pointer",
    transition: "background 0.2s ease",
    flexShrink: 0,
  },

  toggleCircle: {
    display: "block",
    width: "21px",
    height: "21px",
    borderRadius: "50%",
    background: "white",
    transition: "transform 0.2s ease",
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  quickCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "15px",
    border: "1px solid #e9edf4",
    background: "#ffffff",
    borderRadius: "12px",
    cursor: "pointer",
    textAlign: "left",
    boxSizing: "border-box",
  },

  quickIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#edf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    flexShrink: 0,
  },

  quickContent: {
    flex: 1,
  },

  quickTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "700",
    color: "#25304a",
  },

  quickText: {
    margin: "4px 0 0",
    fontSize: "9px",
    color: "#8993a8",
  },

  arrow: {
    fontSize: "18px",
    color: "#173b8c",
    fontWeight: "700",
  },

  logoutCard: {
    marginTop: "18px",
    background: "#fff",
    border: "1px solid #f0dddd",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    boxSizing: "border-box",
  },

  logoutTitle: {
    margin: 0,
    fontSize: "13px",
    color: "#25304a",
  },

  logoutText: {
    margin: "5px 0 0",
    fontSize: "10px",
    color: "#8993a8",
  },

  logoutAction: {
    border: "none",
    background: "#fff0f0",
    color: "#d13c3c",
    borderRadius: "9px",
    padding: "10px 15px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIcon: {
    fontSize: "35px",
    color: "#173b8c",
  },

  loadingTitle: {
    margin: "10px 0 5px",
    fontSize: "18px",
  },

  loadingText: {
    margin: 0,
    color: "#8993a8",
    fontSize: "12px",
  },
};

// =========================
// RESPONSIVE STYLES
// =========================

const responsiveStyles = {
  page: {
    paddingBottom: "25px",
  },

  container: {
    maxWidth: "100%",
    padding: "16px 12px",
  },

  header: {
    maxHeight: "none",
    padding: "20px 18px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "16px",
    borderRadius: "15px",
  },

  headerActions: {
    width: "100%",
    flexDirection: "column",
    gap: "8px",
  },

  headerButton: {
    width: "100%",
    padding: "11px 12px",
    textAlign: "center",
  },

  profileButton: {
    width: "100%",
    padding: "11px 12px",
    textAlign: "center",
  },

  card: {
    marginTop: "14px",
    padding: "18px 15px",
    borderRadius: "15px",
  },

  cardHeader: {
    alignItems: "flex-start",
    marginBottom: "16px",
  },

  accountGrid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
  },

  value: {
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  settingRow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "12px",
    padding: "15px 0",
  },

  settingLeft: {
    width: "100%",
    alignItems: "flex-start",
    gap: "11px",
  },

  actionButton: {
    width: "100%",
    padding: "11px 12px",
    textAlign: "center",
    whiteSpace: "normal",
  },

  quickGrid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
  },

  logoutCard: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "12px",
    padding: "17px 15px",
  },

  logoutAction: {
    width: "100%",
    padding: "11px 15px",
  },
};

export default Settings;