import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function BondManagement() {
  const [accounts, setAccounts] = useState([]);
  const [bondPlans, setBondPlans] = useState([]);
  const [bonds, setBonds] = useState([]);

  const [selectedPlanCode, setSelectedPlanCode] = useState("");
  const [accountId, setAccountId] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [sellingId, setSellingId] = useState(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 600 : false
  );
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined"
      ? window.innerWidth > 600 && window.innerWidth <= 900
      : false
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Sync with the dashboard's shared Avani theme.
  const [darkMode, setDarkMode] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("avani-theme") === "dark"
  );

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    };
    syncTheme();
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const [sellBondData, setSellBondData] = useState(null);

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken");

    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [accountsResponse, plansResponse, bondsResponse] =
        await Promise.all([
          fetch(`${API_BASE}/api/accounts`, {
            headers: getHeaders(),
          }),
          fetch(`${API_BASE}/api/bond-plans`, {
            headers: getHeaders(),
          }),
          fetch(`${API_BASE}/api/bonds`, {
            headers: getHeaders(),
          }),
        ]);

      if (!accountsResponse.ok) {
        throw new Error("Unable to load accounts");
      }

      if (!plansResponse.ok) {
        throw new Error("Unable to load bond plans");
      }

      if (!bondsResponse.ok) {
        throw new Error("Unable to load bonds");
      }

      const accountData = await accountsResponse.json();
      const planData = await plansResponse.json();
      const bondData = await bondsResponse.json();

      setAccounts(
        Array.isArray(accountData)
          ? accountData.filter(
              (account) =>
                String(account.status || "").toUpperCase() === "ACTIVE"
            )
          : []
      );

      setBondPlans(
        Array.isArray(planData)
          ? planData
          : []
      );

      setBonds(
        Array.isArray(bondData)
          ? bondData
          : []
      );

      if (Array.isArray(planData) && planData.length > 0) {
        setSelectedPlanCode(planData[0].planCode);
      }

      if (Array.isArray(accountData)) {
        const activeAccount = accountData.find(
          (account) =>
            String(account.status || "").toUpperCase() === "ACTIVE"
        );

        if (activeAccount) {
          setAccountId(String(activeAccount.id));
        }
      }
    } catch (err) {
      setError(
        err.message || "Unable to load Bond Management data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 600);
      setIsTablet(width > 600 && width <= 900);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // =====================================================
  // SELECTED PLAN
  // =====================================================

  const selectedPlan = useMemo(() => {
    return bondPlans.find(
      (plan) =>
        plan.planCode === selectedPlanCode
    );
  }, [bondPlans, selectedPlanCode]);

  // =====================================================
  // EXPECTED INTEREST
  // =====================================================

  const expectedInterest = useMemo(() => {
    if (
      !selectedPlan ||
      !investmentAmount ||
      Number(investmentAmount) <= 0
    ) {
      return 0;
    }

    const amount = Number(investmentAmount);
    const rate = Number(selectedPlan.couponRate);
    const months = Number(selectedPlan.tenureMonths);

    return (
      (amount * rate * (months / 12)) /
      100
    );
  }, [selectedPlan, investmentAmount]);

  // =====================================================
  // HANDLE PLAN CHANGE
  // =====================================================

  const handlePlanChange = (event) => {
    setSelectedPlanCode(event.target.value);
    setInvestmentAmount("");
    setMessage("");
    setError("");
  };

  // =====================================================
  // PURCHASE BOND
  // =====================================================

  const handlePurchase = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedPlan) {
      setError("Please select a bond plan.");
      return;
    }

    if (!accountId) {
      setError("Please select an account.");
      return;
    }

    const amount = Number(investmentAmount);

    if (!amount || amount <= 0) {
      setError("Please enter a valid investment amount.");
      return;
    }

    const minimumInvestment =
      Number(selectedPlan.minimumInvestment);

    if (amount < minimumInvestment) {
      setError(
        `Minimum investment is ₹${minimumInvestment.toLocaleString(
          "en-IN"
        )}.`
      );
      return;
    }

    const account = accounts.find(
      (item) => String(item.id) === String(accountId)
    );

    if (
      account &&
      account.balance != null &&
      Number(account.balance) < amount
    ) {
      setError("Insufficient account balance.");
      return;
    }

    const confirmed = window.confirm(
      `Confirm Bond Investment?\n\n` +
        `${selectedPlan.bondName}\n` +
        `Investment: ₹${amount.toLocaleString("en-IN")}\n` +
        `Coupon Rate: ${selectedPlan.couponRate}%\n` +
        `Tenure: ${selectedPlan.tenureMonths} months`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPurchasing(true);

      const params = new URLSearchParams();

      params.append("accountId", accountId);
      params.append(
        "bondName",
        selectedPlan.bondName
      );
      params.append(
        "bondType",
        selectedPlan.bondType
      );
      params.append(
        "faceValue",
        selectedPlan.faceValue
      );
      params.append(
        "investmentAmount",
        amount
      );
      params.append(
        "couponRate",
        selectedPlan.couponRate
      );
      params.append(
        "tenureMonths",
        selectedPlan.tenureMonths
      );

      const response = await fetch(
        `${API_BASE}/api/bonds?${params.toString()}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Bond purchase failed."
        );
      }

      setMessage(
        "Bond purchased successfully."
      );

      setInvestmentAmount("");

      await loadData();
    } catch (err) {
      setError(
        err.message || "Bond purchase failed."
      );
    } finally {
      setPurchasing(false);
    }
  };

  // =====================================================
  // SELL CONFIRMATION
  // =====================================================

  const openSellConfirmation = (bond) => {
    setSellBondData(bond);
    setMessage("");
    setError("");
  };

  const closeSellConfirmation = () => {
    if (sellingId === null) {
      setSellBondData(null);
    }
  };

  // =====================================================
  // SELL BOND
  // =====================================================

  const handleSellBond = async () => {
    if (!sellBondData) {
      return;
    }

    try {
      setSellingId(sellBondData.id);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE}/api/bonds/${sellBondData.id}/sell`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Bond sale failed."
        );
      }

      setSellBondData(null);

      setMessage(
        "Bond sold successfully and amount credited to your account."
      );

      await loadData();
    } catch (err) {
      setError(
        err.message || "Bond sale failed."
      );
    } finally {
      setSellingId(null);
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const activeBonds = bonds.filter(
    (bond) =>
      String(bond.status || "").toUpperCase() ===
      "ACTIVE"
  );

  const totalInvestment = activeBonds.reduce(
    (sum, bond) =>
      sum + Number(bond.investmentAmount || 0),
    0
  );

  const totalInterest = activeBonds.reduce(
    (sum, bond) =>
      sum + Number(bond.totalInterestEarned || 0),
    0
  );

  const currentValue = activeBonds.reduce(
    (sum, bond) =>
      sum + Number(bond.currentValue || 0),
    0
  );

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const responsiveStyles = {
    ...styles,
    page: { ...styles.page, overflowX: "hidden" },
    header: {
      ...styles.header,
      margin: isMobile ? "10px" : isTablet ? "14px" : styles.header.margin,
      padding: isMobile ? "16px" : isTablet ? "19px 20px" : styles.header.padding,
      flexDirection: isMobile || isTablet ? "column" : "row",
      alignItems: isMobile || isTablet ? "stretch" : "center",
      gap: isMobile ? "14px" : "18px",
      borderRadius: isMobile ? "14px" : styles.header.borderRadius,
    },
    headerLeft: {
      ...styles.headerLeft,
      alignItems: isMobile ? "flex-start" : "center",
      gap: isMobile ? "10px" : styles.headerLeft.gap,
      minWidth: 0,
    },
    headerIcon: {
      ...styles.headerIcon,
      width: isMobile ? "44px" : isTablet ? "48px" : styles.headerIcon.width,
      height: isMobile ? "44px" : isTablet ? "48px" : styles.headerIcon.height,
      fontSize: isMobile ? "22px" : styles.headerIcon.fontSize,
      flexShrink: 0,
    },
    headerTitle: {
      ...styles.headerTitle,
      fontSize: isMobile ? "20px" : isTablet ? "23px" : styles.headerTitle.fontSize,
      lineHeight: 1.25,
    },
    headerSubtitle: {
      ...styles.headerSubtitle,
      fontSize: isMobile ? "11px" : styles.headerSubtitle.fontSize,
      lineHeight: 1.45,
    },
    backButton: {
      ...styles.backButton,
      width: isMobile || isTablet ? "100%" : "auto",
      boxSizing: "border-box",
      textAlign: "center",
      padding: isMobile ? "11px 13px" : styles.backButton.padding,
    },
    container: {
      ...styles.container,
      padding: isMobile ? "0 10px 30px" : isTablet ? "0 14px 35px" : styles.container.padding,
    },
    successMessage: {
      ...styles.successMessage,
      fontSize: isMobile ? "12px" : styles.successMessage.fontSize,
      lineHeight: 1.45,
    },
    errorMessage: {
      ...styles.errorMessage,
      fontSize: isMobile ? "12px" : styles.errorMessage.fontSize,
      lineHeight: 1.45,
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
      padding: isMobile ? "15px" : styles.summaryCard.padding,
      minWidth: 0,
    },
    summaryValue: {
      ...styles.summaryValue,
      fontSize: isMobile ? "18px" : styles.summaryValue.fontSize,
      overflowWrap: "anywhere",
    },
    mainGrid: {
      ...styles.mainGrid,
      gridTemplateColumns: isMobile || isTablet ? "1fr" : styles.mainGrid.gridTemplateColumns,
      gap: isMobile ? "12px" : styles.mainGrid.gap,
    },
    card: {
      ...styles.card,
      padding: isMobile ? "16px" : isTablet ? "19px" : styles.card.padding,
      borderRadius: isMobile ? "14px" : styles.card.borderRadius,
    },
    sectionHeader: {
      ...styles.sectionHeader,
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      gap: isMobile ? "12px" : styles.sectionHeader.gap,
      marginBottom: isMobile ? "17px" : styles.sectionHeader.marginBottom,
    },
    sectionTitle: {
      ...styles.sectionTitle,
      fontSize: isMobile ? "18px" : styles.sectionTitle.fontSize,
    },
    sectionSubtitle: {
      ...styles.sectionSubtitle,
      fontSize: isMobile ? "11px" : styles.sectionSubtitle.fontSize,
      lineHeight: 1.45,
    },
    sectionIcon: {
      ...styles.sectionIcon,
      alignSelf: isMobile ? "flex-start" : "auto",
    },
    activeBadge: {
      ...styles.activeBadge,
      alignSelf: isMobile ? "flex-start" : "auto",
    },
    input: {
      ...styles.input,
      minHeight: isMobile ? "43px" : "auto",
      fontSize: isMobile ? "13px" : styles.input.fontSize,
    },
    amountWrapper: {
      ...styles.amountWrapper,
      minHeight: isMobile ? "43px" : "auto",
    },
    amountInput: {
      ...styles.amountInput,
      minWidth: 0,
      fontSize: isMobile ? "13px" : styles.amountInput.fontSize,
    },
    planDetails: {
      ...styles.planDetails,
      padding: isMobile ? "13px" : styles.planDetails.padding,
    },
    planTop: {
      ...styles.planTop,
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      gap: isMobile ? "12px" : styles.planTop.gap,
    },
    planName: {
      ...styles.planName,
      fontSize: isMobile ? "15px" : styles.planName.fontSize,
      overflowWrap: "anywhere",
    },
    rateBox: {
      ...styles.rateBox,
      alignItems: isMobile ? "flex-start" : "flex-end",
    },
    detailGrid: {
      ...styles.detailGrid,
      gridTemplateColumns: isMobile
        ? "1fr"
        : isTablet
        ? "repeat(2, minmax(0, 1fr))"
        : styles.detailGrid.gridTemplateColumns,
      gap: isMobile ? "11px" : styles.detailGrid.gap,
    },
    description: {
      ...styles.description,
      fontSize: isMobile ? "11px" : styles.description.fontSize,
    },
    calculationBox: {
      ...styles.calculationBox,
      padding: isMobile ? "12px" : styles.calculationBox.padding,
    },
    calcRow: {
      ...styles.calcRow,
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      gap: isMobile ? "3px" : styles.calcRow.gap,
      fontSize: isMobile ? "12px" : styles.calcRow.fontSize,
    },
    primaryButton: {
      ...styles.primaryButton,
      minHeight: isMobile ? "44px" : "auto",
      fontSize: isMobile ? "13px" : styles.primaryButton.fontSize,
    },
    infoCard: {
      ...styles.infoCard,
      padding: isMobile ? "18px" : isTablet ? "21px" : styles.infoCard.padding,
      borderRadius: isMobile ? "14px" : styles.infoCard.borderRadius,
    },
    infoTitle: {
      ...styles.infoTitle,
      fontSize: isMobile ? "18px" : styles.infoTitle.fontSize,
    },
    infoItem: {
      ...styles.infoItem,
      gap: isMobile ? "9px" : styles.infoItem.gap,
    },
    infoItemP: {
      ...styles.infoItemP,
      fontSize: isMobile ? "11px" : styles.infoItemP.fontSize,
    },
    infoNote: {
      ...styles.infoNote,
      fontSize: isMobile ? "10px" : styles.infoNote.fontSize,
    },
    bondGrid: {
      ...styles.bondGrid,
      gridTemplateColumns: isMobile
        ? "1fr"
        : isTablet
        ? "repeat(2, minmax(0, 1fr))"
        : styles.bondGrid.gridTemplateColumns,
      gap: isMobile ? "12px" : styles.bondGrid.gap,
    },
    bondCard: {
      ...styles.bondCard,
      padding: isMobile ? "14px" : styles.bondCard.padding,
      minWidth: 0,
    },
    bondHeader: {
      ...styles.bondHeader,
      flexDirection: isMobile ? "column" : "row",
      alignItems: "flex-start",
      gap: isMobile ? "9px" : styles.bondHeader.gap,
    },
    bondName: {
      ...styles.bondName,
      fontSize: isMobile ? "15px" : styles.bondName.fontSize,
      overflowWrap: "anywhere",
    },
    statusBadge: {
      ...styles.statusBadge,
      alignSelf: isMobile ? "flex-start" : "auto",
    },
    bondAmount: {
      ...styles.bondAmount,
      fontSize: isMobile ? "20px" : styles.bondAmount.fontSize,
      overflowWrap: "anywhere",
    },
    bondDetails: {
      ...styles.bondDetails,
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
      gap: isMobile ? "10px" : styles.bondDetails.gap,
    },
    sellButton: {
      ...styles.sellButton,
      minHeight: isMobile ? "42px" : "auto",
    },
    emptyState: {
      ...styles.emptyState,
      padding: isMobile ? "32px 14px" : styles.emptyState.padding,
    },
    historyTableWrapper: {
      ...styles.historyTableWrapper,
      width: "100%",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
    },
    table: {
      ...styles.table,
      minWidth: isMobile ? "720px" : styles.table.minWidth,
    },
    th: {
      ...styles.th,
      padding: isMobile ? "10px" : styles.th.padding,
      whiteSpace: "nowrap",
    },
    td: {
      ...styles.td,
      padding: isMobile ? "11px 10px" : styles.td.padding,
      whiteSpace: "nowrap",
    },
    loading: {
      ...styles.loading,
      padding: isMobile ? "25px 10px" : styles.loading.padding,
    },
    modalOverlay: {
      ...styles.modalOverlay,
      padding: isMobile ? "12px" : styles.modalOverlay.padding,
    },
    modal: {
      ...styles.modal,
      maxWidth: isMobile ? "100%" : styles.modal.maxWidth,
      padding: isMobile ? "18px" : styles.modal.padding,
      borderRadius: isMobile ? "14px" : styles.modal.borderRadius,
      maxHeight: isMobile ? "92vh" : "none",
      overflowY: isMobile ? "auto" : "visible",
    },
    modalTitle: {
      ...styles.modalTitle,
      fontSize: isMobile ? "19px" : styles.modalTitle.fontSize,
    },
    modalText: {
      ...styles.modalText,
      fontSize: isMobile ? "12px" : styles.modalText.fontSize,
    },
    modalActions: {
      ...styles.modalActions,
      flexDirection: isMobile ? "column-reverse" : "row",
      marginTop: isMobile ? "16px" : styles.modalActions.marginTop,
    },
    cancelButton: {
      ...styles.cancelButton,
      width: isMobile ? "100%" : "auto",
      minHeight: isMobile ? "42px" : "auto",
    },
    confirmSellButton: {
      ...styles.confirmSellButton,
      width: isMobile ? "100%" : "auto",
      minHeight: isMobile ? "42px" : "auto",
    },
  };

  // Dark-mode colors layered over responsive styles. Keep the header and back button unchanged.
  const darkOverrides = darkMode ? {
    page: { background: "#0b1220", color: "#e5e7eb" },
    container: { color: "#e5e7eb" },
    successMessage: { background: "#102c20", color: "#86efac", border: "1px solid #236342" },
    errorMessage: { background: "#351719", color: "#fca5a5", border: "1px solid #7f3038" },
    summaryCard: { background: "#151f30", border: "1px solid #29364a", boxShadow: "0 5px 18px rgba(0,0,0,0.18)" },
    summaryIcon: { background: "#1d3150" },
    summaryLabel: { color: "#a7b4c8" },
    summaryValue: { color: "#f3f6fb" },
    card: { background: "#151f30", border: "1px solid #29364a", boxShadow: "0 5px 18px rgba(0,0,0,0.18)" },
    sectionTitle: { color: "#f3f6fb" },
    sectionSubtitle: { color: "#a7b4c8" },
    sectionIcon: { background: "#1d3150" },
    label: { color: "#d1d9e6" },
    input: { background: "#0f1726", color: "#e5e7eb", border: "1px solid #3a4960", colorScheme: "dark" },
    amountWrapper: { background: "#0f1726", border: "1px solid #3a4960" },
    amountInput: { background: "#0f1726", color: "#e5e7eb", colorScheme: "dark" },
    planDetails: { background: "linear-gradient(145deg, #17263d, #142238)", border: "1px solid #2b4668" },
    planName: { color: "#dbeafe" },
    planType: { background: "#203a5d", color: "#93c5fd" },
    detailLabel: { color: "#a7b4c8" },
    description: { color: "#b3bfd1" },
    calculationBox: { background: "#101a2a", border: "1px solid #29364a" },
    calcRow: { color: "#dbe3ef" },
    calcDivider: { borderTop: "1px dashed #3a4960" },
    infoCard: { background: "linear-gradient(150deg, #123d78, #102b59)", color: "#f8fafc" },
    activeBadge: { background: "#15382c", color: "#86efac" },
    bondCard: { background: "#101a2a", border: "1px solid #29364a" },
    bondName: { color: "#f3f6fb" },
    bondType: { color: "#a7b4c8" },
    bondDetails: { color: "#dbe3ef" },
    bondDetailsSpan: { color: "#a7b4c8" },
    bondDetailsStrong: { color: "#f3f6fb" },
    bondAmount: { color: "#7db7ff" },
    statusBadge: { background: "#15382c", color: "#86efac" },
    emptyState: { background: "#101a2a", border: "1px dashed #3a4960", color: "#dbe3ef" },
    historyTableWrapper: { background: "#151f30" },
    table: { background: "#151f30", color: "#dbe3ef" },
    th: { background: "#1c293d", color: "#dbe3ef", borderBottom: "1px solid #35445a" },
    td: { color: "#dbe3ef", borderBottom: "1px solid #29364a" },
    loading: { color: "#b3bfd1" },
    modalOverlay: { background: "rgba(2, 6, 15, 0.78)" },
    modal: { background: "#151f30", color: "#e5e7eb", border: "1px solid #35445a" },
    modalTitle: { color: "#f3f6fb" },
    modalText: { color: "#c3cede" },
    modalDetails: { background: "#101a2a", border: "1px solid #29364a" },
    modalDetailsSpan: { color: "#a7b4c8" },
    modalDetailsStrong: { color: "#f3f6fb" },
    warningBox: { background: "#332818", color: "#fcd9a1", border: "1px solid #72572d" },
    cancelButton: { background: "#1d293b", color: "#e5e7eb", border: "1px solid #3a4960" },
  } : {};

  const themedStyles = {
    ...responsiveStyles,
    ...Object.fromEntries(
      Object.entries(darkOverrides).map(([key, value]) => [
        key,
        { ...(responsiveStyles[key] || {}), ...value },
      ])
    ),
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div style={themedStyles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={responsiveStyles.header}>

        <div style={themedStyles.headerLeft}>

          <div style={themedStyles.headerIcon}>
            🏦
          </div>

          <div>
            <h1 style={themedStyles.headerTitle}>
              Bond Management
            </h1>

            <p style={themedStyles.headerSubtitle}>
              Invest in bonds and manage your fixed-income portfolio
            </p>
          </div>

        </div>

        <button
          style={responsiveStyles.backButton}
          onClick={() => {
            window.location.href =
              "/investments";
          }}
        >
          ← Back to Investment Page
        </button>

      </div>

      <div style={themedStyles.container}>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div style={themedStyles.successMessage}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div style={themedStyles.errorMessage}>
            ⚠ {error}
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div style={themedStyles.summaryGrid}>

          <div style={themedStyles.summaryCard}>
            <div style={themedStyles.summaryIcon}>
              💰
            </div>

            <div>
              <div style={themedStyles.summaryLabel}>
                Total Investment
              </div>

              <div style={themedStyles.summaryValue}>
                {formatMoney(totalInvestment)}
              </div>
            </div>
          </div>

          <div style={themedStyles.summaryCard}>
            <div style={themedStyles.summaryIcon}>
              📈
            </div>

            <div>
              <div style={themedStyles.summaryLabel}>
                Interest Earned
              </div>

              <div style={themedStyles.summaryValue}>
                {formatMoney(totalInterest)}
              </div>
            </div>
          </div>

          <div style={themedStyles.summaryCard}>
            <div style={themedStyles.summaryIcon}>
              🏦
            </div>

            <div>
              <div style={themedStyles.summaryLabel}>
                Current Value
              </div>

              <div style={themedStyles.summaryValue}>
                {formatMoney(currentValue)}
              </div>
            </div>
          </div>

          <div style={themedStyles.summaryCard}>
            <div style={themedStyles.summaryIcon}>
              📊
            </div>

            <div>
              <div style={themedStyles.summaryLabel}>
                Active Bonds
              </div>

              <div style={themedStyles.summaryValue}>
                {activeBonds.length}
              </div>
            </div>
          </div>

        </div>

        {/* =================================================
            PURCHASE SECTION
        ================================================= */}

        <div style={themedStyles.mainGrid}>

          <div style={themedStyles.card}>

            <div style={themedStyles.sectionHeader}>
              <div>
                <h2 style={themedStyles.sectionTitle}>
                  Invest in Bonds
                </h2>

                <p style={themedStyles.sectionSubtitle}>
                  Choose a bond plan and start investing
                </p>
              </div>

              <div style={themedStyles.sectionIcon}>
                💼
              </div>
            </div>

            {loading ? (
              <div style={themedStyles.loading}>
                Loading bond plans...
              </div>
            ) : (
              <form onSubmit={handlePurchase}>

                <label style={themedStyles.label}>
                  Select Bond Plan
                </label>

                <select
                  value={selectedPlanCode}
                  onChange={handlePlanChange}
                  style={themedStyles.input}
                  required
                >
                  <option value="">
                    Select a bond plan
                  </option>

                  {bondPlans.map((plan) => (
                    <option
                      key={plan.planCode}
                      value={plan.planCode}
                    >
                      {plan.bondName} — {plan.couponRate}%
                    </option>
                  ))}
                </select>

                {selectedPlan && (
                  <div style={themedStyles.planDetails}>

                    <div style={themedStyles.planTop}>
                      <div>
                        <h3 style={themedStyles.planName}>
                          {selectedPlan.bondName}
                        </h3>

                        <span style={themedStyles.planType}>
                          {selectedPlan.bondType}
                        </span>
                      </div>

                      <div style={themedStyles.rateBox}>
                        <strong>
                          {selectedPlan.couponRate}%
                        </strong>

                        <span>
                          Coupon Rate
                        </span>
                      </div>
                    </div>

                    <div style={themedStyles.detailGrid}>

                      <div>
                        <span style={themedStyles.detailLabel}>
                          Face Value
                        </span>

                        <strong>
                          {formatMoney(
                            selectedPlan.faceValue
                          )}
                        </strong>
                      </div>

                      <div>
                        <span style={themedStyles.detailLabel}>
                          Minimum Investment
                        </span>

                        <strong>
                          {formatMoney(
                            selectedPlan.minimumInvestment
                          )}
                        </strong>
                      </div>

                      <div>
                        <span style={themedStyles.detailLabel}>
                          Tenure
                        </span>

                        <strong>
                          {selectedPlan.tenureMonths} months
                        </strong>
                      </div>

                      <div>
                        <span style={themedStyles.detailLabel}>
                          Interest
                        </span>

                        <strong>
                          {selectedPlan.interestFrequency}
                        </strong>
                      </div>

                    </div>

                    <p style={themedStyles.description}>
                      {selectedPlan.description}
                    </p>

                  </div>
                )}

                <label style={themedStyles.label}>
                  Debit Account
                </label>

                <select
                  value={accountId}
                  onChange={(e) =>
                    setAccountId(e.target.value)
                  }
                  style={themedStyles.input}
                  required
                >
                  <option value="">
                    Select account
                  </option>

                  {accounts.map((account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.accountNumber}
                      {" — "}
                      Balance:{" "}
                      {formatMoney(account.balance)}
                    </option>
                  ))}
                </select>

                <label style={themedStyles.label}>
                  Investment Amount
                </label>

                <div style={themedStyles.amountWrapper}>
                  <span style={themedStyles.currency}>
                    ₹
                  </span>

                  <input
                    type="number"
                    min={
                      selectedPlan
                        ? selectedPlan.minimumInvestment
                        : 1
                    }
                    step="0.01"
                    value={investmentAmount}
                    onChange={(e) =>
                      setInvestmentAmount(
                        e.target.value
                      )
                    }
                    placeholder="Enter investment amount"
                    style={themedStyles.amountInput}
                    required
                  />
                </div>

                {selectedPlan &&
                  Number(investmentAmount) > 0 && (
                    <div style={themedStyles.calculationBox}>

                      <div style={themedStyles.calcRow}>
                        <span>
                          Investment
                        </span>

                        <strong>
                          {formatMoney(
                            investmentAmount
                          )}
                        </strong>
                      </div>

                      <div style={themedStyles.calcRow}>
                        <span>
                          Expected Total Interest
                        </span>

                        <strong style={themedStyles.greenText}>
                          {formatMoney(
                            expectedInterest
                          )}
                        </strong>
                      </div>

                      <div style={themedStyles.calcDivider} />

                      <div style={themedStyles.calcRow}>
                        <span>
                          Expected Total Value
                        </span>

                        <strong>
                          {formatMoney(
                            Number(investmentAmount) +
                              expectedInterest
                          )}
                        </strong>
                      </div>

                    </div>
                  )}

                <button
                  type="submit"
                  disabled={
                    purchasing ||
                    loading ||
                    !selectedPlan
                  }
                  style={{
                    ...themedStyles.primaryButton,
                    opacity:
                      purchasing ||
                      loading ||
                      !selectedPlan
                        ? 0.6
                        : 1,
                  }}
                >
                  {purchasing
                    ? "Processing..."
                    : "Invest in Bond"}
                </button>

              </form>
            )}

          </div>

          {/* =================================================
              BOND INFO
          ================================================= */}

          <div style={themedStyles.infoCard}>

            <div style={themedStyles.infoIcon}>
              🛡️
            </div>

            <h2 style={themedStyles.infoTitle}>
              Why Invest in Bonds?
            </h2>

            <div style={themedStyles.infoItem}>
              <span>✓</span>
              <div>
                <strong>Fixed Coupon Income</strong>
                <p>
                  Earn periodic interest according
                  to the selected bond plan.
                </p>
              </div>
            </div>

            <div style={themedStyles.infoItem}>
              <span>✓</span>
              <div>
                <strong>Defined Maturity</strong>
                <p>
                  Your investment has a predefined
                  maturity date.
                </p>
              </div>
            </div>

            <div style={themedStyles.infoItem}>
              <span>✓</span>
              <div>
                <strong>Portfolio Tracking</strong>
                <p>
                  Track investment, interest and
                  current value from one place.
                </p>
              </div>
            </div>

            <div style={themedStyles.infoNote}>
              Bond returns and availability are
              based on the selected Avani Bank
              product plan.
            </div>

          </div>

        </div>

        {/* =================================================
            ACTIVE BONDS
        ================================================= */}

        <div style={themedStyles.card}>

          <div style={themedStyles.sectionHeader}>
            <div>
              <h2 style={themedStyles.sectionTitle}>
                My Active Bonds
              </h2>

              <p style={themedStyles.sectionSubtitle}>
                Manage your currently active bond investments
              </p>
            </div>

            <div style={themedStyles.activeBadge}>
              {activeBonds.length} Active
            </div>
          </div>

          {loading ? (
            <div style={themedStyles.loading}>
              Loading bonds...
            </div>
          ) : activeBonds.length === 0 ? (
            <div style={themedStyles.emptyState}>
              <div style={themedStyles.emptyIcon}>
                📋
              </div>

              <h3>
                No Active Bonds
              </h3>

              <p>
                Your active bond investments will
                appear here.
              </p>
            </div>
          ) : (
            <div style={themedStyles.bondGrid}>

              {activeBonds.map((bond) => {

                const bondInterest =
                  Number(
                    bond.totalInterestEarned || 0
                  );

                const investment =
                  Number(
                    bond.investmentAmount || 0
                  );

                return (
                  <div
                    key={bond.id}
                    style={themedStyles.bondCard}
                  >

                    <div style={themedStyles.bondHeader}>

                      <div>
                        <h3 style={themedStyles.bondName}>
                          {bond.bondName}
                        </h3>

                        <span style={themedStyles.bondType}>
                          {bond.bondType}
                        </span>
                      </div>

                      <span style={themedStyles.statusBadge}>
                        ACTIVE
                      </span>

                    </div>

                    <div style={themedStyles.bondAmount}>
                      {formatMoney(investment)}

                      <span>
                        Investment
                      </span>
                    </div>

                    <div style={themedStyles.bondDetails}>

                      <div>
                        <span>
                          Coupon Rate
                        </span>

                        <strong>
                          {bond.couponRate}%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Tenure
                        </span>

                        <strong>
                          {bond.tenureMonths} months
                        </strong>
                      </div>

                      <div>
                        <span>
                          Purchase Date
                        </span>

                        <strong>
                          {formatDate(
                            bond.purchaseDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Maturity Date
                        </span>

                        <strong>
                          {formatDate(
                            bond.maturityDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Interest Earned
                        </span>

                        <strong style={themedStyles.greenText}>
                          {formatMoney(
                            bondInterest
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Current Value
                        </span>

                        <strong>
                          {formatMoney(
                            bond.currentValue
                          )}
                        </strong>
                      </div>

                    </div>

                    <button
                      style={themedStyles.sellButton}
                      onClick={() =>
                        openSellConfirmation(bond)
                      }
                    >
                      Sell Bond
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* =================================================
            BOND HISTORY
        ================================================= */}

        {bonds.some(
          (bond) =>
            String(bond.status || "").toUpperCase() !==
            "ACTIVE"
        ) && (
          <div style={themedStyles.card}>

            <div style={themedStyles.sectionHeader}>
              <div>
                <h2 style={themedStyles.sectionTitle}>
                  Bond History
                </h2>

                <p style={themedStyles.sectionSubtitle}>
                  Previously sold or matured investments
                </p>
              </div>
            </div>

            <div style={themedStyles.historyTableWrapper}>

              <table style={themedStyles.table}>

                <thead>
                  <tr>
                    <th style={themedStyles.th}>
                      Bond
                    </th>

                    <th style={themedStyles.th}>
                      Investment
                    </th>

                    <th style={themedStyles.th}>
                      Interest
                    </th>

                    <th style={themedStyles.th}>
                      Purchase Date
                    </th>

                    <th style={themedStyles.th}>
                      Maturity Date
                    </th>

                    <th style={themedStyles.th}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {bonds
                    .filter(
                      (bond) =>
                        String(
                          bond.status || ""
                        ).toUpperCase() !==
                        "ACTIVE"
                    )
                    .map((bond) => (

                      <tr key={bond.id}>

                        <td style={themedStyles.td}>
                          <strong>
                            {bond.bondName}
                          </strong>
                        </td>

                        <td style={themedStyles.td}>
                          {formatMoney(
                            bond.investmentAmount
                          )}
                        </td>

                        <td style={themedStyles.td}>
                          {formatMoney(
                            bond.totalInterestEarned
                          )}
                        </td>

                        <td style={themedStyles.td}>
                          {formatDate(
                            bond.purchaseDate
                          )}
                        </td>

                        <td style={themedStyles.td}>
                          {formatDate(
                            bond.maturityDate
                          )}
                        </td>

                        <td style={themedStyles.td}>
                          <span
                            style={
                              String(
                                bond.status || ""
                              ).toUpperCase() ===
                              "MATURED"
                                ? themedStyles.maturedBadge
                                : themedStyles.soldBadge
                            }
                          >
                            {bond.status}
                          </span>
                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

      {/* ===================================================
          SELL CONFIRMATION MODAL
      =================================================== */}

      {sellBondData && (
        <div style={themedStyles.modalOverlay}>

          <div style={themedStyles.modal}>

            <div style={themedStyles.modalIcon}>
              ⚠️
            </div>

            <h2 style={themedStyles.modalTitle}>
              Sell Bond?
            </h2>

            <p style={themedStyles.modalText}>
              Are you sure you want to sell this
              bond before maturity?
            </p>

            <div style={themedStyles.modalDetails}>

              <div>
                <span>Bond</span>
                <strong>
                  {sellBondData.bondName}
                </strong>
              </div>

              <div>
                <span>Investment</span>
                <strong>
                  {formatMoney(
                    sellBondData.investmentAmount
                  )}
                </strong>
              </div>

              <div>
                <span>Interest Earned</span>
                <strong>
                  {formatMoney(
                    sellBondData.totalInterestEarned
                  )}
                </strong>
              </div>

            </div>

            <div style={themedStyles.warningBox}>
              Premature selling may reduce your
              earned interest according to the
              applicable early-exit adjustment.
            </div>

            <div style={themedStyles.modalActions}>

              <button
                style={themedStyles.cancelButton}
                onClick={closeSellConfirmation}
                disabled={sellingId !== null}
              >
                Cancel
              </button>

              <button
                style={themedStyles.confirmSellButton}
                onClick={handleSellBond}
                disabled={sellingId !== null}
              >
                {sellingId !== null
                  ? "Selling..."
                  : "Confirm Sell"}
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
    background: "#f4f7fb",
    color: "#172033",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background:
      "linear-gradient(135deg, #0756c9 0%, #0b72e7 55%, #1591f0 100%)",
    color: "#ffffff",
    margin: "20px",
    padding: "22px 28px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow:
      "0 10px 28px rgba(7, 86, 201, 0.22)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  headerIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    border:
      "1px solid rgba(255,255,255,0.25)",
  },

  headerTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: 750,
  },

  headerSubtitle: {
    margin: "5px 0 0",
    fontSize: "13px",
    opacity: 0.88,
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.15)",
    color: "#ffffff",
    padding: "11px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 650,
    fontSize: "13px",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0 20px 40px",
  },

  successMessage: {
    background: "#eaf8ef",
    color: "#137333",
    border: "1px solid #b8e0c2",
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
    fontSize: "14px",
    fontWeight: 600,
  },

  errorMessage: {
    background: "#fff0f0",
    color: "#b42318",
    border: "1px solid #f2b8b5",
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
    fontSize: "14px",
    fontWeight: 600,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e4eaf2",
    borderRadius: "15px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 5px 18px rgba(30, 55, 90, 0.06)",
  },

  summaryIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#edf5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  summaryLabel: {
    color: "#6b778c",
    fontSize: "12px",
    marginBottom: "4px",
  },

  summaryValue: {
    fontSize: "20px",
    fontWeight: 750,
    color: "#172033",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.7fr) minmax(280px, 0.8fr)",
    gap: "20px",
    marginBottom: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e4eaf2",
    borderRadius: "17px",
    padding: "23px",
    boxShadow:
      "0 5px 18px rgba(30, 55, 90, 0.06)",
    marginBottom: "20px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "22px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#18243a",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#718096",
    fontSize: "13px",
  },

  sectionIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#edf5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  activeBadge: {
    background: "#e9f7ee",
    color: "#18794e",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },

  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "16px",
    fontSize: "13px",
    fontWeight: 650,
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #d8e0eb",
    borderRadius: "10px",
    background: "#ffffff",
    fontSize: "14px",
    color: "#172033",
    outline: "none",
  },

  amountWrapper: {
    display: "flex",
    alignItems: "center",
    border:
      "1px solid #d8e0eb",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#ffffff",
  },

  currency: {
    paddingLeft: "14px",
    fontSize: "17px",
    fontWeight: 700,
    color: "#0756c9",
  },

  amountInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px",
    fontSize: "14px",
  },

  planDetails: {
    marginTop: "17px",
    padding: "17px",
    background:
      "linear-gradient(145deg, #f5f9ff, #eef5ff)",
    border:
      "1px solid #d8e8ff",
    borderRadius: "13px",
  },

  planTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "17px",
  },

  planName: {
    margin: 0,
    fontSize: "16px",
    color: "#15345e",
  },

  planType: {
    display: "inline-block",
    marginTop: "6px",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#dcecff",
    color: "#0756c9",
    fontSize: "10px",
    fontWeight: 750,
  },

  rateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  rateBoxStrong: {
    fontSize: "20px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "12px",
  },

  detailLabel: {
    display: "block",
    color: "#718096",
    fontSize: "10px",
    marginBottom: "4px",
  },

  description: {
    margin: "15px 0 0",
    color: "#617089",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  calculationBox: {
    marginTop: "16px",
    padding: "14px",
    background: "#f8fafc",
    border: "1px solid #e4eaf2",
    borderRadius: "11px",
  },

  calcRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "6px 0",
    fontSize: "13px",
  },

  calcDivider: {
    borderTop:
      "1px dashed #d7deea",
    margin: "7px 0",
  },

  greenText: {
    color: "#15803d",
  },

  primaryButton: {
    width: "100%",
    marginTop: "20px",
    border: "none",
    background:
      "linear-gradient(135deg, #0756c9, #0b72e7)",
    color: "#ffffff",
    padding: "13px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow:
      "0 7px 16px rgba(7,86,201,0.2)",
  },

  infoCard: {
    background:
      "linear-gradient(150deg, #0756c9, #123f8d)",
    color: "#ffffff",
    borderRadius: "17px",
    padding: "25px",
    boxShadow:
      "0 8px 22px rgba(7, 63, 140, 0.18)",
  },

  infoIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    marginBottom: "17px",
  },

  infoTitle: {
    margin: "0 0 22px",
    fontSize: "20px",
  },

  infoItem: {
    display: "flex",
    gap: "11px",
    marginBottom: "18px",
  },

  infoItemSpan: {
    fontWeight: 800,
  },

  infoItemP: {
    margin: "4px 0 0",
    fontSize: "12px",
    lineHeight: 1.5,
    opacity: 0.82,
  },

  infoNote: {
    marginTop: "23px",
    padding: "12px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.1)",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  bondGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "17px",
  },

  bondCard: {
    border: "1px solid #e1e8f1",
    borderRadius: "14px",
    padding: "18px",
    background: "#fbfcfe",
  },

  bondHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "18px",
  },

  bondName: {
    margin: 0,
    fontSize: "16px",
    color: "#172033",
  },

  bondType: {
    display: "inline-block",
    marginTop: "6px",
    color: "#66758b",
    fontSize: "10px",
    fontWeight: 700,
  },

  statusBadge: {
    background: "#e8f7ed",
    color: "#18794e",
    padding: "5px 9px",
    borderRadius: "7px",
    fontSize: "10px",
    fontWeight: 750,
  },

  bondAmount: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0756c9",
    marginBottom: "18px",
  },

  bondAmountSpan: {
    display: "block",
    color: "#77859a",
    fontSize: "10px",
    fontWeight: 500,
    marginTop: "3px",
  },

  bondDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "13px",
    marginBottom: "17px",
  },

  bondDetailsSpan: {
    display: "block",
    fontSize: "10px",
    color: "#7b8798",
    marginBottom: "4px",
  },

  bondDetailsStrong: {
    fontSize: "12px",
    color: "#26364d",
  },

  sellButton: {
    width: "100%",
    padding: "10px",
    borderRadius: "9px",
    border:
      "1px solid #f0b4b4",
    background: "#fff6f6",
    color: "#c0392b",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },

  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#718096",
  },

  emptyIcon: {
    fontSize: "35px",
    marginBottom: "8px",
  },

  historyTableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "750px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f5f8fc",
    color: "#607086",
    fontSize: "11px",
    fontWeight: 700,
    borderBottom:
      "1px solid #e2e8f0",
  },

  td: {
    padding: "13px 12px",
    borderBottom:
      "1px solid #edf1f5",
    fontSize: "12px",
    color: "#334155",
  },

  maturedBadge: {
    background: "#eaf7ef",
    color: "#18794e",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
  },

  soldBadge: {
    background: "#fff1f1",
    color: "#b42318",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
  },

  loading: {
    padding: "30px",
    textAlign: "center",
    color: "#718096",
    fontSize: "14px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "450px",
    background: "#ffffff",
    borderRadius: "17px",
    padding: "25px",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.22)",
  },

  modalIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#fff4e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    marginBottom: "15px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "21px",
  },

  modalText: {
    color: "#68758a",
    fontSize: "13px",
    lineHeight: 1.5,
    margin: "9px 0 18px",
  },

  modalDetails: {
    display: "grid",
    gap: "10px",
    background: "#f7f9fc",
    borderRadius: "11px",
    padding: "14px",
  },

  modalDetailsSpan: {
    display: "block",
    fontSize: "10px",
    color: "#77859a",
    marginBottom: "3px",
  },

  modalDetailsStrong: {
    fontSize: "13px",
  },

  warningBox: {
    marginTop: "14px",
    padding: "11px",
    background: "#fff8e8",
    color: "#8a5a00",
    border:
      "1px solid #f1d38a",
    borderRadius: "9px",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  cancelButton: {
    padding: "10px 17px",
    borderRadius: "9px",
    border:
      "1px solid #d7dee8",
    background: "#ffffff",
    color: "#4b5563",
    cursor: "pointer",
    fontWeight: 650,
  },

  confirmSellButton: {
    padding: "10px 17px",
    borderRadius: "9px",
    border: "none",
    background: "#c0392b",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
};