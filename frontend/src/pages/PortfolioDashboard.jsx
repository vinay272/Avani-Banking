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
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("avani-theme") === "dark"
  );

  useEffect(() => {
    const syncTheme = () =>
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    window.addEventListener("storage", syncTheme);
    syncTheme();
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  // Responsive layout state
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 640
  );
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined" &&
      window.innerWidth > 640 &&
      window.innerWidth <= 1050
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 640);
      setIsTablet(width > 640 && width <= 1050);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const responsiveStyles = useMemo(() => ({
    page: {
      padding: isMobile ? "10px" : isTablet ? "14px 18px" : "20px 32px",
      overflowX: "hidden",
    },
    header: {
      minHeight: isMobile ? "auto" : "92px",
      padding: isMobile ? "16px" : isTablet ? "18px 22px" : "18px 32px",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "14px" : "20px",
    },
    headerLeft: {
      width: isMobile ? "100%" : "auto",
      minWidth: 0,
    },
    headerIcon: {
      width: isMobile ? "44px" : "50px",
      height: isMobile ? "44px" : "50px",
      minWidth: isMobile ? "44px" : "50px",
      fontSize: isMobile ? "21px" : "25px",
    },
    headerTitle: {
      fontSize: isMobile ? "21px" : isTablet ? "23px" : "26px",
    },
    headerSubtitle: {
      fontSize: isMobile ? "11px" : "13px",
    },
    backButton: {
      width: isMobile ? "100%" : "auto",
      minHeight: "44px",
      justifyContent: "center",
    },
    container: {
      padding: isMobile ? "16px 0 28px" : isTablet ? "22px 0 36px" : "28px 32px 45px",
    },
    heroCard: {
      minHeight: isMobile ? "auto" : "190px",
      padding: isMobile ? "22px 18px" : isTablet ? "25px 24px" : "30px 34px",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      gap: isMobile ? "20px" : "15px",
    },
    heroTitle: {
      fontSize: isMobile ? "25px" : isTablet ? "28px" : "30px",
    },
    heroText: {
      fontSize: isMobile ? "12px" : "14px",
      maxWidth: isMobile ? "100%" : "570px",
    },
    heroCircle: {
      width: isMobile ? "110px" : isTablet ? "125px" : "145px",
      height: isMobile ? "110px" : isTablet ? "125px" : "145px",
      marginRight: isMobile ? "0" : isTablet ? "10px" : "30px",
      alignSelf: isMobile ? "center" : "auto",
    },
    summaryGrid: {
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(5, minmax(0, 1fr))",
      gap: isMobile ? "10px" : "16px",
    },
    summaryCard: {
      padding: isMobile ? "15px" : "18px",
    },
    summaryValue: {
      fontSize: isMobile ? "20px" : "22px",
    },
    mainGrid: {
      gridTemplateColumns: isMobile || isTablet ? "1fr" : "1.1fr 0.9fr",
      gap: isMobile ? "12px" : "20px",
    },
    panel: {
      padding: isMobile ? "16px" : isTablet ? "19px" : "23px",
      borderRadius: isMobile ? "16px" : "20px",
    },
    panelHeader: {
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "stretch" : "flex-start",
    },
    panelTitle: {
      fontSize: isMobile ? "16px" : "18px",
    },
    allocationContent: {
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "minmax(190px, 0.8fr) 1.2fr" : "minmax(250px, 0.9fr) 1.1fr",
      gap: isMobile ? "16px" : "20px",
    },
    donut: {
      width: isMobile ? "175px" : isTablet ? "190px" : "215px",
      height: isMobile ? "175px" : isTablet ? "190px" : "215px",
    },
    donutCenter: {
      width: isMobile ? "116px" : isTablet ? "127px" : "143px",
      height: isMobile ? "116px" : isTablet ? "127px" : "143px",
    },
    donutValue: {
      fontSize: isMobile ? "14px" : "17px",
      textAlign: "center",
    },
    legendRow: {
      padding: isMobile ? "11px 6px" : "10px 8px",
      minHeight: "42px",
    },
    legendLeft: {
      fontSize: isMobile ? "11px" : "12px",
      minWidth: 0,
    },
    legendRight: {
      fontSize: isMobile ? "10px" : "11px",
      gap: isMobile ? "6px" : "10px",
      whiteSpace: "nowrap",
    },
    performanceContent: {
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "20px" : "25px",
      justifyContent: isMobile ? "center" : "space-around",
    },
    returnCircle: {
      width: isMobile ? "155px" : isTablet ? "165px" : "180px",
      height: isMobile ? "155px" : isTablet ? "165px" : "180px",
    },
    performanceStats: {
      width: isMobile ? "100%" : "auto",
    },
    breakdownCard: {
      gridTemplateColumns: isMobile ? "42px 1fr" : isTablet ? "42px 1fr 130px 20px" : "45px 1fr 150px 20px",
      gap: isMobile ? "10px" : "14px",
      padding: isMobile ? "12px 10px" : "12px 14px",
    },
    breakdownValue: {
      gridColumn: isMobile ? "2" : "auto",
      alignItems: isMobile ? "flex-start" : "flex-end",
    },
    arrow: {
      display: isMobile ? "none" : "inline",
    },
    quickSection: {
      padding: isMobile ? "18px 16px" : "22px 24px",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "16px" : "20px",
    },
    quickActions: {
      width: isMobile ? "100%" : "auto",
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
      justifyContent: "stretch",
    },
    quickButton: {
      width: "100%",
      minHeight: "44px",
      justifyContent: "space-between",
      padding: isMobile ? "11px 12px" : "10px 12px",
    },
    errorCard: {
      width: isMobile ? "calc(100% - 4px)" : "auto",
      margin: isMobile ? "40px auto" : "100px auto",
      padding: isMobile ? "24px 18px" : "35px",
      boxSizing: "border-box",
    },
    retryButton: {
      minHeight: "44px",
      width: isMobile ? "100%" : "auto",
    },
  }), [isMobile, isTablet]);

  // Theme overrides are layered over responsive styles; the blue header stays unchanged.
  const themedStyles = useMemo(() => {
    const darkOverrides = {
      page: { background: "#0b1220", color: "#e5e7eb" },
      container: { color: "#e5e7eb" },
      heroCard: {
        background: "linear-gradient(120deg, #172b49 0%, #111c30 58%, #172b49 100%)",
        borderColor: "#2b4264",
      },
      heroTitle: { color: "#f3f6fc" },
      heroText: { color: "#b5c2d6" },
      heroCircleInner: { background: "#111c30", color: "#c4cee0" },
      summaryCard: { background: "#131e30", borderColor: "#28374d", boxShadow: "0 5px 18px rgba(0,0,0,0.18)" },
      cardLabel: { color: "#aab8cc" },
      summaryValue: { color: "#f3f6fc" },
      summaryBottom: { color: "#9aa9bf" },
      panel: { background: "#131e30", borderColor: "#28374d", boxShadow: "0 6px 22px rgba(0,0,0,0.18)" },
      panelTitle: { color: "#f3f6fc" },
      panelSubtitle: { color: "#aab8cc" },
      donutCenter: { background: "#131e30", boxShadow: "inset 0 0 0 1px #34445b" },
      donutLabel: { color: "#aab8cc" },
      donutValue: { color: "#f3f6fc" },
      donutCaption: { color: "#9aa9bf" },
      legendRow: { background: "transparent" },
      legendLeft: { color: "#d8e1ef" },
      legendRight: { color: "#b5c2d6" },
      returnCircleInner: { background: "#131e30", boxShadow: "inset 0 0 0 1px #34445b", color: "#e5e7eb" },
      performanceStat: { borderBottomColor: "#2b394e", color: "#d8e1ef" },
      performanceMessage: { background: "#1a2940", color: "#c4cee0" },
      refreshButton: { background: "#1a2940", borderColor: "#344a68", color: "#93baff" },
      breakdownCard: { borderColor: "#2b394e", background: "#111c2e" },
      breakdownName: { color: "#e2e8f0" },
      progressTrack: { background: "#2b394e" },
      breakdownValue: { color: "#e2e8f0" },
      arrow: { color: "#aab8cc" },
      quickSection: { background: "linear-gradient(135deg, #172b49, #111c30)", borderColor: "#2b4264" },
      quickTitle: { color: "#f3f6fc" },
      quickSubtitle: { color: "#aab8cc" },
      quickButton: { background: "#17263d", borderColor: "#344a68", color: "#a8c8ff" },
      loaderContainer: { color: "#e5e7eb" },
      spinner: { borderColor: "#293b55", borderTopColor: "#60a5fa" },
      loadingText: { color: "#b5c2d6" },
      errorCard: { background: "#131e30", borderColor: "#34445b", color: "#e5e7eb", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" },
    };
    return Object.fromEntries(
      Object.entries(responsiveStyles).map(([key, value]) => [
        key,
        { ...value, ...(darkMode ? (darkOverrides[key] || {}) : {}) },
      ])
    );
  }, [responsiveStyles, darkMode]);


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
      <div style={{ ...styles.page, ...themedStyles.page }}>
        <div style={{ ...styles.header, ...themedStyles.header }}>
          <div>
            <div style={{ ...styles.headerTitle, ...themedStyles.headerTitle }}>
              Portfolio Dashboard
            </div>
            <div style={{ ...styles.headerSubtitle, ...themedStyles.headerSubtitle }}>
              Track, analyze and grow your investments
            </div>
          </div>

          <button
            style={{ ...styles.backButton, ...themedStyles.backButton }}
            onClick={() => navigate("/investments")}
          >
            ← Investments
          </button>
        </div>

        <div style={{ ...styles.loaderContainer, ...themedStyles.loaderContainer }}>
          <div style={{ ...styles.spinner, ...themedStyles.spinner }}></div>
          <p style={{ ...styles.loadingText, ...themedStyles.loadingText }}>
            Loading your portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.page, ...themedStyles.page }}>
        <div style={{ ...styles.header, ...themedStyles.header }}>
          <div>
            <div style={{ ...styles.headerTitle, ...themedStyles.headerTitle }}>
              Portfolio Dashboard
            </div>
            <div style={{ ...styles.headerSubtitle, ...themedStyles.headerSubtitle }}>
              Track, analyze and grow your investments
            </div>
          </div>

          <button
            style={{ ...styles.backButton, ...themedStyles.backButton }}
            onClick={() => navigate("/investments")}
          >
            ← Back to Investments
          </button>
        </div>

        <div style={{ ...styles.errorCard, ...themedStyles.errorCard }}>
          <div style={{ ...styles.errorIcon, ...themedStyles.errorIcon }}>⚠️</div>

          <h2>Unable to load portfolio</h2>

          <p>{error}</p>

          <button
            style={{ ...styles.retryButton, ...themedStyles.retryButton }}
            onClick={fetchPortfolio}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.page, ...themedStyles.page }}>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header style={{ ...styles.header, ...themedStyles.header }}>
        <div style={{ ...styles.headerLeft, ...themedStyles.headerLeft }}>
          <div style={{ ...styles.headerIcon, ...themedStyles.headerIcon }}>📊</div>

          <div>
            <div style={{ ...styles.headerTitle, ...themedStyles.headerTitle }}>
              Portfolio Dashboard
            </div>

            <div style={{ ...styles.headerSubtitle, ...themedStyles.headerSubtitle }}>
              Your complete investment portfolio in one place
            </div>
          </div>
        </div>

        <button
          style={{ ...styles.backButton, ...themedStyles.backButton }}
          onClick={() => navigate("/investments")}
        >
          ← Back to Investments
        </button>
      </header>

      <main style={{ ...styles.container, ...themedStyles.container }}>
        {/* =====================================================
            HERO
        ====================================================== */}

        <section style={{ ...styles.heroCard, ...themedStyles.heroCard }}>
          <div>
            <div style={{ ...styles.heroSmall, ...themedStyles.heroSmall }}>
              YOUR WEALTH JOURNEY
            </div>

            <h1 style={{ ...styles.heroTitle, ...themedStyles.heroTitle }}>
              Invest today,
              <br />
              grow for tomorrow.
            </h1>

            <p style={{ ...styles.heroText, ...themedStyles.heroText }}>
              Keep track of your investments, returns and
              portfolio allocation from one dashboard.
            </p>
          </div>

          <div style={{ ...styles.heroCircle, ...themedStyles.heroCircle }}>
            <div style={{ ...styles.heroCircleInner, ...themedStyles.heroCircleInner }}>
              <span>PORTFOLIO</span>
              <strong>LIVE</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <section style={{ ...styles.summaryGrid, ...themedStyles.summaryGrid }}>
          <div style={{ ...styles.summaryCard, ...themedStyles.summaryCard }}>
            <div style={{ ...styles.summaryTop, ...themedStyles.summaryTop }}>
              <div
                style={{
                  ...styles.summaryIcon,
                  background: "#eef4ff",
                  color: "#2563eb",
                }}
              >
                💰
              </div>

              <span style={{ ...styles.cardLabel, ...themedStyles.cardLabel }}>
                Total Invested
              </span>
            </div>

            <div style={{ ...styles.summaryValue, ...themedStyles.summaryValue }}>
              {formatCurrency(portfolio?.totalInvested)}
            </div>

            <div style={{ ...styles.summaryBottom, ...themedStyles.summaryBottom }}>
              Capital deployed
            </div>
          </div>

          <div style={{ ...styles.summaryCard, ...themedStyles.summaryCard }}>
            <div style={{ ...styles.summaryTop, ...themedStyles.summaryTop }}>
              <div
                style={{
                  ...styles.summaryIcon,
                  background: "#ecfdf5",
                  color: "#059669",
                }}
              >
                📈
              </div>

              <span style={{ ...styles.cardLabel, ...themedStyles.cardLabel }}>
                Current Value
              </span>
            </div>

            <div style={{ ...styles.summaryValue, ...themedStyles.summaryValue }}>
              {formatCurrency(portfolio?.currentValue)}
            </div>

            <div style={{ ...styles.positiveText, ...themedStyles.positiveText }}>
              ● Live portfolio value
            </div>
          </div>

          <div style={{ ...styles.summaryCard, ...themedStyles.summaryCard }}>
            <div style={{ ...styles.summaryTop, ...themedStyles.summaryTop }}>
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

              <span style={{ ...styles.cardLabel, ...themedStyles.cardLabel }}>
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

          <div style={{ ...styles.summaryCard, ...themedStyles.summaryCard }}>
            <div style={{ ...styles.summaryTop, ...themedStyles.summaryTop }}>
              <div
                style={{
                  ...styles.summaryIcon,
                  background: "#fff7ed",
                  color: "#ea580c",
                }}
              >
                %
              </div>

              <span style={{ ...styles.cardLabel, ...themedStyles.cardLabel }}>
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

            <div style={{ ...styles.summaryBottom, ...themedStyles.summaryBottom }}>
              Portfolio performance
            </div>
          </div>

          <div style={{ ...styles.summaryCard, ...themedStyles.summaryCard }}>
            <div style={{ ...styles.summaryTop, ...themedStyles.summaryTop }}>
              <div
                style={{
                  ...styles.summaryIcon,
                  background: "#f5f3ff",
                  color: "#7c3aed",
                }}
              >
                ◉
              </div>

              <span style={{ ...styles.cardLabel, ...themedStyles.cardLabel }}>
                Active Investments
              </span>
            </div>

            <div style={{ ...styles.summaryValue, ...themedStyles.summaryValue }}>
              {portfolio?.activeInvestments || 0}
            </div>

            <div style={{ ...styles.summaryBottom, ...themedStyles.summaryBottom }}>
              Across investment products
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN ANALYTICS
        ====================================================== */}

        <section style={{ ...styles.mainGrid, ...themedStyles.mainGrid }}>
          {/* =================================================
              LIVE DONUT
          ================================================== */}

          <div style={{ ...styles.panel, ...themedStyles.panel }}>
            <div style={{ ...styles.panelHeader, ...themedStyles.panelHeader }}>
              <div>
                <h2 style={{ ...styles.panelTitle, ...themedStyles.panelTitle }}>
                  Portfolio Allocation
                </h2>

                <p style={{ ...styles.panelSubtitle, ...themedStyles.panelSubtitle }}>
                  Live distribution of your current portfolio
                </p>
              </div>

              <div style={{ ...styles.liveBadge, ...themedStyles.liveBadge }}>
                <span style={{ ...styles.liveDot, ...themedStyles.liveDot }}></span>
                LIVE
              </div>
            </div>

            <div style={{ ...styles.allocationContent, ...themedStyles.allocationContent }}>
              <div style={{ ...styles.donutWrapper, ...themedStyles.donutWrapper }}>
                <div
                  style={{
                    ...styles.donut,
                    background: donutGradient,
                  }}
                >
                  <div style={{ ...styles.donutCenter, ...themedStyles.donutCenter }}>
                    <span style={{ ...styles.donutLabel, ...themedStyles.donutLabel }}>
                      Current Value
                    </span>

                    <strong style={{ ...styles.donutValue, ...themedStyles.donutValue }}>
                      {formatCurrency(
                        portfolio?.currentValue
                      )}
                    </strong>
                  </div>
                </div>

                <div style={{ ...styles.donutCaption, ...themedStyles.donutCaption }}>
                  Updated from your live investment data
                </div>
              </div>

              <div style={{ ...styles.legend, ...themedStyles.legend }}>
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
                      style={{ ...styles.legendRow, ...themedStyles.legendRow }}
                      onClick={() => {
                        if (item.value > 0) {
                          navigate(item.route);
                        }
                      }}
                    >
                      <div style={{ ...styles.legendLeft, ...themedStyles.legendLeft }}>
                        <span
                          style={{
                            ...styles.legendDot,
                            background:
                              dotColors[index],
                          }}
                        />

                        <span style={{ ...styles.legendIcon, ...themedStyles.legendIcon }}>
                          {item.icon}
                        </span>

                        <span>
                          {item.name}
                        </span>
                      </div>

                      <div style={{ ...styles.legendRight, ...themedStyles.legendRight }}>
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

          <div style={{ ...styles.panel, ...themedStyles.panel }}>
            <div style={{ ...styles.panelHeader, ...themedStyles.panelHeader }}>
              <div>
                <h2 style={{ ...styles.panelTitle, ...themedStyles.panelTitle }}>
                  Portfolio Performance
                </h2>

                <p style={{ ...styles.panelSubtitle, ...themedStyles.panelSubtitle }}>
                  Your overall investment return
                </p>
              </div>

              <div style={{ ...styles.performanceIcon, ...themedStyles.performanceIcon }}>
                ↗
              </div>
            </div>

            <div style={{ ...styles.performanceContent, ...themedStyles.performanceContent }}>
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
                <div style={{ ...styles.returnCircleInner, ...themedStyles.returnCircleInner }}>
                  <span>RETURN</span>

                  <strong>
                    {Number(
                      portfolio?.returnPercentage || 0
                    ).toFixed(2)}
                    %
                  </strong>
                </div>
              </div>

              <div style={{ ...styles.performanceStats, ...themedStyles.performanceStats }}>
                <div style={{ ...styles.performanceStat, ...themedStyles.performanceStat }}>
                  <span>Invested</span>
                  <strong>
                    {formatCurrency(
                      portfolio?.totalInvested
                    )}
                  </strong>
                </div>

                <div style={{ ...styles.performanceStat, ...themedStyles.performanceStat }}>
                  <span>Current Value</span>
                  <strong>
                    {formatCurrency(
                      portfolio?.currentValue
                    )}
                  </strong>
                </div>

                <div style={{ ...styles.performanceStat, ...themedStyles.performanceStat }}>
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

            <div style={{ ...styles.performanceMessage, ...themedStyles.performanceMessage }}>
              {isProfit
                ? "Your portfolio is currently growing. Keep investing consistently for long-term wealth creation."
                : "Review your portfolio allocation and investment strategy."}
            </div>
          </div>
        </section>

        {/* =====================================================
            INVESTMENT BREAKDOWN
        ====================================================== */}

        <section style={{ ...styles.panel, ...themedStyles.panel }}>
          <div style={{ ...styles.panelHeader, ...themedStyles.panelHeader }}>
            <div>
              <h2 style={{ ...styles.panelTitle, ...themedStyles.panelTitle }}>
                Investment Breakdown
              </h2>

              <p style={{ ...styles.panelSubtitle, ...themedStyles.panelSubtitle }}>
                Explore each investment category
              </p>
            </div>

            <button
              style={{ ...styles.refreshButton, ...themedStyles.refreshButton }}
              onClick={fetchPortfolio}
            >
              ↻ Refresh
            </button>
          </div>

          <div style={{ ...styles.breakdownGrid, ...themedStyles.breakdownGrid }}>
            {allocation.map((item) => {
              const percentage =
                getPercentage(
                  item.value,
                  totalAllocation
                );

              return (
                <div
                  key={item.name}
                  style={{ ...styles.breakdownCard, ...themedStyles.breakdownCard }}
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

                  <div style={{ ...styles.breakdownInfo, ...themedStyles.breakdownInfo }}>
                    <div style={{ ...styles.breakdownName, ...themedStyles.breakdownName }}>
                      {item.name}
                    </div>

                    <div style={{ ...styles.progressTrack, ...themedStyles.progressTrack }}>
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

                  <div style={{ ...styles.breakdownValue, ...themedStyles.breakdownValue }}>
                    <strong>
                      {formatCurrency(item.value)}
                    </strong>

                    <span>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  <span style={{ ...styles.arrow, ...themedStyles.arrow }}>
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

        <section style={{ ...styles.quickSection, ...themedStyles.quickSection }}>
          <div>
            <h2 style={{ ...styles.quickTitle, ...themedStyles.quickTitle }}>
              Grow Your Portfolio
            </h2>

            <p style={{ ...styles.quickSubtitle, ...themedStyles.quickSubtitle }}>
              Explore more investment opportunities with
              Avani Bank.
            </p>
          </div>

          <div style={{ ...styles.quickActions, ...themedStyles.quickActions }}>
            <button
              style={{ ...styles.quickButton, ...themedStyles.quickButton }}
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
              style={{ ...styles.quickButton, ...themedStyles.quickButton }}
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
              style={{ ...styles.quickButton, ...themedStyles.quickButton }}
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
              style={{ ...styles.quickButton, ...themedStyles.quickButton }}
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

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 640px) {
            button {
              -webkit-tap-highlight-color: transparent;
            }
          }
        `}
      </style>
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