import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("jwtToken") ||
  localStorage.getItem("accessToken");

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

const getPercentage = (value, total) => {
  if (!total || total <= 0) return 0;
  return (Number(value || 0) / total) * 100;
};

function PortfolioDashboard() {
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/portfolio/summary`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        setError("Session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load portfolio data.");
      }

      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      console.error("Portfolio error:", err);
      setError(
        err.message || "Unable to load portfolio data."
      );
    } finally {
      setLoading(false);
    }
  };

  const allocation = useMemo(() => {
    if (!portfolio) return [];

    return [
      {
        name: "Fixed Deposits",
        shortName: "FD",
        value: Number(portfolio.fixedDepositValue || 0),
        icon: "🏦",
        className: "fd",
        route: "/investments/fixed-deposit",
      },
      {
        name: "SIPs",
        shortName: "SIP",
        value: Number(portfolio.sipValue || 0),
        icon: "📈",
        className: "sip",
        route: "/investments/sip",
      },
      {
        name: "Bonds",
        shortName: "Bonds",
        value: Number(portfolio.bondValue || 0),
        icon: "📜",
        className: "bond",
        route: "/investments/bonds",
      },
      {
        name: "Gold",
        shortName: "Gold",
        value: Number(portfolio.goldValue || 0),
        icon: "🪙",
        className: "gold",
        route: "/investments/gold",
      },
      {
        name: "Mutual Funds",
        shortName: "MF",
        value: Number(portfolio.mutualFundValue || 0),
        icon: "📊",
        className: "mf",
        route: "/investments/mutual-funds",
      },
    ];
  }, [portfolio]);

  const totalAllocation = useMemo(() => {
    return allocation.reduce(
      (sum, item) => sum + item.value,
      0
    );
  }, [allocation]);

  const donutGradient = useMemo(() => {
    if (!allocation.length || totalAllocation <= 0) {
      return "conic-gradient(#e5e7eb 0deg 360deg)";
    }

    const segments = [];
    let currentDegree = 0;

    const segmentColors = [
      "#2563eb",
      "#10b981",
      "#8b5cf6",
      "#f59e0b",
      "#ec4899",
    ];

    allocation.forEach((item, index) => {
      if (item.value <= 0) return;

      const percentage =
        (item.value / totalAllocation) * 100;

      const degree =
        (percentage / 100) * 360;

      const start = currentDegree;
      const end = currentDegree + degree;

      segments.push(
        `${segmentColors[index]} ${start}deg ${end}deg`
      );

      currentDegree = end;
    });

    if (segments.length === 0) {
      return "conic-gradient(#e5e7eb 0deg 360deg)";
    }

    return `conic-gradient(${segments.join(", ")})`;
  }, [allocation, totalAllocation]);

  const profitLoss = Number(
    portfolio?.totalProfitLoss || 0
  );

  const isProfit = profitLoss >= 0;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <div style={styles.headerTitle}>
              Portfolio Dashboard
            </div>
            <div style={styles.headerSubtitle}>
              Track, analyze and grow your investments
            </div>
          </div>

          <button
            style={styles.backButton}
            onClick={() => navigate("/investments")}
          >
            ← Investments
          </button>
        </div>

        <div style={styles.loaderContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>
            Loading your portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <div style={styles.headerTitle}>
              Portfolio Dashboard
            </div>
            <div style={styles.headerSubtitle}>
              Track, analyze and grow your investments
            </div>
          </div>

          <button
            style={styles.backButton}
            onClick={() => navigate("/investments")}
          >
            ← Back to Investments
          </button>
        </div>

        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>

          <h2>Unable to load portfolio</h2>

          <p>{error}</p>

          <button
            style={styles.retryButton}
            onClick={fetchPortfolio}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>📊</div>

          <div>
            <div style={styles.headerTitle}>
              Portfolio Dashboard
            </div>

            <div style={styles.headerSubtitle}>
              Your complete investment portfolio in one place
            </div>
          </div>
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/investments")}
        >
          ← Back to Investments
        </button>
      </header>

      <main style={styles.container}>
        {/* =====================================================
            HERO
        ====================================================== */}

        <section style={styles.heroCard}>
          <div>
            <div style={styles.heroSmall}>
              YOUR WEALTH JOURNEY
            </div>

            <h1 style={styles.heroTitle}>
              Invest today,
              <br />
              grow for tomorrow.
            </h1>

            <p style={styles.heroText}>
              Keep track of your investments, returns and
              portfolio allocation from one dashboard.
            </p>
          </div>

          <div style={styles.heroCircle}>
            <div style={styles.heroCircleInner}>
              <span>PORTFOLIO</span>
              <strong>LIVE</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <section style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryTop}>
              <div
                style={{
                  ...styles.summaryIcon,
                  background: "#eef4ff",
                  color: "#2563eb",
                }}
              >
                💰
              </div>

              <span style={styles.cardLabel}>
                Total Invested
              </span>
            </div>

            <div style={styles.summaryValue}>
              {formatCurrency(portfolio?.totalInvested)}
            </div>

            <div style={styles.summaryBottom}>
              Capital deployed
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryTop}>
              <div
                style={{
                  ...styles.summaryIcon,
                  background: "#ecfdf5",
                  color: "#059669",
                }}
              >
                📈
              </div>

              <span style={styles.cardLabel}>
                Current Value
              </span>
            </div>

            <div style={styles.summaryValue}>
              {formatCurrency(portfolio?.currentValue)}
            </div>

            <div style={styles.positiveText}>
              ● Live portfolio value
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryTop}>
              <div
                style={{
                  ...styles.summaryIcon,
                  background: isProfit
                    ? "#ecfdf5"
                    : "#fef2f2",
                  color: isProfit
                    ? "#059669"
                    : "#dc2626",
                }}
              >
                {isProfit ? "↗" : "↘"}
              </div>

              <span style={styles.cardLabel}>
                Profit / Loss
              </span>
            </div>

            <div
              style={{
                ...styles.summaryValue,
                color: isProfit
                  ? "#059669"
                  : "#dc2626",
              }}
            >
              {isProfit ? "+" : ""}
              {formatCurrency(profitLoss)}
            </div>

            <div
              style={{
                ...styles.summaryBottom,
                color: isProfit
                  ? "#059669"
                  : "#dc2626",
              }}
            >
              {isProfit
                ? "Portfolio is in profit"
                : "Portfolio is in loss"}
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryTop}>
              <div
                style={{
                  ...styles.summaryIcon,
                  background: "#fff7ed",
                  color: "#ea580c",
                }}
              >
                %
              </div>

              <span style={styles.cardLabel}>
                Overall Return
              </span>
            </div>

            <div
              style={{
                ...styles.summaryValue,
                color:
                  Number(
                    portfolio?.returnPercentage || 0
                  ) >= 0
                    ? "#059669"
                    : "#dc2626",
              }}
            >
              {Number(
                portfolio?.returnPercentage || 0
              ) >= 0
                ? "+"
                : ""}
              {formatNumber(
                portfolio?.returnPercentage
              )}
              %
            </div>

            <div style={styles.summaryBottom}>
              Portfolio performance
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryTop}>
              <div
                style={{
                  ...styles.summaryIcon,
                  background: "#f5f3ff",
                  color: "#7c3aed",
                }}
              >
                ◉
              </div>

              <span style={styles.cardLabel}>
                Active Investments
              </span>
            </div>

            <div style={styles.summaryValue}>
              {portfolio?.activeInvestments || 0}
            </div>

            <div style={styles.summaryBottom}>
              Across investment products
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN ANALYTICS
        ====================================================== */}

        <section style={styles.mainGrid}>
          {/* =================================================
              LIVE DONUT
          ================================================== */}

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>
                  Portfolio Allocation
                </h2>

                <p style={styles.panelSubtitle}>
                  Live distribution of your current portfolio
                </p>
              </div>

              <div style={styles.liveBadge}>
                <span style={styles.liveDot}></span>
                LIVE
              </div>
            </div>

            <div style={styles.allocationContent}>
              <div style={styles.donutWrapper}>
                <div
                  style={{
                    ...styles.donut,
                    background: donutGradient,
                  }}
                >
                  <div style={styles.donutCenter}>
                    <span style={styles.donutLabel}>
                      Current Value
                    </span>

                    <strong style={styles.donutValue}>
                      {formatCurrency(
                        portfolio?.currentValue
                      )}
                    </strong>
                  </div>
                </div>

                <div style={styles.donutCaption}>
                  Updated from your live investment data
                </div>
              </div>

              <div style={styles.legend}>
                {allocation.map((item, index) => {
                  const percentage =
                    getPercentage(
                      item.value,
                      totalAllocation
                    );

                  const dotColors = [
                    "#2563eb",
                    "#10b981",
                    "#8b5cf6",
                    "#f59e0b",
                    "#ec4899",
                  ];

                  return (
                    <div
                      key={item.name}
                      style={styles.legendRow}
                      onClick={() => {
                        if (item.value > 0) {
                          navigate(item.route);
                        }
                      }}
                    >
                      <div style={styles.legendLeft}>
                        <span
                          style={{
                            ...styles.legendDot,
                            background:
                              dotColors[index],
                          }}
                        />

                        <span style={styles.legendIcon}>
                          {item.icon}
                        </span>

                        <span>
                          {item.name}
                        </span>
                      </div>

                      <div style={styles.legendRight}>
                        <strong>
                          {percentage.toFixed(1)}%
                        </strong>

                        <span>
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =================================================
              CIRCULAR RETURN
          ================================================== */}

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>
                  Portfolio Performance
                </h2>

                <p style={styles.panelSubtitle}>
                  Your overall investment return
                </p>
              </div>

              <div style={styles.performanceIcon}>
                ↗
              </div>
            </div>

            <div style={styles.performanceContent}>
              <div
                style={{
                  ...styles.returnCircle,
                  background:
                    Number(
                      portfolio?.returnPercentage || 0
                    ) >= 0
                      ? "conic-gradient(#10b981 0deg, #10b981 270deg, #e8f5ef 270deg, #e8f5ef 360deg)"
                      : "conic-gradient(#ef4444 0deg, #ef4444 90deg, #fee2e2 90deg, #fee2e2 360deg)",
                }}
              >
                <div style={styles.returnCircleInner}>
                  <span>RETURN</span>

                  <strong>
                    {Number(
                      portfolio?.returnPercentage || 0
                    ).toFixed(2)}
                    %
                  </strong>
                </div>
              </div>

              <div style={styles.performanceStats}>
                <div style={styles.performanceStat}>
                  <span>Invested</span>
                  <strong>
                    {formatCurrency(
                      portfolio?.totalInvested
                    )}
                  </strong>
                </div>

                <div style={styles.performanceStat}>
                  <span>Current Value</span>
                  <strong>
                    {formatCurrency(
                      portfolio?.currentValue
                    )}
                  </strong>
                </div>

                <div style={styles.performanceStat}>
                  <span>Net Gain</span>
                  <strong
                    style={{
                      color: isProfit
                        ? "#059669"
                        : "#dc2626",
                    }}
                  >
                    {isProfit ? "+" : ""}
                    {formatCurrency(profitLoss)}
                  </strong>
                </div>
              </div>
            </div>

            <div style={styles.performanceMessage}>
              {isProfit
                ? "Your portfolio is currently growing. Keep investing consistently for long-term wealth creation."
                : "Review your portfolio allocation and investment strategy."}
            </div>
          </div>
        </section>

        {/* =====================================================
            INVESTMENT BREAKDOWN
        ====================================================== */}

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>
                Investment Breakdown
              </h2>

              <p style={styles.panelSubtitle}>
                Explore each investment category
              </p>
            </div>

            <button
              style={styles.refreshButton}
              onClick={fetchPortfolio}
            >
              ↻ Refresh
            </button>
          </div>

          <div style={styles.breakdownGrid}>
            {allocation.map((item) => {
              const percentage =
                getPercentage(
                  item.value,
                  totalAllocation
                );

              return (
                <div
                  key={item.name}
                  style={styles.breakdownCard}
                  onClick={() => {
                    navigate(item.route);
                  }}
                >
                  <div
                    style={{
                      ...styles.breakdownIcon,
                      background:
                        item.className === "fd"
                          ? "#eef4ff"
                          : item.className === "sip"
                          ? "#ecfdf5"
                          : item.className === "bond"
                          ? "#f5f3ff"
                          : item.className === "gold"
                          ? "#fff7ed"
                          : "#fdf2f8",
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={styles.breakdownInfo}>
                    <div style={styles.breakdownName}>
                      {item.name}
                    </div>

                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(
                            percentage,
                            100
                          )}%`,
                          background:
                            item.className === "fd"
                              ? "#2563eb"
                              : item.className === "sip"
                              ? "#10b981"
                              : item.className === "bond"
                              ? "#8b5cf6"
                              : item.className === "gold"
                              ? "#f59e0b"
                              : "#ec4899",
                        }}
                      />
                    </div>
                  </div>

                  <div style={styles.breakdownValue}>
                    <strong>
                      {formatCurrency(item.value)}
                    </strong>

                    <span>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  <span style={styles.arrow}>
                    →
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <section style={styles.quickSection}>
          <div>
            <h2 style={styles.quickTitle}>
              Grow Your Portfolio
            </h2>

            <p style={styles.quickSubtitle}>
              Explore more investment opportunities with
              Avani Bank.
            </p>
          </div>

          <div style={styles.quickActions}>
            <button
              style={styles.quickButton}
              onClick={() =>
                navigate("/investments/mutual-funds")
              }
            >
              📊
              <span>
                Explore Mutual Funds
              </span>
              →
            </button>

            <button
              style={styles.quickButton}
              onClick={() =>
                navigate("/investments/sip")
              }
            >
              📈
              <span>
                Start a SIP
              </span>
              →
            </button>

            <button
              style={styles.quickButton}
              onClick={() =>
                navigate("/investments/bonds")
              }
            >
              📜
              <span>
                Invest in Bonds
              </span>
              →
            </button>

            <button
              style={styles.quickButton}
              onClick={() =>
                navigate("/investments/gold")
              }
            >
              🪙
              <span>
                Buy Gold
              </span>
              →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px 32px",
    background: "#ffffff",
    color: "#172033",
    fontFamily:
      "Inter, Segoe UI, Roboto, Arial, sans-serif",
  },

  header: {
    minHeight: "92px",
    padding: "18px 32px",
    borderRadius:"18px",
    background:
      "linear-gradient(135deg, #1557c0 0%, #2878e8 52%, #1e64d5 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxSizing: "border-box",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  headerIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.28)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    boxShadow:
      "0 8px 20px rgba(0,0,0,0.12)",
  },

  headerTitle: {
    fontSize: "26px",
    fontWeight: "750",
    letterSpacing: "-0.4px",
  },

  headerSubtitle: {
    marginTop: "4px",
    fontSize: "13px",
    opacity: 0.88,
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.45)",
    background: "rgba(255,255,255,0.13)",
    color: "#ffffff",
    padding: "11px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "650",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "28px 32px 45px",
  },

  heroCard: {
    minHeight: "190px",
    borderRadius: "22px",
    padding: "30px 34px",
    background:
      "linear-gradient(120deg, #f2f7ff 0%, #ffffff 58%, #eef6ff 100%)",
    border: "1px solid #dbe8fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
    boxSizing: "border-box",
  },

  heroSmall: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
    marginBottom: "10px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.18,
    color: "#13233d",
    letterSpacing: "-0.8px",
  },

  heroText: {
    maxWidth: "570px",
    color: "#667085",
    fontSize: "14px",
    lineHeight: 1.6,
    margin: "12px 0 0",
  },

  heroCircle: {
    width: "145px",
    height: "145px",
    borderRadius: "50%",
    background:
      "conic-gradient(#2563eb, #38bdf8, #8b5cf6, #2563eb)",
    padding: "7px",
    marginRight: "30px",
    boxShadow:
      "0 15px 35px rgba(37,99,235,0.18)",
  },

  heroCircleInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "11px",
    letterSpacing: "1.5px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "20px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "17px",
    padding: "18px",
    boxShadow:
      "0 5px 18px rgba(15,23,42,0.055)",
  },

  summaryTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  summaryIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
  },

  cardLabel: {
    color: "#667085",
    fontSize: "12px",
    fontWeight: "600",
  },

  summaryValue: {
    marginTop: "14px",
    fontSize: "22px",
    fontWeight: "800",
    color: "#172033",
    letterSpacing: "-0.4px",
  },

  summaryBottom: {
    marginTop: "7px",
    color: "#98a2b3",
    fontSize: "11px",
  },

  positiveText: {
    marginTop: "7px",
    color: "#059669",
    fontSize: "11px",
    fontWeight: "600",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "20px",
    marginTop: "20px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "20px",
    padding: "23px",
    boxShadow:
      "0 6px 22px rgba(15,23,42,0.055)",
  },

  panelHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
  },

  panelTitle: {
    margin: 0,
    color: "#172033",
    fontSize: "18px",
    fontWeight: "750",
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#8a94a6",
    fontSize: "12px",
  },

  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "20px",
    background: "#ecfdf5",
    color: "#059669",
    fontSize: "10px",
    fontWeight: "800",
  },

  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#10b981",
    boxShadow:
      "0 0 0 4px rgba(16,185,129,0.12)",
  },

  allocationContent: {
    display: "grid",
    gridTemplateColumns: "minmax(250px, 0.9fr) 1.1fr",
    gap: "20px",
    alignItems: "center",
    marginTop: "20px",
  },

  donutWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  donut: {
    width: "215px",
    height: "215px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 10px 30px rgba(37,99,235,0.10)",
  },

  donutCenter: {
    width: "143px",
    height: "143px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "inset 0 0 0 1px #edf1f6",
  },

  donutLabel: {
    color: "#98a2b3",
    fontSize: "10px",
    fontWeight: "650",
    marginBottom: "6px",
  },

  donutValue: {
    color: "#172033",
    fontSize: "17px",
    fontWeight: "800",
  },

  donutCaption: {
    marginTop: "12px",
    color: "#98a2b3",
    fontSize: "10px",
    textAlign: "center",
  },

  legend: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  legendRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 8px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  legendLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#344054",
    fontSize: "12px",
    fontWeight: "600",
  },

  legendDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },

  legendIcon: {
    fontSize: "15px",
  },

  legendRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#667085",
    fontSize: "11px",
  },

  performanceIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "#ecfdf5",
    color: "#059669",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
  },

  performanceContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    gap: "25px",
    marginTop: "24px",
  },

  returnCircle: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    padding: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  returnCircleInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "inset 0 0 0 1px #edf1f6",
  },

  performanceStats: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  performanceStat: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderBottom: "1px solid #eef1f5",
    paddingBottom: "10px",
  },

  performanceMessage: {
    marginTop: "20px",
    padding: "13px 15px",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#667085",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  refreshButton: {
    border: "1px solid #dbe4f0",
    background: "#ffffff",
    color: "#2563eb",
    borderRadius: "9px",
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  breakdownGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginTop: "20px",
  },

  breakdownCard: {
    display: "grid",
    gridTemplateColumns:
      "45px 1fr 150px 20px",
    alignItems: "center",
    gap: "14px",
    padding: "12px 14px",
    border: "1px solid #edf0f4",
    borderRadius: "13px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  breakdownIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  breakdownInfo: {
    minWidth: 0,
  },

  breakdownName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#344054",
    marginBottom: "8px",
  },

  progressTrack: {
    width: "100%",
    height: "6px",
    background: "#eef1f5",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "20px",
    transition: "width 0.5s ease",
  },

  breakdownValue: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "3px",
  },

  arrow: {
    color: "#98a2b3",
    fontSize: "18px",
  },

  quickSection: {
    marginTop: "20px",
    padding: "22px 24px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f5f9ff, #ffffff)",
    border: "1px solid #dfeafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  quickTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#172033",
  },

  quickSubtitle: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#8a94a6",
  },

  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: "8px",
  },

  quickButton: {
    border: "1px solid #d9e5f8",
    background: "#ffffff",
    color: "#2563eb",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  loaderContainer: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  spinner: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "4px solid #e5edf9",
    borderTopColor: "#2563eb",
    animation: "spin 0.8s linear infinite",
  },

  loadingText: {
    color: "#667085",
    fontSize: "13px",
    marginTop: "14px",
  },

  errorCard: {
    maxWidth: "500px",
    margin: "100px auto",
    textAlign: "center",
    padding: "35px",
    borderRadius: "20px",
    border: "1px solid #e7ebf2",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.06)",
  },

  errorIcon: {
    fontSize: "40px",
  },

  retryButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #1557c0, #2878e8)",
    color: "#ffffff",
    padding: "11px 22px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default PortfolioDashboard;