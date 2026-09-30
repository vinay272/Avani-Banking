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
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("avani-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("avani-theme", darkMode ? "dark" : "light");
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    document.body.style.background = darkMode ? "#0b1220" : "#f5f7fb";
  }, [darkMode]);

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

  const themeStyles = darkMode ? darkStyles : themeStylesBase;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={themeStyles.loadingPage}>
        <div style={themeStyles.loadingCard}>
          <div style={themeStyles.loadingIcon}>🏦</div>

          <h2 style={themeStyles.loadingTitle}>Loading your dashboard</h2>

          <p style={themeStyles.loadingText}>
            Please wait while we fetch your account information...
          </p>

          <div style={themeStyles.loader}></div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !customer) {
    return (
      <div style={themeStyles.loadingPage}>
        <div style={themeStyles.errorCard}>
          <div style={themeStyles.errorIcon}>⚠️</div>

          <h2 style={themeStyles.errorTitle}>Unable to load dashboard</h2>

          <p style={themeStyles.errorText}>{error}</p>

          <button
            style={themeStyles.primaryButton}
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
    <div
      className={`dashboard-page ${darkMode ? "dashboard-dark-mode" : ""}`}
      style={themeStyles.page}
    >
      {" "}
      {/* ================= NAVBAR ================= */}
      <header className="dashboard-navbar" style={themeStyles.navbar}>
        <div style={themeStyles.brandArea}>
          <div style={themeStyles.brandIcon}>🏦</div>

          <div>
            <div style={themeStyles.brandName}>AVANI BANK</div>

            <div style={themeStyles.brandSubtitle}>Digital Banking</div>
          </div>
        </div>

        <div className="dashboard-nav-right" style={themeStyles.navRight}>
          <div style={themeStyles.accountBadge}>
            <span style={themeStyles.onlineDot}></span>
            Account Active
          </div>

          <button
            type="button"
            style={themeStyles.themeToggle}
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span style={themeStyles.themeToggleIcon}>
              {darkMode ? "☀️" : "🌙"}
            </span>
            {darkMode ? "Light" : "Dark"}
          </button>

          <button style={themeStyles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      {/* ================= MAIN ================= */}
      <main style={themeStyles.container}>
        {/* GREETING */}

        <section
          className="dashboard-greeting"
          style={themeStyles.greetingSection}
        >
          <div>
            <p style={themeStyles.greetingSmall}>{getGreeting()}</p>

            <h1 style={themeStyles.greetingTitle}>
              {customer?.fullName || "Customer"} 👋
            </h1>

            <p style={themeStyles.greetingSubtitle}>
              Here's your account overview and recent banking activity.
            </p>
          </div>

          <div style={themeStyles.accountMiniCard}>
            <div style={themeStyles.accountMiniIcon}>💳</div>

            <div>
              <p style={themeStyles.miniLabel}>ACCOUNT NUMBER</p>

              <p style={themeStyles.miniValue}>
                {customer?.accountNumber || "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && <div style={themeStyles.warningBox}>⚠️ {error}</div>}

        {/* ================= BALANCE ================= */}

        <section className="dashboard-balance" style={themeStyles.balanceCard}>
          <div className="dashboard-balance-left" style={themeStyles.balanceLeft}>
            <div style={themeStyles.balanceIcon}>₹</div>

            <div>
              <p style={themeStyles.balanceLabel}>AVAILABLE BALANCE</p>

              <h2 style={themeStyles.balanceAmount}>
                ₹{formatCurrency(customer?.balance)}
              </h2>

              <p style={themeStyles.balanceStatus}>Available in your account</p>
            </div>
          </div>

          <div
            className="dashboard-balance-right"
            style={themeStyles.balanceRight}
          >
            <p style={themeStyles.accountTypeLabel}>ACCOUNT TYPE</p>

            <p style={themeStyles.accountTypeValue}>
              {customer?.accountType || "N/A"}
            </p>

            <span style={themeStyles.activeBadge}>● Active</span>
          </div>
        </section>

        {/* ================= STATS ================= */}

        <section className="dashboard-stats" style={themeStyles.statsGrid}>
          <div style={themeStyles.statCard}>
            <div
              style={{
                ...themeStyles.statIcon,
                background: "#fff1f1",
                color: "#d63c3c",
              }}
            >
              ↑
            </div>

            <div style={themeStyles.statContent}>
              <p style={themeStyles.statLabel}>MONEY SENT</p>

              <h3 style={themeStyles.statValue}>
                ₹{formatCurrency(moneySent)}
              </h3>

              <p style={themeStyles.statSubtext}>
                {sentTransactions.length} transaction
                {sentTransactions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div style={themeStyles.statCard}>
            <div
              style={{
                ...themeStyles.statIcon,
                background: "#ecfdf5",
                color: "#119463",
              }}
            >
              ↓
            </div>

            <div style={themeStyles.statContent}>
              <p style={themeStyles.statLabel}>MONEY RECEIVED</p>

              <h3 style={themeStyles.statValue}>
                ₹{formatCurrency(moneyReceived)}
              </h3>

              <p style={themeStyles.statSubtext}>
                {receivedTransactions.length} transaction
                {receivedTransactions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div style={themeStyles.statCard}>
            <div
              style={{
                ...themeStyles.statIcon,
                background: "#eef4ff",
                color: "#2457c6",
              }}
            >
              ↔
            </div>

            <div style={themeStyles.statContent}>
              <p style={themeStyles.statLabel}>TOTAL TRANSACTIONS</p>

              <h3 style={themeStyles.statValue}>{totalTransactions}</h3>

              <p style={themeStyles.statSubtext}>All account activity</p>
            </div>
          </div>
        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section style={themeStyles.section}>
          <div style={themeStyles.sectionHeader}>
            <div>
              <p style={themeStyles.sectionEyebrow}>BANKING</p>

              <h2 style={themeStyles.sectionTitle}>Quick Actions</h2>
            </div>
          </div>

          <div className="dashboard-actions" style={themeStyles.actionsGrid}>
            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/payments")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                ₹
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Payments</h3>

                <p style={themeStyles.actionDescription}>
                  UPI, NEFT, RTGS, IMPS, bills and other payments.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* TRANSACTION HISTORY */}

            <button
              style={themeStyles.actionCard}
              onClick={() => navigate("/transactions")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                📋
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Transaction History</h3>

                <p style={themeStyles.actionDescription}>
                  View all your transactions.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* CARDS */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/cards")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#f3f0ff",
                  color: "#6847c7",
                }}
              >
                💳
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>My Cards</h3>

                <p style={themeStyles.actionDescription}>
                  Manage your debit and credit cards.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* KYC */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/kyc")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#f0fdf4",
                  color: "#15803d",
                }}
              >
                ✓
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>KYC Verification</h3>

                <p style={themeStyles.actionDescription}>
                  Verify and manage your KYC documents.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* RISK PROFILE */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/risk-profile")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#fff8e7",
                  color: "#9a6700",
                }}
              >
                🛡️
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Risk Profile</h3>

                <p style={themeStyles.actionDescription}>
                  View your customer risk assessment.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* ADDRESS VERIFICATION */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/address-verification")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef7f5",
                  color: "#16806b",
                }}
              >
                📍
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Address Verification</h3>

                <p style={themeStyles.actionDescription}>
                  Verify and manage your registered address.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>
            {/* DUPLICATE KYC */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/duplicate-kyc")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#f5efff",
                  color: "#7c3aed",
                }}
              >
                🛡️
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Duplicate KYC</h3>

                <p style={themeStyles.actionDescription}>
                  Check KYC document duplication.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>
            {/* JOINT ACCOUNT */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/joint-account")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                👥
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Joint Account</h3>

                <p style={themeStyles.actionDescription}>
                  Manage your joint bank accounts.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>
            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/customer-relationship-history")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                🔗
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Relationship History</h3>

                <p style={themeStyles.actionDescription}>
                  View your customer relationship history.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>
            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/biometric-verification")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                🛡️
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Biometric Verification</h3>

                <p style={themeStyles.actionDescription}>
                  Manage your biometric verification.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>
            {/*AMLCHECK*/}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/aml-check")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                ✓
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>AML Check</h3>

                <p style={themeStyles.actionDescription}>
                  Anti-Money Laundering screening & compliance
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>
            {/* NOMINEE */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/nominee")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#f5f3ff",
                  color: "#6d4cc2",
                }}
              >
                ♙
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Nominee Management</h3>

                <p style={themeStyles.actionDescription}>
                  Add and manage your nominees.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* BENEFICIARIES */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/beneficiaries")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                👥
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Beneficiaries</h3>

                <p style={themeStyles.actionDescription}>
                  Add and manage your beneficiaries.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* ACCOUNT MANAGEMENT */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/accounts")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                🏦
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Account Management</h3>

                <p style={themeStyles.actionDescription}>
                  Manage accounts, balance, statements and account services.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* PROFILE */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/profile")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                👤
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Profile & Account</h3>

                <p style={themeStyles.actionDescription}>
                  View and manage your account details.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* SETTINGS */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/settings")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#f5f3ff",
                  color: "#7956b8",
                }}
              >
                ⚙️
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Settings</h3>

                <p style={themeStyles.actionDescription}>
                  Manage security and preferences.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* LOAN MANAGEMENT */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/loans")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#fff7e8",
                  color: "#9a6700",
                }}
              >
                💰
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Loan Management</h3>

                <p style={themeStyles.actionDescription}>
                  Apply for loans and manage your repayments.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* INVESTMENT & WEALTH MANAGEMENT */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/investments")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                📈
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>
                  Investment & Wealth Management
                </h3>

                <p style={themeStyles.actionDescription}>
                  Manage mutual funds, FD, SIP, bonds, gold and your portfolio.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* SECURITY CENTER */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/security-center")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#fff1f2",
                  color: "#c0263e",
                }}
              >
                🛡️
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Security Center</h3>

                <p style={themeStyles.actionDescription}>
                  Monitor fraud alerts, risk score and account security.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* CUSTOMER SERVICE */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/customer-service")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef7f5",
                  color: "#16806b",
                }}
              >
                💬
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Customer Service</h3>

                <p style={themeStyles.actionDescription}>
                  Raise complaints, service requests, appointments and get
                  support.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() => navigate("/notifications")}
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                🔔
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>Notifications</h3>

                <p style={themeStyles.actionDescription}>
                  View alerts, banking updates and important notifications.
                </p>
              </div>

              {unreadNotificationCount > 0 && (
                <span style={themeStyles.notificationBadge}>
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}

              <span style={themeStyles.actionArrow}>→</span>
            </button>

            {/* VIEW ACTIVITY */}

            <button
              type="button"
              style={themeStyles.actionCard}
              onClick={() =>
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                })
              }
            >
              <div
                style={{
                  ...themeStyles.actionIcon,
                  background: "#eef4ff",
                  color: "#2457c6",
                }}
              >
                📊
              </div>

              <div style={themeStyles.actionText}>
                <h3 style={themeStyles.actionTitle}>View Activity</h3>

                <p style={themeStyles.actionDescription}>
                  Check your recent transactions.
                </p>
              </div>

              <span style={themeStyles.actionArrow}>→</span>
            </button>
          </div>
        </section>

        {/* ================= RECENT ACTIVITY ================= */}

        <section style={themeStyles.section}>
          <div style={themeStyles.sectionHeader}>
            <div>
              <p style={themeStyles.sectionEyebrow}>TRANSACTIONS</p>

              <h2 style={themeStyles.sectionTitle}>Recent Activity</h2>
            </div>

            <div style={themeStyles.transactionCount}>
              {totalTransactions} total
            </div>
          </div>

          <div style={themeStyles.activityCard}>
            {transactionLoading ? (
              <div style={themeStyles.activityLoading}>
                <div style={themeStyles.smallLoader}></div>
                Loading transactions...
              </div>
            ) : recentTransactions.length === 0 ? (
              <div style={themeStyles.emptyState}>
                <div style={themeStyles.emptyIcon}>📭</div>

                <h3 style={themeStyles.emptyTitle}>No transactions yet</h3>

                <p style={themeStyles.emptyText}>
                  Your recent transactions will appear here.
                </p>

                <button
                  style={themeStyles.emptyButton}
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
                      className="dashboard-transaction-row"
                      style={{
                        ...themeStyles.transactionRow,
                        borderBottom:
                          index === recentTransactions.length - 1
                            ? "none"
                            : "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          ...themeStyles.transactionIcon,
                          background: isSent ? "#fff1f1" : "#ecfdf5",
                          color: isSent ? "#d63c3c" : "#119463",
                        }}
                      >
                        {isSent ? "↑" : "↓"}
                      </div>

                      <div style={themeStyles.transactionInfo}>
                        <h3 style={themeStyles.transactionTitle}>
                          {isSent ? "Money Sent" : "Money Received"}
                        </h3>

                        <p style={themeStyles.transactionAccount}>
                          {isSent ? "To" : "From"} Account{" "}
                          {otherAccount || "N/A"}
                        </p>

                        <p style={themeStyles.transactionDate}>
                          {formatDate(transaction.transactionDate)}

                          {formatTime(transaction.transactionDate) &&
                            ` • ${formatTime(transaction.transactionDate)}`}
                        </p>
                      </div>

                      <div style={themeStyles.transactionAmountBox}>
                        <p
                          style={{
                            ...themeStyles.transactionAmount,
                            color: isSent ? "#d63c3c" : "#119463",
                          }}
                        >
                          {isSent ? "-" : "+"}₹
                          {formatCurrency(transaction.amount)}
                        </p>

                        <span style={themeStyles.successStatus}>
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

        <section style={themeStyles.section}>
          <div style={themeStyles.sectionHeader}>
            <div>
              <p style={themeStyles.sectionEyebrow}>PROFILE</p>

              <h2 style={themeStyles.sectionTitle}>Account Information</h2>
            </div>
          </div>

          <div className="dashboard-profile-card" style={themeStyles.profileCard}>
            <div className="dashboard-profile-top" style={themeStyles.profileTop}>
              <div style={themeStyles.avatar}>
                {customer?.fullName?.charAt(0)?.toUpperCase() || "C"}
              </div>

              <div>
                <h3 style={themeStyles.profileName}>
                  {customer?.fullName || "Customer"}
                </h3>

                <p style={themeStyles.profileEmail}>
                  {customer?.email || "Email unavailable"}
                </p>
              </div>

              <div style={themeStyles.profileStatus}>
                ● {customer?.status || "ACTIVE"}
              </div>
            </div>

            <div className="dashboard-profile-grid" style={themeStyles.profileGrid}>
              <div style={themeStyles.profileItem}>
                <p style={themeStyles.profileLabel}>FULL NAME</p>

                <p style={themeStyles.profileValue}>
                  {customer?.fullName || "N/A"}
                </p>
              </div>

              <div style={themeStyles.profileItem}>
                <p style={themeStyles.profileLabel}>EMAIL</p>

                <p style={themeStyles.profileValue}>
                  {customer?.email || "N/A"}
                </p>
              </div>

              <div style={themeStyles.profileItem}>
                <p style={themeStyles.profileLabel}>PHONE</p>

                <p style={themeStyles.profileValue}>
                  {customer?.phone || "N/A"}
                </p>
              </div>

              <div style={themeStyles.profileItem}>
                <p style={themeStyles.profileLabel}>ACCOUNT NUMBER</p>

                <p style={themeStyles.profileValue}>
                  {customer?.accountNumber || "N/A"}
                </p>
              </div>

              <div style={themeStyles.profileItem}>
                <p style={themeStyles.profileLabel}>ACCOUNT TYPE</p>

                <p style={themeStyles.profileValue}>
                  {customer?.accountType || "N/A"}
                </p>
              </div>

              <div style={themeStyles.profileItem}>
                <p style={themeStyles.profileLabel}>CUSTOMER SINCE</p>

                <p style={themeStyles.profileValue}>
                  {formatDate(customer?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* ================= FOOTER ================= */}
      <footer className="dashboard-footer" style={themeStyles.footer}>
        <div>© {new Date().getFullYear()} Avani Bank</div>

        <div>Secure • Reliable • Digital Banking</div>
      </footer>
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const themeStylesBase = {
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

  themeToggle: {
    border: "1px solid #e1e6ef",
    background: "#ffffff",
    color: "#4b5870",
    borderRadius: "9px",
    padding: "8px 11px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  themeToggleIcon: {
    fontSize: "13px",
    lineHeight: 1,
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
// DARK MODE OVERRIDES
// =====================================================

const darkThemeOverrides = {
  page: {
    background: "#0b1220",
    color: "#e7edf7",
  },
  navbar: {
    background: "#111a2b",
    borderBottom: "1px solid #26344b",
  },
  brandName: { color: "#f4f7fb" },
  brandSubtitle: { color: "#8d9ab0" },
  themeToggle: {
    background: "#182337",
    border: "1px solid #30405a",
    color: "#e7edf7",
  },
  logoutButton: {
    background: "#182337",
    border: "1px solid #30405a",
    color: "#e7edf7",
  },
  greetingSmall: { color: "#66a0ff" },
  greetingTitle: { color: "#f3f6fb" },
  greetingSubtitle: { color: "#96a3b8" },
  accountMiniCard: {
    background: "#111a2b",
    border: "1px solid #26344b",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  },
  accountMiniIcon: { background: "#1a2942" },
  miniLabel: { color: "#8190a8" },
  miniValue: { color: "#e7edf7" },
  warningBox: {
    background: "#2b2414",
    border: "1px solid #5a4820",
    color: "#f0c969",
  },
  statCard: {
    background: "#111a2b",
    border: "1px solid #26344b",
    boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
  },
  statLabel: { color: "#8290a8" },
  statValue: { color: "#f0f4fa" },
  statSubtext: { color: "#8491a6" },
  sectionEyebrow: { color: "#7199df" },
  sectionTitle: { color: "#f0f4fa" },
  actionCard: {
    background: "#111a2b",
    border: "1px solid #26344b",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
  },
  actionTitle: { color: "#eaf0f8" },
  actionDescription: { color: "#8491a6" },
  actionArrow: { color: "#6ea0ff" },
  notificationBadge: { background: "#3269d6" },
  transactionCount: {
    background: "#1a2942",
    color: "#9bb7ea",
  },
  activityCard: {
    background: "#111a2b",
    border: "1px solid #26344b",
    boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
  },
  transactionTitle: { color: "#e8eef7" },
  transactionAccount: { color: "#8794a9" },
  transactionDate: { color: "#707e94" },
  activityLoading: { color: "#9aa7ba" },
  emptyIcon: { background: "#1a2538" },
  emptyTitle: { color: "#e6ecf5" },
  emptyText: { color: "#8794a9" },
  profileCard: {
    background: "#111a2b",
    border: "1px solid #26344b",
    boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
  },
  profileTop: { borderBottom: "1px solid #26344b" },
  profileName: { color: "#e8eef7" },
  profileEmail: { color: "#8794a9" },
  profileLabel: { color: "#78869b" },
  profileValue: { color: "#dce5f1" },
  footer: {
    background: "#111a2b",
    borderTop: "1px solid #26344b",
    color: "#7f8ca0",
  },
  loadingPage: {
    background: "linear-gradient(135deg, #0b1220, #111a2b)",
  },
  loadingCard: {
    background: "#111a2b",
    boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
  },
  loadingTitle: { color: "#e8eef7" },
  loadingText: { color: "#8997ac" },
  loader: {
    border: "3px solid #26344b",
    borderTop: "3px solid #4f8df7",
  },
  errorCard: {
    background: "#111a2b",
    boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
  },
  errorTitle: { color: "#e8eef7" },
  errorText: { color: "#9aa7ba" },
};

const darkStyles = Object.fromEntries(
  Object.entries(themeStylesBase).map(([key, value]) => [
    key,
    { ...value, ...(darkThemeOverrides[key] || {}) },
  ]),
);

// =====================================================
// GLOBAL ANIMATION
// =====================================================

const styleSheet = document.createElement("style");

styleSheet.innerHTML = `
  .dashboard-dark-mode button:hover {
    filter: brightness(1.08);
  }

  .dashboard-dark-mode .transactionRow {
    border-bottom-color: #26344b !important;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  /* =========================================
     TABLET
     ========================================= */

  @media (max-width: 900px) {

    .dashboard-navbar {
      padding: 12px 4% !important;
      min-height: auto !important;
      flex-wrap: wrap !important;
    }

    .dashboard-nav-right {
      flex-wrap: wrap !important;
      justify-content: flex-end !important;
      gap: 8px !important;
    }

    .dashboard-greeting {
      align-items: stretch !important;
      flex-direction: column !important;
      gap: 16px !important;
    }

    .dashboard-greeting > div:first-child {
      min-width: 0 !important;
    }

    .dashboard-balance {
      flex-direction: column !important;
      align-items: flex-start !important;
    }

    .dashboard-balance-right {
      width: 100% !important;
      text-align: left !important;
      padding-top: 4px !important;
    }

    .dashboard-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .dashboard-actions {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    .dashboard-profile-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }


  /* =========================================
     MOBILE
     ========================================= */

  @media (max-width: 600px) {

    .dashboard-page {
      width: 100% !important;
      overflow-x: hidden !important;
    }

    .dashboard-navbar {
      padding: 12px 16px !important;
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 12px !important;
    }

    .dashboard-nav-right {
      width: 100% !important;
      justify-content: space-between !important;
      gap: 7px !important;
    }

    .dashboard-nav-right button {
      min-height: 38px !important;
    }

    .dashboard-nav-right > div {
      min-height: 38px !important;
      display: flex !important;
      align-items: center !important;
    }

    .dashboard-page main {
      padding: 24px 16px 38px !important;
    }

    .dashboard-greeting {
      margin-bottom: 18px !important;
      gap: 14px !important;
    }

    .dashboard-greeting h1 {
      font-size: 26px !important;
      line-height: 1.2 !important;
      word-break: break-word !important;
    }

    .dashboard-greeting p {
      max-width: 100% !important;
    }

    .dashboard-balance {
      padding: 22px 20px !important;
      border-radius: 17px !important;
      gap: 18px !important;
    }

    .dashboard-balance-left {
      width: 100% !important;
    }

    .dashboard-balance h2 {
      font-size: 27px !important;
      word-break: break-word !important;
    }

    .dashboard-stats {
      grid-template-columns: 1fr !important;
      gap: 11px !important;
    }

    .dashboard-actions {
      grid-template-columns: 1fr !important;
      gap: 10px !important;
    }

    .dashboard-actions button {
      min-height: 82px !important;
      padding: 13px 14px !important;
    }

    .dashboard-actions button > div:nth-child(2) {
      min-width: 0 !important;
    }

    .dashboard-actions button h3,
    .dashboard-actions button p {
      overflow-wrap: anywhere !important;
    }

    .dashboard-profile-grid {
      grid-template-columns: 1fr !important;
      gap: 15px !important;
    }

    .dashboard-profile-top {
      flex-wrap: wrap !important;
    }

    .dashboard-profile-top > div:nth-child(2) {
      min-width: 0 !important;
      flex: 1 !important;
    }

    .dashboard-profile-top > div:last-child {
      margin-left: auto !important;
    }

    .dashboard-transaction-row {
      padding: 14px 13px !important;
      gap: 10px !important;
    }

    .dashboard-transaction-row > div:nth-child(2) {
      min-width: 0 !important;
    }

    .dashboard-transaction-row p {
      overflow-wrap: anywhere !important;
    }

    .dashboard-transaction-row > div:last-child {
      flex-shrink: 0 !important;
    }

    .dashboard-footer {
      padding: 16px !important;
      flex-direction: column !important;
      text-align: center !important;
      gap: 7px !important;
    }
  }


  /* =========================================
     SMALL MOBILE
     ========================================= */

  @media (max-width: 430px) {

    .dashboard-navbar {
      padding: 10px 12px !important;
    }

    .dashboard-nav-right {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
    }

    .dashboard-nav-right > div {
      grid-column: 1 / -1 !important;
      justify-content: center !important;
    }

    .dashboard-nav-right button {
      width: 100% !important;
      justify-content: center !important;
    }

    .dashboard-page main {
      padding: 20px 12px 32px !important;
    }

    .dashboard-greeting h1 {
      font-size: 23px !important;
    }

    .dashboard-greeting small {
      font-size: 16px !important;
    }

    .dashboard-greeting p {
      font-size: 11px !important;
      line-height: 1.5 !important;
    }

    .dashboard-balance {
      padding: 19px 17px !important;
    }

    .dashboard-balance h2 {
      font-size: 24px !important;
    }

    .dashboard-balance-left {
      gap: 12px !important;
    }

    .dashboard-balance-left > div:first-child {
      width: 46px !important;
      height: 46px !important;
      min-width: 46px !important;
      font-size: 21px !important;
    }

    .dashboard-actions button {
      min-height: 78px !important;
    }

    .dashboard-actions button > div:first-child {
      width: 42px !important;
      min-width: 42px !important;
      height: 42px !important;
    }

    .dashboard-transaction-row {
      align-items: flex-start !important;
    }

    .dashboard-transaction-row > div:first-child {
      width: 36px !important;
      min-width: 36px !important;
      height: 36px !important;
    }

    .dashboard-transaction-row > div:last-child {
      text-align: right !important;
    }

    .dashboard-transaction-row > div:last-child p {
      font-size: 12px !important;
    }

    .dashboard-profile-card {
      padding: 17px !important;
    }
  }


  /* =========================================
     VERY SMALL MOBILE
     ========================================= */

  @media (max-width: 360px) {

    .dashboard-navbar {
      padding: 9px 10px !important;
    }

    .dashboard-page main {
      padding-left: 10px !important;
      padding-right: 10px !important;
    }

    .dashboard-greeting h1 {
      font-size: 21px !important;
    }

    .dashboard-balance {
      padding: 17px 14px !important;
    }

    .dashboard-balance h2 {
      font-size: 22px !important;
    }

    .dashboard-actions button {
      padding: 12px !important;
    }

    .dashboard-actions button h3 {
      font-size: 12px !important;
    }

    .dashboard-actions button p {
      font-size: 9px !important;
    }

    .dashboard-transaction-row {
      padding: 12px 10px !important;
    }

    .dashboard-transaction-row > div:last-child {
      max-width: 105px !important;
    }

    .dashboard-transaction-row > div:last-child p {
      font-size: 11px !important;
    }

    .dashboard-profile-top {
      align-items: flex-start !important;
    }

    .dashboard-profile-top > div:last-child {
      width: 100% !important;
      margin-left: 0 !important;
    }
  }
`;

if (!document.head.contains(styleSheet)) {
  document.head.appendChild(styleSheet);
}

export default Dashboard;
