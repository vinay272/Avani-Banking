import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
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
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Staff login failed"
        );
      }

      // Only BANK_ADMIN and SUPER_ADMIN can access admin portal
      if (
        data.role !== "BANK_ADMIN" &&
        data.role !== "SUPER_ADMIN"
      ) {
        throw new Error(
          "Access denied. Admin privileges are required."
        );
      }

      // Store staff authentication details
      localStorage.setItem("token", data.token);
      localStorage.setItem("staffToken", data.token);
      localStorage.setItem("staffRole", data.role);
      localStorage.setItem("staffId", data.employeeId);
      localStorage.setItem(
        "employeeCode",
        data.employeeCode
      );
      localStorage.setItem("staffName", data.fullName);
      localStorage.setItem("staffEmail", data.email);
      localStorage.setItem(
        "branchCode",
        data.branchCode
      );

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Responsive safety CSS */}
      <style>
        {`
          html,
          body,
          #root {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
            overflow-x: hidden;
          }

          body {
            overflow-y: hidden;
          }

          * {
            box-sizing: border-box;
          }

          @media (max-width: 900px) {
            body {
              overflow-y: auto;
            }
          }
        `}
      </style>

      <div style={styles.page}>

        {/* Background Decoration */}
        <div style={styles.glowOne}></div>
        <div style={styles.glowTwo}></div>

        <div style={styles.loginContainer}>

          {/* =====================================================
              LEFT BRANDING PANEL
          ====================================================== */}

          <div style={styles.brandPanel}>

            <div style={styles.brandHeader}>
              <div style={styles.logoBox}>🏦</div>

              <div>
                <div style={styles.brandName}>
                  AVANI BANK
                </div>

                <div style={styles.brandSmall}>
                  DIGITAL BANKING SYSTEM
                </div>
              </div>
            </div>


            <div style={styles.brandContent}>

              {/* <div style={styles.securityIcon}>
                🔐
              </div> */}

              <div style={styles.adminBadge}>
                ADMINISTRATIVE PORTAL
              </div>

              <h1 style={styles.brandTitle}>
                Secure Banking
                <br />
                Administration
              </h1>

              <p style={styles.brandDescription}>
                A centralized and secure workspace for
                managing Avani Bank's branches, employees,
                cash operations, ATMs, vaults, reports and
                banking services.
              </p>

              <div style={styles.featureList}>

                <div style={styles.featureItem}>
                  <span style={styles.checkIcon}>
                    ✓
                  </span>

                  <span>
                    Secure staff authentication
                  </span>
                </div>

                <div style={styles.featureItem}>
                  <span style={styles.checkIcon}>
                    ✓
                  </span>

                  <span>
                    Role-based administrative access
                  </span>
                </div>

                <div style={styles.featureItem}>
                  <span style={styles.checkIcon}>
                    ✓
                  </span>

                  <span>
                    Protected banking operations
                  </span>
                </div>

              </div>
            </div>


            <div style={styles.authorized}>
              <span style={styles.onlineDot}></span>

              <span>
                Authorized personnel only
              </span>
            </div>

          </div>


          {/* =====================================================
              STYLISH CENTER SEPARATOR
          ====================================================== */}

          <div style={styles.centerDivider}>
            <div style={styles.dividerDot}></div>
          </div>


          {/* =====================================================
              RIGHT LOGIN PANEL
          ====================================================== */}

          <div style={styles.loginPanel}>

            <div style={styles.loginHeader}>

              <div style={styles.adminIcon}>
                👤
              </div>

              <div>
                <div style={styles.securityLabel}>
                  STAFF SECURITY PORTAL
                </div>

                <h2 style={styles.title}>
                  Admin Sign In
                </h2>
              </div>

            </div>


            <p style={styles.subtitle}>
              Sign in with your authorized staff credentials
              to access the administration portal.
            </p>


            {/* ERROR */}

            {error && (
              <div style={styles.errorBox}>

                <div style={styles.errorIcon}>
                  !
                </div>

                <div>
                  <div style={styles.errorTitle}>
                    Authentication Failed
                  </div>

                  <div style={styles.errorMessage}>
                    {error}
                  </div>
                </div>

              </div>
            )}


            <form onSubmit={handleLogin}>

              {/* EMAIL */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Staff Email
                </label>

                <div style={styles.inputWrapper}>

                  <span style={styles.inputIcon}>
                    ✉
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your staff email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                    autoComplete="email"
                    style={styles.input}
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div style={styles.formGroup}>

                <label style={styles.label}>
                  Password
                </label>

                <div style={styles.inputWrapper}>

                  <span style={styles.inputIcon}>
                    🔑
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    autoComplete="current-password"
                    style={styles.passwordInput}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    style={styles.showButton}
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>


              {/* ACCESS INFORMATION */}

              <div style={styles.accessBox}>

                <span style={styles.accessIcon}>
                  🛡️
                </span>

                <span>
                  Admin access is restricted to{" "}
                  <strong>BANK_ADMIN</strong>{" "}
                  and{" "}
                  <strong>SUPER_ADMIN</strong>{" "}
                  roles.
                </span>

              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.loginButton,
                  ...(loading
                    ? styles.loginButtonDisabled
                    : {}),
                }}
              >

                {loading ? (
                  <>
                    <span style={styles.loadingIcon}>
                      ⟳
                    </span>

                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Admin Portal

                    <span style={styles.arrow}>
                      →
                    </span>
                  </>
                )}

              </button>

            </form>


            {/* SECURITY DIVIDER */}

            <div style={styles.divider}>

              <div style={styles.dividerLine}></div>

              <span style={styles.dividerText}>
                SECURE ACCESS
              </span>

              <div style={styles.dividerLine}></div>

            </div>


            <div style={styles.securityMessage}>
              <span>🔒</span>

              <span>
                Your session is protected by secure
                authentication.
              </span>
            </div>

            <div style={styles.copyright}>
              © {new Date().getFullYear()} Avani Bank
              {" · "}
              Administrative Portal
            </div>

          </div>

        </div>
      </div>
    </>
  );
}


/* =========================================================
   STYLES
========================================================= */
const styles = {

  /* ================================
     PAGE
  ================================= */

  page: {
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    boxSizing: "border-box",
    position: "relative",
    background:
      "linear-gradient(135deg, #061326 0%, #09284b 48%, #075ca8 100%)",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },


  /* ================================
     BACKGROUND
  ================================= */

  glowOne: {
    position: "absolute",

    width: "380px",
    height: "380px",

    borderRadius: "50%",

    top: "-220px",
    right: "-100px",

    background:
      "rgba(30, 150, 255, 0.19)",

    pointerEvents: "none",
  },

  glowTwo: {
    position: "absolute",

    width: "300px",
    height: "300px",

    borderRadius: "50%",

    bottom: "-200px",
    left: "-100px",

    background:
      "rgba(0, 191, 255, 0.22)",

    pointerEvents: "none",
  },


  /* ================================
     MAIN CARD
  ================================= */

  loginContainer: {
    position: "relative",
    zIndex: 2,

    /* 55-58% screen width */
    width: "58vw",
    maxWidth: "1040px",
    minWidth: "760px",

    /*
      IMPORTANT:
      No 650px / 560px fixed height.
      Compact height so everything fits.
    */
    height: "min(500px, calc(100vh - 30px))",

    display: "flex",

    background: "#ffffff",

    borderRadius: "28px",

    overflow: "hidden",

    boxShadow:
      "0 24px 65px rgba(0,0,0,0.30)",

    border:
      "1px solid rgba(255,255,255,0.35)",
  },


  /* ================================
     LEFT PANEL
  ================================= */

  brandPanel: {
    width: "50%",
    height: "100%",

    padding: "25px 32px",

    boxSizing: "border-box",

    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

    background:
      "linear-gradient(290deg, #0755c7 0%, #0878df 52%, #0b9af1 100%)",

    color: "#ffffff",

    position: "relative",
  },


  brandHeader: {
    display: "flex",
    alignItems: "center",

    gap: "10px",
  },


  logoBox: {
    width: "43px",
    height: "43px",

    borderRadius: "12px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background:
      "rgba(255,255,255,0.18)",

    border:
      "1px solid rgba(255,255,255,0.28)",

    fontSize: "23px",
    fontWeight: 900,
    fontStyle: "italic",

    flexShrink: 0,
  },


  brandName: {
    fontSize: "17px",

    fontWeight: 850,

    letterSpacing: "1.6px",
  },


  brandSmall: {
    marginTop: "2px",

    fontSize: "7px",

    fontWeight: 700,

    letterSpacing: "1.3px",

    opacity: 0.75,
  },


  brandContent: {
    width: "100%",

    maxWidth: "390px",

    margin: "0 auto",
  },


  securityIcon: {
    width: "48px",
    height: "48px",

    borderRadius: "14px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background:
      "rgba(255,255,255,0.15)",

    border:
      "1px solid rgba(255,255,255,0.23)",

    fontSize: "22px",

    marginBottom: "9px",
  },


  adminBadge: {
    display: "inline-flex",

    width: "fit-content",

    padding: "5px 10px",

    borderRadius: "18px",

    background:
      "rgba(255,255,255,0.14)",

    border:
      "1px solid rgba(255,255,255,0.22)",

    fontSize: "7.5px",

    fontWeight: 800,

    letterSpacing: "0.9px",

    marginBottom: "8px",
  },


  brandTitle: {
    margin: 0,

    fontSize: "27px",

    lineHeight: "1.07",

    letterSpacing: "-0.6px",

    fontWeight: 800,
  },


  brandDescription: {
    margin: "9px 0 0",

    color:
      "rgba(255,255,255,0.86)",

    fontSize: "10px",

    lineHeight: "1.45",
  },


  featureList: {
    display: "grid",

    gap: "5px",

    marginTop: "11px",
  },


  featureItem: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    color:
      "rgba(255,255,255,0.94)",

    fontSize: "9.5px",
  },


  checkIcon: {
    width: "19px",
    height: "19px",

    borderRadius: "50%",

    display: "inline-flex",

    alignItems: "center",
    justifyContent: "center",

    background:
      "rgba(255,255,255,0.16)",

    border:
      "1px solid rgba(255,255,255,0.18)",

    fontSize: "9px",

    fontWeight: 900,

    flexShrink: 0,
  },


  authorized: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    color:
      "rgba(255,255,255,0.70)",

    fontSize: "8px",
  },


  onlineDot: {
    width: "6px",
    height: "6px",

    borderRadius: "50%",

    background: "#8fffc4",

    boxShadow:
      "0 0 0 3px rgba(143,255,196,0.12)",
  },


  /* ================================
     CENTER SEPARATOR
  ================================= */

  centerDivider: {
    position: "absolute",

    top: "10%",
    bottom: "10%",

    left: "50%",

    width: "1px",

    transform:
      "translateX(-50%)",

    background:
      "linear-gradient(180deg, transparent, rgba(255,255,255,0.8) 20%, rgba(8,114,217,0.45) 50%, rgba(255,255,255,0.8) 80%, transparent)",

    zIndex: 10,

    pointerEvents: "none",
  },


  dividerDot: {
    position: "absolute",

    top: "50%",
    left: "50%",

    width: "7px",
    height: "7px",

    transform:
      "translate(-50%, -50%)",

    borderRadius: "50%",

    background: "#087ee9",

    border: "2px solid #ffffff",

    boxShadow:
      "0 0 0 3px rgba(8,126,233,0.15)",
  },


  /* ================================
     RIGHT PANEL
  ================================= */

  loginPanel: {
    width: "50%",
    height: "100%",

    padding: "24px 34px",
    marginTop:"20px",
    boxSizing: "border-box",

    display: "flex",
    flexDirection: "column",

    justifyContent: "center",

    background: "#ffffff",

    overflow: "hidden",
  },


  loginHeader: {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "10px",

    marginBottom: "5px",
  },


  adminIcon: {
    width: "38px",
    height: "38px",

    borderRadius: "11px",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    background: "#eaf3ff",

    fontSize: "17px",

    flexShrink: 0,
  },


  securityLabel: {
    color: "#0872d9",

    fontSize: "7.5px",

    fontWeight: 850,

    letterSpacing: "1.15px",

    marginBottom: "2px",
  },


  title: {
    margin: 0,

    color: "#10213a",

    fontSize: "24px",

    fontWeight: 800,

    letterSpacing: "-0.6px",

    lineHeight: "1",
  },


  subtitle: {
    margin: "0 auto 13px",

    maxWidth: "450px",

    color: "#718096",

    fontSize: "9.5px",

    lineHeight: "1.4",

    textAlign: "center",
  },


  /* ================================
     ERROR
  ================================= */

  errorBox: {
    display: "flex",

    alignItems: "flex-start",

    gap: "7px",

    background: "#fff4f4",

    border:
      "1px solid #ffd2d2",

    color: "#b4232d",

    padding: "7px 8px",

    borderRadius: "8px",

    fontSize: "8.5px",

    lineHeight: "1.35",

    marginBottom: "9px",
  },


  errorIcon: {
    width: "17px",
    height: "17px",

    flexShrink: 0,

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    borderRadius: "50%",

    background: "#f8d6d8",

    fontSize: "9px",

    fontWeight: 900,
  },


  errorTitle: {
    fontWeight: 800,
  },


  errorMessage: {
    wordBreak: "break-word",
  },


  /* ================================
     FORM
  ================================= */

  formGroup: {
    marginBottom: "9px",
  },


  label: {
    display: "block",

    marginBottom: "4px",

    color: "#33445d",

    fontSize: "9.5px",

    fontWeight: 750,

    textAlign: "center",
  },


  inputWrapper: {
    width: "100%",

    height: "40px",

    display: "flex",

    alignItems: "center",

    boxSizing: "border-box",

    border:
      "1px solid #d8e2ee",

    borderRadius: "9px",

    background: "#fbfdff",
  },


  inputIcon: {
    width: "34px",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    color: "#6b7d94",

    fontSize: "11px",

    flexShrink: 0,
  },


  input: {
    flex: 1,

    minWidth: 0,

    border: "none",

    outline: "none",

    background: "transparent",

    color: "#172033",

    padding:
      "8px 9px 8px 0",

    fontSize: "11px",
  },


  passwordInput: {
    flex: 1,

    minWidth: 0,

    border: "none",

    outline: "none",

    background: "transparent",

    color: "#172033",

    padding:
      "8px 4px 8px 0",

    fontSize: "11px",
  },


  showButton: {
    flexShrink: 0,

    marginRight: "5px",

    border: "none",

    background: "#eef4fb",

    color: "#42617f",

    padding: "5px 8px",

    borderRadius: "7px",

    cursor: "pointer",

    fontSize: "8px",

    fontWeight: 750,
  },


  /* ================================
     ACCESS BOX
  ================================= */

  accessBox: {
    display: "flex",

    alignItems: "center",

    gap: "6px",

    minHeight: "35px",

    padding: "6px 8px",

    marginBottom: "9px",

    borderRadius: "8px",

    background: "#f4f8fd",

    border:
      "1px solid #e1ebf5",

    color: "#63748a",

    fontSize: "8px",

    lineHeight: "1.3",

    textAlign: "center",
  },


  accessIcon: {
    flexShrink: 0,

    fontSize: "10px",
  },


  /* ================================
     LOGIN BUTTON
  ================================= */

  loginButton: {
    width: "100%",

    height: "42px",

    border: "none",

    borderRadius: "9px",

    background:
      "linear-gradient(135deg, #075ecf 0%, #087ee9 55%, #1197f2 100%)",

    color: "#ffffff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "8px",

    padding: "9px 12px",

    fontSize: "11px",

    fontWeight: 800,

    cursor: "pointer",

    boxShadow:
      "0 8px 18px rgba(7,103,211,0.20)",
  },


  loginButtonDisabled: {
    opacity: 0.72,

    cursor: "not-allowed",

    boxShadow: "none",
  },


  loadingIcon: {
    fontSize: "14px",
  },


  arrow: {
    fontSize: "15px",
  },


  /* ================================
     BOTTOM SECURITY DIVIDER
  ================================= */

  divider: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    margin: "9px 0 6px",
  },


  dividerLine: {
    flex: 1,

    height: "1px",

    background:
      "linear-gradient(90deg, transparent, #bdd5e9, #5b9ed4, #bdd5e9, transparent)",
  },


  dividerText: {
    color: "#527493",

    fontSize: "5.5px",

    fontWeight: 850,

    letterSpacing: "0.9px",

    padding: "3px 7px",

    borderRadius: "20px",
    background: "#ffffff",
    border:
      "1px solid #dce8f4",
    whiteSpace: "nowrap",
  },
  /* ================================
     SECURITY MESSAGE
  ================================= */
  securityMessage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    color: "#8795a7",
    fontSize: "7.5px",
    textAlign: "center",
  
  },
  /* ================================
     COPYRIGHT
  ================================= */
  copyright: {
    marginTop: "2px",
    textAlign: "center",
    color: "#b0bac7",
    fontSize: "6.5px",
  },
};
export default AdminLogin;