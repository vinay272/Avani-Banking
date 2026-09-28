import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8080";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("jwtToken") ||
  localStorage.getItem("accessToken");

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const formatPercent = (value) => {
  return `${Number(value || 0).toFixed(2)}%`;
};

const getCategoryIcon = (category) => {
  switch (String(category || "").toUpperCase()) {
    case "EQUITY":
      return "📈";
    case "DEBT":
      return "🛡️";
    case "HYBRID":
      return "⚖️";
    case "INDEX":
      return "📊";
    case "ELSS":
      return "💰";
    default:
      return "📁";
  }
};

const getRiskStyle = (risk) => {
  switch (String(risk || "").toUpperCase()) {
    case "LOW":
      return {
        background: "#eaf8ef",
        color: "#198754",
      };

    case "MODERATE":
      return {
        background: "#fff7e6",
        color: "#c57b00",
      };

    case "HIGH":
      return {
        background: "#fff0f0",
        color: "#dc3545",
      };

    default:
      return {
        background: "#f1f3f5",
        color: "#69758a",
      };
  }
};

export default function MutualFund() {
  const navigate = useNavigate();

  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFund, setSelectedFund] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("ALL");

  const [selectedRisk, setSelectedRisk] =
    useState("ALL");

  // =====================================================
  // LOAD ACTIVE MUTUAL FUNDS
  // =====================================================

  useEffect(() => {
    loadFunds();
  }, []);

  const loadFunds = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const headers = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE}/api/mutual-funds`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load mutual funds (${response.status})`
        );
      }

      const data = await response.json();

      setFunds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Mutual Fund Load Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load mutual funds."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER FUNDS
  // =====================================================

  const filteredFunds = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    return funds.filter((fund) => {
      const matchesSearch =
        !search ||
        String(fund.fundName || "")
          .toLowerCase()
          .includes(search) ||
        String(fund.fundCategory || "")
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        selectedCategory === "ALL" ||
        String(fund.fundCategory || "").toUpperCase() ===
          selectedCategory;

      const matchesRisk =
        selectedRisk === "ALL" ||
        String(fund.riskLevel || "").toUpperCase() ===
          selectedRisk;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesRisk
      );
    });
  }, [
    funds,
    searchText,
    selectedCategory,
    selectedRisk,
  ]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalFunds = funds.length;

  const equityFunds = funds.filter(
    (fund) =>
      String(fund.fundCategory || "").toUpperCase() ===
      "EQUITY"
  ).length;

  const lowRiskFunds = funds.filter(
    (fund) =>
      String(fund.riskLevel || "").toUpperCase() ===
      "LOW"
  ).length;

  const averageExpectedReturn =
    funds.length > 0
      ? funds.reduce(
          (total, fund) =>
            total +
            Number(
              fund.expectedReturnRate || 0
            ),
          0
        ) / funds.length
      : 0;

  // =====================================================
  // OPEN DETAILS
  // =====================================================

  const openDetails = (fund) => {
    setSelectedFund(fund);
    setShowDetails(true);
  };

  // =====================================================
  // CLOSE DETAILS
  // =====================================================

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedFund(null);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            📈
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Mutual Funds...
          </h2>

          <p style={styles.loadingText}>
            Please wait while we load available
            investment funds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            📈
          </div>

          <div>
            <h1 style={styles.headerTitle}>
              Mutual Fund Investments
            </h1>

            <p style={styles.headerSubtitle}>
              Explore and compare mutual fund opportunities
            </p>
          </div>
        </div>

        <button
          type="button"
          style={styles.backButton}
          onClick={() =>
            navigate("/investments")
          }
        >
          ← Back to Investment Page
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div style={styles.errorAlert}>
          <span style={styles.alertIcon}>
            !
          </span>

          <span>{error}</span>

          <button
            type="button"
            style={styles.retryButton}
            onClick={loadFunds}
          >
            Retry
          </button>
        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div style={styles.summaryGrid}>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#eef4ff",
              color: "#2457c6",
            }}
          >
            📊
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Available Funds
            </p>

            <h2 style={styles.summaryValue}>
              {totalFunds}
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#eef8f1",
              color: "#198754",
            }}
          >
            📈
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Equity Funds
            </p>

            <h2 style={styles.summaryValue}>
              {equityFunds}
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#fff7e6",
              color: "#c57b00",
            }}
          >
            🛡️
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Low Risk Funds
            </p>

            <h2 style={styles.summaryValue}>
              {lowRiskFunds}
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#f2edff",
              color: "#6842c2",
            }}
          >
            %
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Avg. Expected Return
            </p>

            <h2 style={styles.summaryValue}>
              {formatPercent(
                averageExpectedReturn
              )}
            </h2>
          </div>
        </div>

      </div>

      {/* =================================================
          FILTER CARD
      ================================================= */}

      <div style={styles.filterCard}>

        <div style={styles.filterHeading}>
          <div>
            <h2 style={styles.filterTitle}>
              Find Your Mutual Fund
            </h2>

            <p style={styles.filterSubtitle}>
              Compare funds based on category and
              risk level.
            </p>
          </div>

          <span style={styles.resultBadge}>
            {filteredFunds.length} Funds
          </span>
        </div>

        <div style={styles.filterGrid}>

          {/* SEARCH */}

          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>
              🔍
            </span>

            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search fund name or category..."
              style={styles.searchInput}
            />
          </div>

          {/* CATEGORY */}

          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(
                event.target.value
              )
            }
            style={styles.select}
          >
            <option value="ALL">
              All Categories
            </option>

            <option value="EQUITY">
              Equity
            </option>

            <option value="DEBT">
              Debt
            </option>

            <option value="HYBRID">
              Hybrid
            </option>

            <option value="INDEX">
              Index
            </option>

            <option value="ELSS">
              ELSS
            </option>
          </select>

          {/* RISK */}

          <select
            value={selectedRisk}
            onChange={(event) =>
              setSelectedRisk(
                event.target.value
              )
            }
            style={styles.select}
          >
            <option value="ALL">
              All Risk Levels
            </option>

            <option value="LOW">
              Low Risk
            </option>

            <option value="MODERATE">
              Moderate Risk
            </option>

            <option value="HIGH">
              High Risk
            </option>
          </select>

        </div>
      </div>

      {/* =================================================
          FUND CATALOGUE
      ================================================= */}

      <div style={styles.sectionHeader}>

        <div>
          <h2 style={styles.sectionTitle}>
            Mutual Fund Catalogue
          </h2>

          <p style={styles.sectionSubtitle}>
            Explore available Avani Bank mutual fund
            products.
          </p>
        </div>

      </div>

      {filteredFunds.length === 0 ? (
        <div style={styles.emptyCard}>

          <div style={styles.emptyIcon}>
            🔎
          </div>

          <h3 style={styles.emptyTitle}>
            No Mutual Funds Found
          </h3>

          <p style={styles.emptyText}>
            Try changing your search or filter
            selection.
          </p>

          <button
            type="button"
            style={styles.clearButton}
            onClick={() => {
              setSearchText("");
              setSelectedCategory("ALL");
              setSelectedRisk("ALL");
            }}
          >
            Clear Filters
          </button>

        </div>
      ) : (
        <div style={styles.fundGrid}>

          {filteredFunds.map((fund) => {
            const riskStyle =
              getRiskStyle(
                fund.riskLevel
              );

            return (
              <div
                key={fund.id}
                style={styles.fundCard}
              >

                {/* CARD TOP */}

                <div style={styles.fundTop}>

                  <div style={styles.fundIdentity}>

                    <div style={styles.fundIcon}>
                      {getCategoryIcon(
                        fund.fundCategory
                      )}
                    </div>

                    <div>
                      <h3 style={styles.fundName}>
                        {fund.fundName}
                      </h3>

                      <span style={styles.categoryText}>
                        {fund.fundCategory}
                      </span>
                    </div>

                  </div>

                  <span
                    style={{
                      ...styles.riskBadge,
                      background:
                        riskStyle.background,
                      color:
                        riskStyle.color,
                    }}
                  >
                    {fund.riskLevel}
                  </span>

                </div>

                {/* RETURN */}

                <div style={styles.returnBox}>

                  <div>
                    <span style={styles.detailLabel}>
                      Expected Return
                    </span>

                    <strong style={styles.returnValue}>
                      {formatPercent(
                        fund.expectedReturnRate
                      )}
                    </strong>
                  </div>

                  <div style={styles.returnDivider} />

                  <div>
                    <span style={styles.detailLabel}>
                      Minimum Investment
                    </span>

                    <strong style={styles.minimumValue}>
                      {formatCurrency(
                        fund.minimumInvestment
                      )}
                    </strong>
                  </div>

                </div>

                {/* DETAILS */}

                <div style={styles.fundDetails}>

                  <div style={styles.detailRow}>
                    <span>
                      Fund Category
                    </span>

                    <strong>
                      {fund.fundCategory}
                    </strong>
                  </div>

                  <div style={styles.detailRow}>
                    <span>
                      Risk Level
                    </span>

                    <strong>
                      {fund.riskLevel}
                    </strong>
                  </div>

                  <div style={styles.detailRow}>
                    <span>
                      Exit Load
                    </span>

                    <strong>
                      {fund.exitLoad != null
                        ? formatPercent(
                            fund.exitLoad
                          )
                        : "0.00%"}
                    </strong>
                  </div>

                </div>

                {/* BUTTON */}

                <button
                  type="button"
                  style={styles.detailsButton}
                  onClick={() =>
                    openDetails(fund)
                  }
                >
                  View Fund Details
                  <span>→</span>
                </button>

              </div>
            );
          })}

        </div>
      )}

      {/* =================================================
          INFORMATION SECTION
      ================================================= */}

      <div style={styles.infoSection}>

        <div style={styles.infoSectionIcon}>
          💡
        </div>

        <div>
          <h3 style={styles.infoSectionTitle}>
            About Mutual Fund Investments
          </h3>

          <p style={styles.infoSectionText}>
            Mutual funds allow investors to participate
            in professionally managed investment
            portfolios. Review the fund category,
            expected return, minimum investment and
            risk level before making an investment
            decision.
          </p>
        </div>

      </div>

      {/* =================================================
          FUND DETAILS MODAL
      ================================================= */}

      {showDetails && selectedFund && (
        <div
          style={styles.modalOverlay}
          onClick={closeDetails}
        >
          <div
            style={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div style={styles.modalHeader}>

              <div style={styles.modalFundIdentity}>

                <div style={styles.modalFundIcon}>
                  {getCategoryIcon(
                    selectedFund.fundCategory
                  )}
                </div>

                <div>
                  <h2 style={styles.modalTitle}>
                    {selectedFund.fundName}
                  </h2>

                  <p style={styles.modalSubtitle}>
                    {selectedFund.fundCategory} Mutual Fund
                  </p>
                </div>

              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={closeDetails}
              >
                ×
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div style={styles.modalContent}>

              <div style={styles.modalHighlightGrid}>

                <div style={styles.modalHighlight}>
                  <span>
                    Expected Return
                  </span>

                  <strong
                    style={{
                      color: "#198754",
                    }}
                  >
                    {formatPercent(
                      selectedFund.expectedReturnRate
                    )}
                  </strong>
                </div>

                <div style={styles.modalHighlight}>
                  <span>
                    Risk Level
                  </span>

                  <strong
                    style={{
                      color:
                        getRiskStyle(
                          selectedFund.riskLevel
                        ).color,
                    }}
                  >
                    {selectedFund.riskLevel}
                  </strong>
                </div>

                <div style={styles.modalHighlight}>
                  <span>
                    Minimum Investment
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedFund.minimumInvestment
                    )}
                  </strong>
                </div>

                <div style={styles.modalHighlight}>
                  <span>
                    Exit Load
                  </span>

                  <strong>
                    {selectedFund.exitLoad != null
                      ? formatPercent(
                          selectedFund.exitLoad
                        )
                      : "0.00%"}
                  </strong>
                </div>

              </div>

              <div style={styles.modalInfoBox}>

                <div style={styles.modalInfoRow}>
                  <span>
                    Fund ID
                  </span>

                  <strong>
                    #{selectedFund.id}
                  </strong>
                </div>

                <div style={styles.modalInfoRow}>
                  <span>
                    Fund Category
                  </span>

                  <strong>
                    {selectedFund.fundCategory}
                  </strong>
                </div>

                <div style={styles.modalInfoRow}>
                  <span>
                    Risk Profile
                  </span>

                  <strong>
                    {selectedFund.riskLevel}
                  </strong>
                </div>

                <div style={styles.modalInfoRow}>
                  <span>
                    Minimum Investment
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedFund.minimumInvestment
                    )}
                  </strong>
                </div>

                <div style={styles.modalInfoRow}>
                  <span>
                    Expected Return
                  </span>

                  <strong>
                    {formatPercent(
                      selectedFund.expectedReturnRate
                    )}
                  </strong>
                </div>

                <div style={styles.modalInfoRow}>
                  <span>
                    Exit Load
                  </span>

                  <strong>
                    {selectedFund.exitLoad != null
                      ? formatPercent(
                          selectedFund.exitLoad
                        )
                      : "0.00%"}
                  </strong>
                </div>

                <div style={styles.modalInfoRow}>
                  <span>
                    Status
                  </span>

                  <span style={styles.activeStatus}>
                    ACTIVE
                  </span>
                </div>

              </div>

              <div style={styles.modalNotice}>
                <span>ℹ</span>

                <p>
                  Investment execution will be enabled
                  after the Mutual Fund customer investment
                  module is connected.
                </p>
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div style={styles.modalFooter}>

              <button
                type="button"
                style={styles.modalCloseButton}
                onClick={closeDetails}
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "28px",
    color: "#1f2937",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background:
      "linear-gradient(135deg, #165dcc 0%, #2d74da 100%)",
    borderRadius: "18px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow:
      "0 10px 30px rgba(36, 87, 198, 0.18)",
    marginBottom: "22px",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  headerIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.12)",
  },

  headerTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "25px",
    fontWeight: 750,
  },

  headerSubtitle: {
    margin: "4px 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: "13px",
  },

  backButton: {
    border:
      "1px solid rgba(255,255,255,0.4)",
    background:
      "rgba(255,255,255,0.13)",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 650,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  errorAlert: {
    background: "#fff0f0",
    border: "1px solid #f1c0c0",
    color: "#a82929",
    borderRadius: "11px",
    padding: "12px 15px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },

  alertIcon: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#dc3545",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },

  retryButton: {
    marginLeft: "auto",
    border: "none",
    background: "#dc3545",
    color: "#ffffff",
    borderRadius: "7px",
    padding: "7px 12px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "11px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "15px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 4px 14px rgba(26, 48, 79, 0.05)",
  },

  summaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  summaryLabel: {
    margin: 0,
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 600,
  },

  summaryValue: {
    margin: "5px 0 0",
    fontSize: "19px",
    fontWeight: 750,
    color: "#172033",
  },

  filterCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "17px",
    padding: "21px",
    marginBottom: "25px",
    boxShadow:
      "0 5px 18px rgba(26, 48, 79, 0.05)",
  },

  filterHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "18px",
  },

  filterTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 750,
    color: "#172033",
  },

  filterSubtitle: {
    margin: "5px 0 0",
    color: "#778196",
    fontSize: "12px",
  },

  resultBadge: {
    background: "#eef4ff",
    color: "#2457c6",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 750,
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(260px, 1.7fr) 1fr 1fr",
    gap: "12px",
  },

  searchWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d9dfe9",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#ffffff",
  },

  searchIcon: {
    paddingLeft: "13px",
    fontSize: "14px",
  },

  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px 10px",
    fontSize: "13px",
    background: "transparent",
  },

  select: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d9dfe9",
    borderRadius: "10px",
    padding: "12px 13px",
    background: "#ffffff",
    color: "#354052",
    fontSize: "13px",
    outline: "none",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 750,
    color: "#172033",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#778196",
    fontSize: "12px",
  },

  fundGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "17px",
  },

  fundCard: {
    background: "#ffffff",
    border: "1px solid #e5e9f0",
    borderRadius: "16px",
    padding: "18px",
    boxShadow:
      "0 5px 16px rgba(26, 48, 79, 0.05)",
    transition: "transform 0.2s ease",
  },

  fundTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "17px",
  },

  fundIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
  },

  fundIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#eef4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  fundName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 750,
    color: "#202a3c",
    lineHeight: 1.25,
  },

  categoryText: {
    display: "block",
    marginTop: "4px",
    fontSize: "10px",
    color: "#7b8494",
    fontWeight: 650,
  },

  riskBadge: {
    padding: "5px 8px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  returnBox: {
    background: "#f7f9fd",
    borderRadius: "11px",
    padding: "13px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },

  detailLabel: {
    display: "block",
    color: "#7b8494",
    fontSize: "10px",
    marginBottom: "4px",
  },

  returnValue: {
    display: "block",
    color: "#198754",
    fontSize: "15px",
  },

  minimumValue: {
    display: "block",
    color: "#2457c6",
    fontSize: "13px",
  },

  returnDivider: {
    width: "1px",
    height: "30px",
    background: "#dce2eb",
  },

  fundDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    paddingBottom: "14px",
    borderBottom:
      "1px solid #edf0f4",
  },

  detailRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    fontSize: "11px",
    color: "#7b8494",
  },

  detailsButton: {
    width: "100%",
    marginTop: "14px",
    border: "1px solid #cbd9f5",
    background: "#f2f6ff",
    color: "#2457c6",
    borderRadius: "9px",
    padding: "10px",
    fontSize: "12px",
    fontWeight: 750,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px dashed #d5dce7",
    borderRadius: "15px",
    padding: "50px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#354052",
  },

  emptyText: {
    margin: "7px 0 17px",
    color: "#7b8494",
    fontSize: "12px",
  },

  clearButton: {
    border: "none",
    background: "#2457c6",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "9px 15px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
  },

  infoSection: {
    marginTop: "24px",
    background: "#f2f6ff",
    border:
      "1px solid #dce6fb",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  infoSectionIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  infoSectionTitle: {
    margin: 0,
    fontSize: "14px",
    color: "#2457c6",
  },

  infoSectionText: {
    margin: "5px 0 0",
    color: "#647086",
    fontSize: "11px",
    lineHeight: 1.55,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 28, 48, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "560px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow:
      "0 22px 70px rgba(0,0,0,0.22)",
  },

  modalHeader: {
    padding: "20px 21px",
    borderBottom:
      "1px solid #edf0f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  modalFundIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  modalFundIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "#eef4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 750,
    color: "#172033",
  },

  modalSubtitle: {
    margin: "4px 0 0",
    color: "#7b8494",
    fontSize: "11px",
  },

  closeButton: {
    width: "32px",
    height: "32px",
    border: "none",
    background: "#f1f3f5",
    color: "#5c6677",
    borderRadius: "50%",
    fontSize: "21px",
    cursor: "pointer",
    lineHeight: 1,
  },

  modalContent: {
    padding: "20px 21px",
  },

  modalHighlightGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "11px",
    marginBottom: "15px",
  },

  modalHighlight: {
    background: "#f7f9fc",
    borderRadius: "11px",
    padding: "13px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  modalHighlightSpan: {
    color: "#7b8494",
    fontSize: "10px",
  },

  modalInfoBox: {
    border:
      "1px solid #e6eaf0",
    borderRadius: "11px",
    padding: "5px 13px",
  },

  modalInfoRow: {
    minHeight: "39px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderBottom:
      "1px solid #edf0f4",
    fontSize: "11px",
    color: "#7b8494",
  },

  activeStatus: {
    background: "#eaf8ef",
    color: "#198754",
    borderRadius: "20px",
    padding: "5px 9px",
    fontSize: "9px",
    fontWeight: 800,
  },

  modalNotice: {
    marginTop: "15px",
    background: "#fff8e8",
    border:
      "1px solid #f4dfae",
    borderRadius: "10px",
    padding: "11px",
    display: "flex",
    gap: "8px",
    color: "#856404",
    fontSize: "11px",
    lineHeight: 1.45,
  },

  modalFooter: {
    padding: "15px 21px 20px",
    borderTop:
      "1px solid #edf0f4",
    display: "flex",
    justifyContent: "flex-end",
  },

  modalCloseButton: {
    border: "1px solid #d8dee8",
    background: "#ffffff",
    color: "#536075",
    borderRadius: "9px",
    padding: "9px 18px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "45px 25px",
    textAlign: "center",
    boxShadow:
      "0 10px 35px rgba(26, 48, 79, 0.08)",
  },

  loadingIcon: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  loadingTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#172033",
  },

  loadingText: {
    margin: "8px 0 0",
    color: "#7b8494",
    fontSize: "13px",
  },
};