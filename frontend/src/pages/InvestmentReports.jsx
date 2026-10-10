import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("jwtToken") ||
  localStorage.getItem("accessToken");

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatPercent = (value) => {
  return `${Number(value || 0).toFixed(2)}%`;
};

const getChartColor = (type) => {
  const colors = {
    fd: "#2478e8",
    sip: "#35b779",
    bond: "#8b5cf6",
    gold: "#e8a91a",
    mutual: "#ef6c8f",
  };

  return colors[type] || "#2478e8";
};

function InvestmentReports() {
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

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined"
      ? window.innerWidth > 640 && window.innerWidth <= 1024
      : false
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 640);
      setIsTablet(width > 640 && width <= 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const darkOverrides = {
    page: { background: "#0b1220", color: "#e5edf8" },
    loadingPage: { background: "#0b1220", color: "#e5edf8" },
    loadingText: { color: "#a8b6ca" },
    intro: { color: "#e5edf8" },
    pageTitle: { color: "#f1f5f9" },
    pageDescription: { color: "#a8b6ca" },
    reportDateBox: { background: "#151f30", borderColor: "#2a3a50" },
    reportDateLabel: { color: "#a8b6ca" },
    reportDate: { color: "#dbeafe" },
    summaryCard: { background: "#151f30", borderColor: "#2a3a50", boxShadow: "0 6px 22px rgba(0,0,0,0.18)" },
    summaryTitle: { color: "#a8b6ca" },
    summaryValue: { color: "#f1f5f9" },
    summarySubtitle: { color: "#9aa9bd" },
    countSection: { background: "#111b2b", borderColor: "#29384d", boxShadow: "0 6px 24px rgba(0,0,0,0.16)" },
    sectionTitle: { color: "#f1f5f9" },
    sectionSubtitle: { color: "#a8b6ca" },
    totalCount: { background: "#1b2a3e", color: "#c1cee0" },
    countCard: { background: "#162235", borderColor: "#2a3a50", color: "#e5edf8" },
    countName: { color: "#d1dced" },
    countNumber: { color: "#f1f5f9" },
    countLabel: { color: "#a8b6ca" },
    card: { background: "#111b2b", borderColor: "#29384d", boxShadow: "0 6px 24px rgba(0,0,0,0.16)" },
    performanceNameStrong: { color: "#e5edf8" },
    performanceRow: { borderBottomColor: "#2a3a50" },
    barLabels: { color: "#a8b6ca" },
    barTrack: { background: "#263449" },
    refreshButton: { background: "#192a40", borderColor: "#315078", color: "#8dbbff" },
    tableHeader: { background: "#1b2a3e", color: "#c1cee0" },
    tableRow: { borderBottomColor: "#2a3a50" },
    tableProduct: { color: "#d1dced" },
    tableText: { color: "#c1cee0" },
    totalRow: { background: "#1b2a3e", color: "#e5edf8" },
    noteCard: { background: "#142238", borderColor: "#2b4566" },
    noteTitle: { color: "#dbeafe" },
    noteText: { color: "#b3c2d6" },
    footerQuote: { background: "linear-gradient(135deg, #142238 0%, #111b2b 100%)", borderColor: "#2b4566" },
    quoteText: { color: "#c1cee0" },
    quoteAuthor: { color: "#8dbbff" },
    errorCard: { background: "#151f30", borderColor: "#2a3a50", boxShadow: "0 10px 35px rgba(0,0,0,0.25)" },
    errorTitle: { color: "#f1f5f9" },
    errorText: { color: "#b3c2d6" },
    secondaryButton: { background: "#192a40", borderColor: "#38506d", color: "#dbeafe" },
  };

  const getResponsiveStyle = (key) => ({
    ...styles[key],
    ...(isMobile
      ? responsiveStyles.mobile[key]
      : isTablet
      ? responsiveStyles.tablet[key]
      : {}),
    ...(darkMode ? (darkOverrides[key] || {}) : {}),
  });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH REPORT
  // =========================================================

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/investment-reports`,
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
        throw new Error("Unable to load investment report.");
      }

      const data = await response.json();

      setReport(data);
    } catch (err) {
      console.error("Investment report error:", err);
      setError("Unable to load investment report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // =========================================================
  // INVESTMENT PRODUCTS
  // =========================================================

  const products = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      {
        name: "Fixed Deposits",
        shortName: "FD",
        icon: "🏦",
        type: "fd",
        count: Number(report.fixedDepositCount || 0),
        invested: Number(report.fixedDepositInvested || 0),
        current: Number(
          report.fixedDepositCurrentValue || 0
        ),
        route: "/fixed-deposit",
      },
      {
        name: "SIPs",
        shortName: "SIP",
        icon: "🌱",
        type: "sip",
        count: Number(report.sipCount || 0),
        invested: Number(report.sipInvested || 0),
        current: Number(report.sipCurrentValue || 0),
        route: "/investments/sip",
      },
      {
        name: "Bonds",
        shortName: "BOND",
        icon: "📄",
        type: "bond",
        count: Number(report.bondCount || 0),
        invested: Number(report.bondInvested || 0),
        current: Number(report.bondCurrentValue || 0),
        route: "/investments/bonds",
      },
      {
        name: "Gold",
        shortName: "GOLD",
        icon: "🪙",
        type: "gold",
        count: Number(report.goldCount || 0),
        invested: Number(report.goldInvested || 0),
        current: Number(report.goldCurrentValue || 0),
        route: "/investments/gold",
      },
      {
        name: "Mutual Funds",
        shortName: "MF",
        icon: "📊",
        type: "mutual",
        count: Number(report.mutualFundCount || 0),
        invested: Number(
          report.mutualFundInvested || 0
        ),
        current: Number(
          report.mutualFundCurrentValue || 0
        ),
        route: "/investments/mutual-funds",
      },
    ];
  }, [report]);

  // =========================================================
  // PRODUCT CALCULATIONS
  // =========================================================

  const productData = products.map((product) => {
    const profitLoss =
      product.current - product.invested;

    const returnPercentage =
      product.invested > 0
        ? (profitLoss / product.invested) * 100
        : 0;

    return {
      ...product,
      profitLoss,
      returnPercentage,
    };
  });

  const maxCurrentValue = Math.max(
    ...productData.map((item) => item.current),
    1
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div style={getResponsiveStyle("loadingPage")}>
        <div style={getResponsiveStyle("loader")}></div>

        <p style={getResponsiveStyle("loadingText")}>
          Preparing your investment report...
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div data-theme={darkMode ? "dark" : "light"} style={getResponsiveStyle("page")}>
        <div style={getResponsiveStyle("errorCard")}>
          <div style={getResponsiveStyle("errorIcon")}>⚠️</div>

          <h2 style={getResponsiveStyle("errorTitle")}>
            Report Unavailable
          </h2>

          <p style={getResponsiveStyle("errorText")}>
            {error}
          </p>

          <button
            style={getResponsiveStyle("primaryButton")}
            onClick={fetchReport}
          >
            Try Again
          </button>

          <button
            style={getResponsiveStyle("secondaryButton")}
            onClick={() => navigate("/investments")}
          >
            ← Back to Investments
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div data-theme={darkMode ? "dark" : "light"} style={getResponsiveStyle("page")}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header style={getResponsiveStyle("header")}>

        <div style={getResponsiveStyle("headerLeft")}>

          <div style={getResponsiveStyle("headerIcon")}>
            📑
          </div>

          <div>
            <h1 style={getResponsiveStyle("headerTitle")}>
              Investment Reports
            </h1>

            <p style={getResponsiveStyle("headerSubtitle")}>
              Complete overview of your investment activity
            </p>
          </div>

        </div>

        <button
          style={getResponsiveStyle("backButton")}
          onClick={() => navigate("/investments")}
        >
          ← Investment Page
        </button>

      </header>

      <main style={getResponsiveStyle("container")}>

        {/* ===================================================
            REPORT INTRO
        =================================================== */}

        <section style={getResponsiveStyle("intro")}>

          <div>
            <span style={getResponsiveStyle("overline")}>
              INVESTMENT REPORT
            </span>

            <h2 style={getResponsiveStyle("pageTitle")}>
              Your investment summary
            </h2>

            <p style={getResponsiveStyle("pageDescription")}>
              Review your investments, current values and
              overall performance in one place.
            </p>
          </div>

          <div style={getResponsiveStyle("reportDateBox")}>

            <span style={getResponsiveStyle("reportDateLabel")}>
              Report Generated
            </span>

            <strong style={getResponsiveStyle("reportDate")}>
              {report?.generatedAt
                ? new Date(
                    report.generatedAt
                  ).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Just now"}
            </strong>

          </div>

        </section>

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <section style={getResponsiveStyle("summaryGrid")}>

          <ReportCard
            icon="💰"
            title="Total Invested"
            value={formatCurrency(
              report?.totalInvested
            )}
            subtitle="Across all active investments"
            type="blue"
            darkMode={darkMode}
          />

          <ReportCard
            icon="📈"
            title="Current Value"
            value={formatCurrency(
              report?.currentValue
            )}
            subtitle="Current portfolio valuation"
            type="green"
            darkMode={darkMode}
          />

          <ReportCard
            icon="₹"
            title="Total Profit / Loss"
            value={formatCurrency(
              report?.totalProfitLoss
            )}
            subtitle="Overall portfolio gain/loss"
            type="purple"
            positive={
              Number(report?.totalProfitLoss || 0) >= 0
            }
            darkMode={darkMode}
          />

          <ReportCard
            icon="%"
            title="Overall Return"
            value={formatPercent(
              report?.returnPercentage
            )}
            subtitle="Portfolio return"
            type="orange"
            positive={
              Number(report?.returnPercentage || 0) >= 0
            }
            darkMode={darkMode}
          />

        </section>

        {/* ===================================================
            INVESTMENT COUNTS
        ===================================================== */}

        <section style={getResponsiveStyle("countSection")}>

          <div style={getResponsiveStyle("countHeader")}>

            <div>
              <h3 style={getResponsiveStyle("sectionTitle")}>
                Investment Overview
              </h3>

              <p style={getResponsiveStyle("sectionSubtitle")}>
                Your active investment products
              </p>
            </div>

            <div style={getResponsiveStyle("totalCount")}>
              <span>Total Active</span>

              <strong>
                {report?.activeInvestments || 0}
              </strong>
            </div>

          </div>

          <div style={getResponsiveStyle("countGrid")}>

            {productData.map((product) => (
              <button
                type="button"
                key={product.name}
                style={getResponsiveStyle("countCard")}
                onClick={() =>
                  product.route &&
                  navigate(product.route)
                }
              >

                <div
                  style={{
                    ...styles.productIcon,
                    background:
                      `${getChartColor(
                        product.type
                      )}16`,
                  }}
                >
                  {product.icon}
                </div>

                <div style={getResponsiveStyle("countInfo")}>

                  <span style={getResponsiveStyle("countName")}>
                    {product.name}
                  </span>

                  <strong style={getResponsiveStyle("countNumber")}>
                    {product.count}
                  </strong>

                  <span style={getResponsiveStyle("countLabel")}>
                    {product.count === 1
                      ? "Investment"
                      : "Investments"}
                  </span>

                </div>

              </button>
            ))}

          </div>

        </section>

        {/* ===================================================
            PRODUCT PERFORMANCE
        ===================================================== */}

        <section style={getResponsiveStyle("card")}>

          <div style={getResponsiveStyle("cardHeader")}>

            <div>
              <h3 style={getResponsiveStyle("sectionTitle")}>
                Product-wise Performance
              </h3>

              <p style={getResponsiveStyle("sectionSubtitle")}>
                Invested amount compared with current value
              </p>
            </div>

          </div>

          <div style={getResponsiveStyle("performanceList")}>

            {productData.map((product) => (

              <div
                key={product.name}
                style={getResponsiveStyle("performanceRow")}
              >

                <div style={getResponsiveStyle("performanceName")}>

                  <div
                    style={{
                      ...styles.smallIcon,
                      background:
                        `${getChartColor(
                          product.type
                        )}18`,
                    }}
                  >
                    {product.icon}
                  </div>

                  <div>
                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.count}{" "}
                      {product.count === 1
                        ? "investment"
                        : "investments"}
                    </span>
                  </div>

                </div>

                <div style={getResponsiveStyle("barArea")}>

                  <div style={getResponsiveStyle("barLabels")}>

                    <span>
                      Invested{" "}
                      {formatCurrency(
                        product.invested
                      )}
                    </span>

                    <span>
                      Current{" "}
                      {formatCurrency(
                        product.current
                      )}
                    </span>

                  </div>

                  <div style={getResponsiveStyle("barTrack")}>

                    <div
                      style={{
                        ...styles.barInvested,
                        width:
                          `${Math.min(
                            (product.invested /
                              maxCurrentValue) *
                              100,
                            100
                          )}%`,
                        background:
                          `${getChartColor(
                            product.type
                          )}55`,
                      }}
                    />

                    <div
                      style={{
                        ...styles.barCurrent,
                        width:
                          `${Math.min(
                            (product.current /
                              maxCurrentValue) *
                              100,
                            100
                          )}%`,
                        background:
                          getChartColor(
                            product.type
                          ),
                      }}
                    />

                  </div>

                </div>

                <div style={getResponsiveStyle("returnColumn")}>

                  <strong
                    className={
                      product.profitLoss >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {product.profitLoss >= 0
                      ? "+"
                      : ""}
                    {formatCurrency(
                      product.profitLoss
                    )}
                  </strong>

                  <span
                    className={
                      product.returnPercentage >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {product.returnPercentage >= 0
                      ? "↑"
                      : "↓"}{" "}
                    {formatPercent(
                      product.returnPercentage
                    )}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* ===================================================
            REPORT TABLE
        ===================================================== */}

        <section style={getResponsiveStyle("card")}>

          <div style={getResponsiveStyle("cardHeader")}>

            <div>
              <h3 style={getResponsiveStyle("sectionTitle")}>
                Detailed Investment Report
              </h3>

              <p style={getResponsiveStyle("sectionSubtitle")}>
                Complete product-wise financial summary
              </p>
            </div>

            <button
              style={getResponsiveStyle("refreshButton")}
              onClick={fetchReport}
            >
              ↻ Refresh Report
            </button>

          </div>

          <div style={getResponsiveStyle("tableWrapper")}>

            <div style={getResponsiveStyle("tableHeader")}>

              <span>Investment</span>
              <span>Count</span>
              <span>Invested</span>
              <span>Current Value</span>
              <span>Profit / Loss</span>
              <span>Return</span>

            </div>

            {productData.map((product) => (

              <div
                key={product.name}
                style={getResponsiveStyle("tableRow")}
              >

                <div style={getResponsiveStyle("tableProduct")}>

                  <div
                    style={{
                      ...styles.tableIcon,
                      background:
                        `${getChartColor(
                          product.type
                        )}16`,
                    }}
                  >
                    {product.icon}
                  </div>

                  <strong>
                    {product.name}
                  </strong>

                </div>

                <span style={getResponsiveStyle("tableText")}>
                  {product.count}
                </span>

                <span style={getResponsiveStyle("tableText")}>
                  {formatCurrency(
                    product.invested
                  )}
                </span>

                <span style={getResponsiveStyle("tableText")}>
                  {formatCurrency(
                    product.current
                  )}
                </span>

                <span
                  className={
                    product.profitLoss >= 0
                      ? "positive"
                      : "negative"
                  }
                  style={getResponsiveStyle("tableText")}
                >
                  {product.profitLoss >= 0
                    ? "+"
                    : ""}
                  {formatCurrency(
                    product.profitLoss
                  )}
                </span>

                <span
                  className={
                    product.returnPercentage >= 0
                      ? "positive"
                      : "negative"
                  }
                  style={getResponsiveStyle("tableText")}
                >
                  {formatPercent(
                    product.returnPercentage
                  )}
                </span>

              </div>

            ))}

            {/* TOTAL ROW */}

            <div style={getResponsiveStyle("totalRow")}>

              <strong>
                TOTAL PORTFOLIO
              </strong>

              <strong>
                {report?.totalInvestments || 0}
              </strong>

              <strong>
                {formatCurrency(
                  report?.totalInvested
                )}
              </strong>

              <strong>
                {formatCurrency(
                  report?.currentValue
                )}
              </strong>

              <strong
                className={
                  Number(
                    report?.totalProfitLoss || 0
                  ) >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {Number(
                  report?.totalProfitLoss || 0
                ) >= 0
                  ? "+"
                  : ""}
                {formatCurrency(
                  report?.totalProfitLoss
                )}
              </strong>

              <strong
                className={
                  Number(
                    report?.returnPercentage || 0
                  ) >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {formatPercent(
                  report?.returnPercentage
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* ===================================================
            REPORT NOTE
        ===================================================== */}

        <section style={getResponsiveStyle("noteCard")}>

          <div style={getResponsiveStyle("noteIcon")}>
            💡
          </div>

          <div>

            <h3 style={getResponsiveStyle("noteTitle")}>
              About this report
            </h3>

            <p style={getResponsiveStyle("noteText")}>
              This report is generated using your current
              investment data. Values may change as your
              investments earn interest, mature, or their
              market prices change.
            </p>

          </div>

        </section>

        {/* ===================================================
            FOOTER
        ===================================================== */}

        <div style={getResponsiveStyle("footerQuote")}>
          <span style={getResponsiveStyle("quoteMark")}>
            “
          </span>

          <div>
            <p style={getResponsiveStyle("quoteText")}>
              Invest wisely today,
              <br />
              build confidently for tomorrow.
            </p>

            <span style={getResponsiveStyle("quoteAuthor")}>
              — Avani Bank
            </span>
          </div>
        </div>

      </main>

      {/* =====================================================
          LOCAL STYLE ANIMATION
      ===================================================== */}

      <style>
        {`
          @keyframes reportSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .positive {
            color: #0a9f53 !important;
            font-weight: 800;
          }

          .negative {
            color: #dc3545 !important;
            font-weight: 800;
          }

          button:hover {
            filter: brightness(0.98);
          }

          @media (max-width: 1100px) {
            .report-responsive-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

    </div>
  );
}

// =============================================================
// REPORT CARD
// =============================================================

function ReportCard({
  icon,
  title,
  value,
  subtitle,
  type,
  positive,
  darkMode = false,
}) {
  const iconStyles = {
    blue: {
      background: "#eaf3ff",
      color: "#1771dc",
    },

    green: {
      background: "#e8faf2",
      color: "#0aa363",
    },

    purple: {
      background: "#f2ebff",
      color: "#8b4de8",
    },

    orange: {
      background: "#fff4df",
      color: "#e59a00",
    },
  };

  return (
    <div style={{
      ...styles.summaryCard,
      ...(darkMode ? { background: "#151f30", borderColor: "#2a3a50", boxShadow: "0 6px 22px rgba(0,0,0,0.18)" } : {}),
    }}>

      <div
        style={{
          ...styles.summaryIcon,
          ...(iconStyles[type] || iconStyles.blue),
        }}
      >
        {icon}
      </div>

      <div>

        <span style={{
          ...styles.summaryTitle,
          ...(darkMode ? { color: "#a8b6ca" } : {}),
        }}>
          {title}
        </span>

        <strong
          className={
            positive === true
              ? "positive"
              : positive === false
              ? "negative"
              : ""
          }
          style={{
            ...styles.summaryValue,
            ...(darkMode && positive == null ? { color: "#f1f5f9" } : {}),
          }}
        >
          {value}
        </strong>

        <span style={{
          ...styles.summarySubtitle,
          ...(darkMode ? { color: "#9aa9bd" } : {}),
        }}>
          {subtitle}
        </span>

      </div>

    </div>
  );
}

// =============================================================
// STYLES
// =============================================================

const styles = {
  page: {
    minHeight: "100vh",
    padding: "25px 32px",
    background: "#ffffff",
    color: "#172554",
    fontFamily:
      "Inter, Segoe UI, Arial, sans-serif",
  },

  header: {
    minHeight: "92px",
    padding: "25px 32px",
    borderRadius:"18px",
    background:"linear-gradient(135deg, #1247a6 0%, #1678e8 55%, #2495f5 100%)",
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
    borderRadius: "15px",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  headerTitle: {
    margin: 0,
    fontSize: "27px",
    fontWeight: 650,
  },

  headerSubtitle: {
    margin: "4px 0 0",
    fontSize: "13px",
    opacity: 0.88,
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.55)",
    background: "#ffffff",
    color: "#173b8c",
    padding: "11px 18px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "14px",
  },

  container: {
    width: "100%",
    maxWidth: "1380px",
    margin: "0 auto",
    padding: "28px 30px 50px",
    boxSizing: "border-box",
  },

  intro: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },

  overline: {
    color: "#2478e8",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "2px",
  },

  pageTitle: {
    margin: "6px 0 5px",
    fontSize: "27px",
    fontWeight: 800,
    color: "#132452",
  },

  pageDescription: {
    margin: 0,
    fontSize: "13px",
    color: "#7886a0",
  },

  reportDateBox: {
    padding: "13px 18px",
    border: "1px solid #dfe8f4",
    borderRadius: "11px",
    background: "#f9fbfe",
    minWidth: "200px",
  },

  reportDateLabel: {
    display: "block",
    fontSize: "10px",
    color: "#8995a9",
    marginBottom: "5px",
  },

  reportDate: {
    color: "#31527d",
    fontSize: "12px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "20px",
    
  },

  summaryCard: {
    padding: "20px",
    minHeight: "130px",
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    border: "1px solid #e2e9f3",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow:
      "0 6px 22px rgba(23, 54, 100, 0.07)",
    boxSizing: "border-box",
    marginBottom: "18px", 
  },

  summaryIcon: {
    width: "45px",
    height: "45px",
    minWidth: "45px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: 800,
  },

  summaryTitle: {
    display: "block",
    color: "#71809b",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "7px",
  },

  summaryValue: {
    display: "block",
    color: "#142452",
    fontSize: "22px",
    fontWeight: 800,
    marginBottom: "7px",
  },

  summarySubtitle: {
    display: "block",
    color: "#8b96a9",
    fontSize: "10px",
  },

  countSection: {
    padding: "22px",
    background: "#ffffff",
    border: "1px solid #e2e9f3",
    borderRadius: "17px",
    boxShadow:
      "0 6px 24px rgba(28, 57, 100, 0.06)",
    marginBottom: "20px",
  },

  countHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    color: "#142452",
    fontSize: "18px",
    fontWeight: 800,
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#8591a7",
    fontSize: "12px",
  },

  totalCount: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "8px 13px",
    background: "#f2f7fd",
    borderRadius: "9px",
    color: "#687895",
    fontSize: "11px",
  },

  countGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0, 1fr))",
    gap: "12px",
  },

  countCard: {
    border: "1px solid #e5ebf3",
    background: "#fbfcfe",
    borderRadius: "13px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    cursor: "pointer",
  },

  productIcon: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  countInfo: {
    minWidth: 0,
  },

  countName: {
    display: "block",
    color: "#415273",
    fontSize: "11px",
    fontWeight: 700,
  },

  countNumber: {
    display: "inline-block",
    marginTop: "4px",
    color: "#142452",
    fontSize: "20px",
    fontWeight: 800,
    marginRight: "5px",
  },

  countLabel: {
    color: "#8995a9",
    fontSize: "10px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e9f3",
    borderRadius: "17px",
    padding: "22px",
    boxShadow:
      "0 6px 24px rgba(28, 57, 100, 0.06)",
    marginBottom: "20px",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "20px",
  },

  performanceList: {
    display: "flex",
    flexDirection: "column",
  },

  performanceRow: {
    display: "grid",
    gridTemplateColumns:
      "190px minmax(250px, 1fr) 140px",
    gap: "25px",
    alignItems: "center",
    padding: "15px 5px",
    borderBottom: "1px solid #edf1f6",
  },

  performanceName: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  smallIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
  },

  performanceNameStrong: {
    color: "#26375b",
  },

  barArea: {
    width: "100%",
  },

  barLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "7px",
    color: "#7e8ba2",
    fontSize: "10px",
  },

  barTrack: {
    position: "relative",
    height: "10px",
    background: "#edf2f8",
    borderRadius: "20px",
    overflow: "hidden",
  },

  barInvested: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: "20px",
  },

  barCurrent: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "5px",
    borderRadius: "20px",
    marginTop: "2.5px",
    transition: "width 0.7s ease",
  },

  returnColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
    fontSize: "11px",
  },

  refreshButton: {
    border: "1px solid #bdd5f7",
    background: "#f5faff",
    color: "#176bd8",
    padding: "9px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 700,
  },

  tableWrapper: {
    overflowX: "auto",
  },

  tableHeader: {
    minWidth: "850px",
    display: "grid",
    gridTemplateColumns:
      "2fr 0.7fr 1.25fr 1.3fr 1.25fr 0.9fr",
    gap: "15px",
    padding: "12px 14px",
    background: "#f4f8fd",
    borderRadius: "9px",
    color: "#647493",
    fontSize: "10px",
    fontWeight: 800,
  },

  tableRow: {
    minWidth: "850px",
    display: "grid",
    gridTemplateColumns:
      "2fr 0.7fr 1.25fr 1.3fr 1.25fr 0.9fr",
    gap: "15px",
    alignItems: "center",
    padding: "13px 14px",
    borderBottom: "1px solid #edf1f6",
  },

  tableProduct: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#334565",
    fontSize: "12px",
  },

  tableIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },

  tableText: {
    color: "#4b5c79",
    fontSize: "11px",
    fontWeight: 600,
  },

  totalRow: {
    minWidth: "850px",
    display: "grid",
    gridTemplateColumns:
      "2fr 0.7fr 1.25fr 1.3fr 1.25fr 0.9fr",
    gap: "15px",
    padding: "15px 14px",
    background: "#f8fbff",
    color: "#1c3158",
    fontSize: "11px",
  },

  noteCard: {
    display: "flex",
    gap: "14px",
    padding: "18px 20px",
    background: "#f8fbff",
    border: "1px solid #dce9f8",
    borderRadius: "14px",
    marginBottom: "20px",
  },

  noteIcon: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    borderRadius: "11px",
    background: "#eaf3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  noteTitle: {
    margin: "2px 0 5px",
    color: "#29456e",
    fontSize: "13px",
    fontWeight: 800,
  },

  noteText: {
    margin: 0,
    color: "#75839c",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  footerQuote: {
    padding: "22px 28px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #f3f8ff 0%, #ffffff 100%)",
    border: "1px solid #dce9f8",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  quoteMark: {
    fontSize: "50px",
    color: "#1d78e6",
    lineHeight: 1,
    fontFamily: "Georgia, serif",
  },

  quoteText: {
    margin: 0,
    color: "#4b5e7f",
    fontSize: "14px",
    lineHeight: 1.6,
    fontStyle: "italic",
  },

  quoteAuthor: {
    display: "block",
    marginTop: "6px",
    color: "#176bd8",
    fontSize: "11px",
    fontWeight: 800,
    textAlign: "right",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  loader: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "4px solid #e5eef9",
    borderTopColor: "#1976e8",
    animation:
      "reportSpin 0.8s linear infinite",
  },

  loadingText: {
    marginTop: "14px",
    color: "#71809b",
    fontSize: "13px",
  },

  errorCard: {
    width: "min(450px, calc(100% - 40px))",
    margin: "100px auto",
    padding: "35px",
    textAlign: "center",
    background: "#ffffff",
    border: "1px solid #e3eaf4",
    borderRadius: "18px",
    boxShadow:
      "0 10px 35px rgba(24, 53, 95, 0.09)",
  },

  errorIcon: {
    fontSize: "42px",
  },

  errorTitle: {
    margin: "15px 0 8px",
    color: "#182957",
  },

  errorText: {
    color: "#75829b",
    fontSize: "13px",
    marginBottom: "22px",
  },

  primaryButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #125ac5, #2589ed)",
    color: "#ffffff",
    padding: "11px 22px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: 700,
    marginRight: "8px",
  },

  secondaryButton: {
    border: "1px solid #c9d8eb",
    background: "#ffffff",
    color: "#31547f",
    padding: "10px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: 700,
  },
};

/* =============================================================
   RESPONSIVE OVERRIDES
   Keeps the existing UI/business logic intact while adapting
   layout, spacing and controls for tablet/mobile screens.
============================================================= */

const responsiveStyles = {
  tablet: {
    page: { padding: "18px 20px" },
    header: { padding: "22px 24px" },
    container: { padding: "24px 20px 40px" },
    intro: { alignItems: "flex-start" },
    summaryGrid: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
    countGrid: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
    performanceRow: {
      gridTemplateColumns: "170px minmax(180px, 1fr) 110px",
      gap: "16px",
    },
    card: { padding: "20px" },
    countSection: { padding: "20px" },
  },

  mobile: {
    page: { padding: "10px" },
    header: {
      padding: "18px 16px",
      minHeight: "auto",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "14px",
      borderRadius: "15px",
    },
    headerLeft: { gap: "11px", alignItems: "flex-start" },
    headerIcon: {
      width: "44px",
      height: "44px",
      minWidth: "44px",
      borderRadius: "12px",
      fontSize: "21px",
    },
    headerTitle: { fontSize: "21px" },
    headerSubtitle: { fontSize: "11px", lineHeight: 1.45 },
    backButton: {
      width: "100%",
      padding: "11px 14px",
      fontSize: "13px",
    },
    container: { padding: "20px 4px 35px" },
    intro: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: "14px",
      marginBottom: "18px",
    },
    pageTitle: { fontSize: "22px", lineHeight: 1.25 },
    pageDescription: { fontSize: "12px", lineHeight: 1.55 },
    reportDateBox: {
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      padding: "12px 14px",
    },
    summaryGrid: {
      gridTemplateColumns: "1fr",
      gap: "10px",
      marginBottom: "16px",
    },
    summaryCard: {
      minHeight: "auto",
      padding: "16px",
      marginBottom: 0,
    },
    summaryValue: { fontSize: "20px" },
    countSection: {
      padding: "16px",
      borderRadius: "14px",
      marginBottom: "16px",
    },
    countHeader: {
      alignItems: "flex-start",
      gap: "12px",
      flexDirection: "column",
    },
    sectionTitle: { fontSize: "16px" },
    sectionSubtitle: { fontSize: "11px", lineHeight: 1.45 },
    totalCount: { alignSelf: "flex-start" },
    countGrid: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "9px",
    },
    countCard: {
      padding: "12px 10px",
      gap: "9px",
      minWidth: 0,
    },
    productIcon: {
      width: "36px",
      height: "36px",
      minWidth: "36px",
      fontSize: "16px",
    },
    countName: {
      fontSize: "10px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    countNumber: { fontSize: "18px" },
    card: {
      padding: "16px",
      borderRadius: "14px",
      marginBottom: "16px",
    },
    cardHeader: {
      flexDirection: "column",
      alignItems: "stretch",
      gap: "12px",
      marginBottom: "16px",
    },
    performanceRow: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "12px",
      padding: "14px 2px",
    },
    performanceName: { width: "100%" },
    barArea: { width: "100%" },
    barLabels: {
      fontSize: "9px",
      gap: "10px",
    },
    returnColumn: {
      alignItems: "flex-start",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      gap: "10px",
      fontSize: "10px",
    },
    refreshButton: {
      width: "100%",
      padding: "11px 12px",
      fontSize: "12px",
    },
    tableWrapper: {
      width: "100%",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
    },
    tableHeader: {
      minWidth: "850px",
      fontSize: "9px",
      gap: "10px",
      padding: "11px 10px",
    },
    tableRow: {
      minWidth: "850px",
      gap: "10px",
      padding: "12px 10px",
    },
    tableText: { fontSize: "10px" },
    totalRow: {
      minWidth: "850px",
      gap: "10px",
      padding: "13px 10px",
    },
    noteCard: {
      padding: "15px",
      gap: "11px",
      alignItems: "flex-start",
      marginBottom: "16px",
    },
    noteIcon: {
      width: "36px",
      height: "36px",
      minWidth: "36px",
      fontSize: "17px",
    },
    noteText: { fontSize: "10px", lineHeight: 1.55 },
    footerQuote: {
      padding: "18px 16px",
      gap: "11px",
      alignItems: "flex-start",
    },
    quoteMark: { fontSize: "40px" },
    quoteText: { fontSize: "12px" },
    quoteAuthor: { fontSize: "10px" },
    errorCard: {
      margin: "50px auto",
      padding: "25px 18px",
      width: "calc(100% - 20px)",
      boxSizing: "border-box",
    },
    primaryButton: {
      width: "100%",
      marginRight: 0,
      marginBottom: "10px",
    },
    secondaryButton: { width: "100%" },
    loadingPage: { padding: "20px" },
    loadingText: { textAlign: "center", fontSize: "12px" },
  },
};

export default InvestmentReports;
