import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      console.log("Login Response:", response.data);

      // JWT token save
      localStorage.setItem("token", response.data.token);

      // Customer information save
      localStorage.setItem(
        "customer",
        JSON.stringify(response.data.customer)
      );

      // Dashboard par bhejo
      navigate("/dashboard");

    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        setError(
          error.response.data?.message ||
          "Invalid email or password"
        );
      } else {
        setError("Unable to connect with server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          html,
          body,
          #root {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
          }

          body {
            overflow-x: hidden;
            overflow-y: hidden;
          }

          @media (max-width: 850px) {
            body {
              overflow-y: auto;
            }
          }

          * {
            box-sizing: border-box;
          }
        `}
      </style>

      <div style={styles.page}>

        {/* Decorative background elements */}
        <div style={styles.backgroundCircleOne}></div>
        <div style={styles.backgroundCircleTwo}></div>

        <div style={styles.card}>

          {/* =================================================
              LEFT CUSTOMER WELCOME PANEL
          ================================================== */}

          <div style={styles.welcomePanel}>

            <div>

              {/* Brand */}
              <div style={styles.brand}>
                <div style={styles.brandIcon}>🏦
                  
                </div>

                <div>
                  <div style={styles.brandName}>
                    AVANI BANK
                  </div>

                  <div style={styles.brandSubtitle}>
                    PERSONAL BANKING
                  </div>
                </div>
              </div>


              {/* Welcome content */}
              <div style={styles.welcomeContent}>

                <div style={styles.welcomeTag}>
                  YOUR BANK. YOUR WAY.
                </div>

                <h1 style={styles.welcomeTitle}>
                  Banking made
                  <br />
                  simple for you.
                </h1>

                <p style={styles.welcomeText}>
                  Manage your money, payments and everyday
                  banking from one simple and secure place.
                </p>


                {/* Benefits */}

                <div style={styles.benefits}>

                  <div style={styles.benefitItem}>
                    <div style={styles.benefitIcon}>
                      ↗
                    </div>

                    <div>
                      <div style={styles.benefitTitle}>
                        Easy Banking
                      </div>

                      <div style={styles.benefitText}>
                        Manage your account with ease
                      </div>
                    </div>
                  </div>


                  <div style={styles.benefitItem}>
                    <div style={styles.benefitIcon}>
                      ₹
                    </div>

                    <div>
                      <div style={styles.benefitTitle}>
                        Smart Payments
                      </div>

                      <div style={styles.benefitText}>
                        Pay and transfer anytime
                      </div>
                    </div>
                  </div>


                  <div style={styles.benefitItem}>
                    <div style={styles.benefitIcon}>
                      ✓
                    </div>

                    <div>
                      <div style={styles.benefitTitle}>
                        Secure Account
                      </div>

                      <div style={styles.benefitText}>
                        Your banking stays protected
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>


            {/* Bottom text */}

            <div style={styles.welcomeFooter}>
              <span style={styles.statusDot}></span>

              <span>
                Avani Bank digital banking
              </span>
            </div>

          </div>


          {/* =================================================
              RIGHT LOGIN PANEL
          ================================================== */}

          <div style={styles.loginPanel}>

            <div style={styles.loginContent}>

              {/* Header */}

              <div style={styles.loginHeader}>

                <div style={styles.loginIcon}>
                  👋
                </div>

                <div>
                  <div style={styles.loginLabel}>
                    CUSTOMER BANKING
                  </div>

                  <h2 style={styles.title}>
                    Welcome back
                  </h2>
                </div>

              </div>


              <p style={styles.subtitle}>
                Sign in to continue to your Avani Bank account.
              </p>


              {/* Error */}

              {error && (
                <div style={styles.errorBox}>

                  <div style={styles.errorIcon}>
                    !
                  </div>

                  <div>
                    <div style={styles.errorTitle}>
                      Login failed
                    </div>

                    <div style={styles.errorMessage}>
                      {error}
                    </div>
                  </div>

                </div>
              )}


              {/* Login Form */}

              <form onSubmit={handleSubmit}>

                {/* EMAIL */}

                <div style={styles.inputGroup}>

                  <label style={styles.label}>
                    Email Address
                  </label>

                  <div style={styles.inputWrapper}>

                    <span style={styles.inputIcon}>
                      ✉
                    </span>

                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      style={styles.input}
                    />

                  </div>

                </div>


                {/* PASSWORD */}

                <div style={styles.inputGroup}>

                  <div style={styles.passwordLabelRow}>

                    <label style={styles.label}>
                      Password
                    </label>

                    <span style={styles.secureHint}>
                      Secure login
                    </span>

                  </div>

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
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
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


                {/* Security information */}

                <div style={styles.securityBox}>

                  <span style={styles.securityIcon}>
                    🛡
                  </span>

                  <span>
                    Your login details are protected
                    with secure authentication.
                  </span>

                </div>


                {/* Login button */}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.button,
                    ...(loading
                      ? styles.buttonDisabled
                      : {}),
                  }}
                >

                  {loading ? (
                    <>
                      <span style={styles.loadingIcon}>
                        ⟳
                      </span>

                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue to My Account

                      <span style={styles.buttonArrow}>
                        →
                      </span>
                    </>
                  )}

                </button>

              </form>


              {/* Register */}

              <div style={styles.registerSection}>

                <span style={styles.registerText}>
                  New to Avani Bank?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
                  style={styles.registerButton}
                >
                  Create New Account
                </button>

              </div>


              {/* Footer */}

              <div style={styles.footerDivider}></div>

              <div style={styles.footer}>

                <span>🔒</span>

                <span>
                  Secure personal banking
                </span>

                <span style={styles.footerDot}>
                  •
                </span>

                <span>
                  Avani Bank
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}


/* ============================================================
   STYLES
============================================================ */

const styles = {

  /* ============================================================
     PAGE
  ============================================================ */

  page: {
    width: "100%",
    height: "100vh",

    position: "relative",

    overflow: "hidden",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    padding: "15px",

    boxSizing: "border-box",

    background:
      "linear-gradient(135deg, #e9f7ff 0%, #9bc5e1 48%, #6ca8e1 100%)",

    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },


  /* ============================================================
     BACKGROUND
  ============================================================ */

  backgroundCircleOne: {
    position: "absolute",

    width: "430px",
    height: "430px",

    borderRadius: "50%",

    top: "-270px",
    right: "-100px",

    background:
      "rgba(14, 164, 233, 0.38)",

    pointerEvents: "none",
  },


  backgroundCircleTwo: {
    position: "absolute",

    width: "330px",
    height: "330px",

    borderRadius: "50%",

    bottom: "-210px",
    left: "-120px",

    background:
      "rgba(21, 196, 172, 0.48)",

    pointerEvents: "none",
  },


  /* ============================================================
     MAIN CARD
  ============================================================ */

  card: {
    position: "relative",

    zIndex: 2,

    width: "58vw",

    maxWidth: "1040px",

    minWidth: "760px",

    height:
      "min(540px, calc(100vh - 30px))",

    display: "flex",

    background: "#ffffff",

    borderRadius: "28px",

    overflow: "hidden",

    border:
      "1px solid rgba(148,163,184,0.20)",

    boxShadow:
      "0 25px 70px rgba(30,64,175,0.15)",
  },


  /* ============================================================
     LEFT WELCOME PANEL
  ============================================================ */

  welcomePanel: {
    width: "50%",

    height: "100%",

    padding: "30px 32px",

    boxSizing: "border-box",

    display: "flex",

    flexDirection: "column",

    justifyContent: "space-between",

    background:
      "linear-gradient(150deg, #075985 0%, #0891b2 52%, #14b8a6 100%)",

    color: "#ffffff",

    position: "relative",
  },


  brand: {
    display: "flex",

    alignItems: "center",

    gap: "10px",
  },


  brandIcon: {
    width: "44px",
    height: "44px",
    marginLeft:"45px",
    borderRadius: "13px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background:
      "rgba(255,255,255,0.16)",

    border:
      "1px solid rgba(255,255,255,0.28)",

    fontSize: "22px",

    fontWeight: 900,

    fontStyle: "italic",
  },


  brandName: {
    fontSize: "17px",
    textAlign:"center",
    fontWeight: 850,
    justifyContent:"center",
    letterSpacing: "1.6px",
    marginLeft:"10px"
  },


  brandSubtitle: {
    marginTop: "2px",
    marginLeft:"15px",
    fontSize: "7px",

    fontWeight: 700,

    letterSpacing: "1.3px",

    opacity: 0.78,
  },


  /* ============================================================
     WELCOME CONTENT
  ============================================================ */

  welcomeContent: {
    maxWidth: "380px",

    margin: "0 auto",

    width: "100%",
  },


  welcomeIcon: {
    width: "50px",
    height: "50px",

    borderRadius: "16px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background:
      "rgba(255,255,255,0.15)",

    border:
      "1px solid rgba(255,255,255,0.24)",

    fontSize: "23px",

    marginBottom: "10px",
  },


  welcomeTag: {
    display: "inline-flex",

    padding: "5px 10px",

    borderRadius: "20px",

    background:
      "rgba(255,255,255,0.13)",

    border:
      "1px solid rgba(255,255,255,0.20)",

    fontSize: "7px",

    fontWeight: 800,

    letterSpacing: "1px",

    marginBottom: "9px",
  },


  welcomeTitle: {
    margin: 0,

    fontSize: "28px",

    lineHeight: "1.08",

    letterSpacing: "-0.7px",

    fontWeight: 800,
  },


  welcomeText: {
    margin: "10px 0 0",

    color:
      "rgba(255,255,255,0.84)",

    fontSize: "10.5px",

    lineHeight: "1.5",
  },


  /* ============================================================
     BENEFITS
  ============================================================ */

  benefits: {
    display: "grid",

    gap: "7px",

    marginTop: "15px",
  },


  benefitItem: {
    display: "flex",

    alignItems: "center",

    gap: "9px",
  },


  benefitIcon: {
    width: "27px",
    height: "27px",

    borderRadius: "9px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background:
      "rgba(255,255,255,0.14)",

    border:
      "1px solid rgba(255,255,255,0.18)",

    fontSize: "12px",

    fontWeight: 800,

    flexShrink: 0,
  },


  benefitTitle: {
    fontSize: "9.5px",

    fontWeight: 750,
  },


  benefitText: {
    marginTop: "1px",

    fontSize: "7.5px",

    color:
      "rgba(255,255,255,0.68)",
  },


  /* ============================================================
     LEFT FOOTER
  ============================================================ */

  welcomeFooter: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    color:
      "rgba(255,255,255,0.68)",

    fontSize: "8px",
  },


  statusDot: {
    width: "6px",
    height: "6px",

    borderRadius: "50%",

    background: "#99f6e4",

    boxShadow:
      "0 0 0 3px rgba(153,246,228,0.12)",
  },


  /* ============================================================
     RIGHT LOGIN PANEL
  ============================================================ */

  loginPanel: {
    width: "50%",

    height: "100%",

    padding: "30px 38px",

    boxSizing: "border-box",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background: "#ffffff",
  },


  loginContent: {
    width: "100%",

    maxWidth: "430px",
  },


  /* ============================================================
     LOGIN HEADER
  ============================================================ */

  loginHeader: {
    display: "flex",

    alignItems: "center",

    gap: "11px",

    marginBottom: "5px",
  },


  loginIcon: {
    width: "40px",
    height: "40px",

    borderRadius: "12px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background:
      "linear-gradient(135deg, #e0f2fe, #ccfbf1)",

    fontSize: "18px",

    flexShrink: 0,
  },


  loginLabel: {
    color: "#0891b2",

    fontSize: "7.5px",

    fontWeight: 850,

    letterSpacing: "1.15px",

    marginBottom: "2px",
  },


  title: {
    margin: 0,

    color: "#0f2742",

    fontSize: "25px",

    lineHeight: "1",

    fontWeight: 800,

    letterSpacing: "-0.6px",
  },


  subtitle: {
    margin: "0 0 15px",

    color: "#718096",

    fontSize: "9.5px",

    lineHeight: "1.45",
  },


  /* ============================================================
     ERROR
  ============================================================ */

  errorBox: {
    display: "flex",

    alignItems: "flex-start",

    gap: "8px",

    padding: "8px 9px",

    marginBottom: "10px",

    borderRadius: "9px",

    background: "#fff4f4",

    border:
      "1px solid #ffd2d2",

    color: "#b4232d",

    fontSize: "8.5px",

    lineHeight: "1.35",
  },


  errorIcon: {
    width: "18px",
    height: "18px",

    borderRadius: "50%",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background: "#f8d6d8",

    fontSize: "9px",

    fontWeight: 900,

    flexShrink: 0,
  },


  errorTitle: {
    fontWeight: 800,

    marginBottom: "1px",
  },


  errorMessage: {
    wordBreak: "break-word",
  },


  /* ============================================================
     INPUTS
  ============================================================ */

  inputGroup: {
    marginBottom: "10px",
  },


  passwordLabelRow: {
    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",
  },


  label: {
    display: "block",

    marginBottom: "4px",

    color: "#33445d",

    fontSize: "9.5px",

    fontWeight: 750,
  },


  secureHint: {
    color: "#94a3b8",

    fontSize: "7.5px",

    marginBottom: "4px",
  },


  inputWrapper: {
    width: "100%",

    height: "42px",

    display: "flex",

    alignItems: "center",

    border:
      "1px solid #d9e4ed",

    borderRadius: "10px",

    background: "#fbfdff",

    transition:
      "border-color 0.2s ease",
  },


  inputIcon: {
    width: "36px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    color: "#648198",

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
      "9px 10px 9px 0",

    fontSize: "11.5px",
  },


  passwordInput: {
    flex: 1,

    minWidth: 0,

    border: "none",

    outline: "none",

    background: "transparent",

    color: "#172033",

    padding:
      "9px 4px 9px 0",

    fontSize: "11.5px",
  },


  showButton: {
    border: "none",

    background: "#eef7fa",

    color: "#087f9b",

    padding: "5px 8px",

    marginRight: "5px",

    borderRadius: "7px",

    cursor: "pointer",

    fontSize: "8px",

    fontWeight: 750,
  },


  /* ============================================================
     SECURITY BOX
  ============================================================ */

  securityBox: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    minHeight: "35px",

    padding: "6px 9px",

    marginBottom: "10px",

    borderRadius: "9px",

    background:
      "linear-gradient(135deg, #f0f9ff, #f0fdfa)",

    border:
      "1px solid #d9edf1",

    color: "#66808e",

    fontSize: "8px",

    lineHeight: "1.35",
  },


  securityIcon: {
    fontSize: "11px",

    flexShrink: 0,
  },


  /* ============================================================
     LOGIN BUTTON
  ============================================================ */

  button: {
    width: "100%",

    height: "43px",

    border: "none",

    borderRadius: "10px",

    background:
      "linear-gradient(135deg, #087f9b 0%, #0891b2 50%, #14b8a6 100%)",

    color: "#ffffff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "8px",

    padding: "9px 14px",

    fontSize: "11px",

    fontWeight: 800,

    cursor: "pointer",

    boxShadow:
      "0 9px 22px rgba(8,145,178,0.20)",
  },


  buttonDisabled: {
    opacity: 0.70,

    cursor: "not-allowed",

    boxShadow: "none",
  },


  loadingIcon: {
    fontSize: "14px",
  },


  buttonArrow: {
    fontSize: "15px",
  },


  /* ============================================================
     REGISTER
  ============================================================ */

  registerSection: {
    textAlign: "center",

    marginTop: "13px",

    paddingTop: "12px",

    borderTop:
      "1px solid #e7eef3",
  },


  registerText: {
    color: "#718096",

    fontSize: "8.5px",
  },


  registerButton: {
    border: "none",

    background: "transparent",

    color: "#087f9b",

    fontWeight: 800,

    marginLeft: "5px",

    cursor: "pointer",

    fontSize: "8.5px",

    padding: 0,
  },


  /* ============================================================
     FOOTER
  ============================================================ */

  footerDivider: {
    width: "70px",

    height: "2px",

    borderRadius: "10px",

    margin:
      "11px auto 7px",

    background:
      "linear-gradient(90deg, #bae6fd, #14b8a6, #bae6fd)",
  },


  footer: {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "5px",

    color: "#9aa9b5",

    fontSize: "7.5px",

    textAlign: "center",
  },


  footerDot: {
    color: "#cbd5e1",
  },
};

export default Login;