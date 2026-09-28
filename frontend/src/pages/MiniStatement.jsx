import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MiniStatement() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMiniStatement = async () => {
      const token = localStorage.getItem("token");

      // Token nahi hai
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8080/api/account/mini-statement",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Unauthorized / Forbidden
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");

          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to fetch mini statement."
          );
        }

        const data = await response.json();

        // Backend directly array return kar raha hai
        if (Array.isArray(data)) {
          setTransactions(data);
        } else if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        } else if (Array.isArray(data.data)) {
          setTransactions(data.data);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error(
          "Mini Statement Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load mini statement."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMiniStatement();
  }, [navigate]);

  // =========================
  // FORMAT CURRENCY
  // =========================

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString(
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

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // GET TRANSACTION TYPE
  // =========================

  const getTransactionType = (transaction) => {
    return (
      transaction.transactionType ||
      transaction.type ||
      transaction.txnType ||
      "TRANSFER"
    ).toUpperCase();
  };

  // =========================
  // GET AMOUNT
  // =========================

  const getAmount = (transaction) => {
    return Number(
      transaction.amount ||
        transaction.transactionAmount ||
        0
    );
  };

  // =========================
  // GET DATE
  // =========================

  const getTransactionDate = (transaction) => {
    return (
      transaction.transactionDate ||
      transaction.date ||
      transaction.createdAt
    );
  };

  // =========================
  // TRANSACTION DESCRIPTION
  // =========================

  const getDescription = (transaction) => {
    const type = getTransactionType(transaction);

    if (type === "TRANSFER") {
      if (transaction.senderAccountNumber) {
        return `Transfer from/to account`;
      }

      return "Account Transfer";
    }

    return type;
  };

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            📄
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Mini Statement
          </h2>

          <p style={styles.loadingText}>
            Please wait while we fetch your
            recent transactions...
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
            🏦
          </div>

          <div>
            <div style={styles.brandName}>
              AVANI BANK
            </div>

            <div style={styles.brandSubtitle}>
              Mini Statement
            </div>
          </div>

        </div>

        <button
          style={styles.headerButton}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

      </header>

      {/* ================= MAIN ================= */}

      <main style={styles.container}>

        {/* ================= PAGE HEADING ================= */}

        <section style={styles.pageHeading}>

          <p style={styles.eyebrow}>
            ACCOUNT SERVICES
          </p>

          <h1 style={styles.title}>
            Mini Statement
          </h1>

          <p style={styles.subtitle}>
            View your recent account transactions.
          </p>

        </section>

        {/* ================= ERROR ================= */}

        {error ? (

          <div style={styles.errorBox}>
            {error}
          </div>

        ) : (

          <>

            {/* ================= SUMMARY ================= */}

            <section style={styles.summaryCard}>

              <div style={styles.summaryLeft}>

                <div style={styles.summaryIcon}>
                  📄
                </div>

                <div>

                  <p style={styles.summaryLabel}>
                    RECENT TRANSACTIONS
                  </p>

                  <p style={styles.transactionCount}>
                    {transactions.length}{" "}
                    Transaction
                    {transactions.length !== 1
                      ? "s"
                      : ""}
                  </p>

                </div>

              </div>

              <div style={styles.secureBadge}>
                🛡️ Secure
              </div>

            </section>

            {/* ================= TRANSACTIONS ================= */}

            <section style={styles.statementCard}>

              <div style={styles.cardHeader}>

                <div>
                  <h2 style={styles.cardTitle}>
                    Recent Transactions
                  </h2>

                  <p style={styles.cardSubtitle}>
                    Your latest account activity
                  </p>
                </div>

              </div>

              {transactions.length === 0 ? (

                <div style={styles.emptyState}>

                  <div style={styles.emptyIcon}>
                    📄
                  </div>

                  <h3 style={styles.emptyTitle}>
                    No Transactions Found
                  </h3>

                  <p style={styles.emptyText}>
                    There are no recent
                    transactions available.
                  </p>

                </div>

              ) : (

                <div style={styles.transactionList}>

                  {transactions.map(
                    (transaction, index) => {

                      const type =
                        getTransactionType(
                          transaction
                        );

                      const amount =
                        getAmount(
                          transaction
                        );

                      const transactionDate =
                        getTransactionDate(
                          transaction
                        );

                      const isCredit =
                        transaction.receiverAccountNumber &&
                        !transaction.senderAccountNumber;

                      return (
                        <div
                          key={
                            transaction.id ||
                            transaction.transactionId ||
                            index
                          }
                          style={
                            styles.transactionRow
                          }
                        >

                          {/* ICON */}

                          <div
                            style={{
                              ...styles.transactionIcon,
                              ...(isCredit
                                ? styles.creditIcon
                                : styles.debitIcon),
                            }}
                          >
                            {isCredit
                              ? "↓"
                              : "↑"}
                          </div>

                          {/* DETAILS */}

                          <div
                            style={
                              styles.transactionDetails
                            }
                          >

                            <div
                              style={
                                styles.transactionTop
                              }
                            >

                              <span
                                style={
                                  styles.transactionTitle
                                }
                              >
                                {getDescription(
                                  transaction
                                )}
                              </span>

                              <span
                                style={{
                                  ...styles.amount,
                                  color: isCredit
                                    ? "#159663"
                                    : "#dc3d3d",
                                }}
                              >
                                {isCredit
                                  ? "+"
                                  : "-"}
                                ₹
                                {formatCurrency(
                                  amount
                                )}
                              </span>

                            </div>

                            <div
                              style={
                                styles.transactionBottom
                              }
                            >

                              <span>
                                {formatDate(
                                  transactionDate
                                )}
                                {" • "}
                                {formatTime(
                                  transactionDate
                                )}
                              </span>

                              <span
                                style={{
                                  ...styles.statusBadge,
                                  ...(transaction.status ===
                                  "SUCCESS"
                                    ? styles.successBadge
                                    : styles.failedBadge),
                                }}
                              >
                                {transaction.status ||
                                  "UNKNOWN"}
                              </span>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </section>

            {/* ================= DETAILS ================= */}

            {transactions.length > 0 && (

              <section style={styles.infoCard}>

                <div style={styles.infoIcon}>
                  ℹ️
                </div>

                <div>

                  <h3 style={styles.infoTitle}>
                    Mini Statement
                  </h3>

                  <p style={styles.infoText}>
                    This page shows your most
                    recent account transactions.
                    For complete transaction
                    history, use Account Statement.
                  </p>

                </div>

              </section>

            )}

            {/* ================= BUTTON ================= */}

            <button
              style={styles.statementButton}
              onClick={() =>
                navigate("/account/statement")
              }
            >
              View Full Account Statement →
            </button>

          </>

        )}

      </main>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  // ================= HEADER =================

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
    background:
      "rgba(255,255,255,0.18)",
    border:
      "1px solid rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  brandName: {
    color: "#fff",
    fontSize: "15px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  brandSubtitle: {
    color:
      "rgba(255,255,255,0.75)",
    marginTop: "3px",
    fontSize: "11px",
  },

  headerButton: {
    border:
      "1px solid rgba(255,255,255,0.4)",
    background:
      "rgba(255,255,255,0.08)",
    color: "#fff",
    borderRadius: "12px",
    padding: "11px 17px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // ================= CONTAINER =================

  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "48px 24px 60px",
    boxSizing: "border-box",
  },

  // ================= HEADING =================

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
    margin:
      "8px 0 6px",
    color: "#172442",
    fontSize: "34px",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: 0,
    color: "#78849b",
    fontSize: "13px",
  },

  // ================= SUMMARY =================

  summaryCard: {
    background: "#fff",
    border:
      "1px solid #e5eaf2",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow:
      "0 8px 25px rgba(25,45,85,0.05)",
    marginBottom: "12px",
  },

  summaryLeft: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  summaryIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#edf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  summaryLabel: {
    margin: 0,
    color: "#71809b",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  transactionCount: {
    margin: "5px 0 0",
    color: "#1c2b49",
    fontSize: "15px",
    fontWeight: "800",
  },

  secureBadge: {
    background: "#edf9f3",
    color: "#159663",
    border:
      "1px solid #cceede",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "10px",
    fontWeight: "800",
  },

  // ================= STATEMENT CARD =================

  statementCard: {
    background: "#fff",
    border:
      "1px solid #e5eaf2",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 8px 25px rgba(25,45,85,0.05)",
  },

  cardHeader: {
    padding: "20px",
    borderBottom:
      "1px solid #edf0f4",
  },

  cardTitle: {
    margin: 0,
    color: "#24304a",
    fontSize: "16px",
  },

  cardSubtitle: {
    margin: "4px 0 0",
    color: "#8993a8",
    fontSize: "11px",
  },

  // ================= TRANSACTION LIST =================

  transactionList: {
    width: "100%",
  },

  transactionRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px 20px",
    borderBottom:
      "1px solid #edf0f4",
  },

  transactionIcon: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },

  creditIcon: {
    background: "#edfaf4",
    color: "#159663",
  },

  debitIcon: {
    background: "#fff1f1",
    color: "#dc3d3d",
  },

  transactionDetails: {
    flex: 1,
    minWidth: 0,
  },

  transactionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  transactionTitle: {
    color: "#283753",
    fontSize: "13px",
    fontWeight: "700",
  },

  amount: {
    fontSize: "13px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  transactionBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginTop: "6px",
    color: "#8993a8",
    fontSize: "10px",
  },

  statusBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "8px",
    fontWeight: "800",
  },

  successBadge: {
    color: "#159663",
    background: "#edfaf4",
    border:
      "1px solid #cceede",
  },

  failedBadge: {
    color: "#dc3d3d",
    background: "#fff1f1",
    border:
      "1px solid #ffd1d1",
  },

  // ================= INFO =================

  infoCard: {
    marginTop: "16px",
    background: "#fff",
    border:
      "1px solid #e5eaf2",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 6px 20px rgba(25,45,85,0.04)",
  },

  infoIcon: {
    width: "43px",
    height: "43px",
    minWidth: "43px",
    borderRadius: "11px",
    background: "#edf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  infoTitle: {
    margin: 0,
    color: "#24304a",
    fontSize: "13px",
  },

  infoText: {
    margin: "4px 0 0",
    color: "#8993a8",
    fontSize: "10px",
    lineHeight: "1.5",
  },

  // ================= BUTTON =================

  statementButton: {
    width: "100%",
    marginTop: "16px",
    padding: "14px 18px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #173f9d, #2563d4)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  // ================= ERROR =================

  errorBox: {
    background: "#fff0f0",
    border:
      "1px solid #ffd0d0",
    color: "#d93434",
    borderRadius: "12px",
    padding: "18px",
    textAlign: "center",
    fontSize: "14px",
  },

  // ================= EMPTY =================

  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "35px",
  },

  emptyTitle: {
    margin:
      "10px 0 5px",
    color: "#26334e",
    fontSize: "16px",
  },

  emptyText: {
    margin: 0,
    color: "#8b95a8",
    fontSize: "11px",
  },

  // ================= LOADING =================

  loadingPage: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "35px",
    textAlign: "center",
    boxShadow:
      "0 15px 40px rgba(25,45,85,0.08)",
  },

  loadingIcon: {
    fontSize: "40px",
  },

  loadingTitle: {
    color: "#1d2b47",
    margin:
      "12px 0 5px",
  },

  loadingText: {
    color: "#8993a8",
    fontSize: "12px",
  },

  loader: {
    width: "27px",
    height: "27px",
    border:
      "3px solid #dfe6f2",
    borderTop:
      "3px solid #2457c6",
    borderRadius: "50%",
    margin:
      "18px auto 0",
    animation:
      "spin 0.8s linear infinite",
  },
};

export default MiniStatement;