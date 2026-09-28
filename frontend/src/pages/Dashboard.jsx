import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [sentTransactions, setSentTransactions] = useState([]);
  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // TIME BASED GREETING
  // =====================================================

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";

    return "Good Night";
  };

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setTransactionLoading(true);
        setError("");

        // CUSTOMER
        const customerResponse = await fetch(
          "http://localhost:8080/api/customers/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (
          customerResponse.status === 401 ||
          customerResponse.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!customerResponse.ok) {
          throw new Error("Unable to fetch customer details.");
        }

        const customerData = await customerResponse.json();

        setCustomer(customerData);
        localStorage.setItem("customer", JSON.stringify(customerData));

        // SENT TRANSACTIONS
        const sentResponse = await fetch(
          "http://localhost:8080/api/transactions/sent",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (sentResponse.status === 401 || sentResponse.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!sentResponse.ok) {
          throw new Error("Unable to fetch sent transactions.");
        }

        const sentData = await sentResponse.json();

        setSentTransactions(Array.isArray(sentData) ? sentData : []);

        // RECEIVED TRANSACTIONS
        const receivedResponse = await fetch(
          "http://localhost:8080/api/transactions/received",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (
          receivedResponse.status === 401 ||
          receivedResponse.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!receivedResponse.ok) {
          throw new Error("Unable to fetch received transactions.");
        }

        const receivedData = await receivedResponse.json();

        setReceivedTransactions(
          Array.isArray(receivedData) ? receivedData : [],
        );

      // UNREAD NOTIFICATION COUNT
const notificationResponse = await fetch(
  "http://localhost:8080/api/notifications/unread/count",
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  },
);

if (
  notificationResponse.status === 401 ||
  notificationResponse.status === 403
) {
  localStorage.removeItem("token");
  localStorage.removeItem("customer");
  navigate("/login");
  return;
}

if (notificationResponse.ok) {
  const notificationCount = await notificationResponse.json();
  setUnreadNotificationCount(Number(notificationCount || 0));
}  

      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
        setTransactionLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // =====================================================
  // FINANCIAL CALCULATIONS
  // =====================================================

  const moneySent = useMemo(() => {
    return sentTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );
  }, [sentTransactions]);

  const moneyReceived = useMemo(() => {
    return receivedTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0,
    );
  }, [receivedTransactions]);

  const totalTransactions =
    sentTransactions.length + receivedTransactions.length;

  // =====================================================
  // RECENT ACTIVITY
  // =====================================================

  const recentTransactions = useMemo(() => {
    const sent = sentTransactions.map((transaction) => ({
      ...transaction,
      direction: "SENT",
    }));

    const received = receivedTransactions.map((transaction) => ({
      ...transaction,
      direction: "RECEIVED",
    }));

    return [...sent, ...received]
      .sort((a, b) => {
        const dateA = new Date(a.transactionDate || 0).getTime();
        const dateB = new Date(b.transactionDate || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [sentTransactions, receivedTransactions]);

  // =====================================================
  // DATE / TIME / CURRENCY
  // =====================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");

    navigate("/login");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>🏦</div>

          <h2 style={styles.loadingTitle}>Loading your dashboard</h2>

          <p style={styles.loadingText}>
            Please wait while we fetch your account information...
          </p>

          <div style={styles.loader}></div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !customer) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>

          <h2 style={styles.errorTitle}>Unable to load dashboard</h2>

          <p style={styles.errorText}>{error}</p>

          <button
            style={styles.primaryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div style={styles.page}>
      {/* ================= NAVBAR ================= */}

      <header style={styles.navbar}>
        <div style={styles.brandArea}>
          <div style={styles.brandIcon}>🏦</div>

          <div>
            <div style={styles.brandName}>AVANI BANK</div>

            <div style={styles.brandSubtitle}>Digital Banking</div>
          </div>
        </div>

        <div style={styles.navRight}>
          <div style={styles.accountBadge}>
            <span style={styles.onlineDot}></span>
            Account Active
          </div>

          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main style={styles.container}>
        {/* GREETING */}

        <section style={styles.greetingSection}>
          <div>
            <p style={styles.greetingSmall}>{getGreeting()}</p>

            <h1 style={styles.greetingTitle}>
              {customer?.fullName || "Customer"} 👋
            </h1>

            <p style={styles.greetingSubtitle}>
              Here's your account overview and recent banking activity.
            </p>
          </div>

          <div style={styles.accountMiniCard}>
            <div style={styles.accountMiniIcon}>💳</div>

            <div>
              <p style={styles.miniLabel}>ACCOUNT NUMBER</p>

              <p style={styles.miniValue}>{customer?.accountNumber || "N/A"}</p>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && <div style={styles.warningBox}>⚠️ {error}</div>}

        {/* ================= BALANCE ================= */}

        <section style={styles.balanceCard}>
          <div style={styles.balanceLeft}>
            <div style={styles.balanceIcon}>₹</div>

            <div>
              <p style={styles.balanceLabel}>AVAILABLE BALANCE</p>

              <h2 style={styles.balanceAmount}>
                ₹{formatCurrency(customer?.balance)}
              </h2>

              <p style={styles.balanceStatus}>Available in your account</p>
            </div>
          </div>

          <div style={styles.balanceRight}>
            <p style={styles.accountTypeLabel}>ACCOUNT TYPE</p>

            <p style={styles.accountTypeValue}>
              {customer?.accountType || "N/A"}
            </p>

            <span style={styles.activeBadge}>● Active</span>
          </div>
        </section>

        {/* ================= STATS ================= */}

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#fff1f1",
                color: "#d63c3c",
              }}
            >
              ↑
            </div>

            <div style={styles.statContent}>
              <p style={styles.statLabel}>MONEY SENT</p>

              <h3 style={styles.statValue}>₹{formatCurrency(moneySent)}</h3>

              <p style={styles.statSubtext}>
                {sentTransactions.length} transaction
                {sentTransactions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#ecfdf5",
                color: "#119463",
              }}
            >
              ↓
            </div>

            <div style={styles.statContent}>
              <p style={styles.statLabel}>MONEY RECEIVED</p>

              <h3 style={styles.statValue}>₹{formatCurrency(moneyReceived)}</h3>

              <p style={styles.statSubtext}>
                {receivedTransactions.length} transaction
                {receivedTransactions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                background: "#eef4ff",
                color: "#2457c6",
              }}
            >
              ↔
            </div>

            <div style={styles.statContent}>
              <p style={styles.statLabel}>TOTAL TRANSACTIONS</p>

              <h3 style={styles.statValue}>{totalTransactions}</h3>

              <p style={styles.statSubtext}>All account activity</p>
            </div>
          </div>
        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionEyebrow}>BANKING</p>

              <h2 style={styles.sectionTitle}>Quick Actions</h2>
            </div>
          </div>

          <div style={styles.actionsGrid}>       
            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/payments")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                ₹
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Payments</h3>

                <p style={styles.actionDescription}>
                  UPI, NEFT, RTGS, IMPS, bills and other payments.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* TRANSACTION HISTORY */}

            <button
              style={styles.actionCard}
              onClick={() => navigate("/transactions")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                📋
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Transaction History</h3>

                <p style={styles.actionDescription}>
                  View all your transactions.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* CARDS */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/cards")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#f3f0ff",
                  color: "#6847c7",
                }}
              >
                💳
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>My Cards</h3>

                <p style={styles.actionDescription}>
                  Manage your debit and credit cards.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* KYC */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/kyc")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#f0fdf4",
                  color: "#15803d",
                }}
              >
                ✓
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>KYC Verification</h3>

                <p style={styles.actionDescription}>
                  Verify and manage your KYC documents.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* RISK PROFILE */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/risk-profile")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#fff8e7",
                  color: "#9a6700",
                }}
              >
                🛡️
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Risk Profile</h3>

                <p style={styles.actionDescription}>
                  View your customer risk assessment.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* ADDRESS VERIFICATION */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/address-verification")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef7f5",
                  color: "#16806b",
                }}
              >
                📍
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Address Verification</h3>

                <p style={styles.actionDescription}>
                  Verify and manage your registered address.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>
            {/* DUPLICATE KYC */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/duplicate-kyc")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#f5efff",
                  color: "#7c3aed",
                }}
              >
                🛡️
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Duplicate KYC</h3>

                <p style={styles.actionDescription}>
                  Check KYC document duplication.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>
            {/* JOINT ACCOUNT */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/joint-account")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                👥
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Joint Account</h3>

                <p style={styles.actionDescription}>
                  Manage your joint bank accounts.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>
            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/customer-relationship-history")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                🔗
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Relationship History</h3>

                <p style={styles.actionDescription}>
                  View your customer relationship history.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>
            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/biometric-verification")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                🛡️
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Biometric Verification</h3>

                <p style={styles.actionDescription}>
                  Manage your biometric verification.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>
            {/*AMLCHECK*/}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/aml-check")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                ✓
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>AML Check</h3>

                <p style={styles.actionDescription}>
                  Anti-Money Laundering screening & compliance
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>
            {/* NOMINEE */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/nominee")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#f5f3ff",
                  color: "#6d4cc2",
                }}
              >
                ♙
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Nominee Management</h3>

                <p style={styles.actionDescription}>
                  Add and manage your nominees.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* BENEFICIARIES */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/beneficiaries")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                👥
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Beneficiaries</h3>

                <p style={styles.actionDescription}>
                  Add and manage your beneficiaries.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* ACCOUNT MANAGEMENT */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/accounts")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                🏦
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Account Management</h3>

                <p style={styles.actionDescription}>
                  Manage accounts, balance, statements and account services.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* PROFILE */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/profile")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                👤
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Profile & Account</h3>

                <p style={styles.actionDescription}>
                  View and manage your account details.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* SETTINGS */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/settings")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#f5f3ff",
                  color: "#7956b8",
                }}
              >
                ⚙️
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Settings</h3>

                <p style={styles.actionDescription}>
                  Manage security and preferences.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* LOAN MANAGEMENT */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/loans")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#fff7e8",
                  color: "#9a6700",
                }}
              >
                💰
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>Loan Management</h3>

                <p style={styles.actionDescription}>
                  Apply for loans and manage your repayments.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>

            {/* INVESTMENT & WEALTH MANAGEMENT */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() => navigate("/investments")}
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                📈
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>
                  Investment & Wealth Management
                </h3>

                <p style={styles.actionDescription}>
                  Manage mutual funds, FD, SIP, bonds, gold and your portfolio.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>
            
            {/* SECURITY CENTER */}

<button
  type="button"
  style={styles.actionCard}
  onClick={() => navigate("/security-center")}
>
  <div
    style={{
      ...styles.actionIcon,
      background: "#fff1f2",
      color: "#c0263e",
    }}
  >
    🛡️
  </div>

  <div style={styles.actionText}>
    <h3 style={styles.actionTitle}>
      Security Center
    </h3>

    <p style={styles.actionDescription}>
      Monitor fraud alerts, risk score and account security.
    </p>
  </div>

  <span style={styles.actionArrow}>→</span>
</button>

{/* CUSTOMER SERVICE */}

<button
  type="button"
  style={styles.actionCard}
  onClick={() => navigate("/customer-service")}
>
  <div
    style={{
      ...styles.actionIcon,
      background: "#eef7f5",
      color: "#16806b",
    }}
  >
    💬
  </div>

  <div style={styles.actionText}>
    <h3 style={styles.actionTitle}>Customer Service</h3>

    <p style={styles.actionDescription}>
      Raise complaints, service requests, appointments and get support.
    </p>
  </div>

  <span style={styles.actionArrow}>→</span>
</button>

{/* NOTIFICATIONS */}

<button
  type="button"
  style={styles.actionCard}
  onClick={() => navigate("/notifications")}
>
  <div
    style={{
      ...styles.actionIcon,
      background: "#eef4ff",
      color: "#2457c6",
    }}
  >
    🔔
  </div>

  <div style={styles.actionText}>
    <h3 style={styles.actionTitle}>Notifications</h3>

    <p style={styles.actionDescription}>
      View alerts, banking updates and important notifications.
    </p>
  </div>

  {unreadNotificationCount > 0 && (
    <span style={styles.notificationBadge}>
      {unreadNotificationCount > 99
        ? "99+"
        : unreadNotificationCount}
    </span>
  )}

  <span style={styles.actionArrow}>→</span>
</button>

            {/* VIEW ACTIVITY */}

            <button
              type="button"
              style={styles.actionCard}
              onClick={() =>
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                })
              }
            >
              <div
                style={{
                  ...styles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                📊
              </div>

              <div style={styles.actionText}>
                <h3 style={styles.actionTitle}>View Activity</h3>

                <p style={styles.actionDescription}>
                  Check your recent transactions.
                </p>
              </div>

              <span style={styles.actionArrow}>→</span>
            </button>
          </div>
        </section>

        {/* ================= RECENT ACTIVITY ================= */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionEyebrow}>TRANSACTIONS</p>

              <h2 style={styles.sectionTitle}>Recent Activity</h2>
            </div>

            <div style={styles.transactionCount}>{totalTransactions} total</div>
          </div>

          <div style={styles.activityCard}>
            {transactionLoading ? (
              <div style={styles.activityLoading}>
                <div style={styles.smallLoader}></div>
                Loading transactions...
              </div>
            ) : recentTransactions.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>

                <h3 style={styles.emptyTitle}>No transactions yet</h3>

                <p style={styles.emptyText}>
                  Your recent transactions will appear here.
                </p>

                <button
                  style={styles.emptyButton}
                  onClick={() => navigate("/transfer")}
                >
                  Make Your First Transfer
                </button>
              </div>
            ) : (
              <div>
                {recentTransactions.map((transaction, index) => {
                  const isSent = transaction.direction === "SENT";

                  const otherAccount = isSent
                    ? transaction.receiverAccountNumber
                    : transaction.senderAccountNumber;

                  return (
                    <div
                      key={
                        transaction.id || `${transaction.direction}-${index}`
                      }
                      style={{
                        ...styles.transactionRow,
                        borderBottom:
                          index === recentTransactions.length - 1
                            ? "none"
                            : "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          ...styles.transactionIcon,
                          background: isSent ? "#fff1f1" : "#ecfdf5",
                          color: isSent ? "#d63c3c" : "#119463",
                        }}
                      >
                        {isSent ? "↑" : "↓"}
                      </div>

                      <div style={styles.transactionInfo}>
                        <h3 style={styles.transactionTitle}>
                          {isSent ? "Money Sent" : "Money Received"}
                        </h3>

                        <p style={styles.transactionAccount}>
                          {isSent ? "To" : "From"} Account{" "}
                          {otherAccount || "N/A"}
                        </p>

                        <p style={styles.transactionDate}>
                          {formatDate(transaction.transactionDate)}

                          {formatTime(transaction.transactionDate) &&
                            ` • ${formatTime(transaction.transactionDate)}`}
                        </p>
                      </div>

                      <div style={styles.transactionAmountBox}>
                        <p
                          style={{
                            ...styles.transactionAmount,
                            color: isSent ? "#d63c3c" : "#119463",
                          }}
                        >
                          {isSent ? "-" : "+"}₹
                          {formatCurrency(transaction.amount)}
                        </p>

                        <span style={styles.successStatus}>
                          ✓ {transaction.status || "SUCCESS"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ================= ACCOUNT INFORMATION ================= */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.sectionEyebrow}>PROFILE</p>

              <h2 style={styles.sectionTitle}>Account Information</h2>
            </div>
          </div>

          <div style={styles.profileCard}>
            <div style={styles.profileTop}>
              <div style={styles.avatar}>
                {customer?.fullName?.charAt(0)?.toUpperCase() || "C"}
              </div>

              <div>
                <h3 style={styles.profileName}>
                  {customer?.fullName || "Customer"}
                </h3>

                <p style={styles.profileEmail}>
                  {customer?.email || "Email unavailable"}
                </p>
              </div>

              <div style={styles.profileStatus}>
                ● {customer?.status || "ACTIVE"}
              </div>
            </div>

            <div style={styles.profileGrid}>
              <div style={styles.profileItem}>
                <p style={styles.profileLabel}>FULL NAME</p>

                <p style={styles.profileValue}>{customer?.fullName || "N/A"}</p>
              </div>

              <div style={styles.profileItem}>
                <p style={styles.profileLabel}>EMAIL</p>

                <p style={styles.profileValue}>{customer?.email || "N/A"}</p>
              </div>

              <div style={styles.profileItem}>
                <p style={styles.profileLabel}>PHONE</p>

                <p style={styles.profileValue}>{customer?.phone || "N/A"}</p>
              </div>

              <div style={styles.profileItem}>
                <p style={styles.profileLabel}>ACCOUNT NUMBER</p>

                <p style={styles.profileValue}>
                  {customer?.accountNumber || "N/A"}
                </p>
              </div>

              <div style={styles.profileItem}>
                <p style={styles.profileLabel}>ACCOUNT TYPE</p>

                <p style={styles.profileValue}>
                  {customer?.accountType || "N/A"}
                </p>
              </div>

              <div style={styles.profileItem}>
                <p style={styles.profileLabel}>CUSTOMER SINCE</p>

                <p style={styles.profileValue}>
                  {formatDate(customer?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}

      <footer style={styles.footer}>
        <div>© {new Date().getFullYear()} Avani Bank</div>

        <div>Secure • Reliable • Digital Banking</div>
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
    background: "#f5f7fb",
    color: "#172033",
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
  },

  navbar: {
    minHeight: "72px",
    background: "#ffffff",
    borderBottom: "1px solid #e8ecf2",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxSizing: "border-box",
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
    background: "linear-gradient(135deg, #102354, #2457c6)",
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
    color: "#12224a",
  },

  brandSubtitle: {
    marginTop: "2px",
    fontSize: "10px",
    color: "#8993a8",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  accountBadge: {
    padding: "8px 11px",
    borderRadius: "20px",
    background: "#ecfdf5",
    color: "#14875a",
    fontSize: "11px",
    fontWeight: "700",
  },

  onlineDot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#16a36c",
    marginRight: "6px",
  },

  logoutButton: {
    border: "1px solid #e1e6ef",
    background: "#ffffff",
    color: "#4b5870",
    borderRadius: "9px",
    padding: "9px 15px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "35px 24px 50px",
    boxSizing: "border-box",
  },

  greetingSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    marginBottom: "25px",
  },

  greetingSmall: {
    margin: 0,
    color: "#2457c6",
    fontSize: "19px",
    fontWeight: "700",
  },

  greetingTitle: {
    margin: "5px 0 7px",
    fontSize: "32px",
    lineHeight: "1.15",
    color: "#15213d",
    letterSpacing: "-0.7px",
  },

  greetingSubtitle: {
    margin: 0,
    color: "#7d879b",
    fontSize: "13px",
  },

  accountMiniCard: {
    minWidth: "235px",
    padding: "15px 17px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 6px 20px rgba(24,43,83,0.04)",
    boxSizing: "border-box",
  },

  accountMiniIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#edf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  miniLabel: {
    margin: 0,
    fontSize: "9px",
    color: "#929bad",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  miniValue: {
    margin: "4px 0 0",
    fontSize: "14px",
    color: "#1c2c52",
    fontWeight: "700",
  },

  warningBox: {
    background: "#fff8e8",
    border: "1px solid #f5dfaa",
    color: "#8b650e",
    padding: "12px 15px",
    borderRadius: "10px",
    fontSize: "12px",
    marginBottom: "20px",
  },

  balanceCard: {
    background:
      "linear-gradient(135deg, #102354 0%, #173b8c 58%, #2457c6 100%)",
    color: "#ffffff",
    borderRadius: "20px",
    padding: "28px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    boxShadow: "0 15px 35px rgba(18,51,120,0.16)",
    boxSizing: "border-box",
  },
  

  balanceLeft: {
    display: "flex",
    alignItems: "center",
    gap: "17px",
  },

  balanceIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.13)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "800",
  },

  balanceLabel: {
    margin: 0,
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: "#bdcdf5",
    fontWeight: "700",
  },

  balanceAmount: {
    margin: "5px 0 4px",
    fontSize: "31px",
    letterSpacing: "-0.5px",
  },

  balanceStatus: {
    margin: 0,
    fontSize: "11px",
    color: "#d1dcfa",
  },

  balanceRight: {
    textAlign: "right",
  },

  accountTypeLabel: {
    margin: 0,
    fontSize: "9px",
    color: "#b9c9f2",
    letterSpacing: "1px",
    fontWeight: "700",
  },

  accountTypeValue: {
    margin: "5px 0 8px",
    fontSize: "14px",
    fontWeight: "700",
  },

  activeBadge: {
    fontSize: "10px",
    background: "rgba(255,255,255,0.12)",
    padding: "6px 9px",
    borderRadius: "15px",
    color: "#d9e4ff",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "18px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 6px 22px rgba(24,43,83,0.04)",
    boxSizing: "border-box",
  },

  statIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
    flexShrink: 0,
  },

  statContent: {
    minWidth: 0,
  },

  statLabel: {
    margin: 0,
    color: "#8b94a7",
    fontSize: "9px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  statValue: {
    margin: "5px 0 3px",
    color: "#182440",
    fontSize: "21px",
    fontWeight: "800",
  },

  statSubtext: {
    margin: 0,
    color: "#9aa2b2",
    fontSize: "10px",
  },

  section: {
    marginTop: "32px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
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

  /* =====================================================
     COMPACT QUICK ACTION CARDS
     ===================================================== */


  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },

  actionCard: {
    width: "100%",
    minHeight: "84px",
    border: "1px solid #e5eaf2",
    background: "#ffffff",
    borderRadius: "14px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 5px 16px rgba(24,43,83,0.035)",
    boxSizing: "border-box",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },

  actionIcon: {
    width: "46px",
    height: "46px",
    minWidth: "46px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    flexShrink: 0,
  },

  actionText: {
    flex: 1,
    minWidth: 0,
  },

  actionTitle: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "1.25",
    fontWeight: "700",
    color: "#1c2947",
  },

  actionDescription: {
    margin: "4px 0 0",
    fontSize: "10px",
    color: "#8993a8",
    lineHeight: "1.35",
  },

  actionArrow: {
    fontSize: "20px",
    color: "#2457c6",
    fontWeight: "400",
    marginLeft: "auto",
    flexShrink: 0,
  },

  notificationBadge: {
  minWidth: "22px",
  height: "22px",
  padding: "0 6px",
  borderRadius: "12px",
  background: "#2457c6",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "9px",
  fontWeight: "800",
  boxSizing: "border-box",
  flexShrink: 0,
},

  transactionCount: {
    background: "#eef3ff",
    color: "#355db2",
    padding: "6px 10px",
    borderRadius: "15px",
    fontSize: "10px",
    fontWeight: "700",
  },

  activityCard: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 6px 22px rgba(24,43,83,0.035)",
  },

  transactionRow: {
    minHeight: "82px",
    padding: "15px 18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxSizing: "border-box",
  },

  transactionIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    flexShrink: 0,
  },

  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },

  transactionTitle: {
    margin: 0,
    fontSize: "13px",
    color: "#1d2944",
  },

  transactionAccount: {
    margin: "3px 0 0",
    fontSize: "10px",
    color: "#7e889b",
  },

  transactionDate: {
    margin: "3px 0 0",
    fontSize: "9px",
    color: "#a0a7b5",
  },

  transactionAmountBox: {
    textAlign: "right",
    flexShrink: 0,
  },

  transactionAmount: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "800",
  },

  successStatus: {
    display: "inline-block",
    marginTop: "4px",
    fontSize: "8px",
    color: "#16875a",
    background: "#ecfdf5",
    padding: "3px 6px",
    borderRadius: "8px",
    fontWeight: "700",
  },

  activityLoading: {
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#7e889b",
    fontSize: "12px",
  },

  smallLoader: {
    width: "16px",
    height: "16px",
    border: "2px solid #dce4f2",
    borderTop: "2px solid #2457c6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  emptyState: {
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    background: "#f1f4f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  emptyTitle: {
    margin: "13px 0 5px",
    fontSize: "15px",
    color: "#25314d",
  },

  emptyText: {
    margin: 0,
    color: "#929bad",
    fontSize: "11px",
  },

  emptyButton: {
    marginTop: "15px",
    border: "none",
    background: "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "10px 15px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  profileCard: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 6px 22px rgba(24,43,83,0.035)",
  },

  profileTop: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    paddingBottom: "20px",
    borderBottom: "1px solid #edf0f5",
  },

  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "800",
  },

  profileName: {
    margin: 0,
    fontSize: "15px",
    color: "#1c2947",
  },

  profileEmail: {
    margin: "4px 0 0",
    fontSize: "10px",
    color: "#8b94a7",
  },

  profileStatus: {
    marginLeft: "auto",
    color: "#14875a",
    background: "#ecfdf5",
    padding: "7px 10px",
    borderRadius: "15px",
    fontSize: "9px",
    fontWeight: "700",
  },

  profileGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "20px",
    paddingTop: "20px",
  },

  profileItem: {
    minWidth: 0,
  },

  profileLabel: {
    margin: 0,
    fontSize: "8px",
    letterSpacing: "1px",
    color: "#9aa2b2",
    fontWeight: "800",
  },

  profileValue: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#293650",
    fontWeight: "600",
    wordBreak: "break-word",
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
    background: "linear-gradient(135deg, #f5f7fb, #edf2fb)",
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
    boxShadow: "0 15px 40px rgba(25,45,85,0.08)",
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

  errorCard: {
    width: "100%",
    maxWidth: "400px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "35px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(25,45,85,0.08)",
    boxSizing: "border-box",
  },

  errorIcon: {
    fontSize: "40px",
  },

  errorTitle: {
    margin: "15px 0 7px",
    color: "#25314d",
    fontSize: "18px",
  },

  errorText: {
    color: "#7d879b",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  primaryButton: {
    border: "none",
    borderRadius: "9px",
    background: "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    padding: "11px 20px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

// =====================================================
// GLOBAL ANIMATION
// =====================================================

const styleSheet = document.createElement("style");

styleSheet.innerHTML = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 850px) {
    .dashboard-responsive {
      grid-template-columns: 1fr;
    }

    .actionsGrid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .dashboard-responsive {
      grid-template-columns: 1fr;
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default Dashboard;
