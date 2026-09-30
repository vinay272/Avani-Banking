import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AccountStatement() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 700);
      setIsTablet(width <= 1000);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatement = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        // =====================================================
        // ACCOUNT DETAILS
        // GET /api/accounts
        // =====================================================

        const accountResponse = await fetch(
          "http://localhost:8080/api/accounts",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          accountResponse.status === 401 ||
          accountResponse.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!accountResponse.ok) {
          throw new Error(
            "Unable to fetch account details."
          );
        }

        const accountData = await accountResponse.json();

        // Backend returns an array
        if (Array.isArray(accountData)) {
          setAccount(accountData[0] || null);
        } else {
          setAccount(accountData);
        }

        // =====================================================
        // ACCOUNT STATEMENT
        // GET /api/account/statement
        // =====================================================

        const statementResponse = await fetch(
          "http://localhost:8080/api/account/statement",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          statementResponse.status === 401 ||
          statementResponse.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!statementResponse.ok) {
          let message =
            "Unable to fetch account statement.";

          try {
            const data =
              await statementResponse.json();

            if (data.message) {
              message = data.message;
            }
          } catch {
            // Ignore invalid JSON
          }

          throw new Error(message);
        }

        const statementData =
          await statementResponse.json();

        // Backend directly returns List<Transaction>
        if (Array.isArray(statementData)) {
          setTransactions(statementData);
        } else if (
          Array.isArray(statementData.transactions)
        ) {
          setTransactions(statementData.transactions);
        } else if (
          Array.isArray(statementData.data)
        ) {
          setTransactions(statementData.data);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error(
          "Account Statement Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load account statement."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatement();
  }, [navigate]);

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // TRANSACTION TYPE
  // =====================================================

  const getTransactionType = (transaction) => {
    return (
      transaction.type ||
      transaction.transactionType ||
      transaction.txnType ||
      "DEBIT"
    ).toUpperCase();
  };

  // =====================================================
  // DESCRIPTION
  // =====================================================

  const getDescription = (transaction) => {
    return (
      transaction.description ||
      transaction.narration ||
      transaction.remark ||
      transaction.transactionDescription ||
      "Transaction"
    );
  };

  // =====================================================
  // AMOUNT
  // =====================================================

  const getAmount = (transaction) => {
    return Number(
      transaction.amount ||
        transaction.transactionAmount ||
        0
    );
  };

  // =====================================================
  // BALANCE
  // =====================================================

  const getBalance = (transaction) => {
    return Number(
      transaction.balance ||
        transaction.runningBalance ||
        transaction.availableBalance ||
        0
    );
  };

  const responsiveStyles = {
    ...styles,
    header: { ...styles.header, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", padding: isMobile ? "14px 16px" : "0 6%" },
    brandArea: { ...styles.brandArea, gap: isMobile ? "9px" : "13px" },
    headerButton: { ...styles.headerButton, width: isMobile ? "100%" : "auto", textAlign: "center" },
    container: { ...styles.container, padding: isMobile ? "30px 14px 40px" : isTablet ? "38px 18px 50px" : "48px 24px 60px" },
    pageHeading: { ...styles.pageHeading, marginBottom: isMobile ? "22px" : "30px" },
    title: { ...styles.title, fontSize: isMobile ? "26px" : isTablet ? "30px" : "34px" },
    subtitle: { ...styles.subtitle, fontSize: isMobile ? "12px" : "13px" },
    summaryCard: { ...styles.summaryCard, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", padding: isMobile ? "15px" : "18px 20px" },
    accountSummary: { ...styles.accountSummary, minWidth: 0 },
    accountNumber: { ...styles.accountNumber, fontSize: isMobile ? "13px" : "15px", overflowWrap: "anywhere" },
    balanceSummary: { ...styles.balanceSummary, width: isMobile ? "100%" : "auto", minWidth: isMobile ? 0 : "190px", boxSizing: "border-box" },
    statementCard: { ...styles.statementCard },
    tableWrapper: { ...styles.tableWrapper, WebkitOverflowScrolling: "touch" },
    table: { ...styles.table, minWidth: isMobile ? "650px" : "720px" },
    securityCard: { ...styles.securityCard, alignItems: isMobile ? "flex-start" : "center", padding: isMobile ? "15px" : "18px 20px" },
    securityText: { ...styles.securityText, lineHeight: isMobile ? "1.5" : "normal" },
    errorBox: { ...styles.errorBox, padding: isMobile ? "14px" : "18px", fontSize: isMobile ? "12px" : "14px" },
    emptyState: { ...styles.emptyState, padding: isMobile ? "45px 15px" : "60px 20px" },
    loadingPage: { ...styles.loadingPage, padding: "16px", boxSizing: "border-box" },
    loadingCard: { ...styles.loadingCard, width: "100%", maxWidth: "380px", padding: isMobile ? "25px 18px" : "35px", boxSizing: "border-box" },
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={responsiveStyles.loadingPage}>
        <div style={responsiveStyles.loadingCard}>

          <div style={responsiveStyles.loadingIcon}>
            📄
          </div>

          <h2 style={responsiveStyles.loadingTitle}>
            Loading statement
          </h2>

          <p style={responsiveStyles.loadingText}>
            Please wait while we fetch your
            account statement...
          </p>

          <div style={responsiveStyles.loader}></div>

        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={responsiveStyles.page}>

      {/* ================= HEADER ================= */}

      <header style={responsiveStyles.header}>

        <div style={responsiveStyles.brandArea}>

          <div style={responsiveStyles.brandIcon}>
            🏦
          </div>

          <div>

            <div style={responsiveStyles.brandName}>
              AVANI BANK
            </div>

            <div style={responsiveStyles.brandSubtitle}>
              Account Statement
            </div>

          </div>

        </div>

        <button
          style={responsiveStyles.headerButton}
          onClick={() =>
            navigate("/accounts")
          }
        >
          ← Account Details
        </button>

      </header>

      {/* ================= MAIN ================= */}

      <main style={responsiveStyles.container}>

        <section style={responsiveStyles.pageHeading}>

          <p style={responsiveStyles.eyebrow}>
            ACCOUNT SERVICES
          </p>

          <h1 style={responsiveStyles.title}>
            Account Statement
          </h1>

          <p style={responsiveStyles.subtitle}>
            View your recent transactions and
            account activity.
          </p>

        </section>

        {error ? (

          <div style={responsiveStyles.errorBox}>
            {error}
          </div>

        ) : (

          <>

            {/* ================= SUMMARY ================= */}

            <section style={responsiveStyles.summaryCard}>

              <div style={responsiveStyles.accountSummary}>

                <div style={responsiveStyles.summaryIcon}>
                  💳
                </div>

                <div>

                  <p style={responsiveStyles.label}>
                    ACCOUNT NUMBER
                  </p>

                  <p style={responsiveStyles.accountNumber}>
                    {account?.accountNumber ||
                      "N/A"}
                  </p>

                </div>

              </div>

              <div style={responsiveStyles.balanceSummary}>

                <p style={responsiveStyles.balanceLabel}>
                  AVAILABLE BALANCE
                </p>

                <p style={responsiveStyles.summaryBalance}>
                  ₹
                  {formatCurrency(
                    account?.balance
                  )}
                </p>

              </div>

            </section>

            {/* ================= TRANSACTIONS ================= */}

            <section style={responsiveStyles.statementCard}>

              {transactions.length === 0 ? (

                <div style={responsiveStyles.emptyState}>

                  <div style={responsiveStyles.emptyIcon}>
                    📄
                  </div>

                  <h3 style={responsiveStyles.emptyTitle}>
                    No Transactions Found
                  </h3>

                  <p style={responsiveStyles.emptyText}>
                    There are no transactions
                    available for this account.
                  </p>

                </div>

              ) : (

                <div style={responsiveStyles.tableWrapper}>

                  <table style={responsiveStyles.table}>

                    <thead>

                      <tr>

                        <th style={responsiveStyles.th}>
                          DATE
                        </th>

                        <th style={responsiveStyles.th}>
                          DESCRIPTION
                        </th>

                        <th style={responsiveStyles.th}>
                          TYPE
                        </th>

                        <th
                          style={{
                            ...responsiveStyles.th,
                            textAlign: "right",
                          }}
                        >
                          AMOUNT (₹)
                        </th>

                        <th
                          style={{
                            ...responsiveStyles.th,
                            textAlign: "right",
                          }}
                        >
                          BALANCE (₹)
                        </th>

                      </tr>

                    </thead>

                    <tbody>

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

                          const balance =
                            getBalance(
                              transaction
                            );

                          const isCredit =
                            type === "CREDIT" ||
                            type === "CR";

                          return (

                            <tr
                              key={
                                transaction.id ||
                                transaction.transactionId ||
                                index
                              }
                              style={
                                styles.tableRow
                              }
                            >

                              <td
                                style={responsiveStyles.td}
                              >
                                {formatDate(
                                  transaction.transactionDate ||
                                  transaction.date ||
                                  transaction.createdAt
                                )}
                              </td>

                              <td
                                style={responsiveStyles.td}
                              >

                                <span
                                  style={
                                    styles.description
                                  }
                                >
                                  {getDescription(
                                    transaction
                                  )}
                                </span>

                              </td>

                              <td
                                style={responsiveStyles.td}
                              >

                                <span
                                  style={{
                                    ...responsiveStyles.typeBadge,
                                    ...(isCredit
                                      ? styles.creditBadge
                                      : styles.debitBadge),
                                  }}
                                >
                                  {isCredit
                                    ? "CREDIT"
                                    : "DEBIT"}
                                </span>

                              </td>

                              <td
                                style={{
                                  ...styles.td,
                                  textAlign: "right",
                                  fontWeight: "800",
                                  color: isCredit
                                    ? "#159663"
                                    : "#dc3d3d",
                                }}
                              >
                                {isCredit
                                  ? "+"
                                  : "-"}
                                {formatCurrency(
                                  amount
                                )}
                              </td>

                              <td
                                style={{
                                  ...styles.td,
                                  textAlign: "right",
                                  fontWeight: "700",
                                  color: "#253657",
                                }}
                              >
                                {formatCurrency(
                                  balance
                                )}
                              </td>

                            </tr>

                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

            {/* ================= SECURITY ================= */}

            <section style={responsiveStyles.securityCard}>

              <div style={responsiveStyles.securityIcon}>
                🛡️
              </div>

              <div>

                <h3 style={responsiveStyles.securityTitle}>
                  This is your account statement
                </h3>

                <p style={responsiveStyles.securityText}>
                  This statement contains your
                  recent transactions and account
                  activity.
                </p>

              </div>

            </section>

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
  },

  container: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
    padding: "48px 24px 60px",
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

  summaryCard: {
    background: "#fff",
    border: "1px solid #e5eaf2",
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

  accountSummary: {
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
    fontSize: "17px",
  },

  label: {
    margin: 0,
    color: "#71809b",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  accountNumber: {
    margin: "5px 0 0",
    color: "#1c2b49",
    fontSize: "15px",
    fontWeight: "800",
  },

  balanceSummary: {
    background: "#edf9f3",
    borderRadius: "12px",
    padding: "10px 15px",
    minWidth: "190px",
  },

  balanceLabel: {
    margin: 0,
    color: "#159663",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  summaryBalance: {
    margin: "3px 0 0",
    color: "#159663",
    fontSize: "19px",
    fontWeight: "800",
  },

  statementCard: {
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 8px 25px rgba(25,45,85,0.05)",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "720px",
  },

  th: {
    padding: "13px 15px",
    background: "#f8fafd",
    color: "#687792",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.8px",
    textAlign: "left",
    borderBottom: "1px solid #e6ebf2",
    whiteSpace: "nowrap",
  },

  tableRow: {
    borderBottom: "1px solid #edf0f4",
  },

  td: {
    padding: "15px",
    color: "#33425e",
    fontSize: "10px",
    whiteSpace: "nowrap",
  },

  description: {
    color: "#283753",
    fontWeight: "600",
  },

  typeBadge: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "8px",
    fontWeight: "800",
  },

  creditBadge: {
    color: "#159663",
    background: "#edfaf4",
    border: "1px solid #cceede",
  },

  debitBadge: {
    color: "#dc3d3d",
    background: "#fff1f1",
    border: "1px solid #ffd1d1",
  },

  securityCard: {
    marginTop: "16px",
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 6px 20px rgba(25,45,85,0.04)",
  },

  securityIcon: {
    width: "43px",
    height: "43px",
    minWidth: "43px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, #153d9a, #2868d8)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  securityTitle: {
    margin: 0,
    color: "#24304a",
    fontSize: "13px",
  },

  securityText: {
    margin: "4px 0 0",
    color: "#8993a8",
    fontSize: "10px",
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

  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "35px",
  },

  emptyTitle: {
    margin: "10px 0 5px",
    color: "#26334e",
    fontSize: "16px",
  },

  emptyText: {
    margin: 0,
    color: "#8b95a8",
    fontSize: "11px",
  },

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
    margin: "12px 0 5px",
  },

  loadingText: {
    color: "#8993a8",
    fontSize: "12px",
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

export default AccountStatement;