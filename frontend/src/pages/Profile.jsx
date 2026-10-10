import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  // Sync with the theme selected on the Dashboard.
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("avani-theme") === "dark"
  );

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

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

  const [customer, setCustomer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // =========================
  // FETCH PROFILE
  // =========================

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

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
          throw new Error("Unable to load profile.");
        }

        const data = await response.json();

        setCustomer(data);

        // Keep local customer information updated
        localStorage.setItem(
          "customer",
          JSON.stringify(data)
        );

      } catch (err) {
        console.error("Profile Error:", err);

        setError(
          err.message || "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // =========================
  // PASSWORD INPUT
  // =========================

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });

    setPasswordMessage("");
    setPasswordError("");
  };

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordForm;

    if (!currentPassword) {
      setPasswordError(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from current password."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/customers/change-password",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.text();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("customer");

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data || "Unable to change password."
        );
      }

      setPasswordMessage(
        "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (err) {
      console.error(
        "Change Password Error:",
        err
      );

      setPasswordError(
        err.message ||
          "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
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
  // FORMAT BALANCE
  // =========================

  const formatBalance = (balance) => {
    return Number(balance || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const themedStyles = darkMode
    ? {
        ...styles,
        page: { ...styles.page, background: "#0b1220", color: "#e5eaf3" },
        container: { ...styles.container },
        profileHero: { ...styles.profileHero, background: "#151f30", borderColor: "#29364a", boxShadow: "0 8px 30px rgba(0,0,0,0.22)" },
        profileName: { ...styles.profileName, color: "#f1f5f9" },
        profileEmail: { ...styles.profileEmail, color: "#a4b1c5" },
        balanceBox: { ...styles.balanceBox, borderLeftColor: "#29364a", borderTopColor: "#29364a" },
        balanceLabel: { ...styles.balanceLabel, color: "#a4b1c5" },
        balance: { ...styles.balance, color: "#8db5ff" },
        card: { ...styles.card, background: "#151f30", borderColor: "#29364a", boxShadow: "0 8px 30px rgba(0,0,0,0.18)" },
        cardTitle: { ...styles.cardTitle, color: "#f1f5f9" },
        cardSubtitle: { ...styles.cardSubtitle, color: "#a4b1c5" },
        cardIcon: { ...styles.cardIcon, background: "#223454", color: "#c6d8ff" },
        securityIcon: { ...styles.securityIcon, background: "#183b32", color: "#9de3c5" },
        infoItem: { ...styles.infoItem, background: "#101a2a", borderColor: "#29364a" },
        infoLabel: { ...styles.infoLabel, color: "#a4b1c5" },
        infoValue: { ...styles.infoValue, color: "#e5eaf3" },
        accountNumberBox: { ...styles.accountNumberBox, background: "linear-gradient(135deg, #172641, #1b2b46)", borderColor: "#31496d" },
        accountNumber: { ...styles.accountNumber, color: "#9bbcff" },
        accountHint: { ...styles.accountHint, color: "#a4b1c5" },
        detailBox: { ...styles.detailBox, background: "#101a2a", borderColor: "#29364a" },
        detailLabel: { ...styles.detailLabel, color: "#a4b1c5" },
        detailValue: { ...styles.detailValue, color: "#e5eaf3" },
        label: { ...styles.label, color: "#c4cede" },
        input: { ...styles.input, background: "#0d1726", color: "#f1f5f9", borderColor: "#394960", colorScheme: "dark" },
        securityNote: { ...styles.securityNote, color: "#a4b1c5" },
        loadingTitle: { ...styles.loadingTitle, color: "#f1f5f9" },
        loadingText: { ...styles.loadingText, color: "#a4b1c5" },
        errorContainer: { ...styles.errorContainer, background: "#151f30", color: "#e5eaf3", borderColor: "#29364a" },
      }
    : styles;

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={{ ...themedStyles.page, ...(isMobile ? responsiveStyles.page : {}) }}>
        <div style={themedStyles.loadingContainer}>
          <div style={themedStyles.loadingIcon}>
            ⟳
          </div>

          <h2 style={themedStyles.loadingTitle}>
            Loading Profile
          </h2>

          <p style={themedStyles.loadingText}>
            Fetching your account information...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div style={themedStyles.page}>
        <div style={themedStyles.errorContainer}>
          <div style={themedStyles.errorIcon}>
            ⚠
          </div>

          <h2>
            Unable to Load Profile
          </h2>

          <p>{error}</p>

          <button
            onClick={() => navigate("/dashboard")}
            style={{ ...themedStyles.primaryButton, ...(isMobile ? responsiveStyles.primaryButton : {}) }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={themedStyles.page}>
      <div style={{ ...themedStyles.container, ...(isMobile ? responsiveStyles.container : {}) }}>

        {/* =========================
            HEADER
        ========================= */}

        <div style={{ ...themedStyles.header, ...(isMobile ? responsiveStyles.header : {}) }}>

          <div style={{ ...themedStyles.headerContent, ...(isMobile ? responsiveStyles.headerContent : {}) }}>

            <p style={themedStyles.smallTitle}>
              AVANI BANK
            </p>

            <h1 style={{ ...themedStyles.title, ...(isMobile ? responsiveStyles.title : {}) }}>
              My Profile
            </h1>

            <p style={{ ...themedStyles.subtitle, ...(isMobile ? responsiveStyles.subtitle : {}) }}>
              Manage your personal and account
              information securely.
            </p>

          </div>

          <div style={{ ...themedStyles.headerActions, ...(isMobile ? responsiveStyles.headerActions : {}) }}>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              style={{ ...themedStyles.headerButton, ...(isMobile ? responsiveStyles.headerButton : {}) }}
            >
              ← Dashboard
            </button>

            <button
              onClick={handleLogout}
              style={{ ...themedStyles.logoutButton, ...(isMobile ? responsiveStyles.logoutButton : {}) }}
            >
              Logout
            </button>

          </div>

        </div>

        {/* =========================
            PROFILE HERO
        ========================= */}

        <div style={{ ...themedStyles.profileHero, ...(isMobile ? responsiveStyles.profileHero : {}) }}>

          <div style={{ ...themedStyles.avatar, ...(isMobile ? responsiveStyles.avatar : {}) }}>
            {customer?.fullName
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div style={{ ...themedStyles.profileIdentity, ...(isMobile ? responsiveStyles.profileIdentity : {}) }}>

            <h2 style={{ ...themedStyles.profileName, ...(isMobile ? responsiveStyles.profileName : {}) }}>
              {customer?.fullName ||
                "Customer"}
            </h2>

            <p style={{ ...themedStyles.profileEmail, ...(isMobile ? responsiveStyles.profileEmail : {}) }}>
              {customer?.email ||
                "Email unavailable"}
            </p>

            <div style={{ ...themedStyles.profileMeta, ...(isMobile ? responsiveStyles.profileMeta : {}) }}>

              <span style={themedStyles.accountBadge}>
                {customer?.accountType ||
                  "Account"}
              </span>

              <span
                style={{
                  ...themedStyles.statusBadge,
                  ...(isMobile ? responsiveStyles.statusBadge : {}),
                  background:
                    customer?.status === "ACTIVE"
                      ? "#eaf8f0"
                      : "#fff0f0",
                  color:
                    customer?.status === "ACTIVE"
                      ? "#168653"
                      : "#d13c3c",
                }}
              >
                ● {customer?.status || "UNKNOWN"}
              </span>

            </div>

          </div>

          <div style={{ ...themedStyles.balanceBox, ...(isMobile ? responsiveStyles.balanceBox : {}) }}>

            <p style={themedStyles.balanceLabel}>
              Available Balance
            </p>

            <h2 style={{ ...themedStyles.balance, ...(isMobile ? responsiveStyles.balance : {}) }}>
              ₹{formatBalance(
                customer?.balance
              )}
            </h2>

          </div>

        </div>

        {/* =========================
            PERSONAL INFORMATION
        ========================= */}

        <div style={{ ...themedStyles.card, ...(isMobile ? responsiveStyles.card : {}) }}>

          <div style={{ ...themedStyles.cardHeader, ...(isMobile ? responsiveStyles.cardHeader : {}) }}>

            <div>
              <h2 style={{ ...themedStyles.cardTitle, ...(isMobile ? responsiveStyles.cardTitle : {}) }}>
                Personal Information
              </h2>

              <p style={{ ...themedStyles.cardSubtitle, ...(isMobile ? responsiveStyles.cardSubtitle : {}) }}>
                Your registered personal details
              </p>
            </div>

            <div style={themedStyles.cardIcon}>
              👤
            </div>

          </div>

          <div style={{ ...themedStyles.infoGrid, ...(isMobile ? responsiveStyles.infoGrid : {}) }}>

            <InfoItem
              label="Full Name"
              value={customer?.fullName}
              isMobile={isMobile}
              darkMode={darkMode}
            />

            <InfoItem
              label="Email Address"
              value={customer?.email}
              isMobile={isMobile}
              darkMode={darkMode}
            />

            <InfoItem
              label="Phone Number"
              value={customer?.phone}
              isMobile={isMobile}
              darkMode={darkMode}
            />

            <InfoItem
              label="Account Type"
              value={customer?.accountType}
              isMobile={isMobile}
              darkMode={darkMode}
            />

          </div>

        </div>

        {/* =========================
            ACCOUNT INFORMATION
        ========================= */}

        <div style={themedStyles.card}>

          <div style={themedStyles.cardHeader}>

            <div>
              <h2 style={themedStyles.cardTitle}>
                Account Information
              </h2>

              <p style={themedStyles.cardSubtitle}>
                Your Avani Bank account details
              </p>
            </div>

            <div style={themedStyles.cardIcon}>
              🏦
            </div>

          </div>

          <div style={{ ...themedStyles.accountGrid, ...(isMobile ? responsiveStyles.accountGrid : {}) }}>

            <div style={{ ...themedStyles.accountNumberBox, ...(isMobile ? responsiveStyles.accountNumberBox : {}) }}>

              <p style={themedStyles.detailLabel}>
                Account Number
              </p>

              <h3 style={{ ...themedStyles.accountNumber, ...(isMobile ? responsiveStyles.accountNumber : {}) }}>
                {customer?.accountNumber ||
                  "Not available"}
              </h3>

              <p style={themedStyles.accountHint}>
                Use this number to receive money
              </p>

            </div>

            <div style={{ ...themedStyles.detailBox, ...(isMobile ? responsiveStyles.detailBox : {}) }}>

              <p style={themedStyles.detailLabel}>
                Current Balance
              </p>

              <h3 style={{ ...themedStyles.detailValue, ...(isMobile ? responsiveStyles.detailValue : {}) }}>
                ₹{formatBalance(
                  customer?.balance
                )}
              </h3>

            </div>

            <div style={themedStyles.detailBox}>

              <p style={themedStyles.detailLabel}>
                Account Status
              </p>

              <h3
                style={{
                  ...themedStyles.detailValue,
                  ...(isMobile ? responsiveStyles.detailValue : {}),
                  color:
                    customer?.status === "ACTIVE"
                      ? "#168653"
                      : "#d13c3c",
                }}
              >
                {customer?.status ||
                  "Unknown"}
              </h3>

            </div>

            <div style={themedStyles.detailBox}>

              <p style={themedStyles.detailLabel}>
                Account Created
              </p>

              <h3 style={themedStyles.detailValue}>
                {formatDate(
                  customer?.createdAt
                )}
              </h3>

            </div>

          </div>

        </div>

        {/* =========================
            CHANGE PASSWORD
        ========================= */}

        <div style={themedStyles.card}>

          <div style={themedStyles.cardHeader}>

            <div>

              <h2 style={themedStyles.cardTitle}>
                Security
              </h2>

              <p style={themedStyles.cardSubtitle}>
                Change your account password
                securely.
              </p>

            </div>

            <div style={themedStyles.securityIcon}>
              🔐
            </div>

          </div>

          <form
            onSubmit={handleChangePassword}
          >

            <div style={{ ...themedStyles.passwordGrid, ...(isMobile ? responsiveStyles.passwordGrid : {}) }}>

              <div style={themedStyles.field}>

                <label style={themedStyles.label}>
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter current password"
                  style={themedStyles.input}
                />

              </div>

              <div style={themedStyles.field}>

                <label style={themedStyles.label}>
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={
                    passwordForm.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Minimum 6 characters"
                  style={themedStyles.input}
                />

              </div>

              <div style={themedStyles.field}>

                <label style={themedStyles.label}>
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={
                    passwordForm.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Confirm new password"
                  style={themedStyles.input}
                />

              </div>

            </div>

            {passwordMessage && (
              <div style={themedStyles.success}>
                ✓ {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div style={themedStyles.error}>
                ⚠ {passwordError}
              </div>
            )}

            <div style={{ ...themedStyles.passwordFooter, ...(isMobile ? responsiveStyles.passwordFooter : {}) }}>

              <p style={{ ...themedStyles.securityNote, ...(isMobile ? responsiveStyles.securityNote : {}) }}>
                🔒 Your password is securely
                encrypted.
              </p>

              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  ...themedStyles.primaryButton,
                  ...(isMobile ? responsiveStyles.primaryButton : {}),
                  opacity: passwordLoading
                    ? 0.7
                    : 1,
                  cursor: passwordLoading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {passwordLoading
                  ? "Changing Password..."
                  : "Change Password →"}
              </button>

            </div>

          </form>

        </div>

      </div>
    </div>
  );
}

// =========================
// REUSABLE INFO COMPONENT
// =========================

function InfoItem({ label, value, isMobile, darkMode }) {
  return (
    <div style={{
      ...styles.infoItem,
      ...(darkMode ? { background: "#101a2a", borderColor: "#29364a" } : {}),
      ...(isMobile ? responsiveStyles.infoItem : {}),
    }}>

      <p style={{ ...styles.infoLabel, ...(darkMode ? { color: "#a4b1c5" } : {}) }}>
        {label}
      </p>

      <p style={{
        ...styles.infoValue,
        ...(darkMode ? { color: "#e5eaf3" } : {}),
        ...(isMobile ? responsiveStyles.infoValue : {}),
      }}>
        {value || "Not available"}
      </p>

    </div>
  );
}

// =========================
// STYLES
// =========================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily:
      "Inter, Arial, sans-serif",
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

  headerContent: {
    minWidth: 0,
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
    background:
      "#ffffff",
    color: "#173b8c",
    borderRadius: "9px",
    padding: "10px 13px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  logoutButton: {
    border: "none",
    background: "#ffffff",
    color: "#173b8c",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  profileHero: {
    marginTop: "20px",
    background: "white",
    border: "1px solid #e9edf4",
    borderRadius: "18px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    boxShadow:
      "0 8px 30px rgba(20,35,70,0.06)",
    boxSizing: "border-box",
  },

  avatar: {
    width: "68px",
    height: "68px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    fontWeight: "800",
    flexShrink: 0,
  },

  profileIdentity: {
    flex: 1,
    minWidth: 0,
  },

  profileName: {
    margin: 0,
    fontSize: "21px",
    color: "#172033",
  },

  profileEmail: {
    margin: "5px 0 10px",
    fontSize: "12px",
    color: "#8993a8",
  },

  profileMeta: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  accountBadge: {
    padding: "5px 9px",
    borderRadius: "6px",
    background: "#edf3ff",
    color: "#173b8c",
    fontSize: "9px",
    fontWeight: "700",
  },

  statusBadge: {
    padding: "5px 9px",
    borderRadius: "6px",
    fontSize: "9px",
    fontWeight: "700",
  },

  balanceBox: {
    textAlign: "right",
    paddingLeft: "20px",
    borderLeft: "1px solid #edf0f5",
    flexShrink: 0,
  },

  balanceLabel: {
    margin: 0,
    fontSize: "10px",
    color: "#8993a8",
    fontWeight: "600",
  },

  balance: {
    margin: "5px 0 0",
    fontSize: "24px",
    color: "#173b8c",
  },

  card: {
    marginTop: "18px",
    background: "white",
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
    marginBottom: "22px",
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

  cardIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#edf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  securityIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#eaf8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  infoItem: {
    padding: "15px",
    background: "#f8faff",
    border: "1px solid #edf1f7",
    borderRadius: "11px",
  },

  infoLabel: {
    margin: 0,
    fontSize: "10px",
    color: "#8993a8",
    fontWeight: "600",
  },

  infoValue: {
    margin: "6px 0 0",
    fontSize: "14px",
    fontWeight: "700",
    color: "#25304a",
    wordBreak: "break-word",
  },

  accountGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  accountNumberBox: {
    gridColumn: "1 / -1",
    padding: "18px",
    background:
      "linear-gradient(135deg, #f4f7ff, #eef4ff)",
    border: "1px solid #dce6fb",
    borderRadius: "12px",
  },

  accountNumber: {
    margin: "7px 0 3px",
    fontSize: "22px",
    letterSpacing: "1px",
    color: "#173b8c",
  },

  accountHint: {
    margin: 0,
    fontSize: "10px",
    color: "#8993a8",
  },

  detailBox: {
    padding: "16px",
    background: "#f8faff",
    border: "1px solid #edf1f7",
    borderRadius: "11px",
  },

  detailLabel: {
    margin: 0,
    fontSize: "10px",
    color: "#8993a8",
    fontWeight: "600",
  },

  detailValue: {
    margin: "7px 0 0",
    fontSize: "15px",
    color: "#25304a",
  },

  passwordGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },

  field: {
    marginBottom: "5px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#526078",
  },

  input: {
    width: "100%",
    height: "46px",
    padding: "0 13px",
    border: "1px solid #dfe5ee",
    borderRadius: "9px",
    outline: "none",
    fontSize: "12px",
    boxSizing: "border-box",
  },

  passwordFooter: {
    marginTop: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  securityNote: {
    margin: 0,
    fontSize: "10px",
    color: "#8993a8",
  },

  primaryButton: {
    border: "none",
    borderRadius: "9px",
    padding: "12px 18px",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "white",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  success: {
    marginTop: "15px",
    padding: "11px 13px",
    borderRadius: "8px",
    background: "#eaf8f0",
    color: "#168653",
    fontSize: "11px",
  },

  error: {
    marginTop: "15px",
    padding: "11px 13px",
    borderRadius: "8px",
    background: "#fff0f0",
    color: "#d13c3c",
    fontSize: "11px",
  },

  loadingContainer: {
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

  errorContainer: {
    maxWidth: "500px",
    margin: "100px auto",
    padding: "35px",
    background: "white",
    borderRadius: "18px",
    textAlign: "center",
    border: "1px solid #e9edf4",
    boxSizing: "border-box",
  },

  errorIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },
};


/* =====================================================
   RESPONSIVE STYLE OVERRIDES
   ===================================================== */

const responsiveStyles = {
  page: {
    paddingBottom: "25px",
  },

  container: {
    padding: "18px 12px 30px",
  },

  header: {
    maxHeight: "none",
    padding: "18px",
    borderRadius: "16px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "16px",
  },

  headerContent: {
    width: "100%",
  },

  title: {
    fontSize: "23px",
    lineHeight: 1.25,
  },

  subtitle: {
    fontSize: "12px",
    lineHeight: 1.55,
  },

  headerActions: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },

  headerButton: {
    width: "100%",
    minHeight: "43px",
  },

  logoutButton: {
    width: "100%",
    minHeight: "43px",
  },

  profileHero: {
    padding: "18px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "16px",
    borderRadius: "16px",
  },

  avatar: {
    width: "58px",
    height: "58px",
    borderRadius: "15px",
    fontSize: "23px",
  },

  profileIdentity: {
    width: "100%",
  },

  profileName: {
    fontSize: "20px",
    overflowWrap: "anywhere",
  },

  profileEmail: {
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    lineHeight: 1.45,
  },

  profileMeta: {
    gap: "7px",
  },

  statusBadge: {
    whiteSpace: "nowrap",
  },

  balanceBox: {
    width: "100%",
    paddingLeft: "0",
    paddingTop: "14px",
    borderLeft: "none",
    borderTop: "1px solid #edf0f5",
    textAlign: "left",
  },

  balance: {
    fontSize: "22px",
    overflowWrap: "anywhere",
  },

  card: {
    marginTop: "14px",
    padding: "18px",
    borderRadius: "15px",
  },

  cardHeader: {
    alignItems: "flex-start",
    marginBottom: "17px",
  },

  cardTitle: {
    fontSize: "17px",
  },

  cardSubtitle: {
    lineHeight: 1.5,
  },

  infoGrid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
  },

  infoItem: {
    padding: "13px",
  },

  infoValue: {
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    lineHeight: 1.45,
  },

  accountGrid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
  },

  accountNumberBox: {
    gridColumn: "auto",
    padding: "15px",
  },

  accountNumber: {
    fontSize: "19px",
    overflowWrap: "anywhere",
    wordBreak: "break-all",
    lineHeight: 1.35,
  },

  detailBox: {
    padding: "14px",
  },

  detailValue: {
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    lineHeight: 1.4,
  },

  passwordGrid: {
    gridTemplateColumns: "1fr",
    gap: "12px",
  },

  passwordFooter: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "12px",
  },

  securityNote: {
    lineHeight: 1.5,
  },

  primaryButton: {
    width: "100%",
    minHeight: "44px",
  },
};

export default Profile;