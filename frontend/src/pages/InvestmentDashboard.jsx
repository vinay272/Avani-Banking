import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";

function InvestmentDashboard() {
  const [mutualFunds, setMutualFunds] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // RESPONSIVE VIEW
  // =========================

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 700
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync with the theme selected on the Dashboard.
  const [darkMode, setDarkMode] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("avani-theme") === "dark"
  );

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    };
    window.addEventListener("storage", syncTheme);
    window.addEventListener("avani-theme-change", syncTheme);
    syncTheme();
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("avani-theme-change", syncTheme);
    };
  }, []);

  const darkThemeCss = `
    .investment-dark { background: #0f172a !important; color: #e5e7eb !important; }
    .investment-dark .investment-dark-card { background: #1e293b !important; border-color: #334155 !important; color: #e5e7eb !important; }
    .investment-dark .investment-dark-card .investment-muted { color: #a8b4c7 !important; }
    .investment-dark .investment-dark-card .investment-dark-text { color: #f1f5f9 !important; }
    .investment-dark .investment-dark-card button { color: #ffffff !important; }
    .investment-dark .investment-dark-text { color: #e5e7eb !important; }
    .investment-dark .investment-muted { color: #a8b4c7 !important; }
    .investment-dark .investment-dark-divider { background: #334155 !important; }
    .investment-dark .investment-dark-soft { background: #273449 !important; color: #e5e7eb !important; }
  `;

  const getToken = () => localStorage.getItem("token");

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(number);
  };

  const getNumber = (...values) => {
    for (const value of values) {
      const number = Number(value);
      if (!Number.isNaN(number)) {
        return number;
      }
    }

    return 0;
  };

  useEffect(() => {
    const fetchInvestmentData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = getToken();

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const [mfResponse, fdResponse, portfolioResponse] = await Promise.all([
          fetch(`${API_BASE}/api/mutual-funds`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_BASE}/api/fixed-deposits`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_BASE}/api/portfolio/summary`, {
            method: "GET",
            headers,
          }),
        ]);

        if (mfResponse.status === 401 || mfResponse.status === 403) {
          throw new Error("Session expired. Please login again.");
        }

        if (fdResponse.status === 401 || fdResponse.status === 403) {
          throw new Error("Session expired. Please login again.");
        }

        if (
          portfolioResponse.status === 401 ||
          portfolioResponse.status === 403
        ) {
          throw new Error("Session expired. Please login again.");
        }

        if (!mfResponse.ok) {
          throw new Error("Unable to load mutual fund data.");
        }

        if (!fdResponse.ok) {
          throw new Error("Unable to load fixed deposit data.");
        }

        if (!portfolioResponse.ok) {
          throw new Error("Unable to load portfolio summary.");
        }
        const mfData = await mfResponse.json();
        const fdData = await fdResponse.json();
        const portfolioData = await portfolioResponse.json();

        setMutualFunds(Array.isArray(mfData) ? mfData : []);
        setFixedDeposits(
          Array.isArray(fdData)
            ? fdData.filter(
                (fd) => String(fd.status || "").toUpperCase() !== "CLOSED",
              )
            : [],
        );
      } catch (err) {
        console.error("Investment Dashboard Error:", err);
        setError(err.message || "Unable to load investment data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentData();
  }, []);

  const portfolioData = useMemo(() => {
    /*
     * Mutual Fund:
     * Different backend response field names are handled safely.
     */
    const mutualFundInvestment = mutualFunds.reduce((total, fund) => {
      return (
        total +
        getNumber(
          fund.investedAmount,
          fund.investmentAmount,
          fund.amount,
          fund.principalAmount,
        )
      );
    }, 0);

    const mutualFundCurrentValue = mutualFunds.reduce((total, fund) => {
      const invested = getNumber(
        fund.investedAmount,
        fund.investmentAmount,
        fund.amount,
        fund.principalAmount,
      );

      return (
        total +
        getNumber(
          fund.currentValue,
          fund.currentAmount,
          fund.marketValue,
          fund.presentValue,
          invested,
        )
      );
    }, 0);

    /*
     * Fixed Deposit:
     * Closed FDs are already excluded from the dashboard list.
     */
    const fixedDepositInvestment = fixedDeposits.reduce((total, fd) => {
      return (
        total +
        getNumber(
          fd.amount,
          fd.principalAmount,
          fd.depositAmount,
          fd.investmentAmount,
        )
      );
    }, 0);

    const fixedDepositCurrentValue = fixedDeposits.reduce((total, fd) => {
      const principal = getNumber(
        fd.amount,
        fd.principalAmount,
        fd.depositAmount,
        fd.investmentAmount,
      );

      return (
        total +
        getNumber(
          fd.maturityAmount,
          fd.currentValue,
          fd.maturityValue,
          principal,
        )
      );
    }, 0);

    const totalInvested = mutualFundInvestment + fixedDepositInvestment;

    const currentValue = mutualFundCurrentValue + fixedDepositCurrentValue;

    const profitLoss = currentValue - totalInvested;

    const profitLossPercentage =
      totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      mutualFundInvestment,
      mutualFundCurrentValue,
      fixedDepositInvestment,
      fixedDepositCurrentValue,
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercentage,
    };
  }, [mutualFunds, fixedDeposits]);

  const portfolioAllocation = useMemo(() => {
    const total = Number(portfolioSummary?.currentValue || 0);

    const getPercentage = (value) => {
      if (total <= 0) {
        return 0;
      }

      return (Number(value || 0) / total) * 100;
    };

    return {
      mutualFund: getPercentage(portfolioSummary?.mutualFundValue),
      fixedDeposit: getPercentage(portfolioSummary?.fixedDepositValue),
      sip: getPercentage(portfolioSummary?.sipValue),
      bond: getPercentage(portfolioSummary?.bondValue),
      gold: getPercentage(portfolioSummary?.goldValue),
    };
  }, [portfolioSummary]);

  const investmentCards = [
    {
      title: "Mutual Funds",
      icon: "📈",
      description: "Invest in diversified mutual fund schemes.",
      count: mutualFunds.length,
      invested: portfolioData.mutualFundInvestment,
      value: portfolioData.mutualFundCurrentValue,
      path: "/investments/mutual-funds",
    },
    {
      title: "Fixed Deposits",
      icon: "🏦",
      description: "Secure investments with fixed returns.",
      count: fixedDeposits.length,
      invested: portfolioData.fixedDepositInvestment,
      value: portfolioData.fixedDepositCurrentValue,
      path: "/accounts/fixed-deposit",
    },
    {
      title: "SIP Management",
      icon: "🔄",
      description: "Manage systematic investment plans.",
      count: 0,
      invested: 0,
      value: 0,
      path: "/investments/sip",
    },
    {
      title: "Bonds",
      icon: "📜",
      description: "Explore fixed-income bond investments.",
      count: 0,
      invested: 0,
      value: 0,
      path: "/investments/bonds",
    },
    {
      title: "Gold Investments",
      icon: "🪙",
      description: "Track your gold investment portfolio.",
      count: 0,
      invested: 0,
      value: 0,
      path: "/investments/gold",
    },
  ];

  if (loading) {
    return (
      <div className={darkMode ? "investment-dark" : ""} style={{ ...styles.page, ...(isMobile ? responsiveStyles.page : {}) }}>
        <style>{darkThemeCss}</style>
        <div className={darkMode ? "investment-dark-card" : ""} style={styles.loadingCard}>
          <div style={styles.loadingIcon}>💼</div>
          <div style={styles.loadingTitle}>Loading Investment Portfolio...</div>
          <div style={styles.loadingText}>
            Fetching your investment information.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "investment-dark" : ""} style={{ ...styles.page, ...(isMobile ? responsiveStyles.page : {}) }}>
      <style>{darkThemeCss}</style>
      <div style={{ ...styles.container, ...(isMobile ? responsiveStyles.container : {}) }}>
        {/* =========================
    HEADER
========================= */}

        <div style={{ ...styles.header, ...(isMobile ? responsiveStyles.header : {}) }}>
          <div style={{ ...styles.headerLeft, ...(isMobile ? responsiveStyles.headerLeft : {}) }}>
            <div style={styles.headerIcon}>💼</div>

            <div>
              <div style={styles.pageTitle}>Investment & Wealth Management</div>

              <div style={styles.pageSubtitle}>
                Track, manage and analyse your complete investment portfolio.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            style={{ ...styles.backButton, ...(isMobile ? responsiveStyles.backButton : {}) }}
          >
            ← Dashboard
          </button>
        </div>

        {/* =========================
            ERROR
        ========================= */}

        {error && <div className={darkMode ? "investment-dark-soft" : ""} style={styles.errorBox}>⚠️ {error}</div>}

        {/* =========================
            PORTFOLIO SUMMARY
        ========================= */}

        <div style={{ ...styles.summaryGrid, ...(isMobile ? responsiveStyles.summaryGrid : {}) }}>
          <div className={darkMode ? "investment-dark-card" : ""} style={styles.summaryCard}>
            <div className={darkMode ? "investment-muted" : ""} style={styles.summaryLabel}>Total Invested</div>

            <div style={styles.summaryValue}>
              {formatCurrency(portfolioData.totalInvested)}
            </div>

            <div className={darkMode ? "investment-muted" : ""} style={styles.summaryHint}>Across active investments</div>
          </div>

          <div className={darkMode ? "investment-dark-card" : ""} style={styles.summaryCard}>
            <div className={darkMode ? "investment-muted" : ""} style={styles.summaryLabel}>Current Value</div>

            <div style={styles.summaryValue}>
              {formatCurrency(portfolioData.currentValue)}
            </div>

            <div className={darkMode ? "investment-muted" : ""} style={styles.summaryHint}>Current portfolio value</div>
          </div>

          <div className={darkMode ? "investment-dark-card" : ""} style={styles.summaryCard}>
            <div className={darkMode ? "investment-muted" : ""} style={styles.summaryLabel}>Profit / Loss</div>

            <div
              style={{
                ...styles.summaryValue,
                color: portfolioData.profitLoss >= 0 ? "#087443" : "#b42318",
              }}
            >
              {portfolioData.profitLoss >= 0 ? "+" : ""}
              {formatCurrency(portfolioData.profitLoss)}
            </div>

            <div
              style={{
                ...styles.summaryHint,
                color: portfolioData.profitLoss >= 0 ? "#087443" : "#b42318",
              }}
            >
              {portfolioData.profitLossPercentage >= 0 ? "+" : ""}
              {portfolioData.profitLossPercentage.toFixed(2)}%
            </div>
          </div>

          <div className={darkMode ? "investment-dark-card" : ""} style={styles.summaryCard}>
            <div className={darkMode ? "investment-muted" : ""} style={styles.summaryLabel}>Active Investments</div>

            <div style={styles.summaryValue}>
              {mutualFunds.length + fixedDeposits.length}
            </div>

            <div className={darkMode ? "investment-muted" : ""} style={styles.summaryHint}>Mutual Funds + Fixed Deposits</div>
          </div>
        </div>

        {/* =========================
            INVESTMENT PRODUCTS
        ========================= */}

        <div style={styles.sectionHeader}>
          <div>
            <div className={darkMode ? "investment-dark-text" : ""} style={styles.sectionTitle}>Investment Products</div>

            <div className={darkMode ? "investment-muted" : ""} style={styles.sectionSubtitle}>
              Choose an investment category to manage your portfolio.
            </div>
          </div>
        </div>

        <div style={{ ...styles.productGrid, ...(isMobile ? responsiveStyles.productGrid : {}) }}>
          {investmentCards.map((card) => (
            <div key={card.title} className={darkMode ? "investment-dark-card" : ""} style={styles.productCard}>
              <div style={styles.productTop}>
                <div className={darkMode ? "investment-dark-soft" : ""} style={styles.productIcon}>{card.icon}</div>

                {card.comingSoon && (
                  <span style={styles.comingSoonBadge}>Coming Soon</span>
                )}
              </div>

              <div className={darkMode ? "investment-dark-text" : ""} style={styles.productTitle}>{card.title}</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.productDescription}>{card.description}</div>

              {!card.comingSoon ? (
                <>
                  <div style={styles.productStats}>
                    <div>
                      <span className={darkMode ? "investment-muted" : ""} style={styles.statLabel}>Investments</span>

                      <strong className={darkMode ? "investment-dark-text" : ""} style={styles.statValue}>{card.count}</strong>
                    </div>

                    <div>
                      <span className={darkMode ? "investment-muted" : ""} style={styles.statLabel}>Value</span>

                      <strong className={darkMode ? "investment-dark-text" : ""} style={styles.statValue}>
                        {formatCurrency(card.value)}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={styles.productButton}
                    onClick={() => {
                      window.location.href = card.path;
                    }}
                  >
                    Manage {card.title}
                    <span>→</span>
                  </button>
                </>
              ) : (
                <div className={darkMode ? "investment-dark-soft" : ""} style={styles.comingSoonText}>
                  This investment category will be available in the upcoming
                  module.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* =========================
            PORTFOLIO & ANALYTICS
        ========================= */}

        <div style={styles.sectionHeader}>
          <div>
            <div className={darkMode ? "investment-dark-text" : ""} style={styles.sectionTitle}>Portfolio & Analytics</div>

            <div className={darkMode ? "investment-muted" : ""} style={styles.sectionSubtitle}>
              Analyse performance and keep track of your wealth.
            </div>
          </div>
        </div>

        {/* PORTFOLIO DASHBOARD */}
        <div style={{ ...styles.analyticsGrid, ...(isMobile ? responsiveStyles.analyticsGrid : {}) }}>
          <div
            className={darkMode ? "investment-dark-card" : ""}
            style={{
              ...styles.analyticsCard,
              cursor: "pointer",
            }}
            onClick={() => {
              window.location.href = "/investments/portfolio";
            }}
          >
            <div className={darkMode ? "investment-dark-soft" : ""} style={styles.analyticsIcon}>📊</div>

            <div>
              <div className={darkMode ? "investment-dark-text" : ""} style={styles.analyticsTitle}>Portfolio Dashboard</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.analyticsText}>
                View investment allocation, current value and overall portfolio
                performance.
              </div>
            </div>
          </div>

          {/* Investment Reports */}

          <div
            className={darkMode ? "investment-dark-card" : ""}
            style={{
              ...styles.analyticsCard,
              cursor: "pointer",
            }}
            onClick={() => {
              window.location.href = "/investments/reports";
            }}
          >
            <div className={darkMode ? "investment-dark-soft" : ""} style={styles.analyticsIcon}>📑</div>

            <div>
              <div className={darkMode ? "investment-dark-text" : ""} style={styles.analyticsTitle}>Investment Reports</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.analyticsText}>
                Review investment activity and generate detailed investment
                reports.
              </div>
            </div>
          </div>

          {/* Profit / Loss Analysis */}

          <div
            className={darkMode ? "investment-dark-card" : ""}
            style={{
              ...styles.analyticsCard,
              cursor: "pointer",
            }}
            onClick={() => {
              window.location.href = "/investments/profit-loss";
            }}
          >
            <div className={darkMode ? "investment-dark-soft" : ""} style={styles.analyticsIcon}>📈</div>

            <div>
              <div className={darkMode ? "investment-dark-text" : ""} style={styles.analyticsTitle}>Profit / Loss Analysis</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.analyticsText}>
                Analyse your investment returns and compare invested amount with
                current value.
              </div>
            </div>
          </div>
          {/* Dividend Tracking */}

          <div
            className={darkMode ? "investment-dark-card" : ""}
            style={{
              ...styles.analyticsCard,
              cursor: "pointer",
            }}
            onClick={() => {
              window.location.href = "/investments/dividends";
            }}
          >
            <div className={darkMode ? "investment-dark-soft" : ""} style={styles.analyticsIcon}>💸</div>

            <div>
              <div className={darkMode ? "investment-dark-text" : ""} style={styles.analyticsTitle}>Dividend Tracking</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.analyticsText}>
                Track dividend income from eligible investments.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
            CURRENT PORTFOLIO BREAKDOWN
        ========================= */}

      <div style={styles.sectionHeader}>
        <div>
          <div className={darkMode ? "investment-dark-text" : ""} style={styles.sectionTitle}>Portfolio Breakdown</div>

          <div className={darkMode ? "investment-muted" : ""} style={styles.sectionSubtitle}>
            Current distribution of your active investments.
          </div>
        </div>
      </div>

      <div className={darkMode ? "investment-dark-card" : ""} style={{ ...styles.breakdownCard, ...(isMobile ? responsiveStyles.breakdownCard : {}) }}>
        {/* Mutual Funds */}
        <div style={{ ...styles.breakdownRow, ...(isMobile ? responsiveStyles.breakdownRow : {}) }}>
          <div style={{ ...styles.breakdownLeft, ...(isMobile ? responsiveStyles.breakdownLeft : {}) }}>
            <span className={darkMode ? "investment-dark-soft" : ""} style={styles.breakdownIcon}>📈</span>

            <div>
              <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownTitle}>Mutual Funds</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.breakdownSubtext}>
                {mutualFunds.length} active investment
                {mutualFunds.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div style={{ ...styles.breakdownValueBox, ...(isMobile ? responsiveStyles.breakdownValueBox : {}) }}>
            <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownAmount}>
              {formatCurrency(portfolioSummary?.mutualFundValue || 0)}
            </div>

            <div style={styles.breakdownPercentage}>
              {portfolioAllocation.mutualFund.toFixed(1)}%
            </div>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(portfolioAllocation.mutualFund, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className={darkMode ? "investment-dark-divider" : ""} style={styles.divider} />

        {/* Fixed Deposits */}
        <div style={{ ...styles.breakdownRow, ...(isMobile ? responsiveStyles.breakdownRow : {}) }}>
          <div style={{ ...styles.breakdownLeft, ...(isMobile ? responsiveStyles.breakdownLeft : {}) }}>
            <span className={darkMode ? "investment-dark-soft" : ""} style={styles.breakdownIcon}>🏦</span>

            <div>
              <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownTitle}>Fixed Deposits</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.breakdownSubtext}>
                {fixedDeposits.length} active deposit
                {fixedDeposits.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div style={{ ...styles.breakdownValueBox, ...(isMobile ? responsiveStyles.breakdownValueBox : {}) }}>
            <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownAmount}>
              {formatCurrency(portfolioSummary?.fixedDepositValue || 0)}
            </div>

            <div style={styles.breakdownPercentage}>
              {portfolioAllocation.fixedDeposit.toFixed(1)}%
            </div>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(portfolioAllocation.mutualFund, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className={darkMode ? "investment-dark-divider" : ""} style={styles.divider} />

        {/* SIP */}
        <div style={{ ...styles.breakdownRow, ...(isMobile ? responsiveStyles.breakdownRow : {}) }}>
          <div style={{ ...styles.breakdownLeft, ...(isMobile ? responsiveStyles.breakdownLeft : {}) }}>
            <span className={darkMode ? "investment-dark-soft" : ""} style={styles.breakdownIcon}>🔄</span>

            <div>
              <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownTitle}>SIP</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.breakdownSubtext}>Active SIP investments</div>
            </div>
          </div>

          <div style={{ ...styles.breakdownValueBox, ...(isMobile ? responsiveStyles.breakdownValueBox : {}) }}>
            <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownAmount}>
              {formatCurrency(portfolioSummary?.sipValue || 0)}
            </div>

            <div style={styles.breakdownPercentage}>
              {portfolioAllocation.sip.toFixed(1)}%
            </div>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(portfolioAllocation.mutualFund, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className={darkMode ? "investment-dark-divider" : ""} style={styles.divider} />

        {/* Bonds */}
        <div style={{ ...styles.breakdownRow, ...(isMobile ? responsiveStyles.breakdownRow : {}) }}>
          <div style={{ ...styles.breakdownLeft, ...(isMobile ? responsiveStyles.breakdownLeft : {}) }}>
            <span className={darkMode ? "investment-dark-soft" : ""} style={styles.breakdownIcon}>📜</span>

            <div>
              <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownTitle}>Bonds</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.breakdownSubtext}>Active bond investments</div>
            </div>
          </div>

          <div style={{ ...styles.breakdownValueBox, ...(isMobile ? responsiveStyles.breakdownValueBox : {}) }}>
            <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownAmount}>
              {formatCurrency(portfolioSummary?.bondValue || 0)}
            </div>

            <div style={styles.breakdownPercentage}>
              {portfolioAllocation.bond.toFixed(1)}%
            </div>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(portfolioAllocation.mutualFund, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className={darkMode ? "investment-dark-divider" : ""} style={styles.divider} />

        {/* Gold */}
        <div style={{ ...styles.breakdownRow, ...(isMobile ? responsiveStyles.breakdownRow : {}) }}>
          <div style={{ ...styles.breakdownLeft, ...(isMobile ? responsiveStyles.breakdownLeft : {}) }}>
            <span className={darkMode ? "investment-dark-soft" : ""} style={styles.breakdownIcon}>🪙</span>

            <div>
              <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownTitle}>Gold</div>

              <div className={darkMode ? "investment-muted" : ""} style={styles.breakdownSubtext}>Active gold investments</div>
            </div>
          </div>

          <div style={{ ...styles.breakdownValueBox, ...(isMobile ? responsiveStyles.breakdownValueBox : {}) }}>
            <div className={darkMode ? "investment-dark-text" : ""} style={styles.breakdownAmount}>
              {formatCurrency(portfolioSummary?.goldValue || 0)}
            </div>

            <div style={styles.breakdownPercentage}>
              {portfolioAllocation.gold.toFixed(1)}%
            </div>
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(portfolioAllocation.mutualFund, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className={darkMode ? "investment-dark-divider" : ""} style={styles.divider} />

        {/* Total */}
        <div style={{ ...styles.totalRow, ...(isMobile ? responsiveStyles.totalRow : {}) }}>
          <div className={darkMode ? "investment-dark-text" : ""} style={styles.totalLabel}>Total Portfolio Value</div>

          <div className={darkMode ? "investment-dark-text" : ""} style={styles.totalAmount}>
            {formatCurrency(portfolioSummary?.currentValue || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

const responsiveStyles = {
  page: {
    padding: "16px 10px 25px",
  },

  container: {
    maxWidth: "100%",
  },

  header: {
    maxHeight: "none",
    padding: "18px 16px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
    borderRadius: "15px",
  },

  headerLeft: {
    width: "100%",
    alignItems: "flex-start",
    gap: "12px",
  },

  backButton: {
    width: "100%",
    padding: "11px 14px",
    textAlign: "center",
  },

  summaryGrid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
    marginTop: "20px",
  },

  summaryValue: {
    fontSize: "20px",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  productGrid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
    marginBottom: "24px",
  },

  analyticsGrid: {
    gridTemplateColumns: "1fr",
    gap: "10px",
    marginBottom: "24px",
  },

  breakdownCard: {
    padding: "4px 12px",
  },

  breakdownRow: {
    minHeight: "auto",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
    padding: "13px 0",
  },

  breakdownLeft: {
    width: "100%",
    alignItems: "flex-start",
  },

  breakdownValueBox: {
    width: "100%",
    alignItems: "flex-start",
    paddingLeft: "47px",
  },

  totalRow: {
    minHeight: "70px",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: "5px",
    padding: "12px 0",
  },
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px 20px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

 header: {
    maxHeight: "100px",
    borderRadius:"18px",
    background:"linear-gradient(135deg, #102354 0%, #173b8c 58%, #2457c6 100%)",
    color: "#ffffff",
    padding: "28px 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    boxSizing: "border-box",
    boxShadow: "0 10px 30px rgba(18,51,120,0.14)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    minWidth: 0,
  },

  pageTitle: {
    fontSize: "26px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "5px",
    letterSpacing: "-0.3px",
  },

  pageSubtitle: {
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.88)",
    lineHeight: "1.5",
  },

  headerIcon: {
    width: "56px",
    height: "56px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "#ffffff",
    color: "#0757b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  },

  backButton: {
    flexShrink: 0,
    border: "1px solid rgba(255, 255, 255, 0.65)",
    borderRadius: "8px",
    padding: "10px 16px",
    background: "#ffffff",
    color: "#284aa0",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#b42318",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    marginBottom: "20px",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "480px",
    margin: "120px auto",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "35px",
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
  },

  loadingIcon: {
    fontSize: "40px",
    marginBottom: "15px",
  },

  loadingTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "7px",
  },

  loadingText: {
    fontSize: "12px",
    color: "#667085",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "15px",
    marginTop: "20px",
    marginBottom: "32px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    padding: "19px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },

  summaryLabel: {
    fontSize: "11px",
    color: "#667085",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    marginBottom: "9px",
  },

  summaryValue: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "6px",
  },

  summaryHint: {
    fontSize: "10px",
    color: "#667085",
  },

  sectionHeader: {
    marginBottom: "14px",
  },

  sectionTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "4px",
  },

  sectionSubtitle: {
    fontSize: "11px",
    color: "#667085",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "15px",
    marginBottom: "32px",
  },

  productCard: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
    minHeight: "230px",
    boxSizing: "border-box",
  },

  productTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "15px",
  },

  productIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#f4f6fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  comingSoonBadge: {
    fontSize: "8px",
    fontWeight: "800",
    color: "#667085",
    background: "#f2f4f7",
    borderRadius: "20px",
    padding: "5px 7px",
    textTransform: "uppercase",
  },

  productTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "7px",
  },

  productDescription: {
    fontSize: "10px",
    lineHeight: "1.5",
    color: "#667085",
    minHeight: "31px",
    marginBottom: "15px",
  },

  productStats: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    borderTop: "1px solid #eef0f4",
    borderBottom: "1px solid #eef0f4",
    padding: "10px 0",
    marginBottom: "12px",
  },

  statLabel: {
    display: "block",
    fontSize: "9px",
    color: "#98a2b3",
    marginBottom: "3px",
  },

  statValue: {
    display: "block",
    fontSize: "11px",
    color: "#172033",
  },

  productButton: {
    width: "100%",
    border: "none",
    borderRadius: "8px",
    padding: "9px 11px",
    background: "#172033",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  comingSoonText: {
    marginTop: "22px",
    padding: "10px",
    borderRadius: "8px",
    background: "#f8fafc",
    color: "#667085",
    fontSize: "10px",
    lineHeight: "1.5",
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "14px",
    marginBottom: "32px",
  },

  analyticsCard: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    padding: "17px",
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },

  analyticsIcon: {
    width: "38px",
    height: "38px",
    flexShrink: 0,
    borderRadius: "9px",
    background: "#f4f6fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  analyticsTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#172033",
    marginBottom: "5px",
    textAlign: "left",
  },

  analyticsText: {
    fontSize: "10px",
    lineHeight: "1.5",
    color: "#667085",
  },

  breakdownCard: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    padding: "5px 18px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },

  breakdownRow: {
    minHeight: "65px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  breakdownLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  breakdownIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    background: "#f4f6fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
  },

  breakdownTitle: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "3px",
    textAlign: "left",
  },

  breakdownSubtext: {
    fontSize: "9px",
    color: "#98a2b3",
  },

  breakdownAmount: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#172033",
  },

  breakdownValueBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "3px",
    flexShrink: 0,
  },

  breakdownPercentage: {
    fontSize: "9px",
    fontWeight: "700",
    color: "#667085",
  },

  divider: {
    height: "1px",
    background: "#eef0f4",
  },

  totalRow: {
    minHeight: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  totalLabel: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#172033",
  },

  totalAmount: {
    fontSize: "16px",
    fontWeight: "900",
    color: "#172033",
  },
};

export default InvestmentDashboard;
