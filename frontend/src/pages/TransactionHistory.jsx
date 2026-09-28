import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function TransactionHistory() {
  const navigate = useNavigate();

  const [sentTransactions, setSentTransactions] = useState([]);
  const [receivedTransactions, setReceivedTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Login session expired. Please login again.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [sentResponse, receivedResponse] = await Promise.all([
        fetch("http://localhost:8080/api/transactions/sent", {
          headers,
        }),

        fetch("http://localhost:8080/api/transactions/received", {
          headers,
        }),
      ]);

      const sentText = await sentResponse.text();
      const receivedText = await receivedResponse.text();

      let sentData = [];
      let receivedData = [];

      try {
        sentData = sentText ? JSON.parse(sentText) : [];
      } catch {
        sentData = [];
      }

      try {
        receivedData = receivedText ? JSON.parse(receivedText) : [];
      } catch {
        receivedData = [];
      }

      if (!sentResponse.ok) {
        throw new Error(
          sentData.message || "Unable to load sent transactions.",
        );
      }

      if (!receivedResponse.ok) {
        throw new Error(
          receivedData.message || "Unable to load received transactions.",
        );
      }

      setSentTransactions(Array.isArray(sentData) ? sentData : []);
      setReceivedTransactions(Array.isArray(receivedData) ? receivedData : []);
    } catch (err) {
      console.error("Transaction history error:", err);
      setError(err.message || "Unable to load transaction history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const downloadStatement = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Login session expired. Please login again.");
        return;
      }

      const response = await fetch("http://localhost:8080/api/statements/pdf", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();

        let message = "Unable to download statement.";

        try {
          const data = text ? JSON.parse(text) : {};
          message = data.message || message;
        } catch {
          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "Avani-Bank-Statement.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Statement download error:", err);

      setError(err.message || "Unable to download statement.");
    }
  };

  // =========================
  // COMBINE TRANSACTIONS
  // =========================

  const allTransactions = useMemo(() => {
    const sent = sentTransactions.map((transaction) => ({
      ...transaction,
      transactionDirection: "DEBIT",
    }));

    const received = receivedTransactions.map((transaction) => ({
      ...transaction,
      transactionDirection: "CREDIT",
    }));

    return [...sent, ...received].sort((a, b) => {
      return (
        new Date(b.transactionDate || 0) - new Date(a.transactionDate || 0)
      );
    });
  }, [sentTransactions, receivedTransactions]);

  // =========================
  // FILTER TRANSACTIONS
  // =========================

  const filteredTransactions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return allTransactions.filter((transaction) => {
      const matchesFilter =
        filter === "ALL" || transaction.transactionDirection === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return (
        String(transaction.id || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.senderAccountNumber || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.receiverAccountNumber || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.transactionType || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(transaction.status || "")
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [allTransactions, filter, search]);

  // =========================
  // TOTALS
  // =========================

  const totalSent = sentTransactions.reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0,
  );

  const totalReceived = receivedTransactions.reduce(
    (total, transaction) => total + Number(transaction.amount || 0),
    0,
  );

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================
  // TRANSACTION ROW
  // =========================

  const TransactionRow = ({ transaction }) => {
    const isDebit = transaction.transactionDirection === "DEBIT";

    return (
      <div style={styles.transactionRow}>
        <div
          style={{
            ...styles.directionIcon,
            background: isDebit ? "#fff1f1" : "#eaf8f0",
            color: isDebit ? "#c43d3d" : "#168653",
          }}
        >
          {isDebit ? "↑" : "↓"}
        </div>

        <div style={styles.transactionMain}>
          <div style={styles.transactionTitleRow}>
            <strong style={styles.transactionTitle}>
              {isDebit ? "Money Sent" : "Money Received"}
            </strong>

            <span
              style={{
                ...styles.status,
                ...(String(transaction.status).toUpperCase() === "SUCCESS"
                  ? styles.successStatus
                  : styles.pendingStatus),
              }}
            >
              {transaction.status || "SUCCESS"}
            </span>
          </div>

          <div style={styles.transactionMeta}>
            <span>Transaction ID: #{transaction.id}</span>

            <span>{formatDate(transaction.transactionDate)}</span>
          </div>

          <div style={styles.accountInfo}>
            {isDebit
              ? `To: ${transaction.receiverAccountNumber}`
              : `From: ${transaction.senderAccountNumber}`}
          </div>

          <div style={styles.transactionType}>
            Type: {transaction.transactionType || "TRANSFER"}
          </div>
        </div>

        <div
          style={{
            ...styles.transactionAmount,
            color: isDebit ? "#c43d3d" : "#168653",
          }}
        >
          {isDebit ? "-" : "+"}
          {formatAmount(transaction.amount)}
        </div>
      </div>
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.loader}></div>

          <p>Loading account statement...</p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <p style={styles.brand}>AVANI BANK</p>

            <h1 style={styles.title}>Account Statement</h1>

            <p style={styles.subtitle}>
              View and track all your account transactions.
            </p>
          </div>
          <div style={styles.headerButtons}>
            <button onClick={downloadStatement} style={styles.downloadButton}>
              ↓ Download Statement
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              style={styles.dashboardButton}
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && <div style={styles.error}>⚠ {error}</div>}

        {/* SUMMARY */}

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>⇄</div>

            <div>
              <span style={styles.summaryLabel}>Total Transactions</span>

              <strong style={styles.summaryValue}>
                {allTransactions.length}
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                background: "#fff1f1",
                color: "#c43d3d",
              }}
            >
              ↑
            </div>

            <div>
              <span style={styles.summaryLabel}>Total Sent</span>

              <strong style={styles.summaryValue}>
                {formatAmount(totalSent)}
              </strong>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                background: "#eaf8f0",
                color: "#168653",
              }}
            >
              ↓
            </div>

            <div>
              <span style={styles.summaryLabel}>Total Received</span>

              <strong style={styles.summaryValue}>
                {formatAmount(totalReceived)}
              </strong>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS */}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>All Transactions</h2>

              <p style={styles.cardSubtitle}>Complete transaction statement</p>
            </div>

            <button
              onClick={() => loadTransactions(true)}
              disabled={refreshing}
              style={styles.refreshButton}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {/* FILTERS */}

          <div style={styles.filterBar}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transaction, account number..."
              style={styles.searchInput}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="ALL">All Transactions</option>

              <option value="DEBIT">Money Sent</option>

              <option value="CREDIT">Money Received</option>
            </select>
          </div>

          {/* LIST */}

          {filteredTransactions.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📄</div>

              <h3 style={styles.emptyTitle}>No Transactions Found</h3>

              <p style={styles.emptyText}>
                No transactions match your current search or filter.
              </p>
            </div>
          ) : (
            <div style={styles.transactionList}>
              {filteredTransactions.map((transaction) => (
                <TransactionRow
                  key={`${transaction.transactionDirection}-${transaction.id}`}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </div>

        {/* INFORMATION */}

        <div style={styles.infoBox}>
          <div style={styles.infoIcon}>ℹ️</div>

          <div>
            <strong style={styles.infoTitle}>Account Statement</strong>

            <p style={styles.infoText}>
              This statement displays transactions retrieved securely from your
              Avani Bank account.
            </p>
          </div>
        </div>
      </div>
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
    fontFamily: "Inter, Arial, sans-serif",
    color: "#172033",
    padding: "35px 20px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
  },

  header: {
    height: "60px",
    background:
      "linear-gradient(135deg, #102354 0%, #173b8c 55%, #2457c6 100%)",
    color: "white",
    borderRadius: "18px",
    padding: "28px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 15px 35px rgba(18,51,120,0.16)",
  },

  headerButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  downloadButton: {
    border: "1px solid rgba(255,255,255,0.25)",
    background: "white",
    color: "#173b8c",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  brand: {
    margin: 0,
    fontSize: "11px",
    letterSpacing: "2px",
    opacity: 0.7,
    fontWeight: "700",
  },

  title: {
    margin: "8px 0 5px",
    fontSize: "28px",
    fontWeight: "800",
  },

  subtitle: {
    margin: 0,
    color: "#d7e2ff",
    fontSize: "13px",
  },

  dashboardButton: {
    border: "1px solid rgba(255,255,255,0.25)",
    background: "#ffffff",
    color: "#173b8c",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  error: {
    marginTop: "18px",
    padding: "13px 15px",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#c43d3d",
    border: "1px solid #ffd4d4",
    fontSize: "12px",
    fontWeight: "600",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  summaryCard: {
    background: "white",
    border: "1px solid #e7ebf2",
    borderRadius: "15px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow: "0 7px 20px rgba(20,35,70,0.04)",
  },

  summaryIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#edf3ff",
    color: "#173b8c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    flexShrink: 0,
  },

  summaryLabel: {
    display: "block",
    fontSize: "10px",
    color: "#7f8a9d",
    marginBottom: "4px",
  },

  summaryValue: {
    display: "block",
    fontSize: "16px",
    fontWeight: "800",
  },

  card: {
    background: "white",
    marginTop: "20px",
    padding: "25px",
    borderRadius: "17px",
    border: "1px solid #e7ebf2",
    boxShadow: "0 8px 25px rgba(20,35,70,0.05)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#7d899b",
  },

  refreshButton: {
    border: "1px solid #d9e1ec",
    background: "#f8faff",
    color: "#173b8c",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  filterBar: {
    display: "grid",
    gridTemplateColumns: "1fr 190px",
    gap: "12px",
    marginBottom: "18px",
  },

  searchInput: {
    width: "100%",
    height: "44px",
    boxSizing: "border-box",
    border: "1px solid #dce3ed",
    borderRadius: "9px",
    padding: "0 13px",
    outline: "none",
    fontSize: "12px",
    background: "#fbfcfe",
  },

  filterSelect: {
    width: "100%",
    height: "44px",
    boxSizing: "border-box",
    border: "1px solid #dce3ed",
    borderRadius: "9px",
    padding: "0 12px",
    outline: "none",
    fontSize: "12px",
    background: "#fbfcfe",
    color: "#33415a",
  },

  transactionList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  transactionRow: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "16px",
    border: "1px solid #e8edf4",
    borderRadius: "12px",
    background: "#fcfdff",
  },

  directionIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    flexShrink: 0,
  },

  transactionMain: {
    flex: 1,
    minWidth: 0,
  },

  transactionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    flexWrap: "wrap",
  },

  transactionTitle: {
    fontSize: "14px",
    fontWeight: "800",
  },

  status: {
    padding: "4px 7px",
    borderRadius: "6px",
    fontSize: "9px",
    fontWeight: "800",
  },

  successStatus: {
    background: "#eaf8f0",
    color: "#168653",
  },

  pendingStatus: {
    background: "#fff7e5",
    color: "#9a6700",
  },

  transactionMeta: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginTop: "5px",
    color: "#8994a6",
    fontSize: "10px",
  },

  accountInfo: {
    marginTop: "6px",
    fontSize: "11px",
    color: "#56647a",
    wordBreak: "break-word",
  },

  transactionType: {
    marginTop: "4px",
    fontSize: "10px",
    color: "#929cad",
  },

  transactionAmount: {
    fontSize: "15px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  empty: {
    textAlign: "center",
    padding: "45px 20px",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#f0f4fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
    fontSize: "22px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "800",
  },

  emptyText: {
    margin: "6px 0 0",
    fontSize: "11px",
    color: "#8994a6",
  },

  infoBox: {
    marginTop: "18px",
    padding: "16px",
    display: "flex",
    gap: "11px",
    alignItems: "flex-start",
    background: "#f5f8fc",
    border: "1px solid #e1e8f1",
    borderRadius: "12px",
  },

  infoIcon: {
    fontSize: "17px",
  },

  infoTitle: {
    fontSize: "12px",
    color: "#33435a",
  },

  infoText: {
    margin: "4px 0 0",
    color: "#728096",
    fontSize: "10px",
    lineHeight: "1.6",
  },

  loading: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#68768b",
    fontSize: "13px",
  },

  loader: {
    width: "28px",
    height: "28px",
    border: "3px solid #dce4ef",
    borderTop: "3px solid #173b8c",
    borderRadius: "50%",
    marginBottom: "12px",
    animation: "spin 1s linear infinite",
  },
};

export default TransactionHistory;
