import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MiniStatement() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
      setIsTablet(window.innerWidth > 700 && window.innerWidth <= 1000);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchMiniStatement = async () => {
      const token = localStorage.getItem("token");

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

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to fetch mini statement.");
        }

        const data = await response.json();

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
        console.error("Mini Statement Error:", err);
        setError(err.message || "Unable to load mini statement.");
      } finally {
        setLoading(false);
      }
    };

    fetchMiniStatement();
  }, [navigate]);

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";
    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionType = (transaction) =>
    (
      transaction.transactionType ||
      transaction.type ||
      transaction.txnType ||
      "TRANSFER"
    ).toUpperCase();

  const getAmount = (transaction) =>
    Number(transaction.amount || transaction.transactionAmount || 0);

  const getTransactionDate = (transaction) =>
    transaction.transactionDate || transaction.date || transaction.createdAt;

  const getDescription = (transaction) => {
    const type = getTransactionType(transaction);
    if (type === "TRANSFER") {
      if (transaction.senderAccountNumber) return "Transfer from/to account";
      return "Account Transfer";
    }
    return type;
  };

  const responsiveStyles = {
    ...styles,
    header: {
      ...styles.header,
      ...(isTablet ? { padding: "0 4%" } : {}),
      ...(isMobile
        ? {
            minHeight: "auto",
            padding: "14px 18px",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "12px",
          }
        : {}),
    },
    brandArea: {
      ...styles.brandArea,
      ...(isMobile ? { width: "100%" } : {}),
    },
    headerButton: {
      ...styles.headerButton,
      ...(isMobile ? { width: "100%", padding: "11px 14px" } : {}),
    },
    container: {
      ...styles.container,
      ...(isTablet ? { padding: "38px 20px 50px" } : {}),
      ...(isMobile ? { padding: "30px 14px 40px" } : {}),
    },
    pageHeading: {
      ...styles.pageHeading,
      ...(isMobile ? { marginBottom: "22px" } : {}),
    },
    title: {
      ...styles.title,
      ...(isTablet ? { fontSize: "31px" } : {}),
      ...(isMobile ? { fontSize: "27px", letterSpacing: "-0.5px" } : {}),
    },
    subtitle: {
      ...styles.subtitle,
      ...(isMobile ? { fontSize: "12px", lineHeight: "1.5" } : {}),
    },
    summaryCard: {
      ...styles.summaryCard,
      ...(isMobile
        ? {
            padding: "15px",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "12px",
          }
        : {}),
    },
    summaryLeft: {
      ...styles.summaryLeft,
      ...(isMobile ? { gap: "10px" } : {}),
    },
    secureBadge: {
      ...styles.secureBadge,
      ...(isMobile ? { alignSelf: "flex-start" } : {}),
    },
    cardHeader: {
      ...styles.cardHeader,
      ...(isMobile ? { padding: "16px" } : {}),
    },
    transactionRow: {
      ...styles.transactionRow,
      ...(isTablet ? { padding: "16px" } : {}),
      ...(isMobile
        ? {
            padding: "14px",
            gap: "10px",
            alignItems: "flex-start",
          }
        : {}),
    },
    transactionIcon: {
      ...styles.transactionIcon,
      ...(isMobile
        ? {
            width: "36px",
            height: "36px",
            minWidth: "36px",
            borderRadius: "10px",
            fontSize: "17px",
          }
        : {}),
    },
    transactionTop: {
      ...styles.transactionTop,
      ...(isMobile
        ? {
            alignItems: "flex-start",
            flexDirection: "column",
            gap: "5px",
          }
        : {}),
    },
    transactionTitle: {
      ...styles.transactionTitle,
      ...(isMobile ? { fontSize: "12px", lineHeight: "1.4" } : {}),
    },
    amount: {
      ...styles.amount,
      ...(isMobile ? { fontSize: "12px" } : {}),
    },
    transactionBottom: {
      ...styles.transactionBottom,
      ...(isMobile
        ? {
            alignItems: "flex-start",
            flexDirection: "column",
            gap: "6px",
            lineHeight: "1.4",
          }
        : {}),
    },
    statusBadge: {
      ...styles.statusBadge,
      ...(isMobile ? { alignSelf: "flex-start" } : {}),
    },
    infoCard: {
      ...styles.infoCard,
      ...(isMobile
        ? {
            padding: "15px",
            alignItems: "flex-start",
            gap: "10px",
          }
        : {}),
    },
    infoIcon: {
      ...styles.infoIcon,
      ...(isMobile
        ? { width: "36px", minWidth: "36px", height: "36px", fontSize: "16px" }
        : {}),
    },
    infoText: {
      ...styles.infoText,
      ...(isMobile ? { fontSize: "10px", lineHeight: "1.6" } : {}),
    },
    statementButton: {
      ...styles.statementButton,
      ...(isMobile ? { padding: "13px 14px", fontSize: "11px" } : {}),
    },
    errorBox: {
      ...styles.errorBox,
      ...(isMobile ? { padding: "14px", fontSize: "12px", lineHeight: "1.5" } : {}),
    },
    emptyState: {
      ...styles.emptyState,
      ...(isMobile ? { padding: "45px 16px" } : {}),
    },
    loadingPage: {
      ...styles.loadingPage,
      ...(isMobile ? { padding: "18px" } : {}),
    },
    loadingCard: {
      ...styles.loadingCard,
      ...(isMobile ? { width: "100%", boxSizing: "border-box", padding: "28px 20px" } : {}),
    },
    loadingTitle: {
      ...styles.loadingTitle,
      ...(isMobile ? { fontSize: "18px" } : {}),
    },
    loadingText: {
      ...styles.loadingText,
      ...(isMobile ? { lineHeight: "1.5" } : {}),
    },
  };

  if (loading) {
    return (
      <div style={responsiveStyles.loadingPage}>
        <div style={responsiveStyles.loadingCard}>
          <div style={responsiveStyles.loadingIcon}>📄</div>
          <h2 style={responsiveStyles.loadingTitle}>Loading Mini Statement</h2>
          <p style={responsiveStyles.loadingText}>
            Please wait while we fetch your recent transactions...
          </p>
          <div style={responsiveStyles.loader}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={responsiveStyles.page}>
      <header style={responsiveStyles.header}>
        <div style={responsiveStyles.brandArea}>
          <div style={responsiveStyles.brandIcon}>🏦</div>
          <div>
            <div style={responsiveStyles.brandName}>AVANI BANK</div>
            <div style={responsiveStyles.brandSubtitle}>Mini Statement</div>
          </div>
        </div>

        <button
          style={responsiveStyles.headerButton}
          onClick={() => navigate(-1)}
        >
          ← Account Management
        </button>
      </header>

      <main style={responsiveStyles.container}>
        <section style={responsiveStyles.pageHeading}>
          <p style={responsiveStyles.eyebrow}>ACCOUNT SERVICES</p>
          <h1 style={responsiveStyles.title}>Mini Statement</h1>
          <p style={responsiveStyles.subtitle}>
            View your recent account transactions.
          </p>
        </section>

        {error ? (
          <div style={responsiveStyles.errorBox}>⚠️ {error}</div>
        ) : (
          <>
            <section style={responsiveStyles.summaryCard}>
              <div style={responsiveStyles.summaryLeft}>
                <div style={responsiveStyles.summaryIcon}>📄</div>
                <div>
                  <p style={responsiveStyles.summaryLabel}>RECENT TRANSACTIONS</p>
                  <p style={responsiveStyles.transactionCount}>
                    {transactions.length} Transaction
                    {transactions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div style={responsiveStyles.secureBadge}>🛡️ Secure</div>
            </section>

            <section style={responsiveStyles.statementCard}>
              <div style={responsiveStyles.cardHeader}>
                <h2 style={responsiveStyles.cardTitle}>Recent Transactions</h2>
                <p style={responsiveStyles.cardSubtitle}>
                  Your latest account activity
                </p>
              </div>

              {transactions.length === 0 ? (
                <div style={responsiveStyles.emptyState}>
                  <div style={responsiveStyles.emptyIcon}>📄</div>
                  <h3 style={responsiveStyles.emptyTitle}>No Transactions Found</h3>
                  <p style={responsiveStyles.emptyText}>
                    There are no recent transactions available.
                  </p>
                </div>
              ) : (
                <div style={responsiveStyles.transactionList}>
                  {transactions.map((transaction, index) => {
                    const amount = getAmount(transaction);
                    const transactionDate = getTransactionDate(transaction);
                    const isCredit =
                      transaction.receiverAccountNumber &&
                      !transaction.senderAccountNumber;

                    return (
                      <div
                        key={transaction.id || transaction.transactionId || index}
                        style={responsiveStyles.transactionRow}
                      >
                        <div
                          style={{
                            ...responsiveStyles.transactionIcon,
                            ...(isCredit
                              ? responsiveStyles.creditIcon
                              : responsiveStyles.debitIcon),
                          }}
                        >
                          {isCredit ? "↓" : "↑"}
                        </div>

                        <div style={responsiveStyles.transactionDetails}>
                          <div style={responsiveStyles.transactionTop}>
                            <span style={responsiveStyles.transactionTitle}>
                              {getDescription(transaction)}
                            </span>
                            <span
                              style={{
                                ...responsiveStyles.amount,
                                color: isCredit ? "#159663" : "#dc3d3d",
                              }}
                            >
                              {isCredit ? "+" : "-"}₹{formatCurrency(amount)}
                            </span>
                          </div>

                          <div style={responsiveStyles.transactionBottom}>
                            <span>
                              {formatDate(transactionDate)}
                              {" • "}
                              {formatTime(transactionDate)}
                            </span>
                            <span
                              style={{
                                ...responsiveStyles.statusBadge,
                                ...(transaction.status === "SUCCESS"
                                  ? responsiveStyles.successBadge
                                  : responsiveStyles.failedBadge),
                              }}
                            >
                              {transaction.status || "UNKNOWN"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {transactions.length > 0 && (
              <section style={responsiveStyles.infoCard}>
                <div style={responsiveStyles.infoIcon}>ℹ️</div>
                <div>
                  <h3 style={responsiveStyles.infoTitle}>Mini Statement</h3>
                  <p style={responsiveStyles.infoText}>
                    This page shows your most recent account transactions. For
                    complete transaction history, use Account Statement.
                  </p>
                </div>
              </section>
            )}

            <button
              style={responsiveStyles.statementButton}
              onClick={() => navigate("/account/statement")}
            >
              View Full Account Statement →
            </button>
          </>
        )}
      </main>
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
    minWidth: 0,
  },
  brandIcon: {
    width: "43px",
    height: "43px",
    minWidth: "43px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.25)",
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
    color: "rgba(255,255,255,0.75)",
    marginTop: "3px",
    fontSize: "11px",
  },
  headerButton: {
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    borderRadius: "12px",
    padding: "11px 17px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "48px 24px 60px",
    boxSizing: "border-box",
  },
  pageHeading: { textAlign: "center", marginBottom: "30px" },
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
  subtitle: { margin: 0, color: "#78849b", fontSize: "13px" },
  summaryCard: {
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 8px 25px rgba(25,45,85,0.05)",
    marginBottom: "12px",
  },
  summaryLeft: { display: "flex", alignItems: "center", gap: "13px", minWidth: 0 },
  summaryIcon: {
    width: "43px",
    height: "43px",
    minWidth: "43px",
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
    border: "1px solid #cceede",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  statementCard: {
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 8px 25px rgba(25,45,85,0.05)",
  },
  cardHeader: { padding: "20px", borderBottom: "1px solid #edf0f4" },
  cardTitle: { margin: 0, color: "#24304a", fontSize: "16px" },
  cardSubtitle: { margin: "4px 0 0", color: "#8993a8", fontSize: "11px" },
  transactionList: { width: "100%" },
  transactionRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px 20px",
    borderBottom: "1px solid #edf0f4",
    boxSizing: "border-box",
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
  creditIcon: { background: "#edfaf4", color: "#159663" },
  debitIcon: { background: "#fff1f1", color: "#dc3d3d" },
  transactionDetails: { flex: 1, minWidth: 0 },
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
    overflowWrap: "anywhere",
  },
  amount: { fontSize: "13px", fontWeight: "800", whiteSpace: "nowrap" },
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
    whiteSpace: "nowrap",
  },
  successBadge: { color: "#159663", background: "#edfaf4", border: "1px solid #cceede" },
  failedBadge: { color: "#dc3d3d", background: "#fff1f1", border: "1px solid #ffd1d1" },
  infoCard: {
    marginTop: "16px",
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 6px 20px rgba(25,45,85,0.04)",
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
  infoTitle: { margin: 0, color: "#24304a", fontSize: "13px" },
  infoText: { margin: "4px 0 0", color: "#8993a8", fontSize: "10px", lineHeight: "1.5" },
  statementButton: {
    width: "100%",
    marginTop: "16px",
    padding: "14px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #173f9d, #2563d4)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },
  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffd0d0",
    color: "#d93434",
    borderRadius: "12px",
    padding: "18px",
    textAlign: "center",
    fontSize: "14px",
  },
  emptyState: { padding: "60px 20px", textAlign: "center" },
  emptyIcon: { fontSize: "35px" },
  emptyTitle: { margin: "10px 0 5px", color: "#26334e", fontSize: "16px" },
  emptyText: { margin: 0, color: "#8b95a8", fontSize: "11px" },
  loadingPage: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },
  loadingCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "18px",
    padding: "35px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(25,45,85,0.08)",
    boxSizing: "border-box",
  },
  loadingIcon: { fontSize: "40px" },
  loadingTitle: { color: "#1d2b47", margin: "12px 0 5px" },
  loadingText: { color: "#8993a8", fontSize: "12px" },
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

export default MiniStatement;
