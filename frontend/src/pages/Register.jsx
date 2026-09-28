import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    accountType: "SAVINGS",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
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
    setSuccess("");
    setAccountNumber("");

    if (formData.phone.length !== 10) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/register",
        formData
      );

      console.log(
        "Register Response:",
        response.data
      );

      setSuccess(
        "Account created successfully! Please save your account number."
      );

      setAccountNumber(
        response.data.accountNumber
      );

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        accountType: "SAVINGS",
      });

    } catch (error) {
      console.error(
        "Register Error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data?.message ||
          error.response.data ||
          "Registration failed."
        );
      } else {
        setError(
          "Unable to connect with server."
        );
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

          * {
            box-sizing: border-box;
          }

          @media (max-width: 850px) {
            body {
              overflow-y: auto;
            }
          }
        `}
      </style>

      <div style={styles.page}>

        {/* BACKGROUND DECORATION */}

        <div style={styles.backgroundCircleOne}></div>
        <div style={styles.backgroundCircleTwo}></div>


        <div style={styles.card}>

          {/* =================================================
              LEFT WELCOME PANEL
          ================================================= */}

          <div style={styles.welcomePanel}>

            <div>

              {/* BRAND */}

              <div style={styles.brand}>

                <div style={styles.brandIcon}>
                  🏦
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


              {/* WELCOME CONTENT */}

              <div style={styles.welcomeContent}>

                <div style={styles.welcomeTag}>
                  START YOUR JOURNEY
                </div>

                <h1 style={styles.welcomeTitle}>
                  Banking that
                  <br />
                  grows with you.
                </h1>

                <p style={styles.welcomeText}>
                  Open your Avani Bank account and
                  experience simple, secure and convenient
                  digital banking.
                </p>


                {/* BENEFITS */}

                <div style={styles.benefits}>

                  <div style={styles.benefitItem}>

                    <div style={styles.benefitIcon}>
                      ₹
                    </div>

                    <div>

                      <div style={styles.benefitTitle}>
                        Personal Banking
                      </div>

                      <div style={styles.benefitText}>
                        Manage your money your way
                      </div>

                    </div>

                  </div>


                  <div style={styles.benefitItem}>

                    <div style={styles.benefitIcon}>
                      ⚡
                    </div>

                    <div>

                      <div style={styles.benefitTitle}>
                        Digital Convenience
                      </div>

                      <div style={styles.benefitText}>
                        Banking whenever you need it
                      </div>

                    </div>

                  </div>


                  <div style={styles.benefitItem}>

                    <div style={styles.benefitIcon}>
                      ✓
                    </div>

                    <div>

                      <div style={styles.benefitTitle}>
                        Secure Banking
                      </div>

                      <div style={styles.benefitText}>
                        Your account stays protected
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* LEFT FOOTER */}

            <div style={styles.welcomeFooter}>

              <span style={styles.statusDot}></span>

              <span>
                Join Avani Bank today
              </span>

            </div>

          </div>


          {/* =================================================
              RIGHT REGISTER PANEL
          ================================================= */}

          <div style={styles.registerPanel}>

            <div style={styles.registerContent}>

              {/* HEADER */}

              <div style={styles.registerHeader}>

                <div style={styles.registerIcon}>
                  👋
                </div>

                <div>

                  <div style={styles.registerLabel}>
                    CUSTOMER BANKING
                  </div>

                  <h2 style={styles.title}>
                    Create your account
                  </h2>

                </div>

              </div>


              <p style={styles.subtitle}>
                Fill in your details to open your Avani
                Bank account.
              </p>


              <form onSubmit={handleSubmit}>

                {/* FULL NAME */}

                <div style={styles.inputGroup}>

                  <label style={styles.label}>
                    Full Name
                  </label>

                  <div style={styles.inputWrapper}>

                    <span style={styles.inputIcon}>
                      👤
                    </span>

                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      style={styles.input}
                    />

                  </div>

                </div>


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
                      style={styles.input}
                    />

                  </div>

                </div>


                {/* PHONE */}

                <div style={styles.inputGroup}>

                  <label style={styles.label}>
                    Phone Number
                  </label>

                  <div style={styles.inputWrapper}>

                    <span style={styles.inputIcon}>
                      📱
                    </span>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter 10-digit phone number"
                      value={formData.phone}
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        if (value.length <= 10) {
                          setFormData({
                            ...formData,
                            phone: value,
                          });
                        }
                      }}
                      required
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

                    <span style={styles.passwordHint}>
                      Minimum 6 characters
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
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
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


                {/* ACCOUNT TYPE */}

                <div style={styles.inputGroup}>

                  <label style={styles.label}>
                    Account Type
                  </label>

                  <div style={styles.inputWrapper}>

                    <span style={styles.inputIcon}>
                      🏦
                    </span>

                    <select
                      name="accountType"
                      value={
                        formData.accountType
                      }
                      onChange={handleChange}
                      style={styles.select}
                    >

                      <option value="SAVINGS">
                        Savings Account
                      </option>

                      <option value="CURRENT">
                        Current Account
                      </option>

                    </select>

                  </div>

                </div>


                {/* SUCCESS */}

                {success && (
                  <div style={styles.success}>

                    <div style={styles.successHeader}>
                      <span style={styles.successIcon}>
                        ✓
                      </span>

                      <span>
                        Account created successfully
                      </span>
                    </div>

                    <div style={styles.successText}>
                      Please save your account number.
                    </div>

                    {accountNumber && (
                      <div
                        style={styles.accountNumber}
                      >
                        Account Number:{" "}
                        <strong>
                          {accountNumber}
                        </strong>
                      </div>
                    )}

                  </div>
                )}


                {/* ERROR */}

                {error && (
                  <div style={styles.error}>

                    <span style={styles.errorIcon}>
                      !
                    </span>

                    <span>
                      {error}
                    </span>

                  </div>
                )}


                {/* CREATE BUTTON */}

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

                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create My Account

                      <span style={styles.buttonArrow}>
                        →
                      </span>
                    </>
                  )}

                </button>

              </form>


              {/* LOGIN */}

              <div style={styles.loginSection}>

                <span style={styles.loginText}>
                  Already have an account?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  style={styles.loginButton}
                >
                  Sign In
                </button>

              </div>


              {/* FOOTER */}

              <div style={styles.footer}>

                <span>
                  🔒
                </span>

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


const styles = {
  /* =========================
     PAGE
  ========================= */

  page: {
    width: "100%",
    height: "100vh",

    position: "relative",

    overflow: "hidden",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    padding: "12px",

    boxSizing: "border-box",

    background:
      "linear-gradient(135deg, #e9f7ff 0%, #f5fbff 50%, #e6f4ff 100%)",

    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },


  /* =========================
     BACKGROUND
  ========================= */

  backgroundCircleOne: {
    position: "absolute",

    width: "390px",
    height: "390px",

    borderRadius: "50%",

    top: "-245px",
    right: "-80px",

    background:
      "rgba(7, 99, 141, 0.12)",

    pointerEvents: "none",
  },


  backgroundCircleTwo: {
    position: "absolute",

    width: "300px",
    height: "300px",

    borderRadius: "50%",

    bottom: "-190px",
    left: "-100px",

    background:
      "rgba(4, 88, 77, 0.1)",

    pointerEvents: "none",
  },


  /* =========================
     MAIN CARD
  ========================= */

  card: {
    position: "relative",

    zIndex: 2,

    width: "58vw",

    maxWidth: "1000px",

    minWidth: "760px",

    /*
      IMPORTANT:
      Card ab viewport ke andar compact rahega.
    */

    height:
      "min(530px, calc(100vh - 24px))",

    display: "flex",

    background: "#ffffff",

    borderRadius: "27px",

    overflow: "hidden",

    border:
      "1px solid rgba(148,163,184,0.20)",

    boxShadow:
      "0 24px 65px rgba(30,64,175,0.15)",
  },


  /* =========================
     LEFT PANEL
  ========================= */

  welcomePanel: {
    width: "40%",

    height: "100%",

    padding: "25px 30px 22px",

    boxSizing: "border-box",

    display: "flex",

    flexDirection: "column",

    justifyContent: "space-between",

    background:
      "linear-gradient(150deg, #075985 0%, #0891b2 52%, #14b8a6 100%)",

    color: "#ffffff",

    position: "relative",

    overflow: "hidden",
  },


  /* =========================
     BRAND
  ========================= */

  brand: {
    display: "flex",

    alignItems: "center",

    gap: "9px",
  },


  brandIcon: {
    width: "40px",
    height: "40px",

    borderRadius: "12px",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    background:
      "rgba(255,255,255,0.16)",

    border:
      "1px solid rgba(255,255,255,0.28)",

    fontSize: "21px",

    fontWeight: 900,

    fontStyle: "italic",
  },


  brandName: {
    fontSize: "16px",

    fontWeight: 850,

    letterSpacing: "1.5px",
  },


  brandSubtitle: {
    marginTop: "2px",

    fontSize: "6.5px",

    fontWeight: 700,

    letterSpacing: "1.2px",

    opacity: 0.78,
  },


  /* =========================
     LEFT CONTENT
  ========================= */

  welcomeContent: {
    width: "100%",

    maxWidth: "370px",

    margin: "0 auto",
  },


  welcomeIcon: {
    width: "45px",
    height: "45px",

    borderRadius: "14px",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    background:
      "rgba(255,255,255,0.15)",

    border:
      "1px solid rgba(255,255,255,0.23)",

    fontSize: "21px",

    marginBottom: "8px",
  },


  welcomeTag: {
    display: "inline-flex",

    padding: "5px 10px",

    borderRadius: "20px",

    background:
      "rgba(255,255,255,0.13)",

    border:
      "1px solid rgba(255,255,255,0.20)",

    fontSize: "6.8px",

    fontWeight: 800,

    letterSpacing: "0.9px",

    marginBottom: "8px",
  },


  welcomeTitle: {
    margin: 0,

    fontSize: "26px",

    lineHeight: "1.06",

    letterSpacing: "-0.6px",

    fontWeight: 800,
  },


  welcomeText: {
    margin: "8px 0 0",

    color:
      "rgba(255,255,255,0.84)",

    fontSize: "9.5px",

    lineHeight: "1.45",
  },


  /* =========================
     BENEFITS
  ========================= */

  benefits: {
    display: "grid",

    gap: "7px",

    marginTop: "13px",
  },


  benefitItem: {
    display: "flex",

    alignItems: "center",

    gap: "8px",
  },


  benefitIcon: {
    width: "25px",
    height: "25px",

    borderRadius: "8px",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    background:
      "rgba(255,255,255,0.14)",

    border:
      "1px solid rgba(255,255,255,0.18)",

    fontSize: "10px",

    fontWeight: 800,

    flexShrink: 0,
  },


  benefitTitle: {
    fontSize: "9px",

    fontWeight: 750,
  },


  benefitText: {
    marginTop: "1px",

    fontSize: "7px",

    color:
      "rgba(255,255,255,0.68)",
  },


  /* =========================
     LEFT FOOTER
  ========================= */

  welcomeFooter: {
    display: "flex",

    alignItems: "center",

    gap: "6px",

    color:
      "rgba(255,255,255,0.68)",

    fontSize: "7.5px",
  },


  statusDot: {
    width: "6px",
    height: "6px",

    borderRadius: "50%",

    background: "#99f6e4",

    boxShadow:
      "0 0 0 3px rgba(153,246,228,0.12)",
  },


  /* =========================
     RIGHT PANEL
  ========================= */

  registerPanel: {
    width: "60%",

    height: "100%",

    padding: "18px 30px",

    boxSizing: "border-box",

    display: "flex",

    alignItems: "flex-start",

    justifyContent: "flex-start",

    background: "#ffffff",

    overflow: "hidden",
  },


  registerContent: {
    width: "100%",

    maxWidth: "440px",

    margin: "0 auto",
    transform: "scale(0.92)",
    transformOrigin: "top center",
  },


  /* =========================
     HEADER
  ========================= */

  registerHeader: {
    display: "flex",

    alignItems: "center",

    gap: "9px",

    marginBottom: "2px",
  },


  registerIcon: {
    width: "37px",
    height: "37px",

    borderRadius: "11px",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    background:
      "linear-gradient(135deg, #e0f2fe, #ccfbf1)",

    fontSize: "16px",

    flexShrink: 0,
  },


  registerLabel: {
    color: "#087f9b",

    fontSize: "6px",

    fontWeight: 850,

    letterSpacing: "1px",

    marginBottom: "0",
  },


  title: {
    margin: 0,

    color: "#0f2742",

    fontSize: "20px",

    lineHeight: "1",

    fontWeight: 800,

    letterSpacing: "-0.5px",
  },


  subtitle: {
    margin: "0 0 9px",

    color: "#718096",

    fontSize: "8.5px",

    lineHeight: "1.35",
  },


  /* =========================
     INPUT GROUP
  ========================= */

  inputGroup: {
    marginBottom: "5px",
  },


  label: {
    display: "block",

    marginBottom: "2px",

    color: "#33445d",

    fontSize: "8.5px",

    fontWeight: 750,
  },


  passwordLabelRow: {
    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",
  },


  passwordHint: {
    color: "#94a3b8",

    fontSize: "6.5px",

    marginBottom: "3px",
  },


  /* =========================
     INPUT
  ========================= */

  inputWrapper: {
    width: "100%",

    height: "33px",

    display: "flex",

    alignItems: "center",

    border:
      "1px solid #d9e4ed",

    borderRadius: "9px",

    background: "#fbfdff",
  },


  inputIcon: {
    width: "32px",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    color: "#648198",

    fontSize: "10px",

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
      "7px 8px 7px 0",

    fontSize: "10px",
  },


  passwordInput: {
    flex: 1,

    minWidth: 0,

    border: "none",

    outline: "none",

    background: "transparent",

    color: "#172033",

    padding:
      "7px 4px 7px 0",

    fontSize: "10px",
  },


  showButton: {
    border: "none",

    background: "#eef7fa",

    color: "#087f9b",

    padding: "4px 7px",

    marginRight: "4px",

    borderRadius: "6px",

    cursor: "pointer",

    fontSize: "7px",

    fontWeight: 750,
  },


  select: {
    flex: 1,

    minWidth: 0,

    height: "100%",

    border: "none",

    outline: "none",

    background: "transparent",

    color: "#172033",

    padding:
      "0 8px 0 0",

    fontSize: "10px",

    cursor: "pointer",
  },


  /* =========================
     SUCCESS
  ========================= */

  success: {
    background: "#ecfdf5",

    border:
      "1px solid #a7f3d0",

    color: "#047857",

    padding: "7px 8px",

    borderRadius: "8px",

    marginBottom: "7px",

    fontSize: "7.5px",

    lineHeight: "1.3",
  },


  successHeader: {
    display: "flex",

    alignItems: "center",

    gap: "5px",

    fontWeight: 750,
  },


  successIcon: {
    width: "15px",
    height: "15px",

    borderRadius: "50%",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    background: "#bbf7d0",

    fontSize: "8px",

    fontWeight: 900,

    flexShrink: 0,
  },


  successText: {
    marginTop: "2px",
  },


  accountNumber: {
    marginTop: "3px",

    fontSize: "9px",

    fontWeight: 700,

    letterSpacing: "0.3px",
  },


  /* =========================
     ERROR
  ========================= */

  error: {
    display: "flex",

    alignItems: "center",

    gap: "6px",

    background: "#fff4f4",

    border:
      "1px solid #ffd2d2",

    color: "#b4232d",

    padding: "6px 8px",

    borderRadius: "8px",

    marginBottom: "7px",

    fontSize: "7.5px",

    lineHeight: "1.3",
  },


  errorIcon: {
    width: "15px",
    height: "15px",

    borderRadius: "50%",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    background: "#f8d6d8",

    fontSize: "8px",

    fontWeight: 900,

    flexShrink: 0,
  },


  /* =========================
     CREATE BUTTON
  ========================= */

  button: {
    width: "100%",

    height: "37px",

    border: "none",

    borderRadius: "9px",

    background:
      "linear-gradient(135deg, #087f9b 0%, #0891b2 50%, #14b8a6 100%)",

    color: "#ffffff",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    gap: "8px",

    padding: "7px 12px",

    fontSize: "10.5px",

    fontWeight: 800,

    cursor: "pointer",

    boxShadow:
      "0 8px 18px rgba(8,145,178,0.20)",
  },


  buttonDisabled: {
    opacity: 0.7,

    cursor: "not-allowed",

    boxShadow: "none",
  },


  loadingIcon: {
    fontSize: "13px",
  },


  buttonArrow: {
    fontSize: "14px",
  },


  /* =========================
     LOGIN SECTION
  ========================= */

  loginSection: {
    textAlign: "center",

    marginTop: "6px",

    paddingTop: "6px",

    borderTop:
      "1px solid #e7eef3",
  },


  loginText: {
    color: "#718096",

    fontSize: "7.5px",
  },


  loginButton: {
    border: "none",

    background: "transparent",

    color: "#087f9b",

    fontWeight: 800,

    marginLeft: "5px",

    cursor: "pointer",

    fontSize: "7.5px",

    padding: 0,
  },


  /* =========================
     FOOTER
  ========================= */

  footer: {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "5px",

    marginTop: "5px",

    color: "#9aa9b5",

    fontSize: "6.8px",

    textAlign: "center",
  },


  footerDot: {
    color: "#cbd5e1",
  },
};

export default Register;