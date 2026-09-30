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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > 600 && window.innerWidth <= 900
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 600);
      setIsTablet(width > 600 && width <= 900);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  // RESPONSIVE STYLES
  // =====================================================

  const responsiveStyles = {
    ...styles,
    page: {
      ...styles.page,
      padding: isMobile ? "12px" : isTablet ? "18px" : styles.page.padding,
    },
    header: {
      ...styles.header,
      padding: isMobile ? "16px" : isTablet ? "18px 20px" : styles.header.padding,
      flexDirection: isMobile ? "column" : styles.header.flexDirection,
      alignItems: isMobile ? "stretch" : styles.header.alignItems,
      gap: isMobile ? "14px" : styles.header.gap,
    },
    headerLeft: {
      ...styles.headerLeft,
      gap: isMobile ? "10px" : styles.headerLeft.gap,
    },
    headerIcon: {
      ...styles.headerIcon,
      width: isMobile ? "44px" : styles.headerIcon.width,
      height: isMobile ? "44px" : styles.headerIcon.height,
      fontSize: isMobile ? "22px" : styles.headerIcon.fontSize,
    },
    headerTitle: {
      ...styles.headerTitle,
      fontSize: isMobile ? "20px" : isTablet ? "23px" : styles.headerTitle.fontSize,
    },
    headerSubtitle: {
      ...styles.headerSubtitle,
      fontSize: isMobile ? "11px" : styles.headerSubtitle.fontSize,
      lineHeight: 1.4,
    },
    backButton: {
      ...styles.backButton,
      width: isMobile ? "100%" : "auto",
      boxSizing: "border-box",
      textAlign: "center",
    },
    errorAlert: {
      ...styles.errorAlert,
      alignItems: isMobile ? "flex-start" : styles.errorAlert.alignItems,
      flexWrap: isMobile ? "wrap" : "nowrap",
      padding: isMobile ? "11px 12px" : styles.errorAlert.padding,
    },
    retryButton: {
      ...styles.retryButton,
      marginLeft: isMobile ? "32px" : styles.retryButton.marginLeft,
      marginTop: isMobile ? "2px" : 0,
    },
    summaryGrid: {
      ...styles.summaryGrid,
      gridTemplateColumns: isMobile
        ? "1fr"
        : isTablet
          ? "repeat(2, minmax(0, 1fr))"
          : styles.summaryGrid.gridTemplateColumns,
      gap: isMobile ? "10px" : styles.summaryGrid.gap,
    },
    summaryCard: {
      ...styles.summaryCard,
      padding: isMobile ? "14px" : styles.summaryCard.padding,
    },
    filterCard: {
      ...styles.filterCard,
      padding: isMobile ? "15px" : isTablet ? "18px" : styles.filterCard.padding,
    },
    filterHeading: {
      ...styles.filterHeading,
      flexDirection: isMobile ? "column" : styles.filterHeading.flexDirection,
      alignItems: isMobile ? "stretch" : styles.filterHeading.alignItems,
    },
    filterTitle: {
      ...styles.filterTitle,
      fontSize: isMobile ? "16px" : styles.filterTitle.fontSize,
    },
    resultBadge: {
      ...styles.resultBadge,
      alignSelf: isMobile ? "flex-start" : "auto",
    },
    filterGrid: {
      ...styles.filterGrid,
      gridTemplateColumns: isMobile
        ? "1fr"
        : isTablet
          ? "1fr 1fr"
          : styles.filterGrid.gridTemplateColumns,
    },
    searchInput: {
      ...styles.searchInput,
      minWidth: 0,
    },
    sectionHeader: {
      ...styles.sectionHeader,
      alignItems: isMobile ? "flex-start" : styles.sectionHeader.alignItems,
    },
    sectionTitle: {
      ...styles.sectionTitle,
      fontSize: isMobile ? "17px" : styles.sectionTitle.fontSize,
    },
    fundGrid: {
      ...styles.fundGrid,
      gridTemplateColumns: isMobile
        ? "1fr"
        : isTablet
          ? "repeat(2, minmax(0, 1fr))"
          : styles.fundGrid.gridTemplateColumns,
    },
    fundCard: {
      ...styles.fundCard,
      padding: isMobile ? "15px" : styles.fundCard.padding,
    },
    fundTop: {
      ...styles.fundTop,
      flexDirection: isMobile ? "column" : styles.fundTop.flexDirection,
    },
    fundName: {
      ...styles.fundName,
      fontSize: isMobile ? "14px" : styles.fundName.fontSize,
      overflowWrap: "anywhere",
    },
    riskBadge: {
      ...styles.riskBadge,
      alignSelf: isMobile ? "flex-start" : "auto",
    },
    returnBox: {
      ...styles.returnBox,
      gridTemplateColumns: isMobile ? "1fr" : styles.returnBox.gridTemplateColumns,
      gap: isMobile ? "9px" : styles.returnBox.gap,
    },
    returnDivider: {
      ...styles.returnDivider,
      width: isMobile ? "100%" : styles.returnDivider.width,
      height: isMobile ? "1px" : styles.returnDivider.height,
    },
    detailRow: {
      ...styles.detailRow,
      alignItems: isMobile ? "flex-start" : styles.detailRow.alignItems,
      flexWrap: isMobile ? "wrap" : "nowrap",
    },
    infoSection: {
      ...styles.infoSection,
      padding: isMobile ? "13px" : styles.infoSection.padding,
      gap: isMobile ? "9px" : styles.infoSection.gap,
    },
    infoSectionText: {
      ...styles.infoSectionText,
      fontSize: isMobile ? "10.5px" : styles.infoSectionText.fontSize,
    },
    modalOverlay: {
      ...styles.modalOverlay,
      padding: isMobile ? "10px" : styles.modalOverlay.padding,
      alignItems: isMobile ? "flex-start" : styles.modalOverlay.alignItems,
    },
    modal: {
      ...styles.modal,
      maxHeight: isMobile ? "calc(100vh - 20px)" : styles.modal.maxHeight,
      borderRadius: isMobile ? "14px" : styles.modal.borderRadius,
      marginTop: isMobile ? "10px" : 0,
    },
    modalHeader: {
      ...styles.modalHeader,
      padding: isMobile ? "15px" : styles.modalHeader.padding,
      gap: isMobile ? "10px" : styles.modalHeader.gap,
    },
    modalFundIdentity: {
      ...styles.modalFundIdentity,
      minWidth: 0,
    },
    modalFundIcon: {
      ...styles.modalFundIcon,
      width: isMobile ? "40px" : styles.modalFundIcon.width,
      height: isMobile ? "40px" : styles.modalFundIcon.height,
      fontSize: isMobile ? "19px" : styles.modalFundIcon.fontSize,
      flexShrink: 0,
    },
    modalTitle: {
      ...styles.modalTitle,
      fontSize: isMobile ? "15px" : styles.modalTitle.fontSize,
      overflowWrap: "anywhere",
    },
    modalContent: {
      ...styles.modalContent,
      padding: isMobile ? "15px" : styles.modalContent.padding,
    },
    modalHighlightGrid: {
      ...styles.modalHighlightGrid,
      gridTemplateColumns: isMobile
        ? "1fr"
        : styles.modalHighlightGrid.gridTemplateColumns,
    },
    modalInfoRow: {
      ...styles.modalInfoRow,
      alignItems: isMobile ? "flex-start" : styles.modalInfoRow.alignItems,
      padding: isMobile ? "9px 0" : 0,
      minHeight: isMobile ? "auto" : styles.modalInfoRow.minHeight,
    },
    modalNotice: {
      ...styles.modalNotice,
      alignItems: "flex-start",
    },
    modalFooter: {
      ...styles.modalFooter,
      padding: isMobile ? "12px 15px 15px" : styles.modalFooter.padding,
    },
    modalCloseButton: {
      ...styles.modalCloseButton,
      width: isMobile ? "100%" : "auto",
    },
    loadingPage: {
      ...styles.loadingPage,
      padding: isMobile ? "15px" : styles.loadingPage.padding,
    },
    loadingCard: {
      ...styles.loadingCard,
      padding: isMobile ? "35px 18px" : styles.loadingCard.padding,
    },
    loadingTitle: {
      ...styles.loadingTitle,
      fontSize: isMobile ? "18px" : styles.loadingTitle.fontSize,
    },
    loadingText: {
      ...styles.loadingText,
      fontSize: isMobile ? "12px" : styles.loadingText.fontSize,
    },
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={responsiveStyles.loadingPage}>
        <div style={responsiveStyles.loadingCard}>
          <div style={responsiveStyles.loadingIcon}>
            📈
          </div>

          <h2 style={responsiveStyles.loadingTitle}>
            Loading Mutual Funds...
          </h2>

          <p style={responsiveStyles.loadingText}>
            Please wait while we load available
            investment funds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={responsiveStyles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={responsiveStyles.header}>
        <div style={responsiveStyles.headerLeft}>
          <div style={responsiveStyles.headerIcon}>
            📈
          </div>

          <div>
            <h1 style={responsiveStyles.headerTitle}>
              Mutual Fund Investments
            </h1>

            <p style={responsiveStyles.headerSubtitle}>
              Explore and compare mutual fund opportunities
            </p>
          </div>
        </div>

        <button
          type="button"
          style={responsiveStyles.backButton}
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
        <div style={responsiveStyles.errorAlert}>
          <span style={responsiveStyles.alertIcon}>
            !
          </span>

          <span>{error}</span>

          <button
            type="button"
            style={responsiveStyles.retryButton}
            onClick={loadFunds}
          >
            Retry
          </button>
        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div style={responsiveStyles.summaryGrid}>

        <div style={responsiveStyles.summaryCard}>
          <div
            style={{
              ...responsiveStyles.summaryIcon,
              background: "#eef4ff",
              color: "#2457c6",
            }}
          >
            📊
          </div>

          <div>
            <p style={responsiveStyles.summaryLabel}>
              Available Funds
            </p>

            <h2 style={responsiveStyles.summaryValue}>
              {totalFunds}
            </h2>
          </div>
        </div>

        <div style={responsiveStyles.summaryCard}>
          <div
            style={{
              ...responsiveStyles.summaryIcon,
              background: "#eef8f1",
              color: "#198754",
            }}
          >
            📈
          </div>

          <div>
            <p style={responsiveStyles.summaryLabel}>
              Equity Funds
            </p>

            <h2 style={responsiveStyles.summaryValue}>
              {equityFunds}
            </h2>
          </div>
        </div>

        <div style={responsiveStyles.summaryCard}>
          <div
            style={{
              ...responsiveStyles.summaryIcon,
              background: "#fff7e6",
              color: "#c57b00",
            }}
          >
            🛡️
          </div>

          <div>
            <p style={responsiveStyles.summaryLabel}>
              Low Risk Funds
            </p>

            <h2 style={responsiveStyles.summaryValue}>
              {lowRiskFunds}
            </h2>
          </div>
        </div>

        <div style={responsiveStyles.summaryCard}>
          <div
            style={{
              ...responsiveStyles.summaryIcon,
              background: "#f2edff",
              color: "#6842c2",
            }}
          >
            %
          </div>

          <div>
            <p style={responsiveStyles.summaryLabel}>
              Avg. Expected Return
            </p>

            <h2 style={responsiveStyles.summaryValue}>
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

      <div style={responsiveStyles.filterCard}>

        <div style={responsiveStyles.filterHeading}>
          <div>
            <h2 style={responsiveStyles.filterTitle}>
              Find Your Mutual Fund
            </h2>

            <p style={responsiveStyles.filterSubtitle}>
              Compare funds based on category and
              risk level.
            </p>
          </div>

          <span style={responsiveStyles.resultBadge}>
            {filteredFunds.length} Funds
          </span>
        </div>

        <div style={responsiveStyles.filterGrid}>

          {/* SEARCH */}

          <div style={responsiveStyles.searchWrapper}>
            <span style={responsiveStyles.searchIcon}>
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
              style={responsiveStyles.searchInput}
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
            style={responsiveStyles.select}
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
            style={responsiveStyles.select}
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

      <div style={responsiveStyles.sectionHeader}>

        <div>
          <h2 style={responsiveStyles.sectionTitle}>
            Mutual Fund Catalogue
          </h2>

          <p style={responsiveStyles.sectionSubtitle}>
            Explore available Avani Bank mutual fund
            products.
          </p>
        </div>

      </div>

      {filteredFunds.length === 0 ? (
        <div style={responsiveStyles.emptyCard}>

          <div style={responsiveStyles.emptyIcon}>
            🔎
          </div>

          <h3 style={responsiveStyles.emptyTitle}>
            No Mutual Funds Found
          </h3>

          <p style={responsiveStyles.emptyText}>
            Try changing your search or filter
            selection.
          </p>

          <button
            type="button"
            style={responsiveStyles.clearButton}
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
        <div style={responsiveStyles.fundGrid}>

          {filteredFunds.map((fund) => {
            const riskStyle =
              getRiskStyle(
                fund.riskLevel
              );

            return (
              <div
                key={fund.id}
                style={responsiveStyles.fundCard}
              >

                {/* CARD TOP */}

                <div style={responsiveStyles.fundTop}>

                  <div style={responsiveStyles.fundIdentity}>

                    <div style={responsiveStyles.fundIcon}>
                      {getCategoryIcon(
                        fund.fundCategory
                      )}
                    </div>

                    <div>
                      <h3 style={responsiveStyles.fundName}>
                        {fund.fundName}
                      </h3>

                      <span style={responsiveStyles.categoryText}>
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

                <div style={responsiveStyles.returnBox}>

                  <div>
                    <span style={responsiveStyles.detailLabel}>
                      Expected Return
                    </span>

                    <strong style={responsiveStyles.returnValue}>
                      {formatPercent(
                        fund.expectedReturnRate
                      )}
                    </strong>
                  </div>

                  <div style={responsiveStyles.returnDivider} />

                  <div>
                    <span style={responsiveStyles.detailLabel}>
                      Minimum Investment
                    </span>

                    <strong style={responsiveStyles.minimumValue}>
                      {formatCurrency(
                        fund.minimumInvestment
                      )}
                    </strong>
                  </div>

                </div>

                {/* DETAILS */}

                <div style={responsiveStyles.fundDetails}>

                  <div style={responsiveStyles.detailRow}>
                    <span>
                      Fund Category
                    </span>

                    <strong>
                      {fund.fundCategory}
                    </strong>
                  </div>

                  <div style={responsiveStyles.detailRow}>
                    <span>
                      Risk Level
                    </span>

                    <strong>
                      {fund.riskLevel}
                    </strong>
                  </div>

                  <div style={responsiveStyles.detailRow}>
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
                  style={responsiveStyles.detailsButton}
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

      <div style={responsiveStyles.infoSection}>

        <div style={responsiveStyles.infoSectionIcon}>
          💡
        </div>

        <div>
          <h3 style={responsiveStyles.infoSectionTitle}>
            About Mutual Fund Investments
          </h3>

          <p style={responsiveStyles.infoSectionText}>
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
          style={responsiveStyles.modalOverlay}
          onClick={closeDetails}
        >
          <div
            style={responsiveStyles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div style={responsiveStyles.modalHeader}>

              <div style={responsiveStyles.modalFundIdentity}>

                <div style={responsiveStyles.modalFundIcon}>
                  {getCategoryIcon(
                    selectedFund.fundCategory
                  )}
                </div>

                <div>
                  <h2 style={responsiveStyles.modalTitle}>
                    {selectedFund.fundName}
                  </h2>

                  <p style={responsiveStyles.modalSubtitle}>
                    {selectedFund.fundCategory} Mutual Fund
                  </p>
                </div>

              </div>

              <button
                type="button"
                style={responsiveStyles.closeButton}
                onClick={closeDetails}
              >
                ×
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div style={responsiveStyles.modalContent}>

              <div style={responsiveStyles.modalHighlightGrid}>

                <div style={responsiveStyles.modalHighlight}>
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

                <div style={responsiveStyles.modalHighlight}>
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

                <div style={responsiveStyles.modalHighlight}>
                  <span>
                    Minimum Investment
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedFund.minimumInvestment
                    )}
                  </strong>
                </div>

                <div style={responsiveStyles.modalHighlight}>
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

              <div style={responsiveStyles.modalInfoBox}>

                <div style={responsiveStyles.modalInfoRow}>
                  <span>
                    Fund ID
                  </span>

                  <strong>
                    #{selectedFund.id}
                  </strong>
                </div>

                <div style={responsiveStyles.modalInfoRow}>
                  <span>
                    Fund Category
                  </span>

                  <strong>
                    {selectedFund.fundCategory}
                  </strong>
                </div>

                <div style={responsiveStyles.modalInfoRow}>
                  <span>
                    Risk Profile
                  </span>

                  <strong>
                    {selectedFund.riskLevel}
                  </strong>
                </div>

                <div style={responsiveStyles.modalInfoRow}>
                  <span>
                    Minimum Investment
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedFund.minimumInvestment
                    )}
                  </strong>
                </div>

                <div style={responsiveStyles.modalInfoRow}>
                  <span>
                    Expected Return
                  </span>

                  <strong>
                    {formatPercent(
                      selectedFund.expectedReturnRate
                    )}
                  </strong>
                </div>

                <div style={responsiveStyles.modalInfoRow}>
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

                <div style={responsiveStyles.modalInfoRow}>
                  <span>
                    Status
                  </span>

                  <span style={responsiveStyles.activeStatus}>
                    ACTIVE
                  </span>
                </div>

              </div>

              <div style={responsiveStyles.modalNotice}>
                <span>ℹ</span>

                <p>
                  Investment execution will be enabled
                  after the Mutual Fund customer investment
                  module is connected.
                </p>
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div style={responsiveStyles.modalFooter}>

              <button
                type="button"
                style={responsiveStyles.modalCloseButton}
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