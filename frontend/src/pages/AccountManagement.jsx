import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AccountManagement() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH ACCOUNTS
  // =========================

  useEffect(() => {
    const fetchAccounts = async () => {
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

        // =========================
        // AUTH ERROR
        // =========================

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        // =========================
        // OTHER ERROR
        // =========================

        if (!response.ok) {
          throw new Error("Unable to fetch account details.");
        }

        // =========================
        // RESPONSE
        // =========================

        const data = await response.json();

        console.log("Accounts API Response:", data);

        setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Account Management Error:", err);

        setError(
          err.message || "Unable to load account information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [navigate]);

  // =========================
  // CURRENCY
  // =========================

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================
  // ACCOUNT STATUS STYLE
  // =========================

  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toUpperCase();

    if (normalizedStatus === "FROZEN") {
      return {
        background: "#fff1f1",
        color: "#d63c3c",
      };
    }

    if (normalizedStatus === "CLOSED") {
      return {
        background: "#f1f3f5",
        color: "#6b7280",
      };
    }

    return {
      background: "#ecfdf5",
      color: "#14875a",
    };
  };

  // =========================
  // FREEZE / UNFREEZE ACCOUNT
  // =========================

  const handleAccountStatus = async (account) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const currentStatus = account.status?.toUpperCase();

    const isFrozen = currentStatus === "FROZEN";

    const action = isFrozen ? "unfreeze" : "freeze";

    const confirmMessage = isFrozen
      ? "Do you want to unfreeze this account?"
      : "Do you want to freeze this account?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/accounts/${account.id}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // =========================
      // AUTH ERROR
      // =========================

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("customer");

        navigate("/login");
        return;
      }

      // =========================
      // OTHER ERROR
      // =========================

      if (!response.ok) {
        let message = "Unable to update account status.";

        try {
          const data = await response.json();

          if (data.message) {
            message = data.message;
          }
        } catch {
          // Ignore invalid JSON response
        }

        throw new Error(message);
      }

      // =========================
      // UPDATED ACCOUNT
      // =========================

      const updatedAccount = await response.json();

      setAccounts((previousAccounts) =>
        previousAccounts.map((item) =>
          item.id === updatedAccount.id
            ? updatedAccount
            : item
        )
      );
    } catch (err) {
      console.error("Account Status Error:", err);

      setError(
        err.message || "Unable to update account status."
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            🏦
          </div>

          <h2 style={styles.loadingTitle}>
            Loading accounts
          </h2>

          <p style={styles.loadingText}>
            Please wait while we fetch your account information...
          </p>

          <div style={styles.loader}></div>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div style={styles.page}>

      {/* ================= NAVBAR ================= */}

      <header style={styles.navbar}>

        <div style={styles.brandArea}>

          <div style={styles.brandIcon}>
            🏦
          </div>

          <div>
            <div style={styles.brandName}>
              AVANI BANK
            </div>

            <div style={styles.brandSubtitle}>
              Account Management
            </div>
          </div>

        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </header>

      {/* ================= MAIN ================= */}

      <main style={styles.container}>

        {/* ================= PAGE HEADER ================= */}

        <section style={styles.pageHeader}>

          <div>

            <p style={styles.eyebrow}>
              BANKING SERVICES
            </p>

            <h1 style={styles.title}>
              Account Management
            </h1>

            <p style={styles.subtitle}>
              Manage your bank accounts and access account services.
            </p>

          </div>

          <div style={styles.accountCount}>
            {accounts.length} Account
            {accounts.length !== 1 ? "s" : ""}
          </div>

        </section>

        {/* ================= ERROR ================= */}

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* ================= ACCOUNTS ================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div>

              <p style={styles.sectionEyebrow}>
                MY ACCOUNTS
              </p>

              <h2 style={styles.sectionTitle}>
                Your Bank Accounts
              </h2>

            </div>

          </div>

          {/* ================= NO ACCOUNT ================= */}

          {accounts.length === 0 ? (

            <div style={styles.emptyCard}>

              <div style={styles.emptyIcon}>
                🏦
              </div>

              <h3 style={styles.emptyTitle}>
                No Account Found
              </h3>

              <p style={styles.emptyText}>
                No separate account has been created yet.
              </p>

            </div>

          ) : (

            /* ================= ACCOUNT GRID ================= */

            <div style={styles.accountsGrid}>

              {accounts.map((account) => {

                const statusStyle =
                  getStatusStyle(account.status);

                const normalizedStatus =
                  account.status?.toUpperCase();

                const isFrozen =
                  normalizedStatus === "FROZEN";

                const isClosed =
                  normalizedStatus === "CLOSED";

                return (

                  <div
                    key={account.id}
                    style={styles.accountCard}
                  >

                    {/* ================= ACCOUNT TOP ================= */}

                    <div style={styles.accountTop}>

                      <div style={styles.accountIcon}>
                        🏦
                      </div>

                      <div style={styles.accountTopText}>

                        <p style={styles.accountLabel}>
                          ACCOUNT TYPE
                        </p>

                        <h3 style={styles.accountType}>
                          {account.accountType || "N/A"}
                        </h3>

                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...statusStyle,
                        }}
                      >
                        ● {account.status || "ACTIVE"}
                      </span>

                    </div>

                    {/* ================= ACCOUNT NUMBER ================= */}

                    <div style={styles.accountNumberBox}>

                      <p style={styles.accountLabel}>
                        ACCOUNT NUMBER
                      </p>

                      <p style={styles.accountNumber}>
                        {account.accountNumber || "N/A"}
                      </p>

                    </div>

                    {/* ================= BALANCE ================= */}

                    <div style={styles.balanceBox}>

                      <div>

                        <p style={styles.accountLabel}>
                          AVAILABLE BALANCE
                        </p>

                        <h2 style={styles.balance}>
                          ₹{formatCurrency(account.balance)}
                        </h2>

                      </div>

                      <div style={styles.interestBox}>

                        <p style={styles.accountLabel}>
                          INTEREST RATE
                        </p>

                        <p style={styles.interestRate}>
                          {account.interestRate || 0}%
                        </p>

                      </div>

                    </div>

                    {/* ================= ACTIONS ================= */}

                    <div style={styles.actions}>

                      {/* VIEW DETAILS */}

                      <button
                        style={styles.actionButton}
                        onClick={() =>
                          navigate(
                            `/accounts/${account.id}`
                          )
                        }
                      >
                        View Details →
                      </button>

                      {/* STATEMENT */}

                      <button
                        style={styles.secondaryButton}
                        onClick={() =>
                          navigate(
                            `/accounts/${account.id}/statement`
                          )
                        }
                      >
                        Statement
                      </button>

                      {/* FREEZE / UNFREEZE */}

                      {!isClosed && (

                        <button
                          style={
                            isFrozen
                              ? styles.unfreezeButton
                              : styles.freezeButton
                          }
                          onClick={() =>
                            handleAccountStatus(account)
                          }
                        >
                          {isFrozen
                            ? "Unfreeze"
                            : "Freeze"}
                        </button>

                      )}

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </section>

        {/* ================= SERVICES ================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div>

              <p style={styles.sectionEyebrow}>
                ACCOUNT SERVICES
              </p>

              <h2 style={styles.sectionTitle}>
                Banking Services
              </h2>

            </div>

          </div>

          <div style={styles.servicesGrid}>

            {/* ================= BALANCE ================= */}

            <button
              style={styles.serviceCard}
              onClick={() =>
                navigate("/accounts/balance")
              }
            >

              <div
                style={{
                  ...styles.serviceIcon,
                  background: "#ecfdf5",
                  color: "#11895b",
                }}
              >
                ₹
              </div>

              <div style={styles.serviceText}>

                <h3 style={styles.serviceTitle}>
                  Balance Inquiry
                </h3>

                <p style={styles.serviceDescription}>
                  Check your current account balance.
                </p>

              </div>

              <span style={styles.arrow}>
                →
              </span>

            </button>

            {/* ================= MINI STATEMENT ================= */}

            <button
              style={styles.serviceCard}
              onClick={() =>
                navigate("/accounts/mini-statement")
              }
            >

              <div
                style={{
                  ...styles.serviceIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                📋
              </div>

              <div style={styles.serviceText}>

                <h3 style={styles.serviceTitle}>
                  Mini Statement
                </h3>

                <p style={styles.serviceDescription}>
                  View your recent account transactions.
                </p>

              </div>

              <span style={styles.arrow}>
                →
              </span>

            </button>

            {/* ================= ACCOUNT STATEMENTS ================= */}

            <button
              style={styles.serviceCard}
              onClick={() =>
                navigate("/accounts/statements")
              }
            >

              <div
                style={{
                  ...styles.serviceIcon,
                  background: "#f5f3ff",
                  color: "#7048c6",
                }}
              >
                📄
              </div>

              <div style={styles.serviceText}>

                <h3 style={styles.serviceTitle}>
                  Account Statements
                </h3>

                <p style={styles.serviceDescription}>
                  View your complete account statement.
                </p>

              </div>

              <span style={styles.arrow}>
                →
              </span>

            </button>

            {/* ================= INTEREST ================= */}

            <button
              style={styles.serviceCard}
              onClick={() =>
                navigate("/accounts/interest")
              }
            >

              <div
                style={{
                  ...styles.serviceIcon,
                  background: "#fff8e7",
                  color: "#9a6700",
                }}
              >
                %
              </div>

              <div style={styles.serviceText}>

                <h3 style={styles.serviceTitle}>
                  Interest Calculation
                </h3>

                <p style={styles.serviceDescription}>
                  Calculate applicable account interest.
                </p>

              </div>

              <span style={styles.arrow}>
                →
              </span>

            </button>

            {/* ================= FIXED DEPOSIT ================= */}

            <button
              style={styles.serviceCard}
              onClick={() =>
                navigate("/accounts/fixed-deposit")
              }
            >

              <div
                style={{
                  ...styles.serviceIcon,
                  background: "#edf8f3",
                  color: "#11895b",
                }}
              >
                💰
              </div>

              <div style={styles.serviceText}>

                <h3 style={styles.serviceTitle}>
                  Fixed Deposit
                </h3>

                <p style={styles.serviceDescription}>
                  Manage your fixed deposit investments.
                </p>

              </div>

              <span style={styles.arrow}>
                →
              </span>

            </button>

            {/* ================= RECURRING DEPOSIT ================= */}

            <button
              style={styles.serviceCard}
              onClick={() =>
                navigate("/accounts/recurring-deposit")
              }
            >

              <div
                style={{
                  ...styles.serviceIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                🔄
              </div>

              <div style={styles.serviceText}>

                <h3 style={styles.serviceTitle}>
                  Recurring Deposit
                </h3>

                <p style={styles.serviceDescription}>
                  Manage your recurring deposit accounts.
                </p>

              </div>

              <span style={styles.arrow}>
                →
              </span>

            </button>

          </div>

        </section>

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

// =====================================================
// STYLES
// =====================================================

const styles = {

  page: {
    minHeight: "100vh",
    padding:"25px 32px",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
  },

  // =========================
  // NAVBAR
  // =========================

navbar: {
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

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  brandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg,  #2457c6)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  brandName: {
    fontSize: "15px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#ffffff",
  },

  brandSubtitle: {
    marginTop: "2px",
    fontSize: "10px",
    color: "#8993a8",
  },

  backButton: {
    border: "1px solid #e1e6ef",
    background: "#ffffff",
    color: "#42516d",
    borderRadius: "9px",
    padding: "9px 15px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // =========================
  // CONTAINER
  // =========================

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "35px 24px 50px",
    boxSizing: "border-box",
  },

  // =========================
  // PAGE HEADER
  // =========================

  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "30px",
  },

  eyebrow: {
    margin: 0,
    color: "#2457c6",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  title: {
    margin: "6px 0 7px",
    fontSize: "30px",
    color: "#15213d",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: 0,
    color: "#7d879b",
    fontSize: "13px",
  },

  accountCount: {
    background: "#eef3ff",
    color: "#355db2",
    padding: "9px 13px",
    borderRadius: "18px",
    fontSize: "10px",
    fontWeight: "700",
  },

  // =========================
  // ERROR
  // =========================

  errorBox: {
    background: "#fff8e8",
    border: "1px solid #f5dfaa",
    color: "#8b650e",
    padding: "12px 15px",
    borderRadius: "10px",
    fontSize: "12px",
    marginBottom: "20px",
  },

  // =========================
  // SECTION
  // =========================

  section: {
    marginTop: "30px",
  },

  sectionHeader: {
    marginBottom: "13px",
  },

  sectionEyebrow: {
    margin: 0,
    fontSize: "9px",
    color: "#5572af",
    letterSpacing: "1.5px",
    fontWeight: "800",
  },

  sectionTitle: {
    margin: "4px 0 0",
    fontSize: "20px",
    color: "#17233f",
  },

  // =========================
  // ACCOUNTS GRID
  // =========================

  accountsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  // =========================
  // ACCOUNT CARD
  // =========================

  accountCard: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "17px",
    padding: "20px",
    boxShadow:
      "0 6px 22px rgba(24,43,83,0.04)",
    boxSizing: "border-box",
  },

  accountTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  accountIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "#edf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  accountTopText: {
    flex: 1,
  },

  accountLabel: {
    margin: 0,
    color: "#929bad",
    fontSize: "8px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  accountType: {
    margin: "4px 0 0",
    fontSize: "15px",
    color: "#1c2947",
  },

  // =========================
  // STATUS
  // =========================

  statusBadge: {
    padding: "6px 9px",
    borderRadius: "14px",
    fontSize: "8px",
    fontWeight: "700",
  },

  // =========================
  // ACCOUNT NUMBER
  // =========================

  accountNumberBox: {
    marginTop: "20px",
    padding: "13px",
    background: "#f7f9fc",
    borderRadius: "10px",
  },

  accountNumber: {
    margin: "5px 0 0",
    color: "#253657",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "0.7px",
  },

  // =========================
  // BALANCE
  // =========================

  balanceBox: {
    marginTop: "17px",
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    gap: "15px",
  },

  balance: {
    margin: "5px 0 0",
    fontSize: "23px",
    color: "#182440",
  },

  interestBox: {
    textAlign: "right",
  },

  interestRate: {
    margin: "5px 0 0",
    fontSize: "14px",
    fontWeight: "800",
    color: "#2457c6",
  },

  // =========================
  // ACTIONS
  // =========================

  actions: {
    display: "flex",
    gap: "9px",
    marginTop: "18px",
    flexWrap: "wrap",
  },

  actionButton: {
    flex: 1,
    border: "none",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "10px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid #dfe5ef",
    background: "#ffffff",
    color: "#42516d",
    borderRadius: "9px",
    padding: "10px 13px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // =========================
  // FREEZE BUTTON
  // =========================

  freezeButton: {
    border: "1px solid #f1caca",
    background: "#fff5f5",
    color: "#d63c3c",
    borderRadius: "9px",
    padding: "10px 13px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // =========================
  // UNFREEZE BUTTON
  // =========================

  unfreezeButton: {
    border: "1px solid #bfe6d5",
    background: "#effcf6",
    color: "#14875a",
    borderRadius: "9px",
    padding: "10px 13px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // =========================
  // SERVICES
  // =========================

  servicesGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  serviceCard: {
    width: "100%",
    minHeight: "82px",
    border: "1px solid #e5eaf2",
    background: "#ffffff",
    borderRadius: "14px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow:
      "0 5px 16px rgba(24,43,83,0.035)",
    boxSizing: "border-box",
  },

  serviceIcon: {
    width: "45px",
    height: "45px",
    minWidth: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "800",
  },

  serviceText: {
    flex: 1,
    minWidth: 0,
  },

  serviceTitle: {
    margin: 0,
    fontSize: "13px",
    color: "#1c2947",
  },

  serviceDescription: {
    margin: "4px 0 0",
    fontSize: "10px",
    color: "#8993a8",
    lineHeight: "1.4",
  },

  arrow: {
    fontSize: "19px",
    color: "#2457c6",
    flexShrink: 0,
  },

  // =========================
  // EMPTY STATE
  // =========================

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "16px",
    minHeight: "220px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "25px",
    boxSizing: "border-box",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    background: "#eef3f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  emptyTitle: {
    margin: "12px 0 5px",
    fontSize: "15px",
    color: "#25314d",
  },

  emptyText: {
    margin: 0,
    color: "#929bad",
    fontSize: "11px",
  },

  // =========================
  // FOOTER
  // =========================

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

  // =========================
  // LOADING
  // =========================

  loadingPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f7fb, #edf2fb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "380px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "35px",
    textAlign: "center",
    boxShadow:
      "0 15px 40px rgba(25,45,85,0.08)",
    boxSizing: "border-box",
  },

  loadingIcon: {
    fontSize: "42px",
  },

  loadingTitle: {
    margin: "15px 0 6px",
    fontSize: "18px",
    color: "#1c2947",
  },

  loadingText: {
    margin: 0,
    color: "#8993a8",
    fontSize: "11px",
  },

  loader: {
    width: "28px",
    height: "28px",
    border: "3px solid #dfe6f2",
    borderTop: "3px solid #2457c6",
    borderRadius: "50%",
    margin: "20px auto 0",
    animation: "spin 0.8s linear infinite",
  },
};

export default AccountManagement;