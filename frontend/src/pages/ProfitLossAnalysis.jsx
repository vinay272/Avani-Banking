import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfitLossAnalysis = () => {
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken")
    );
  };

  const fetchAnalysis = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      const response = await fetch(
        "http://localhost:8080/api/profit-loss",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Unable to load profit/loss analysis."
        );
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Profit/Loss Analysis Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const formatAmount = (value) => {
    const amount = Number(value || 0);

    return amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercentage = (value) => {
    return `${Number(value || 0).toFixed(2)}%`;
  };

  const getStatusColor = (status) => {
    if (status === "PROFIT") return "#15803d";
    if (status === "LOSS") return "#dc2626";
    return "#64748b";
  };

  const getStatusBackground = (status) => {
    if (status === "PROFIT") return "#dcfce7";
    if (status === "LOSS") return "#fee2e2";
    return "#f1f5f9";
  };

  const investmentData = useMemo(() => {
    if (!analysis) return [];

    return [
      {
        name: "Fixed Deposit",
        shortName: "FD",
        invested: Number(analysis.totalInvested || 0) > 0
          ? Number(analysis.fixedDepositProfitLoss || 0)
          : 0,
        profitLoss: Number(analysis.fixedDepositProfitLoss || 0),
        returnPercentage: Number(analysis.fixedDepositReturn || 0),
        icon: "🏦",
      },
      {
        name: "SIP",
        shortName: "SIP",
        invested: Number(analysis.sipProfitLoss || 0),
        profitLoss: Number(analysis.sipProfitLoss || 0),
        returnPercentage: Number(analysis.sipReturn || 0),
        icon: "📈",
      },
      {
        name: "Bonds",
        shortName: "BND",
        invested: Number(analysis.bondProfitLoss || 0),
        profitLoss: Number(analysis.bondProfitLoss || 0),
        returnPercentage: Number(analysis.bondReturn || 0),
        icon: "💰",
      },
      {
        name: "Gold",
        shortName: "GLD",
        invested: Number(analysis.goldProfitLoss || 0),
        profitLoss: Number(analysis.goldProfitLoss || 0),
        returnPercentage: Number(analysis.goldReturn || 0),
        icon: "🪙",
      },
      {
        name: "Mutual Funds",
        shortName: "MF",
        invested: Number(analysis.mutualFundProfitLoss || 0),
        profitLoss: Number(analysis.mutualFundProfitLoss || 0),
        returnPercentage: Number(analysis.mutualFundReturn || 0),
        icon: "📊",
      },
    ];
  }, [analysis]);

  const maxAbsProfitLoss = useMemo(() => {
    if (!investmentData.length) return 1;

    const maxValue = Math.max(
      ...investmentData.map((item) => Math.abs(item.profitLoss))
    );

    return maxValue || 1;
  }, [investmentData]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h3 style={styles.loadingTitle}>Analyzing Your Investments</h3>
          <p style={styles.loadingText}>
            Please wait while we calculate your profit and loss.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>!</div>

          <h2 style={styles.errorTitle}>Unable to Load Analysis</h2>

          <p style={styles.errorText}>{error}</p>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => fetchAnalysis()}
          >
            Try Again
          </button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => navigate("/investments")}
          >
            ← Back to Investment Page
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const overallStatus = analysis.overallStatus || "NO_CHANGE";
  const totalProfitLoss = Number(analysis.totalProfitLoss || 0);
  const returnPercentage = Number(analysis.returnPercentage || 0);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>₹</div>

          <div>
            <h1 style={styles.headerTitle}>Profit / Loss Analysis</h1>
            <p style={styles.headerSubtitle}>
              Track your investment performance at a glance
            </p>
          </div>
        </div>

        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate("/investments")}
        >
          ← Back to Investment Page
        </button>
      </div>

      <div style={styles.content}>
        {/* Main P/L Highlight */}
        <div style={styles.heroCard}>
          <div>
            <p style={styles.heroLabel}>Overall Portfolio Performance</p>

            <div style={styles.heroAmountRow}>
              <span
                style={{
                  ...styles.heroAmount,
                  color: getStatusColor(overallStatus),
                }}
              >
                {totalProfitLoss >= 0 ? "+" : "-"}₹
                {formatAmount(Math.abs(totalProfitLoss))}
              </span>

              <span
                style={{
                  ...styles.statusBadge,
                  color: getStatusColor(overallStatus),
                  background: getStatusBackground(overallStatus),
                }}
              >
                {overallStatus === "PROFIT"
                  ? "● PROFIT"
                  : overallStatus === "LOSS"
                  ? "● LOSS"
                  : "● NO CHANGE"}
              </span>
            </div>

            <p style={styles.heroDescription}>
              Your current portfolio has generated an overall return of{" "}
              <strong>{formatPercentage(returnPercentage)}</strong>.
            </p>
          </div>

          <div style={styles.performanceCircle}>
            <div style={styles.performanceCircleInner}>
              <span style={styles.circlePercentage}>
                {formatPercentage(returnPercentage)}
              </span>
              <span style={styles.circleLabel}>Return</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>₹</div>
            <div>
              <p style={styles.cardLabel}>Total Invested</p>
              <h2 style={styles.cardValue}>
                ₹{formatAmount(analysis.totalInvested)}
              </h2>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>↗</div>
            <div>
              <p style={styles.cardLabel}>Current Value</p>
              <h2 style={styles.cardValue}>
                ₹{formatAmount(analysis.currentValue)}
              </h2>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                color: getStatusColor(overallStatus),
                background: getStatusBackground(overallStatus),
              }}
            >
              {totalProfitLoss >= 0 ? "↗" : "↘"}
            </div>

            <div>
              <p style={styles.cardLabel}>Total Profit / Loss</p>
              <h2
                style={{
                  ...styles.cardValue,
                  color: getStatusColor(overallStatus),
                }}
              >
                {totalProfitLoss >= 0 ? "+" : "-"}₹
                {formatAmount(Math.abs(totalProfitLoss))}
              </h2>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>%</div>
            <div>
              <p style={styles.cardLabel}>Overall Return</p>
              <h2
                style={{
                  ...styles.cardValue,
                  color: getStatusColor(overallStatus),
                }}
              >
                {formatPercentage(returnPercentage)}
              </h2>
            </div>
          </div>
        </div>

        {/* Best & Lowest */}
        <div style={styles.performanceGrid}>
          {/* Best */}
          <div style={styles.highlightCard}>
            <div style={styles.highlightTop}>
              <div style={styles.highlightIconBest}>★</div>

              <div>
                <p style={styles.highlightLabel}>Best Performing</p>
                <h3 style={styles.highlightTitle}>
                  {analysis.bestPerformingInvestment || "—"}
                </h3>
              </div>
            </div>

            <div style={styles.highlightNumbers}>
              <span style={styles.profitValue}>
                +₹{formatAmount(analysis.bestPerformingProfitLoss)}
              </span>

              <span style={styles.returnPill}>
                {formatPercentage(analysis.bestPerformingReturn)}
              </span>
            </div>
          </div>

          {/* Lowest */}
          <div style={styles.highlightCard}>
            <div style={styles.highlightTop}>
              <div style={styles.highlightIconLowest}>↓</div>

              <div>
                <p style={styles.highlightLabel}>Lowest Performing</p>
                <h3 style={styles.highlightTitle}>
                  {analysis.lowestPerformingInvestment || "—"}
                </h3>
              </div>
            </div>

            <div style={styles.highlightNumbers}>
              <span
                style={{
                  ...styles.profitValue,
                  color:
                    Number(analysis.lowestPerformingProfitLoss || 0) < 0
                      ? "#dc2626"
                      : "#15803d",
                }}
              >
                {Number(analysis.lowestPerformingProfitLoss || 0) >= 0
                  ? "+"
                  : "-"}
                ₹
                {formatAmount(
                  Math.abs(Number(analysis.lowestPerformingProfitLoss || 0))
                )}
              </span>

              <span style={styles.returnPill}>
                {formatPercentage(analysis.lowestPerformingReturn)}
              </span>
            </div>
          </div>
        </div>

        {/* Investment Wise Analysis */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Investment-wise Profit / Loss
              </h2>
              <p style={styles.sectionSubtitle}>
                Performance comparison across your investment categories
              </p>
            </div>
          </div>

          <div style={styles.investmentList}>
            {investmentData.map((item) => {
              const positive = item.profitLoss >= 0;

              const barWidth =
                (Math.abs(item.profitLoss) / maxAbsProfitLoss) * 100;

              return (
                <div key={item.name} style={styles.investmentRow}>
                  <div style={styles.investmentInfo}>
                    <div style={styles.investmentIcon}>{item.icon}</div>

                    <div>
                      <h3 style={styles.investmentName}>{item.name}</h3>

                      <p style={styles.investmentReturn}>
                        Return: {formatPercentage(item.returnPercentage)}
                      </p>
                    </div>
                  </div>

                  <div style={styles.barArea}>
                    <div style={styles.barBackground}>
                      <div
                        style={{
                          ...styles.barFill,
                          width: `${Math.max(barWidth, item.profitLoss === 0 ? 0 : 4)}%`,
                          background: positive
                            ? "linear-gradient(90deg, #16a34a, #4ade80)"
                            : "linear-gradient(90deg, #dc2626, #f87171)",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div style={styles.plAmount}>
                    <span
                      style={{
                        color: positive ? "#15803d" : "#dc2626",
                        fontWeight: 800,
                      }}
                    >
                      {positive ? "+" : "-"}₹
                      {formatAmount(Math.abs(item.profitLoss))}
                    </span>

                    <small
                      style={{
                        color: positive ? "#15803d" : "#dc2626",
                      }}
                    >
                      {positive ? "Profit" : "Loss"}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analysis Insight */}
        <div style={styles.insightCard}>
          <div style={styles.insightIcon}>💡</div>

          <div>
            <h3 style={styles.insightTitle}>Investment Insight</h3>

            <p style={styles.insightText}>
              {overallStatus === "PROFIT"
                ? `Your investment portfolio is currently in profit. ${
                    analysis.bestPerformingInvestment || "One of your investments"
                  } is your best-performing category based on the available data.`
                : overallStatus === "LOSS"
                ? `Your investment portfolio is currently showing a loss. ${
                    analysis.lowestPerformingInvestment || "One of your investments"
                  } requires closer attention based on its current performance.`
                : "Your portfolio is currently showing no overall gain or loss. Keep tracking your investments regularly as market values change."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footerSection}>
          <div>
            <p style={styles.generatedText}>
              Analysis generated on{" "}
              {analysis.generatedAt
                ? new Date(analysis.generatedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.refreshButton,
              opacity: refreshing ? 0.7 : 1,
            }}
            onClick={() => fetchAnalysis(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh Analysis"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background: "linear-gradient(135deg, #0f5bd7 0%, #1677f2 100%)",
    padding: "22px 34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 8px 24px rgba(15, 91, 215, 0.18)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  headerIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#0f5bd7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: 900,
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
  },

  headerTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "25px",
    fontWeight: 800,
  },

  headerSubtitle: {
    margin: "5px 0 0",
    color: "rgba(255,255,255,0.85)",
    fontSize: "13px",
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.13)",
    color: "#ffffff",
    padding: "11px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13px",
  },

  content: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "30px 25px 45px",
  },

  heroCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
    marginBottom: "22px",
  },

  heroLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 700,
  },

  heroAmountRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "9px",
  },

  heroAmount: {
    fontSize: "36px",
    fontWeight: 900,
    letterSpacing: "-1px",
  },

  statusBadge: {
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },

  heroDescription: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  performanceCircle: {
    width: "135px",
    height: "135px",
    borderRadius: "50%",
    background:
      "conic-gradient(#1677f2 0deg, #1677f2 260deg, #dbeafe 260deg, #dbeafe 360deg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  performanceCircleInner: {
    width: "101px",
    height: "101px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  circlePercentage: {
    fontSize: "18px",
    fontWeight: 900,
    color: "#0f5bd7",
  },

  circleLabel: {
    marginTop: "3px",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 700,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
  },

  summaryIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#0f5bd7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: 900,
    flexShrink: 0,
  },

  cardLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 600,
  },

  cardValue: {
    margin: "5px 0 0",
    fontSize: "20px",
    fontWeight: 850,
    color: "#0f172a",
  },

  performanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "22px",
  },

  highlightCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "17px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
  },

  highlightTop: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  highlightIconBest: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#fff7ed",
    color: "#ea580c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: 900,
  },

  highlightIconLowest: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: 900,
  },

  highlightLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
  },

  highlightTitle: {
    margin: "4px 0 0",
    fontSize: "18px",
    color: "#0f172a",
    fontWeight: 800,
  },

  highlightNumbers: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  profitValue: {
    color: "#15803d",
    fontSize: "21px",
    fontWeight: 900,
  },

  returnPill: {
    background: "#f1f5f9",
    color: "#334155",
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: 800,
  },

  sectionCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
    marginBottom: "22px",
  },

  sectionHeader: {
    marginBottom: "22px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 850,
    color: "#0f172a",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  investmentList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  investmentRow: {
    display: "grid",
    gridTemplateColumns: "220px 1fr 140px",
    alignItems: "center",
    gap: "18px",
  },

  investmentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  investmentIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  investmentName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 800,
    color: "#0f172a",
  },

  investmentReturn: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#64748b",
  },

  barArea: {
    width: "100%",
  },

  barBackground: {
    width: "100%",
    height: "11px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.5s ease",
  },

  plAmount: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "3px",
    fontSize: "13px",
  },

  insightCard: {
    background: "linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%)",
    border: "1px solid #bfdbfe",
    borderRadius: "18px",
    padding: "22px",
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
    marginBottom: "22px",
  },

  insightIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  insightTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 850,
    color: "#0f3f91",
  },

  insightText: {
    margin: "6px 0 0",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  footerSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  generatedText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "11px",
  },

  refreshButton: {
    border: "none",
    background: "#0f5bd7",
    color: "#ffffff",
    padding: "11px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 750,
  },

  primaryButton: {
    border: "none",
    background: "#0f5bd7",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 750,
  },

  secondaryButton: {
    marginTop: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    padding: "11px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
  },

  spinner: {
    width: "42px",
    height: "42px",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #1677f2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingTitle: {
    margin: "18px 0 5px",
    color: "#0f172a",
  },

  loadingText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  errorContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    textAlign: "center",
    background: "#f8fafc",
  },

  errorIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#fee2e2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: 900,
  },

  errorTitle: {
    margin: "15px 0 6px",
    color: "#0f172a",
  },

  errorText: {
    color: "#64748b",
    margin: "0 0 20px",
    maxWidth: "500px",
  },
};

export default ProfitLossAnalysis;