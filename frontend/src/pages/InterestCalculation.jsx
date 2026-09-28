import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function InterestCalculation() {
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>%</div>

          <h2 style={styles.loadingTitle}>
            Loading interest details
          </h2>

          <p style={styles.loadingText}>
            Please wait while we fetch your account information...
          </p>

          <div style={styles.loader}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* ================= HEADER ================= */}

      <header style={styles.header}>
        <div style={styles.brandArea}>

          <div style={styles.brandIcon}>
            %
          </div>

          <div>
            <div style={styles.brandName}>
              AVANI BANK
            </div>

            <div style={styles.brandSubtitle}>
              Interest Calculation
            </div>
          </div>

        </div>

        <button
          style={styles.headerButton}
          onClick={() => navigate("/accounts")}
        >
          ← Account Management
        </button>
      </header>

      {/* ================= MAIN ================= */}

      <main style={styles.container}>

        <section style={styles.pageHeading}>

          <p style={styles.eyebrow}>
            ACCOUNT SERVICES
          </p>

          <h1 style={styles.title}>
            Interest Calculation
          </h1>

          <p style={styles.subtitle}>
            Calculate the estimated interest on your account balance.
          </p>

        </section>

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {account && (
          <>
            {/* ================= ACCOUNT SUMMARY ================= */}

            <section style={styles.accountCard}>

              <div style={styles.accountLeft}>

                <div style={styles.accountIcon}>
                  🏦
                </div>

                <div>
                  <p style={styles.label}>
                    ACCOUNT NUMBER
                  </p>

                  <p style={styles.accountNumber}>
                    {account.accountNumber || "N/A"}
                  </p>

                  <p style={styles.accountType}>
                    {account.accountType || "N/A"} Account
                  </p>
                </div>

              </div>

              <div style={styles.rateBox}>

                <p style={styles.rateLabel}>
                  CURRENT INTEREST RATE
                </p>

                <p style={styles.rate}>
                  {account.interestRate || 0}%
                </p>

                <p style={styles.rateNote}>
                  Per annum
                </p>

              </div>

            </section>

            {/* ================= CALCULATOR ================= */}

            <section style={styles.calculatorCard}>

              <div style={styles.cardHeader}>

                <div>
                  <p style={styles.sectionEyebrow}>
                    INTEREST CALCULATOR
                  </p>

                  <h2 style={styles.cardTitle}>
                    Calculate Your Interest
                  </h2>
                </div>

                <div style={styles.percentIcon}>
                  %
                </div>

              </div>

              <div style={styles.formGrid}>

                {/* AMOUNT */}

                <div style={styles.fieldGroup}>

                  <label style={styles.fieldLabel}>
                    PRINCIPAL AMOUNT (₹)
                  </label>

                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    style={styles.input}
                  />

                  <p style={styles.helperText}>
                    Current balance: ₹
                    {formatCurrency(account.balance)}
                  </p>

                </div>

                {/* RATE */}

                <div style={styles.fieldGroup}>

                  <label style={styles.fieldLabel}>
                    INTEREST RATE
                  </label>

                  <div style={styles.readOnlyInput}>
                    {account.interestRate || 0}%
                    <span style={styles.inputSuffix}>
                      p.a.
                    </span>
                  </div>

                  <p style={styles.helperText}>
                    Based on your account type
                  </p>

                </div>

                {/* PERIOD */}

                <div style={styles.fieldGroup}>

                  <label style={styles.fieldLabel}>
                    TIME PERIOD
                  </label>

                  <select
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    style={styles.input}
                  >
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                  </select>

                  <p style={styles.helperText}>
                    Select calculation period
                  </p>

                </div>

              </div>

              {/* ================= BUTTONS ================= */}

              <div style={styles.buttonRow}>

                <button
                  style={styles.calculateButton}
                  onClick={calculateInterest}
                >
                  Calculate Interest
                </button>

                <button
                  style={styles.resetButton}
                  onClick={resetCalculation}
                >
                  Reset
                </button>

              </div>

            </section>

            {/* ================= RESULT ================= */}

            {calculatedInterest && (
              <section style={styles.resultCard}>

                <div style={styles.resultHeader}>

                  <div>
                    <p style={styles.resultEyebrow}>
                      CALCULATION RESULT
                    </p>

                    <h2 style={styles.resultTitle}>
                      Estimated Interest
                    </h2>
                  </div>

                  <div style={styles.resultIcon}>
                    ₹
                  </div>

                </div>

                <div style={styles.resultGrid}>

                  <div style={styles.resultItem}>
                    <p style={styles.resultLabel}>
                      PRINCIPAL
                    </p>

                    <p style={styles.resultValue}>
                      ₹
                      {formatCurrency(
                        calculatedInterest.principal
                      )}
                    </p>
                  </div>

                  <div style={styles.resultItem}>
                    <p style={styles.resultLabel}>
                      RATE
                    </p>

                    <p style={styles.resultValue}>
                      {calculatedInterest.rate}%
                    </p>
                  </div>

                  <div style={styles.resultItem}>
                    <p style={styles.resultLabel}>
                      PERIOD
                    </p>

                    <p style={styles.resultValue}>
                      {months} Months
                    </p>
                  </div>

                  <div style={styles.resultItemHighlight}>
                    <p style={styles.resultLabelGreen}>
                      ESTIMATED INTEREST
                    </p>

                    <p style={styles.interestValue}>
                      ₹
                      {formatCurrency(
                        calculatedInterest.interest
                      )}
                    </p>
                  </div>

                </div>

                <div style={styles.totalBox}>

                  <div>
                    <p style={styles.totalLabel}>
                      ESTIMATED TOTAL AMOUNT
                    </p>

                    <p style={styles.totalNote}>
                      Principal + estimated interest
                    </p>
                  </div>

                  <p style={styles.totalAmount}>
                    ₹
                    {formatCurrency(
                      calculatedInterest.totalAmount
                    )}
                  </p>

                </div>

              </section>
            )}

            {/* ================= INFORMATION ================= */}

            <section style={styles.infoCard}>

              <div style={styles.infoIcon}>
                ℹ
              </div>

              <div>

                <h3 style={styles.infoTitle}>
                  Interest Calculation
                </h3>

                <p style={styles.infoText}>
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

      <footer style={styles.footer}>
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