import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InterestCalculation() {
  const navigate = useNavigate();
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

  // Responsive layout state
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 700 : false
  );
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 1000 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
      setIsTablet(window.innerWidth <= 1000);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState("12");
  const [calculatedInterest, setCalculatedInterest] = useState(null);

  useEffect(() => {
    const fetchAccount = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8080/api/accounts",
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
          throw new Error("Unable to fetch account details.");
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setAccount(data[0]);
          setAmount(data[0].balance || "");
        } else {
          setError("No account found.");
        }
      } catch (err) {
        console.error("Interest Calculation Error:", err);
        setError(
          err.message || "Unable to load account information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [navigate]);

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateInterest = () => {
    const principal = Number(amount);
    const rate = Number(account?.interestRate || 0);
    const time = Number(months) / 12;

    if (!principal || principal <= 0) {
      setCalculatedInterest(null);
      setError("Please enter a valid amount.");
      return;
    }

    setError("");

    const interest = (principal * rate * time) / 100;
    const totalAmount = principal + interest;

    setCalculatedInterest({
      principal,
      rate,
      time,
      interest,
      totalAmount,
    });
  };

  const resetCalculation = () => {
    setAmount(account?.balance || "");
    setMonths("12");
    setCalculatedInterest(null);
    setError("");
  };

  // =========================
  // RESPONSIVE STYLES
  // =========================
  const responsiveStyles = {
    ...styles,
    header: {
      ...styles.header,
      ...(isTablet ? { padding: "14px 4%", gap: "12px" } : {}),
      ...(isMobile ? {
        flexDirection: "column",
        alignItems: "stretch",
        padding: "14px 16px",
        gap: "12px",
      } : {}),
    },
    brandArea: {
      ...styles.brandArea,
      ...(isMobile ? { justifyContent: "center" } : {}),
    },
    headerButton: {
      ...styles.headerButton,
      ...(isMobile ? {
        width: "100%",
        textAlign: "center",
        boxSizing: "border-box",
        padding: "11px 14px",
      } : {}),
    },
    container: {
      ...styles.container,
      ...(isTablet ? { padding: "35px 20px 50px" } : {}),
      ...(isMobile ? { padding: "28px 14px 40px" } : {}),
    },
    pageHeading: {
      ...styles.pageHeading,
      ...(isMobile ? { marginBottom: "22px" } : {}),
    },
    title: {
      ...styles.title,
      ...(isTablet ? { fontSize: "30px" } : {}),
      ...(isMobile ? { fontSize: "25px", letterSpacing: "-0.5px" } : {}),
    },
    subtitle: {
      ...styles.subtitle,
      ...(isMobile ? { fontSize: "12px", lineHeight: "1.5" } : {}),
    },
    errorBox: {
      ...styles.errorBox,
      ...(isMobile ? { padding: "12px 14px", fontSize: "12px" } : {}),
    },
    accountCard: {
      ...styles.accountCard,
      ...(isTablet ? { padding: "17px" } : {}),
      ...(isMobile ? {
        flexDirection: "column",
        alignItems: "stretch",
        gap: "14px",
        padding: "16px",
      } : {}),
    },
    accountLeft: {
      ...styles.accountLeft,
      ...(isMobile ? { alignItems: "flex-start" } : {}),
    },
    accountNumber: {
      ...styles.accountNumber,
      ...(isMobile ? { fontSize: "14px", overflowWrap: "anywhere" } : {}),
    },
    rateBox: {
      ...styles.rateBox,
      ...(isMobile ? {
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        textAlign: "left",
      } : {}),
    },
    calculatorCard: {
      ...styles.calculatorCard,
      ...(isTablet ? { padding: "20px" } : {}),
      ...(isMobile ? { padding: "17px" } : {}),
    },
    cardHeader: {
      ...styles.cardHeader,
      ...(isMobile ? { alignItems: "flex-start", gap: "12px" } : {}),
    },
    cardTitle: {
      ...styles.cardTitle,
      ...(isMobile ? { fontSize: "17px" } : {}),
    },
    percentIcon: {
      ...styles.percentIcon,
      ...(isMobile ? {
        width: "38px",
        height: "38px",
        minWidth: "38px",
        fontSize: "18px",
      } : {}),
    },
    formGrid: {
      ...styles.formGrid,
      ...(isTablet ? { gridTemplateColumns: "1fr" } : {}),
    },
    input: {
      ...styles.input,
      ...(isMobile ? { fontSize: "13px" } : {}),
    },
    readOnlyInput: {
      ...styles.readOnlyInput,
      ...(isMobile ? { fontSize: "13px" } : {}),
    },
    buttonRow: {
      ...styles.buttonRow,
      ...(isMobile ? { flexDirection: "column", gap: "9px" } : {}),
    },
    calculateButton: {
      ...styles.calculateButton,
      ...(isMobile ? { width: "100%", padding: "13px 16px" } : {}),
    },
    resetButton: {
      ...styles.resetButton,
      ...(isMobile ? { width: "100%", padding: "13px 16px" } : {}),
    },
    resultCard: {
      ...styles.resultCard,
      ...(isMobile ? { padding: "17px" } : {}),
    },
    resultHeader: {
      ...styles.resultHeader,
      ...(isMobile ? { alignItems: "flex-start", gap: "12px" } : {}),
    },
    resultTitle: {
      ...styles.resultTitle,
      ...(isMobile ? { fontSize: "17px" } : {}),
    },
    resultIcon: {
      ...styles.resultIcon,
      ...(isMobile ? {
        width: "38px",
        height: "38px",
        minWidth: "38px",
        fontSize: "17px",
      } : {}),
    },
    resultGrid: {
      ...styles.resultGrid,
      ...(isTablet ? { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } : {}),
      ...(isMobile ? { gridTemplateColumns: "1fr" } : {}),
    },
    resultItem: {
      ...styles.resultItem,
      ...(isMobile ? { padding: "12px" } : {}),
    },
    resultItemHighlight: {
      ...styles.resultItemHighlight,
      ...(isMobile ? { padding: "12px" } : {}),
    },
    totalBox: {
      ...styles.totalBox,
      ...(isMobile ? {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "8px",
        padding: "14px",
      } : {}),
    },
    totalAmount: {
      ...styles.totalAmount,
      ...(isMobile ? { fontSize: "19px", overflowWrap: "anywhere" } : {}),
    },
    infoCard: {
      ...styles.infoCard,
      ...(isMobile ? {
        alignItems: "flex-start",
        padding: "15px",
        gap: "10px",
      } : {}),
    },
    infoIcon: {
      ...styles.infoIcon,
      ...(isMobile ? { width: "36px", height: "36px", minWidth: "36px" } : {}),
    },
    footer: {
      ...styles.footer,
      ...(isMobile ? {
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "16px",
      } : {}),
    },
    loadingPage: {
      ...styles.loadingPage,
      padding: isMobile ? "16px" : "20px",
      boxSizing: "border-box",
    },
    loadingCard: {
      ...styles.loadingCard,
      width: isMobile ? "100%" : "auto",
      maxWidth: isMobile ? "360px" : "none",
      boxSizing: "border-box",
      padding: isMobile ? "28px 20px" : styles.loadingCard.padding,
    },
    loadingTitle: {
      ...styles.loadingTitle,
      ...(isMobile ? { fontSize: "17px" } : {}),
    },
  };

  const themedStyles = darkMode
    ? {
        ...responsiveStyles,
        page: { ...responsiveStyles.page, background: "#0b1220", color: "#e5e7eb" },
        container: { ...responsiveStyles.container, color: "#e5e7eb" },
        eyebrow: { ...responsiveStyles.eyebrow, color: "#8eb5ff" },
        title: { ...responsiveStyles.title, color: "#f1f5f9" },
        subtitle: { ...responsiveStyles.subtitle, color: "#a5b4c8" },
        errorBox: { ...responsiveStyles.errorBox, background: "#3a1d24", border: "1px solid #7f303c", color: "#fecaca" },
        accountCard: { ...responsiveStyles.accountCard, background: "#111c2e", border: "1px solid #26364e", boxShadow: "0 8px 25px rgba(0,0,0,0.18)" },
        label: { ...responsiveStyles.label, color: "#a5b4c8" },
        accountNumber: { ...responsiveStyles.accountNumber, color: "#f1f5f9" },
        accountType: { ...responsiveStyles.accountType, color: "#a5b4c8" },
        rateBox: { ...responsiveStyles.rateBox, background: "#12352d" },
        calculatorCard: { ...responsiveStyles.calculatorCard, background: "#111c2e", border: "1px solid #26364e", boxShadow: "0 8px 25px rgba(0,0,0,0.18)" },
        sectionEyebrow: { ...responsiveStyles.sectionEyebrow, color: "#9bb8f5" },
        cardTitle: { ...responsiveStyles.cardTitle, color: "#f1f5f9" },
        fieldLabel: { ...responsiveStyles.fieldLabel, color: "#c0cada" },
        input: { ...responsiveStyles.input, background: "#0b1424", border: "1px solid #35445d", color: "#f1f5f9", colorScheme: "dark" },
        readOnlyInput: { ...responsiveStyles.readOnlyInput, background: "#1a2940", border: "1px solid #35445d", color: "#f1f5f9" },
        inputSuffix: { ...responsiveStyles.inputSuffix, color: "#a5b4c8" },
        helperText: { ...responsiveStyles.helperText, color: "#9aa9bf" },
        resetButton: { ...responsiveStyles.resetButton, background: "#1a2940", border: "1px solid #35445d", color: "#e5e7eb" },
        resultCard: { ...responsiveStyles.resultCard, background: "#111c2e", border: "1px solid #2b4b3d", boxShadow: "0 8px 25px rgba(0,0,0,0.18)" },
        resultTitle: { ...responsiveStyles.resultTitle, color: "#f1f5f9" },
        resultItem: { ...responsiveStyles.resultItem, background: "#1a2940" },
        resultItemHighlight: { ...responsiveStyles.resultItemHighlight, background: "#12352d" },
        resultLabel: { ...responsiveStyles.resultLabel, color: "#b4c0d2" },
        resultValue: { ...responsiveStyles.resultValue, color: "#f1f5f9" },
        infoCard: { ...responsiveStyles.infoCard, background: "#111c2e", border: "1px solid #26364e" },
        infoTitle: { ...responsiveStyles.infoTitle, color: "#f1f5f9" },
        infoText: { ...responsiveStyles.infoText, color: "#b0bdcf" },
        footer: { ...responsiveStyles.footer, background: "#0e1829", borderTop: "1px solid #26364e", color: "#a5b4c8" },
        loadingPage: { ...responsiveStyles.loadingPage, background: "#0b1220" },
        loadingCard: { ...responsiveStyles.loadingCard, background: "#111c2e", boxShadow: "0 15px 40px rgba(0,0,0,0.25)" },
        loadingTitle: { ...responsiveStyles.loadingTitle, color: "#f1f5f9" },
        loadingText: { ...responsiveStyles.loadingText, color: "#a5b4c8" },
      }
    : responsiveStyles;

  if (loading) {
    return (
      <div style={themedStyles.loadingPage}>
        <div style={themedStyles.loadingCard}>
          <div style={themedStyles.loadingIcon}>%</div>

          <h2 style={themedStyles.loadingTitle}>
            Loading interest details
          </h2>

          <p style={themedStyles.loadingText}>
            Please wait while we fetch your account information...
          </p>

          <div style={themedStyles.loader}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={themedStyles.page}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        input, select, button {
          max-width: 100%;
        }

        input, select {
          min-width: 0;
        }
      `}</style>

      {/* ================= HEADER ================= */}

      <header style={themedStyles.header}>
        <div style={themedStyles.brandArea}>

          <div style={themedStyles.brandIcon}>
            %
          </div>

          <div>
            <div style={themedStyles.brandName}>
              AVANI BANK
            </div>

            <div style={themedStyles.brandSubtitle}>
              Interest Calculation
            </div>
          </div>

        </div>

        <button
          style={themedStyles.headerButton}
          onClick={() => navigate("/accounts")}
        >
          ← Account Management
        </button>
      </header>

      {/* ================= MAIN ================= */}

      <main style={themedStyles.container}>

        <section style={themedStyles.pageHeading}>

          <p style={themedStyles.eyebrow}>
            ACCOUNT SERVICES
          </p>

          <h1 style={themedStyles.title}>
            Interest Calculation
          </h1>

          <p style={themedStyles.subtitle}>
            Calculate the estimated interest on your account balance.
          </p>

        </section>

        {error && (
          <div style={themedStyles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {account && (
          <>
            {/* ================= ACCOUNT SUMMARY ================= */}

            <section style={themedStyles.accountCard}>

              <div style={themedStyles.accountLeft}>

                <div style={themedStyles.accountIcon}>
                  🏦
                </div>

                <div>
                  <p style={themedStyles.label}>
                    ACCOUNT NUMBER
                  </p>

                  <p style={themedStyles.accountNumber}>
                    {account.accountNumber || "N/A"}
                  </p>

                  <p style={themedStyles.accountType}>
                    {account.accountType || "N/A"} Account
                  </p>
                </div>

              </div>

              <div style={themedStyles.rateBox}>

                <p style={themedStyles.rateLabel}>
                  CURRENT INTEREST RATE
                </p>

                <p style={themedStyles.rate}>
                  {account.interestRate || 0}%
                </p>

                <p style={themedStyles.rateNote}>
                  Per annum
                </p>

              </div>

            </section>

            {/* ================= CALCULATOR ================= */}

            <section style={themedStyles.calculatorCard}>

              <div style={themedStyles.cardHeader}>

                <div>
                  <p style={themedStyles.sectionEyebrow}>
                    INTEREST CALCULATOR
                  </p>

                  <h2 style={themedStyles.cardTitle}>
                    Calculate Your Interest
                  </h2>
                </div>

                <div style={themedStyles.percentIcon}>
                  %
                </div>

              </div>

              <div style={themedStyles.formGrid}>

                {/* AMOUNT */}

                <div style={themedStyles.fieldGroup}>

                  <label style={themedStyles.fieldLabel}>
                    PRINCIPAL AMOUNT (₹)
                  </label>

                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    style={themedStyles.input}
                  />

                  <p style={themedStyles.helperText}>
                    Current balance: ₹
                    {formatCurrency(account.balance)}
                  </p>

                </div>

                {/* RATE */}

                <div style={themedStyles.fieldGroup}>

                  <label style={themedStyles.fieldLabel}>
                    INTEREST RATE
                  </label>

                  <div style={themedStyles.readOnlyInput}>
                    {account.interestRate || 0}%
                    <span style={themedStyles.inputSuffix}>
                      p.a.
                    </span>
                  </div>

                  <p style={themedStyles.helperText}>
                    Based on your account type
                  </p>

                </div>

                {/* PERIOD */}

                <div style={themedStyles.fieldGroup}>

                  <label style={themedStyles.fieldLabel}>
                    TIME PERIOD
                  </label>

                  <select
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    style={themedStyles.input}
                  >
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                  </select>

                  <p style={themedStyles.helperText}>
                    Select calculation period
                  </p>

                </div>

              </div>

              {/* ================= BUTTONS ================= */}

              <div style={themedStyles.buttonRow}>

                <button
                  style={themedStyles.calculateButton}
                  onClick={calculateInterest}
                >
                  Calculate Interest
                </button>

                <button
                  style={themedStyles.resetButton}
                  onClick={resetCalculation}
                >
                  Reset
                </button>

              </div>

            </section>

            {/* ================= RESULT ================= */}

            {calculatedInterest && (
              <section style={themedStyles.resultCard}>

                <div style={themedStyles.resultHeader}>

                  <div>
                    <p style={themedStyles.resultEyebrow}>
                      CALCULATION RESULT
                    </p>

                    <h2 style={themedStyles.resultTitle}>
                      Estimated Interest
                    </h2>
                  </div>

                  <div style={themedStyles.resultIcon}>
                    ₹
                  </div>

                </div>

                <div style={themedStyles.resultGrid}>

                  <div style={themedStyles.resultItem}>
                    <p style={themedStyles.resultLabel}>
                      PRINCIPAL
                    </p>

                    <p style={themedStyles.resultValue}>
                      ₹
                      {formatCurrency(
                        calculatedInterest.principal
                      )}
                    </p>
                  </div>

                  <div style={themedStyles.resultItem}>
                    <p style={themedStyles.resultLabel}>
                      RATE
                    </p>

                    <p style={themedStyles.resultValue}>
                      {calculatedInterest.rate}%
                    </p>
                  </div>

                  <div style={themedStyles.resultItem}>
                    <p style={themedStyles.resultLabel}>
                      PERIOD
                    </p>

                    <p style={themedStyles.resultValue}>
                      {months} Months
                    </p>
                  </div>

                  <div style={themedStyles.resultItemHighlight}>
                    <p style={themedStyles.resultLabelGreen}>
                      ESTIMATED INTEREST
                    </p>

                    <p style={themedStyles.interestValue}>
                      ₹
                      {formatCurrency(
                        calculatedInterest.interest
                      )}
                    </p>
                  </div>

                </div>

                <div style={themedStyles.totalBox}>

                  <div>
                    <p style={themedStyles.totalLabel}>
                      ESTIMATED TOTAL AMOUNT
                    </p>

                    <p style={themedStyles.totalNote}>
                      Principal + estimated interest
                    </p>
                  </div>

                  <p style={themedStyles.totalAmount}>
                    ₹
                    {formatCurrency(
                      calculatedInterest.totalAmount
                    )}
                  </p>

                </div>

              </section>
            )}

            {/* ================= INFORMATION ================= */}

            <section style={themedStyles.infoCard}>

              <div style={themedStyles.infoIcon}>
                ℹ
              </div>

              <div>

                <h3 style={themedStyles.infoTitle}>
                  Interest Calculation
                </h3>

                <p style={themedStyles.infoText}>
                  This calculator provides an estimated interest
                  amount using simple interest based on your
                  account's applicable interest rate.
                </p>

              </div>

            </section>
          </>
        )}

      </main>

      {/* ================= FOOTER ================= */}

      <footer style={themedStyles.footer}>
        <div>
          © {new Date().getFullYear()} Avani Bank
        </div>

        <div>
          Secure • Reliable • Digital Banking
        </div>
      </footer>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
  },

  header: {
    minHeight: "78px",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    background:
      "linear-gradient(135deg, #102354 0%, #173f9d 48%, #2563d4 100%)",
    boxSizing: "border-box",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  brandIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    fontWeight: "800",
  },

  brandName: {
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  brandSubtitle: {
    color: "rgba(255,255,255,0.75)",
    marginTop: "3px",
    fontSize: "11px",
  },

  headerButton: {
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "11px 17px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "45px 24px 60px",
    boxSizing: "border-box",
  },

  pageHeading: {
    textAlign: "center",
    marginBottom: "30px",
  },

  eyebrow: {
    margin: 0,
    color: "#2457c6",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.8px",
  },

  title: {
    margin: "8px 0 6px",
    color: "#172442",
    fontSize: "34px",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: 0,
    color: "#78849b",
    fontSize: "13px",
  },

  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffd0d0",
    color: "#d93434",
    borderRadius: "12px",
    padding: "14px 18px",
    textAlign: "center",
    fontSize: "13px",
    marginBottom: "18px",
  },

  accountCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf2",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 8px 25px rgba(25,45,85,0.05)",
    marginBottom: "15px",
  },

  accountLeft: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  accountIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#edf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  label: {
    margin: 0,
    color: "#71809b",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  accountNumber: {
    margin: "5px 0 2px",
    color: "#1c2b49",
    fontSize: "15px",
    fontWeight: "800",
  },

  accountType: {
    margin: 0,
    color: "#8993a8",
    fontSize: "10px",
  },

  rateBox: {
    background: "#edf9f3",
    borderRadius: "12px",
    padding: "11px 17px",
    minWidth: "160px",
    textAlign: "right",
  },

  rateLabel: {
    margin: 0,
    color: "#159663",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  rate: {
    margin: "3px 0 0",
    color: "#159663",
    fontSize: "21px",
    fontWeight: "800",
  },

  rateNote: {
    margin: "1px 0 0",
    color: "#6ca88e",
    fontSize: "8px",
  },

  calculatorCard: {
    background: "#ffffff",
    border: "1px solid #e5eaf2",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 8px 25px rgba(25,45,85,0.05)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "25px",
  },

  sectionEyebrow: {
    margin: 0,
    color: "#5572af",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  cardTitle: {
    margin: "5px 0 0",
    color: "#1b2947",
    fontSize: "20px",
  },

  percentIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#fff8e7",
    color: "#9a6700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },

  fieldGroup: {
    minWidth: 0,
  },

  fieldLabel: {
    display: "block",
    marginBottom: "7px",
    color: "#6e7b94",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.8px",
  },

  input: {
    width: "100%",
    height: "43px",
    border: "1px solid #dfe5ee",
    borderRadius: "9px",
    padding: "0 12px",
    boxSizing: "border-box",
    background: "#ffffff",
    color: "#253657",
    fontSize: "12px",
    outline: "none",
  },

  readOnlyInput: {
    width: "100%",
    height: "43px",
    border: "1px solid #dfe5ee",
    borderRadius: "9px",
    padding: "0 12px",
    boxSizing: "border-box",
    background: "#f7f9fc",
    color: "#253657",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: "700",
  },

  inputSuffix: {
    color: "#8993a8",
    fontSize: "10px",
    fontWeight: "500",
  },

  helperText: {
    margin: "6px 0 0",
    color: "#929bad",
    fontSize: "9px",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "23px",
  },

  calculateButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px 20px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  resetButton: {
    border: "1px solid #dfe5ef",
    background: "#ffffff",
    color: "#42516d",
    borderRadius: "9px",
    padding: "11px 20px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  resultCard: {
    marginTop: "15px",
    background: "#ffffff",
    border: "1px solid #dce7df",
    borderRadius: "16px",
    padding: "23px",
    boxShadow: "0 8px 25px rgba(25,45,85,0.05)",
  },

  resultHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  resultEyebrow: {
    margin: 0,
    color: "#159663",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  resultTitle: {
    margin: "5px 0 0",
    color: "#1b2947",
    fontSize: "19px",
  },

  resultIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#edf9f3",
    color: "#159663",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
  },

  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "10px",
  },

  resultItem: {
    background: "#f7f9fc",
    borderRadius: "10px",
    padding: "14px",
  },

  resultItemHighlight: {
    background: "#edf9f3",
    borderRadius: "10px",
    padding: "14px",
  },

  resultLabel: {
    margin: 0,
    color: "#8993a8",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.8px",
  },

  resultLabelGreen: {
    margin: 0,
    color: "#159663",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.8px",
  },

  resultValue: {
    margin: "6px 0 0",
    color: "#253657",
    fontSize: "14px",
    fontWeight: "800",
  },

  interestValue: {
    margin: "6px 0 0",
    color: "#159663",
    fontSize: "16px",
    fontWeight: "800",
  },

  totalBox: {
    marginTop: "12px",
    padding: "15px 17px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, #102354, #2457c6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  totalLabel: {
    margin: 0,
    color: "rgba(255,255,255,0.75)",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  totalNote: {
    margin: "4px 0 0",
    color: "rgba(255,255,255,0.6)",
    fontSize: "9px",
  },

  totalAmount: {
    margin: 0,
    color: "#ffffff",
    fontSize: "21px",
    fontWeight: "800",
  },

  infoCard: {
    marginTop: "15px",
    background: "#ffffff",
    border: "1px solid #e5eaf2",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  infoIcon: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    borderRadius: "11px",
    background: "#eef4ff",
    color: "#2457c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  infoTitle: {
    margin: 0,
    color: "#26334e",
    fontSize: "13px",
  },

  infoText: {
    margin: "4px 0 0",
    color: "#8993a8",
    fontSize: "10px",
    lineHeight: "1.5",
  },

  footer: {
    borderTop: "1px solid #e5e9f0",
    background: "#ffffff",
    padding: "18px 6%",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    color: "#939baa",
    fontSize: "9px",
    boxSizing: "border-box",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "35px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(25,45,85,0.08)",
  },

  loadingIcon: {
    width: "50px",
    height: "50px",
    margin: "0 auto",
    borderRadius: "14px",
    background: "#fff8e7",
    color: "#9a6700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    fontWeight: "800",
  },

  loadingTitle: {
    color: "#1d2b47",
    margin: "14px 0 5px",
    fontSize: "18px",
  },

  loadingText: {
    color: "#8993a8",
    fontSize: "11px",
  },

  loader: {
    width: "27px",
    height: "27px",
    border: "3px solid #dfe6f2",
    borderTop: "3px solid #2457c6",
    borderRadius: "50%",
    margin: "18px auto 0",
    animation: "spin 0.8s linear infinite",
  },
};

export default InterestCalculation;