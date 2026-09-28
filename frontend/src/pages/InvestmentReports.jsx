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
      <div style={styles.loadingPage}>
        <div style={styles.loader}></div>

        <p style={styles.loadingText}>
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
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>

          <h2 style={styles.errorTitle}>
            Report Unavailable
          </h2>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            style={styles.primaryButton}
            onClick={fetchReport}
          >
            Try Again
          </button>

          <button
            style={styles.secondaryButton}
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
    <div style={styles.page}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header style={styles.header}>

        <div style={styles.headerLeft}>

          <div style={styles.headerIcon}>
            📑
          </div>

          <div>
            <h1 style={styles.headerTitle}>
              Investment Reports
            </h1>

            <p style={styles.headerSubtitle}>
              Complete overview of your investment activity
            </p>
          </div>

        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/investments")}
        >
          ← Investment Page
        </button>

      </header>

      <main style={styles.container}>

        {/* ===================================================
            REPORT INTRO
        =================================================== */}

        <section style={styles.intro}>

          <div>
            <span style={styles.overline}>
              INVESTMENT REPORT
            </span>

            <h2 style={styles.pageTitle}>
              Your investment summary
            </h2>

            <p style={styles.pageDescription}>
              Review your investments, current values and
              overall performance in one place.
            </p>
          </div>

          <div style={styles.reportDateBox}>

            <span style={styles.reportDateLabel}>
              Report Generated
            </span>

            <strong style={styles.reportDate}>
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

        <section style={styles.summaryGrid}>

          <ReportCard
            icon="💰"
            title="Total Invested"
            value={formatCurrency(
              report?.totalInvested
            )}
            subtitle="Across all active investments"
            type="blue"
          />

          <ReportCard
            icon="📈"
            title="Current Value"
            value={formatCurrency(
              report?.currentValue
            )}
            subtitle="Current portfolio valuation"
            type="green"
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
          />

        </section>

        {/* ===================================================
            INVESTMENT COUNTS
        ===================================================== */}

        <section style={styles.countSection}>

          <div style={styles.countHeader}>

            <div>
              <h3 style={styles.sectionTitle}>
                Investment Overview
              </h3>

              <p style={styles.sectionSubtitle}>
                Your active investment products
              </p>
            </div>

            <div style={styles.totalCount}>
              <span>Total Active</span>

              <strong>
                {report?.activeInvestments || 0}
              </strong>
            </div>

          </div>

          <div style={styles.countGrid}>

            {productData.map((product) => (
              <button
                type="button"
                key={product.name}
                style={styles.countCard}
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

                <div style={styles.countInfo}>

                  <span style={styles.countName}>
                    {product.name}
                  </span>

                  <strong style={styles.countNumber}>
                    {product.count}
                  </strong>

                  <span style={styles.countLabel}>
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

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>
              <h3 style={styles.sectionTitle}>
                Product-wise Performance
              </h3>

              <p style={styles.sectionSubtitle}>
                Invested amount compared with current value
              </p>
            </div>

          </div>

          <div style={styles.performanceList}>

            {productData.map((product) => (

              <div
                key={product.name}
                style={styles.performanceRow}
              >

                <div style={styles.performanceName}>

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

                <div style={styles.barArea}>

                  <div style={styles.barLabels}>

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

                  <div style={styles.barTrack}>

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

                <div style={styles.returnColumn}>

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

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>
              <h3 style={styles.sectionTitle}>
                Detailed Investment Report
              </h3>

              <p style={styles.sectionSubtitle}>
                Complete product-wise financial summary
              </p>
            </div>

            <button
              style={styles.refreshButton}
              onClick={fetchReport}
            >
              ↻ Refresh Report
            </button>

          </div>

          <div style={styles.tableWrapper}>

            <div style={styles.tableHeader}>

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
                style={styles.tableRow}
              >

                <div style={styles.tableProduct}>

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

                <span style={styles.tableText}>
                  {product.count}
                </span>

                <span style={styles.tableText}>
                  {formatCurrency(
                    product.invested
                  )}
                </span>

                <span style={styles.tableText}>
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
                  style={styles.tableText}
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
                  style={styles.tableText}
                >
                  {formatPercent(
                    product.returnPercentage
                  )}
                </span>

              </div>

            ))}

            {/* TOTAL ROW */}

            <div style={styles.totalRow}>

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

        <section style={styles.noteCard}>

          <div style={styles.noteIcon}>
            💡
          </div>

          <div>

            <h3 style={styles.noteTitle}>
              About this report
            </h3>

            <p style={styles.noteText}>
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

        <div style={styles.footerQuote}>
          <span style={styles.quoteMark}>
            “
          </span>

          <div>
            <p style={styles.quoteText}>
              Invest wisely today,
              <br />
              build confidently for tomorrow.
            </p>

            <span style={styles.quoteAuthor}>
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
    <div style={styles.summaryCard}>

      <div
        style={{
          ...styles.summaryIcon,
          ...(iconStyles[type] || iconStyles.blue),
        }}
      >
        {icon}
      </div>

      <div>

        <span style={styles.summaryTitle}>
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
          style={styles.summaryValue}
        >
          {value}
        </strong>

        <span style={styles.summarySubtitle}>
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

export default InvestmentReports;