import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CashierLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/staff/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Cashier login failed."
        );
      }

      if (data.role !== "CASHIER") {
        throw new Error(
          "Access denied. Cashier privileges are required."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("staffToken", data.token);
      localStorage.setItem("staffRole", data.role);
      localStorage.setItem("staffId", data.employeeId);
      localStorage.setItem(
        "employeeCode",
        data.employeeCode
      );
      localStorage.setItem(
        "staffName",
        data.fullName
      );
      localStorage.setItem(
        "staffEmail",
        data.email
      );
      localStorage.setItem(
        "branchCode",
        data.branchCode
      );

      navigate("/cashier/cash-deposit");
    } catch (err) {
      setError(
        err.message || "Unable to login as cashier."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
  width: "100%",
  height: "100vh",
  minHeight: "100svh",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "15px",
  boxSizing: "border-box",
  fontFamily: "'Segoe UI', Arial, sans-serif",
  background:
    "linear-gradient(135deg, #2f76bd 0%, #fcfcfc 50%, #0a7d75 100%)",
  },

    wrapper: {
  width: "min(760px, 94vw)",
  maxWidth: "760px",
  minWidth: 0,
  height: "450px",
  maxHeight: "calc(100vh - 30px)",
  display: "grid",
  gridTemplateColumns: "0.88fr 1.12fr",
  background: "#ffffff",
  borderRadius: "20px",
  overflow: "hidden",
  border: "1px solid #dce8f3",
  boxShadow:
    "0 18px 50px rgba(20, 55, 90, 0.14)",
},

    /* LEFT */

   branding: {
  position: "relative",
  padding: "26px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  background:
    "linear-gradient(150deg, #073b63 0%, #086b87 55%, #07998f 100%)",
  color: "#ffffff",
  overflow: "hidden",
},

    logo: {
      width: "45px",
      height: "45px",
      borderRadius: "13px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "rgba(255,255,255,0.13)",
      border:
        "1px solid rgba(255,255,255,0.22)",
      fontSize: "22px",
      marginBottom: "14px",
    },

    brandTitle: {
      margin: 0,
      fontSize: "26px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
    },

    badge: {
      display: "inline-block",
      marginTop: "18px",
      marginBottom: "10px",
      padding: "6px 10px",
      borderRadius: "20px",
      background:
        "rgba(255,255,255,0.11)",
      border:
        "1px solid rgba(255,255,255,0.18)",
      fontSize: "9px",
      fontWeight: "800",
      letterSpacing: "0.8px",
      textTransform: "uppercase",
    },

    heading: {
      margin: 0,
      fontSize: "28px",
      lineHeight: "1.15",
      fontWeight: "800",
    },

    brandText: {
      margin: "10px 0 0",
      maxWidth: "310px",
      fontSize: "12px",
      lineHeight: "1.6",
      color:
        "rgba(255,255,255,0.78)",
    },

    securityBox: {
      marginTop: "22px",
      padding: "14px",
      borderRadius: "13px",
      background:
        "rgba(255,255,255,0.09)",
      border:
        "1px solid rgba(255,255,255,0.14)",
    },

    securityTitle: {
      margin: "0 0 9px",
      fontSize: "11px",
      fontWeight: "800",
    },

    securityItem: {
      marginTop: "6px",
      fontSize: "10px",
      color:
        "rgba(255,255,255,0.78)",
    },

    /* RIGHT */

    formSection: {
  padding: "30px 36px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  background: "#ffffff",
},

    smallLabel: {
      color: "#07848d",
      fontSize: "10px",
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: "1px",
      marginBottom: "6px",
    },

    title: {
      margin: 0,
      color: "#102f56",
      fontSize: "26px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
    },

    subtitle: {
      margin: "6px 0 22px",
      color: "#7b8da1",
      fontSize: "12px",
    },

    field: {
      marginBottom: "14px",
    },

    label: {
      display: "block",
      marginBottom: "6px",
      color: "#29415f",
      fontSize: "11px",
      fontWeight: "700",
    },

    inputWrapper: {
      position: "relative",
    },

    input: {
      width: "100%",
      height: "43px",
      boxSizing: "border-box",
      border: "1px solid #d7e2ed",
      borderRadius: "9px",
      padding: "0 13px",
      fontSize: "13px",
      outline: "none",
      color: "#17365d",
      background: "#fbfdff",
    },

    passwordInput: {
      paddingRight: "65px",
    },

    showButton: {
      position: "absolute",
      right: "6px",
      top: "6px",
      height: "31px",
      border: "none",
      background: "#edf4fa",
      color: "#086b87",
      borderRadius: "7px",
      padding: "0 10px",
      cursor: "pointer",
      fontSize: "9px",
      fontWeight: "800",
    },

    error: {
      background: "#fff3f3",
      border: "1px solid #ffd4d4",
      color: "#b42318",
      borderRadius: "8px",
      padding: "8px 10px",
      marginBottom: "12px",
      fontSize: "10px",
      fontWeight: "600",
    },

    button: {
      width: "100%",
      height: "45px",
      border: "none",
      borderRadius: "9px",
      background:
        "linear-gradient(135deg, #075985, #078c91)",
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: "800",
      cursor: "pointer",
      boxShadow:
        "0 7px 18px rgba(7, 133, 145, 0.22)",
    },

    disabled: {
      opacity: 0.65,
      cursor: "not-allowed",
    },

    footer: {
      marginTop: "17px",
      textAlign: "center",
      fontSize: "9px",
      color: "#9aa8b5",
    },

  };

  return (
    <div className="cashier-page" style={styles.page}>
      <style>
  {`
    html,
    body,
    #root {
      width: 100%;
      min-height: 100%;
      margin: 0;
      padding: 0;
    }

    html,
    body {
      overflow-x: hidden;
    }

    * {
      box-sizing: border-box;
    }

    input:focus {
      border-color: #078c91 !important;
      box-shadow:
        0 0 0 3px rgba(7, 140, 145, 0.09);
      background: #ffffff !important;
    }

    button:not(:disabled):hover {
      transform: translateY(-1px);
    }

    /* =========================
       TABLET
    ========================= */

    @media (max-width: 900px) {
      .cashier-page {
        min-height: 100svh !important;
        height: auto !important;
        padding: 16px !important;
        align-items: flex-start !important;
      }

      .cashier-wrapper {
        width: 100% !important;
        max-width: 620px !important;
        min-width: 0 !important;
        height: auto !important;
        max-height: none !important;

        grid-template-columns: 1fr !important;

        border-radius: 22px !important;
      }

      .cashier-branding {
        width: 100% !important;
        min-height: 240px !important;
        padding: 24px !important;
      }

      .cashier-form {
        width: 100% !important;
        padding: 30px 28px !important;
      }

      .cashier-security {
        margin-top: 16px !important;
      }
    }

    /* =========================
       MOBILE
    ========================= */

    @media (max-width: 600px) {
      .cashier-page {
        padding: 10px !important;
      }

      .cashier-wrapper {
        width: 100% !important;
        max-width: 520px !important;
        border-radius: 20px !important;
      }

      .cashier-branding {
        min-height: 215px !important;
        padding: 22px 20px !important;
      }

      .cashier-logo {
        width: 42px !important;
        height: 42px !important;
        font-size: 20px !important;
        margin-bottom: 10px !important;
      }

      .cashier-brand-title {
        font-size: 23px !important;
      }

      .cashier-badge {
        margin-top: 12px !important;
        margin-bottom: 7px !important;
        font-size: 8px !important;
        padding: 5px 9px !important;
      }

      .cashier-heading {
        font-size: 24px !important;
      }

      .cashier-brand-text {
        margin-top: 7px !important;
        font-size: 10.5px !important;
        line-height: 1.5 !important;
      }

      .cashier-security {
        margin-top: 13px !important;
        padding: 11px !important;
      }

      .cashier-security-title {
        margin-bottom: 6px !important;
        font-size: 10px !important;
      }

      .cashier-security-item {
        margin-top: 4px !important;
        font-size: 9px !important;
      }

      .cashier-form {
        padding: 26px 20px !important;
      }

      .cashier-title {
        font-size: 24px !important;
      }

      .cashier-subtitle {
        margin-bottom: 18px !important;
      }
    }

    /* =========================
       SMALL MOBILE
    ========================= */

    @media (max-width: 430px) {
      .cashier-page {
        padding: 8px !important;
      }

      .cashier-wrapper {
        border-radius: 18px !important;
      }

      .cashier-branding {
        min-height: 195px !important;
        padding: 19px 17px !important;
      }

      .cashier-logo {
        width: 38px !important;
        height: 38px !important;
        border-radius: 11px !important;
        font-size: 18px !important;
      }

      .cashier-brand-title {
        font-size: 21px !important;
      }

      .cashier-heading {
        font-size: 22px !important;
      }

      .cashier-brand-text {
        font-size: 10px !important;
      }

      .cashier-security {
        margin-top: 10px !important;
        padding: 9px !important;
      }

      .cashier-security-item {
        font-size: 8.5px !important;
      }

      .cashier-form {
        padding: 24px 17px !important;
      }

      .cashier-title {
        font-size: 22px !important;
      }

      .cashier-subtitle {
        font-size: 11px !important;
      }
    }

    /* =========================
       VERY SMALL MOBILE
    ========================= */

    @media (max-width: 360px) {
      .cashier-branding {
        min-height: 180px !important;
        padding: 17px 15px !important;
      }

      .cashier-brand-title {
        font-size: 19px !important;
      }

      .cashier-heading {
        font-size: 20px !important;
      }

      .cashier-brand-text {
        font-size: 9.5px !important;
      }

      .cashier-security {
        display: none !important;
      }

      .cashier-form {
        padding: 22px 15px !important;
      }

      .cashier-title {
        font-size: 21px !important;
      }
    }
  `}
</style>

      <div
        className="cashier-wrapper"
        style={styles.wrapper}
      >
        {/* LEFT BRANDING */}

        <div
          className="cashier-branding"
          style={styles.branding}
        >
          <div className="cashier-logo" style={styles.logo}>🏦</div>

          <h1 className="cashier-brand-title" style={styles.brandTitle}>
            Avani Bank
          </h1>

          <div className="cashier-badge" style={styles.badge}>
            Staff Operations Portal
          </div>

          <h2 className="cashier-heading" style={styles.heading}>
            Cashier Login
          </h2>

          <p className="cashier-brand-text" style={styles.brandText}>
            Secure access for authorized cashiers
            to manage branch cash operations.
          </p>

          <div
            className="cashier-security"
            style={styles.securityBox}
          >
            <p className="cashier-security-title" style={styles.securityTitle}>
              🔐 Secure Cashier Access
            </p>

            <div className="cashier-security-item" style={styles.securityItem}>
              ✓ Branch-level access
            </div>

            <div style={styles.securityItem}>
              ✓ Secure cash deposits
            </div>

            <div style={styles.securityItem}>
              ✓ Authorized staff authentication
            </div>
          </div>
        </div>

        {/* LOGIN */}

        <div
          className="cashier-form"
          style={styles.formSection}
        >
          <div style={styles.smallLabel}>
            ● Authorized Staff Access
          </div>

          <h2
            className="cashier-title"
            style={styles.title}
          >
            Welcome Back
          </h2>

          <p className="cashier-subtitle" style={styles.subtitle}>
            Sign in to your cashier workspace.
          </p>

          <form onSubmit={handleLogin}>
            {/* EMAIL */}

            <div style={styles.field}>
              <label style={styles.label}>
                Staff Email
              </label>

              <div style={styles.inputWrapper}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter cashier email"
                  style={styles.input}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div style={styles.field}>
              <label style={styles.label}>
                Password
              </label>

              <div style={styles.inputWrapper}>
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter password"
                  style={{
                    ...styles.input,
                    ...styles.passwordInput,
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  style={styles.showButton}
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "HIDE"
                    : "SHOW"}
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div style={styles.error}>
                ⚠ {error}
              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              style={{
                ...styles.button,
                ...(loading
                  ? styles.disabled
                  : {}),
              }}
              disabled={loading}
            >
              {loading
                ? "Signing In..."
                : "Sign In as Cashier →"}
            </button>
          </form>

          <div style={styles.footer}>
            🔒 Avani Bank • Authorized Cashier Access
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashierLogin;