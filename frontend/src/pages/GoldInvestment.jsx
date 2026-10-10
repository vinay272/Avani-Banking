import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("jwtToken") ||
  localStorage.getItem("accessToken");

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const formatNumber = (value, digits = 4) => {
  return Number(value || 0).toFixed(digits);
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();

    if (typeof data === "string") {
      return data;
    }

    return (
      data?.message ||
      data?.error ||
      "Something went wrong. Please try again."
    );
  } catch {
    return "Something went wrong. Please try again.";
  }
};

export default function GoldInvestment() {
  const [accounts, setAccounts] = useState([]);
  const [goldPrices, setGoldPrices] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedPurity, setSelectedPurity] = useState("24K");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [sellingId, setSellingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("avani-theme") === "dark"
  );

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 767 : false
  );
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined"
      ? window.innerWidth >= 768 && window.innerWidth <= 1024
      : false
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 767);
      setIsTablet(width >= 768 && width <= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const responsiveStyles = useMemo(() => {
    const mobile = isMobile;
    const tablet = isTablet;

    return {
      page: {
        ...styles.page,
        padding: mobile ? "14px" : tablet ? "18px" : "28px",
        overflowX: "hidden",
      },

      header: {
        ...styles.header,
        padding: mobile ? "16px" : tablet ? "18px 20px" : "20px 24px",
        borderRadius: mobile ? "14px" : "18px",
        gap: mobile ? "14px" : "20px",
        alignItems: mobile || tablet ? "stretch" : "center",
        flexDirection: mobile || tablet ? "column" : "row",
        marginBottom: mobile ? "16px" : "22px",
      },

      headerLeft: {
        ...styles.headerLeft,
        gap: mobile ? "10px" : "14px",
        alignItems: "center",
        minWidth: 0,
      },

      headerIcon: {
        ...styles.headerIcon,
        width: mobile ? "44px" : tablet ? "48px" : "52px",
        height: mobile ? "44px" : tablet ? "48px" : "52px",
        fontSize: mobile ? "23px" : "27px",
        flexShrink: 0,
      },

      headerTitle: {
        ...styles.headerTitle,
        fontSize: mobile ? "20px" : tablet ? "22px" : "25px",
        lineHeight: 1.2,
      },

      headerSubtitle: {
        ...styles.headerSubtitle,
        fontSize: mobile ? "11px" : "13px",
        lineHeight: 1.4,
      },

      backButton: {
        ...styles.backButton,
        width: mobile || tablet ? "100%" : "auto",
        minHeight: mobile ? "44px" : "auto",
        padding: mobile ? "11px 14px" : "10px 16px",
        fontSize: mobile ? "12px" : "13px",
      },

      successAlert: {
        ...styles.successAlert,
        padding: mobile ? "11px 12px" : "12px 15px",
        fontSize: mobile ? "12px" : "14px",
        alignItems: "flex-start",
        lineHeight: 1.45,
      },

      errorAlert: {
        ...styles.errorAlert,
        padding: mobile ? "11px 12px" : "12px 15px",
        fontSize: mobile ? "12px" : "14px",
        alignItems: "flex-start",
        lineHeight: 1.45,
      },

      summaryGrid: {
        ...styles.summaryGrid,
        gridTemplateColumns: mobile
          ? "1fr"
          : tablet
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(4, minmax(0, 1fr))",
        gap: mobile ? "11px" : "16px",
        marginBottom: mobile ? "16px" : "22px",
      },

      summaryCard: {
        ...styles.summaryCard,
        padding: mobile ? "14px" : "18px",
        borderRadius: mobile ? "13px" : "15px",
        gap: mobile ? "11px" : "13px",
      },

      summaryIcon: {
        ...styles.summaryIcon,
        width: mobile ? "41px" : "45px",
        height: mobile ? "41px" : "45px",
        fontSize: mobile ? "19px" : "21px",
      },

      summaryLabel: {
        ...styles.summaryLabel,
        fontSize: mobile ? "11px" : "12px",
      },

      summaryValue: {
        ...styles.summaryValue,
        fontSize: mobile ? "17px" : "19px",
        overflowWrap: "anywhere",
      },

      mainGrid: {
        ...styles.mainGrid,
        gridTemplateColumns: mobile || tablet
          ? "1fr"
          : "minmax(0, 1.15fr) minmax(0, 0.85fr)",
        gap: mobile ? "14px" : "20px",
        marginBottom: mobile ? "18px" : "24px",
      },

      card: {
        ...styles.card,
        padding: mobile ? "16px" : tablet ? "19px" : "22px",
        borderRadius: mobile ? "14px" : "17px",
      },

      cardHeader: {
        ...styles.cardHeader,
        alignItems: mobile ? "flex-start" : "center",
        marginBottom: mobile ? "16px" : "20px",
        gap: "12px",
      },

      cardTitle: {
        ...styles.cardTitle,
        fontSize: mobile ? "17px" : "19px",
      },

      cardSubtitle: {
        ...styles.cardSubtitle,
        fontSize: mobile ? "11px" : "13px",
        lineHeight: 1.4,
      },

      goldBadge: {
        ...styles.goldBadge,
        width: mobile ? "40px" : "45px",
        height: mobile ? "40px" : "45px",
        fontSize: mobile ? "20px" : "23px",
        flexShrink: 0,
      },

      priceIcon: {
        ...styles.priceIcon,
        width: mobile ? "40px" : "45px",
        height: mobile ? "40px" : "45px",
        fontSize: mobile ? "19px" : "21px",
        flexShrink: 0,
      },

      form: {
        ...styles.form,
        gap: mobile ? "14px" : "17px",
      },

      formGroup: {
        ...styles.formGroup,
        gap: "7px",
      },

      label: {
        ...styles.label,
        fontSize: mobile ? "12px" : "13px",
      },

      input: {
        ...styles.input,
        minHeight: mobile ? "46px" : "auto",
        padding: mobile ? "12px" : "12px 13px",
        fontSize: mobile ? "14px" : "14px",
      },

      purityGrid: {
        ...styles.purityGrid,
        gridTemplateColumns: mobile
          ? "1fr"
          : "repeat(2, minmax(0, 1fr))",
        gap: mobile ? "8px" : "10px",
      },

      purityButton: {
        ...styles.purityButton,
        minHeight: mobile ? "58px" : "auto",
        padding: mobile ? "11px" : "12px",
      },

      amountWrapper: {
        ...styles.amountWrapper,
        minHeight: mobile ? "46px" : "auto",
      },

      amountPrefix: {
        ...styles.amountPrefix,
        paddingLeft: mobile ? "12px" : "13px",
      },

      amountInput: {
        ...styles.amountInput,
        padding: mobile ? "12px 9px" : "12px 10px",
        fontSize: mobile ? "15px" : "15px",
        minWidth: 0,
      },

      helperText: {
        ...styles.helperText,
        fontSize: mobile ? "10px" : "11px",
        lineHeight: 1.4,
      },

      calculationBox: {
        ...styles.calculationBox,
        gridTemplateColumns: mobile ? "1fr" : "1fr auto 1fr",
        gap: mobile ? "10px" : "12px",
        padding: mobile ? "12px" : "14px",
      },

      calculationDivider: {
        ...styles.calculationDivider,
        width: mobile ? "100%" : "1px",
        height: mobile ? "1px" : "34px",
      },

      calculationValue: {
        ...styles.calculationValue,
        fontSize: mobile ? "13px" : "14px",
      },

      calculationGold: {
        ...styles.calculationGold,
        fontSize: mobile ? "14px" : "15px",
      },

      primaryButton: {
        ...styles.primaryButton,
        minHeight: mobile ? "46px" : "auto",
        padding: mobile ? "12px" : "13px",
      },

      warningText: {
        ...styles.warningText,
        fontSize: mobile ? "11px" : "12px",
        lineHeight: 1.4,
      },

      priceList: {
        ...styles.priceList,
        gap: mobile ? "9px" : "12px",
      },

      priceRow: {
        ...styles.priceRow,
        padding: mobile ? "12px" : "15px",
        gap: "12px",
        alignItems: "center",
      },

      pricePurity: {
        ...styles.pricePurity,
        fontSize: mobile ? "14px" : "16px",
      },

      priceType: {
        ...styles.priceType,
        fontSize: mobile ? "10px" : "11px",
      },

      priceRight: {
        ...styles.priceRight,
        flexShrink: 0,
      },

      priceAmount: {
        ...styles.priceAmount,
        fontSize: mobile ? "14px" : "16px",
      },

      priceUnit: {
        ...styles.priceUnit,
        fontSize: mobile ? "10px" : "11px",
      },

      infoBox: {
        ...styles.infoBox,
        marginTop: mobile ? "14px" : "18px",
        padding: mobile ? "11px" : "12px",
        fontSize: mobile ? "10px" : "11px",
        lineHeight: 1.5,
      },

      section: {
        ...styles.section,
        padding: mobile ? "16px" : tablet ? "19px" : "22px",
        borderRadius: mobile ? "14px" : "17px",
        marginBottom: mobile ? "16px" : "24px",
      },

      sectionHeader: {
        ...styles.sectionHeader,
        flexDirection: mobile ? "column" : "row",
        alignItems: mobile ? "flex-start" : "center",
        gap: mobile ? "10px" : "15px",
        marginBottom: mobile ? "14px" : "18px",
      },

      sectionTitle: {
        ...styles.sectionTitle,
        fontSize: mobile ? "17px" : "19px",
        lineHeight: 1.3,
      },

      sectionSubtitle: {
        ...styles.sectionSubtitle,
        fontSize: mobile ? "11px" : "13px",
        lineHeight: 1.4,
      },

      countBadge: {
        ...styles.countBadge,
        padding: mobile ? "6px 10px" : "7px 12px",
        fontSize: mobile ? "10px" : "11px",
      },

      investmentGrid: {
        ...styles.investmentGrid,
        gridTemplateColumns: mobile
          ? "1fr"
          : tablet
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(2, minmax(0, 1fr))",
        gap: mobile ? "11px" : "16px",
      },

      investmentCard: {
        ...styles.investmentCard,
        padding: mobile ? "14px" : "17px",
        borderRadius: mobile ? "13px" : "14px",
      },

      investmentTop: {
        ...styles.investmentTop,
        flexDirection: mobile ? "column" : "row",
        alignItems: mobile ? "stretch" : "flex-start",
        marginBottom: mobile ? "13px" : "16px",
      },

      goldTitleRow: {
        ...styles.goldTitleRow,
        gap: mobile ? "8px" : "10px",
      },

      goldMiniIcon: {
        ...styles.goldMiniIcon,
        width: mobile ? "36px" : "39px",
        height: mobile ? "36px" : "39px",
        fontSize: mobile ? "17px" : "19px",
        flexShrink: 0,
      },

      investmentTitle: {
        ...styles.investmentTitle,
        fontSize: mobile ? "14px" : "15px",
      },

      investmentId: {
        ...styles.investmentId,
        fontSize: mobile ? "9px" : "10px",
        overflowWrap: "anywhere",
      },

      activeBadge: {
        ...styles.activeBadge,
        alignSelf: mobile ? "flex-start" : "auto",
      },

      investmentDetails: {
        ...styles.investmentDetails,
        gridTemplateColumns: mobile
          ? "1fr 1fr"
          : "repeat(2, minmax(0, 1fr))",
        gap: mobile ? "10px" : "12px",
      },

      detailLabel: {
        ...styles.detailLabel,
        fontSize: mobile ? "9px" : "10px",
      },

      detailValue: {
        ...styles.detailValue,
        fontSize: mobile ? "11px" : "12px",
        overflowWrap: "anywhere",
      },

      valueBox: {
        ...styles.valueBox,
        gridTemplateColumns: mobile
          ? "1fr"
          : "repeat(3, minmax(0, 1fr))",
        gap: mobile ? "9px" : "10px",
        padding: mobile ? "11px" : "12px",
      },

      valueLabel: {
        ...styles.valueLabel,
        fontSize: mobile ? "9px" : "10px",
      },

      valueAmount: {
        ...styles.valueAmount,
        fontSize: mobile ? "11px" : "12px",
        overflowWrap: "anywhere",
      },

      currentValue: {
        ...styles.currentValue,
        fontSize: mobile ? "11px" : "12px",
        overflowWrap: "anywhere",
      },

      investmentFooter: {
        ...styles.investmentFooter,
        flexDirection: mobile ? "column" : "row",
        alignItems: mobile ? "stretch" : "center",
        marginTop: mobile ? "12px" : "15px",
      },

      purchaseDate: {
        ...styles.purchaseDate,
        fontSize: mobile ? "9px" : "10px",
        overflowWrap: "anywhere",
      },

      sellButton: {
        ...styles.sellButton,
        width: mobile ? "100%" : "auto",
        minHeight: mobile ? "42px" : "auto",
        padding: mobile ? "10px 12px" : "8px 12px",
      },

      emptyCard: {
        ...styles.emptyCard,
        padding: mobile ? "32px 15px" : "40px 20px",
      },

      emptyIcon: {
        ...styles.emptyIcon,
        fontSize: mobile ? "30px" : "34px",
      },

      emptyTitle: {
        ...styles.emptyTitle,
        fontSize: mobile ? "15px" : "16px",
      },

      emptyText: {
        ...styles.emptyText,
        fontSize: mobile ? "11px" : "12px",
        lineHeight: 1.5,
      },

      emptyHistory: {
        ...styles.emptyHistory,
        padding: mobile ? "22px 14px" : "25px",
        fontSize: mobile ? "12px" : "13px",
      },

      tableWrapper: {
        ...styles.tableWrapper,
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      },

      table: {
        ...styles.table,
        minWidth: mobile ? "720px" : "750px",
      },

      th: {
        ...styles.th,
        padding: mobile ? "11px 9px" : "12px 10px",
        fontSize: mobile ? "9px" : "10px",
        whiteSpace: "nowrap",
      },

      td: {
        ...styles.td,
        padding: mobile ? "11px 9px" : "13px 10px",
        fontSize: mobile ? "10px" : "11px",
        whiteSpace: "nowrap",
      },

      soldBadge: {
        ...styles.soldBadge,
        padding: mobile ? "4px 8px" : "5px 9px",
        fontSize: mobile ? "8px" : "9px",
      },

      modalOverlay: {
        ...styles.modalOverlay,
        padding: mobile ? "12px" : "20px",
        alignItems: mobile ? "flex-start" : "center",
        overflowY: "auto",
      },

      modal: {
        ...styles.modal,
        maxWidth: mobile ? "100%" : "430px",
        width: "100%",
        margin: mobile ? "auto 0" : "0",
        padding: mobile ? "20px 16px" : "25px",
        borderRadius: mobile ? "14px" : "17px",
        maxHeight: mobile ? "calc(100vh - 24px)" : "none",
        overflowY: mobile ? "auto" : "visible",
      },

      modalIcon: {
        ...styles.modalIcon,
        width: mobile ? "48px" : "55px",
        height: mobile ? "48px" : "55px",
        fontSize: mobile ? "23px" : "27px",
      },

      modalTitle: {
        ...styles.modalTitle,
        fontSize: mobile ? "19px" : "21px",
      },

      modalText: {
        ...styles.modalText,
        fontSize: mobile ? "12px" : "13px",
      },

      modalDetails: {
        ...styles.modalDetails,
        padding: mobile ? "12px" : "13px",
      },

      modalActions: {
        ...styles.modalActions,
        flexDirection: mobile ? "column" : "row",
        marginTop: mobile ? "16px" : "20px",
      },

      cancelButton: {
        ...styles.cancelButton,
        width: mobile ? "100%" : "auto",
        minHeight: mobile ? "44px" : "auto",
      },

      confirmSellButton: {
        ...styles.confirmSellButton,
        width: mobile ? "100%" : "auto",
        minHeight: mobile ? "44px" : "auto",
      },

      loadingCard: {
        ...styles.loadingCard,
        width: mobile ? "calc(100% - 28px)" : "auto",
        boxSizing: "border-box",
        margin: mobile ? "70px auto" : "120px auto",
        padding: mobile ? "32px 18px" : "45px 25px",
        borderRadius: mobile ? "14px" : "18px",
      },

      loadingTitle: {
        ...styles.loadingTitle,
        fontSize: mobile ? "18px" : "20px",
      },

      loadingText: {
        ...styles.loadingText,
        fontSize: mobile ? "12px" : "13px",
        lineHeight: 1.5,
      },
    };

  }, [isMobile, isTablet]);

  // Theme overrides are layered over responsive styles so layout remains unchanged.
  const themedStyles = useMemo(() => {
    if (!darkMode) return responsiveStyles;

    const dark = {
      page: { background: "#0b1220", color: "#e5e7eb" },
      successAlert: { background: "#123323", borderColor: "#246b45", color: "#b8f3ce" },
      errorAlert: { background: "#3b1c24", borderColor: "#7f303b", color: "#fecaca" },
      summaryCard: { background: "#151f30", borderColor: "#29364a", boxShadow: "0 4px 14px rgba(0,0,0,0.16)" },
      summaryLabel: { color: "#a5b4c8" },
      summaryValue: { color: "#f1f5f9" },
      card: { background: "#151f30", borderColor: "#29364a", boxShadow: "0 5px 18px rgba(0,0,0,0.16)" },
      cardTitle: { color: "#f1f5f9" },
      cardSubtitle: { color: "#a5b4c8" },
      label: { color: "#d2dbea" },
      input: { background: "#0f1726", color: "#e5e7eb", borderColor: "#3a4960", colorScheme: "dark" },
      purityButton: { background: "#111c2c", borderColor: "#36445a", color: "#dbe5f2" },
      purityButtonActive: { background: "#1d3155", borderColor: "#4b83ee", color: "#bfdbfe" },
      amountWrapper: { background: "#0f1726", borderColor: "#3a4960" },
      amountInput: { color: "#e5e7eb", background: "transparent", colorScheme: "dark" },
      helperText: { color: "#9eacc0" },
      calculationBox: { background: "#18243a", borderColor: "#334766" },
      calculationLabel: { color: "#a9bad1" },
      calculationValue: { color: "#e5edf8" },
      warningText: { color: "#fbbf24" },
      priceRow: { background: "#111c2c", borderColor: "#2e3b50" },
      pricePurity: { color: "#f1f5f9" },
      priceType: { color: "#a5b4c8" },
      priceAmount: { color: "#e5edf8" },
      priceUnit: { color: "#a5b4c8" },
      infoBox: { background: "#1a2638", color: "#bdc9da" },
      section: { background: "#151f30", borderColor: "#29364a", boxShadow: "0 5px 18px rgba(0,0,0,0.16)" },
      sectionTitle: { color: "#f1f5f9" },
      sectionSubtitle: { color: "#a5b4c8" },
      investmentCard: { background: "#111c2c", borderColor: "#2e3b50" },
      investmentTitle: { color: "#f1f5f9" },
      investmentId: { color: "#9eacc0" },
      detailLabel: { color: "#9eacc0" },
      detailValue: { color: "#e5edf8" },
      valueBox: { background: "#1a2638" },
      valueLabel: { color: "#a5b4c8" },
      currentValue: { color: "#e5edf8" },
      purchaseDate: { color: "#a5b4c8" },
      emptyCard: { borderColor: "#3a4960", color: "#cbd5e1" },
      emptyTitle: { color: "#f1f5f9" },
      emptyText: { color: "#a5b4c8" },
      emptyHistory: { borderColor: "#3a4960", color: "#a5b4c8" },
      table: { background: "#111c2c" },
      th: { background: "#1a2638", color: "#bdc9da", borderBottomColor: "#344258" },
      td: { color: "#d5deeb", borderBottomColor: "#2b394e" },
      modal: { background: "#151f30", color: "#e5e7eb", border: "1px solid #334155" },
      modalTitle: { color: "#f1f5f9" },
      modalText: { color: "#bdc9da" },
      modalDetails: { background: "#1a2638" },
      modalDetailsRow: { color: "#e5edf8" },
      loadingCard: { background: "#151f30", color: "#e5e7eb", boxShadow: "0 10px 35px rgba(0,0,0,0.2)" },
      loadingTitle: { color: "#f1f5f9" },
      loadingText: { color: "#a5b4c8" },
    };

    return {
      ...Object.fromEntries(
        Object.entries(responsiveStyles).map(([key, value]) => [
          key,
          { ...value, ...(dark[key] || {}) },
        ])
      ),
      purityButtonActive: {
        ...styles.purityButtonActive,
        ...(dark.purityButtonActive || {}),
      },
      modalDetailsRow: {
        ...styles.modalDetailsRow,
        ...(dark.modalDetailsRow || {}),
      },
    };
  }, [responsiveStyles, darkMode]);

  const selectedGoldPrice = useMemo(() => {
    return (
      goldPrices.find(
        (item) =>
          String(item.purity || "").toUpperCase() ===
          String(selectedPurity).toUpperCase()
      ) || null
    );
  }, [goldPrices, selectedPurity]);

  const calculatedGrams = useMemo(() => {
    const amount = Number(investmentAmount || 0);
    const price = Number(selectedGoldPrice?.pricePerGram || 0);

    if (!amount || !price) {
      return 0;
    }

    return amount / price;
  }, [investmentAmount, selectedGoldPrice]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        accountsResponse,
        pricesResponse,
        investmentsResponse,
      ] = await Promise.all([
        fetch(`${API_BASE}/api/accounts`, {
          method: "GET",
          headers,
        }),
        fetch(`${API_BASE}/api/gold-prices`, {
          method: "GET",
          headers,
        }),
        fetch(`${API_BASE}/api/gold-investments`, {
          method: "GET",
          headers,
        }),
      ]);

      if (!accountsResponse.ok) {
        throw new Error(await getErrorMessage(accountsResponse));
      }

      if (!pricesResponse.ok) {
        throw new Error(await getErrorMessage(pricesResponse));
      }

      if (!investmentsResponse.ok) {
        throw new Error(await getErrorMessage(investmentsResponse));
      }

      const accountData = await accountsResponse.json();
      const priceData = await pricesResponse.json();
      const investmentData = await investmentsResponse.json();

      const activeAccounts = Array.isArray(accountData)
        ? accountData.filter(
            (account) =>
              String(account.status || "").toUpperCase() === "ACTIVE"
          )
        : [];

      setAccounts(activeAccounts);
      setGoldPrices(Array.isArray(priceData) ? priceData : []);
      setInvestments(
        Array.isArray(investmentData) ? investmentData : []
      );

      if (activeAccounts.length > 0) {
        setSelectedAccount(String(activeAccounts[0].id));
      }
    } catch (err) {
      console.error("Gold Investment load error:", err);

      setError(
        err.message || "Unable to load Gold Investment data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const amount = Number(investmentAmount || 0);

    if (!selectedAccount) {
      setError("Please select an account.");
      return;
    }

    if (!selectedGoldPrice) {
      setError("Gold price is not available.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Please enter a valid investment amount.");
      return;
    }

    const minimumInvestment = Number(
      selectedGoldPrice.minimumInvestment || 0
    );

    if (minimumInvestment > 0 && amount < minimumInvestment) {
      setError(
        `Minimum investment is ${formatCurrency(minimumInvestment)}.`
      );
      return;
    }

    setPurchasing(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const params = new URLSearchParams();

      params.append("accountId", selectedAccount);
      params.append("goldType", "DIGITAL_GOLD");
      params.append("purity", selectedPurity);
      params.append("investmentAmount", amount.toFixed(2));

      const response = await fetch(
        `${API_BASE}/api/gold-investments?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const savedInvestment = await response.json();

      setInvestments((previous) => [
        savedInvestment,
        ...previous,
      ]);

      setInvestmentAmount("");

      setMessage(
        `Gold purchased successfully. ${formatNumber(
          savedInvestment.quantityGrams
        )} grams of ${savedInvestment.purity} gold added to your portfolio.`
      );

      await loadAccountsOnly();
    } catch (err) {
      console.error("Gold purchase error:", err);

      setError(err.message || "Unable to purchase gold.");
    } finally {
      setPurchasing(false);
    }
  };

  const loadAccountsOnly = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE}/api/accounts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const activeAccounts = Array.isArray(data)
        ? data.filter(
            (account) =>
              String(account.status || "").toUpperCase() === "ACTIVE"
          )
        : [];

      setAccounts(activeAccounts);
    } catch (err) {
      console.error("Account refresh error:", err);
    }
  };

  const openSellModal = (investment) => {
    setSelectedInvestment(investment);
    setShowSellModal(true);
    setError("");
    setMessage("");
  };

  const closeSellModal = () => {
    if (sellingId !== null) {
      return;
    }

    setShowSellModal(false);
    setSelectedInvestment(null);
  };

  const handleSell = async () => {
    if (!selectedInvestment?.id) {
      return;
    }

    setSellingId(selectedInvestment.id);
    setError("");
    setMessage("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE}/api/gold-investments/${selectedInvestment.id}/sell`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const soldInvestment = await response.json();

      setInvestments((previous) =>
        previous.map((investment) =>
          investment.id === soldInvestment.id
            ? soldInvestment
            : investment
        )
      );

      setShowSellModal(false);
      setSelectedInvestment(null);

      setMessage(
        `Gold sold successfully for ${formatCurrency(
          soldInvestment.currentValue
        )}.`
      );

      await loadAccountsOnly();
    } catch (err) {
      console.error("Gold sell error:", err);

      setError(err.message || "Unable to sell gold.");
    } finally {
      setSellingId(null);
    }
  };

  const activeInvestments = investments.filter(
    (investment) =>
      String(investment.status || "").toUpperCase() === "ACTIVE"
  );

  const soldInvestments = investments.filter(
    (investment) =>
      String(investment.status || "").toUpperCase() === "SOLD"
  );

  const totalInvested = activeInvestments.reduce(
    (total, investment) =>
      total + Number(investment.investmentAmount || 0),
    0
  );

  const totalCurrentValue = activeInvestments.reduce(
    (total, investment) =>
      total + Number(investment.currentValue || 0),
    0
  );

  const totalProfitLoss = activeInvestments.reduce(
    (total, investment) =>
      total + Number(investment.profitLoss || 0),
    0
  );

  const totalGoldGrams = activeInvestments.reduce(
    (total, investment) =>
      total + Number(investment.quantityGrams || 0),
    0
  );

  const profitLossPositive = totalProfitLoss >= 0;

  if (loading) {
    return (
      <div style={themedStyles.page}>
        <div style={themedStyles.loadingCard}>
          <div style={themedStyles.loadingIcon}>🪙</div>
          <h2 style={themedStyles.loadingTitle}>
            Loading Gold Investments...
          </h2>
          <p style={themedStyles.loadingText}>
            Please wait while we load your portfolio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={themedStyles.page}>
      <div style={themedStyles.header}>
        <div style={themedStyles.headerLeft}>
          <div style={themedStyles.headerIcon}>🪙</div>

          <div style={{ minWidth: 0 }}>
            <h1 style={themedStyles.headerTitle}>
              Gold Investment
            </h1>

            <p style={themedStyles.headerSubtitle}>
              Invest, track and manage your digital gold
            </p>
          </div>
        </div>

        <button
          type="button"
          style={themedStyles.backButton}
          onClick={() => (window.location.href = "/investments")}
        >
          ← Back to Investment Page
        </button>
      </div>

      {message && (
        <div style={themedStyles.successAlert}>
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={themedStyles.errorAlert}>
          <span>!</span>
          <span>{error}</span>
        </div>
      )}

      <div style={themedStyles.summaryGrid}>
        <div style={themedStyles.summaryCard}>
          <div
            style={{
              ...themedStyles.summaryIcon,
              background: "#eef4ff",
              color: "#2457c6",
            }}
          >
            🪙
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={themedStyles.summaryLabel}>Gold Holdings</p>
            <h2 style={themedStyles.summaryValue}>
              {formatNumber(totalGoldGrams)} g
            </h2>
          </div>
        </div>

        <div style={themedStyles.summaryCard}>
          <div
            style={{
              ...themedStyles.summaryIcon,
              background: "#eef8f1",
              color: "#198754",
            }}
          >
            💰
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={themedStyles.summaryLabel}>Total Invested</p>
            <h2 style={themedStyles.summaryValue}>
              {formatCurrency(totalInvested)}
            </h2>
          </div>
        </div>

        <div style={themedStyles.summaryCard}>
          <div
            style={{
              ...themedStyles.summaryIcon,
              background: "#fff7e8",
              color: "#d98b00",
            }}
          >
            📊
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={themedStyles.summaryLabel}>Current Value</p>
            <h2 style={themedStyles.summaryValue}>
              {formatCurrency(totalCurrentValue)}
            </h2>
          </div>
        </div>

        <div style={themedStyles.summaryCard}>
          <div
            style={{
              ...themedStyles.summaryIcon,
              background: profitLossPositive ? "#eef8f1" : "#fff0f0",
              color: profitLossPositive ? "#198754" : "#dc3545",
            }}
          >
            {profitLossPositive ? "↗" : "↘"}
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={themedStyles.summaryLabel}>Overall P/L</p>
            <h2
              style={{
                ...themedStyles.summaryValue,
                color: profitLossPositive ? "#198754" : "#dc3545",
              }}
            >
              {profitLossPositive ? "+" : ""}
              {formatCurrency(totalProfitLoss)}
            </h2>
          </div>
        </div>
      </div>

      <div style={themedStyles.mainGrid}>
        <div style={themedStyles.card}>
          <div style={themedStyles.cardHeader}>
            <div style={{ minWidth: 0 }}>
              <h2 style={themedStyles.cardTitle}>
                Buy Digital Gold
              </h2>

              <p style={themedStyles.cardSubtitle}>
                Start your gold investment journey
              </p>
            </div>

            <div style={themedStyles.goldBadge}>🪙</div>
          </div>

          <form onSubmit={handlePurchase} style={themedStyles.form}>
            <div style={themedStyles.formGroup}>
              <label style={themedStyles.label}>Debit Account</label>

              <select
                value={selectedAccount}
                onChange={(event) =>
                  setSelectedAccount(event.target.value)
                }
                style={themedStyles.input}
                required
              >
                <option value="">Select Account</option>

                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} —{" "}
                    {formatCurrency(account.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div style={themedStyles.formGroup}>
              <label style={themedStyles.label}>Gold Type</label>

              <input
                type="text"
                value="Digital Gold"
                readOnly
                style={{
                  ...themedStyles.input,
                  background: "#f7f9fc",
                  color: "#495057",
                }}
              />
            </div>

            <div style={themedStyles.formGroup}>
              <label style={themedStyles.label}>Gold Purity</label>

              <div style={themedStyles.purityGrid}>
                {goldPrices.map((price) => {
                  const purity = String(
                    price.purity || ""
                  ).toUpperCase();

                  const selected = selectedPurity === purity;

                  return (
                    <button
                      type="button"
                      key={purity}
                      onClick={() => setSelectedPurity(purity)}
                      style={{
                        ...themedStyles.purityButton,
                        ...(selected
                          ? themedStyles.purityButtonActive
                          : {}),
                      }}
                    >
                      <strong>{purity}</strong>

                      <span>
                        {formatCurrency(price.pricePerGram)}/g
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={themedStyles.formGroup}>
              <label style={themedStyles.label}>
                Investment Amount
              </label>

              <div style={themedStyles.amountWrapper}>
                <span style={themedStyles.amountPrefix}>₹</span>

                <input
                  type="number"
                  min={selectedGoldPrice?.minimumInvestment || 100}
                  step="0.01"
                  value={investmentAmount}
                  onChange={(event) =>
                    setInvestmentAmount(event.target.value)
                  }
                  placeholder="Enter amount"
                  style={themedStyles.amountInput}
                  required
                />
              </div>

              <p style={themedStyles.helperText}>
                Minimum investment:{" "}
                {formatCurrency(
                  selectedGoldPrice?.minimumInvestment
                )}
              </p>
            </div>

            <div style={themedStyles.calculationBox}>
              <div>
                <span style={themedStyles.calculationLabel}>
                  Gold Price
                </span>

                <strong style={themedStyles.calculationValue}>
                  {formatCurrency(selectedGoldPrice?.pricePerGram)}
                  / gram
                </strong>
              </div>

              <div style={themedStyles.calculationDivider} />

              <div>
                <span style={themedStyles.calculationLabel}>
                  You Receive
                </span>

                <strong style={themedStyles.calculationGold}>
                  {formatNumber(calculatedGrams)} grams
                </strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={purchasing || accounts.length === 0}
              style={{
                ...themedStyles.primaryButton,
                opacity:
                  purchasing || accounts.length === 0 ? 0.65 : 1,
              }}
            >
              {purchasing ? "Processing..." : "🪙 Buy Gold"}
            </button>

            {accounts.length === 0 && (
              <p style={themedStyles.warningText}>
                No active account available for investment.
              </p>
            )}
          </form>
        </div>

        <div style={themedStyles.card}>
          <div style={themedStyles.cardHeader}>
            <div style={{ minWidth: 0 }}>
              <h2 style={themedStyles.cardTitle}>Gold Price</h2>

              <p style={themedStyles.cardSubtitle}>
                Current Avani Bank catalogue price
              </p>
            </div>

            <div style={themedStyles.priceIcon}>₹</div>
          </div>

          <div style={themedStyles.priceList}>
            {goldPrices.map((price) => (
              <div
                key={`${price.goldType}-${price.purity}`}
                style={themedStyles.priceRow}
              >
                <div style={{ minWidth: 0 }}>
                  <strong style={themedStyles.pricePurity}>
                    {price.purity}
                  </strong>

                  <span style={themedStyles.priceType}>
                    Digital Gold
                  </span>
                </div>

                <div style={themedStyles.priceRight}>
                  <strong style={themedStyles.priceAmount}>
                    {formatCurrency(price.pricePerGram)}
                  </strong>

                  <span style={themedStyles.priceUnit}>
                    per gram
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={themedStyles.infoBox}>
            <span style={themedStyles.infoIcon}>ℹ</span>

            <span>
              Gold value is calculated according to the current catalogue
              price and your purchased quantity.
            </span>
          </div>
        </div>
      </div>

      <div style={themedStyles.section}>
        <div style={themedStyles.sectionHeader}>
          <div style={{ minWidth: 0 }}>
            <h2 style={themedStyles.sectionTitle}>
              Active Gold Investments
            </h2>

            <p style={themedStyles.sectionSubtitle}>
              Track your current gold holdings
            </p>
          </div>

          <span style={themedStyles.countBadge}>
            {activeInvestments.length} Active
          </span>
        </div>

        {activeInvestments.length === 0 ? (
          <div style={themedStyles.emptyCard}>
            <div style={themedStyles.emptyIcon}>🪙</div>

            <h3 style={themedStyles.emptyTitle}>
              No Active Gold Investments
            </h3>

            <p style={themedStyles.emptyText}>
              Your purchased gold investments will appear here.
            </p>
          </div>
        ) : (
          <div style={themedStyles.investmentGrid}>
            {activeInvestments.map((investment) => {
              const profit =
                Number(investment.profitLoss || 0) >= 0;

              return (
                <div
                  key={investment.id}
                  style={themedStyles.investmentCard}
                >
                  <div style={themedStyles.investmentTop}>
                    <div>
                      <div style={themedStyles.goldTitleRow}>
                        <span style={themedStyles.goldMiniIcon}>
                          🪙
                        </span>

                        <div style={{ minWidth: 0 }}>
                          <h3 style={themedStyles.investmentTitle}>
                            Digital Gold
                          </h3>

                          <span style={themedStyles.investmentId}>
                            Investment #{investment.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span style={themedStyles.activeBadge}>
                      ACTIVE
                    </span>
                  </div>

                  <div style={themedStyles.investmentDetails}>
                    <div style={themedStyles.detailItem}>
                      <span style={themedStyles.detailLabel}>
                        Purity
                      </span>

                      <strong style={themedStyles.detailValue}>
                        {investment.purity}
                      </strong>
                    </div>

                    <div style={themedStyles.detailItem}>
                      <span style={themedStyles.detailLabel}>
                        Quantity
                      </span>

                      <strong style={themedStyles.detailValue}>
                        {formatNumber(investment.quantityGrams)} g
                      </strong>
                    </div>

                    <div style={themedStyles.detailItem}>
                      <span style={themedStyles.detailLabel}>
                        Buy Price
                      </span>

                      <strong style={themedStyles.detailValue}>
                        {formatCurrency(
                          investment.purchasePricePerGram
                        )}
                      </strong>
                    </div>

                    <div style={themedStyles.detailItem}>
                      <span style={themedStyles.detailLabel}>
                        Current Price
                      </span>

                      <strong style={themedStyles.detailValue}>
                        {formatCurrency(
                          investment.currentPricePerGram
                        )}
                      </strong>
                    </div>
                  </div>

                  <div style={themedStyles.valueBox}>
                    <div>
                      <span style={themedStyles.valueLabel}>
                        Invested
                      </span>

                      <strong style={themedStyles.valueAmount}>
                        {formatCurrency(investment.investmentAmount)}
                      </strong>
                    </div>

                    <div>
                      <span style={themedStyles.valueLabel}>
                        Current Value
                      </span>

                      <strong style={themedStyles.currentValue}>
                        {formatCurrency(investment.currentValue)}
                      </strong>
                    </div>

                    <div>
                      <span style={themedStyles.valueLabel}>
                        Profit / Loss
                      </span>

                      <strong
                        style={{
                          ...themedStyles.currentValue,
                          color: profit ? "#198754" : "#dc3545",
                        }}
                      >
                        {profit ? "+" : ""}
                        {formatCurrency(investment.profitLoss)}
                      </strong>
                    </div>
                  </div>

                  <div style={themedStyles.investmentFooter}>
                    <span style={themedStyles.purchaseDate}>
                      Purchased: {investment.purchaseDate || "—"}
                    </span>

                    <button
                      type="button"
                      style={themedStyles.sellButton}
                      onClick={() => openSellModal(investment)}
                    >
                      Sell Gold
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={themedStyles.section}>
        <div style={themedStyles.sectionHeader}>
          <div style={{ minWidth: 0 }}>
            <h2 style={themedStyles.sectionTitle}>
              Gold Investment History
            </h2>

            <p style={themedStyles.sectionSubtitle}>
              Previously completed gold investments
            </p>
          </div>
        </div>

        {soldInvestments.length === 0 ? (
          <div style={themedStyles.emptyHistory}>
            No sold gold investments yet.
          </div>
        ) : (
          <div style={themedStyles.tableWrapper}>
            <table style={themedStyles.table}>
              <thead>
                <tr>
                  <th style={themedStyles.th}>Investment</th>
                  <th style={themedStyles.th}>Purity</th>
                  <th style={themedStyles.th}>Quantity</th>
                  <th style={themedStyles.th}>Invested</th>
                  <th style={themedStyles.th}>Sale Value</th>
                  <th style={themedStyles.th}>Profit / Loss</th>
                  <th style={themedStyles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {soldInvestments.map((investment) => {
                  const profit =
                    Number(investment.profitLoss || 0) >= 0;

                  return (
                    <tr key={investment.id}>
                      <td style={themedStyles.td}>
                        <strong>Gold #{investment.id}</strong>
                      </td>

                      <td style={themedStyles.td}>
                        {investment.purity}
                      </td>

                      <td style={themedStyles.td}>
                        {formatNumber(investment.quantityGrams)} g
                      </td>

                      <td style={themedStyles.td}>
                        {formatCurrency(investment.investmentAmount)}
                      </td>

                      <td style={themedStyles.td}>
                        {formatCurrency(investment.currentValue)}
                      </td>

                      <td
                        style={{
                          ...themedStyles.td,
                          color: profit ? "#198754" : "#dc3545",
                          fontWeight: 700,
                        }}
                      >
                        {profit ? "+" : ""}
                        {formatCurrency(investment.profitLoss)}
                      </td>

                      <td style={themedStyles.td}>
                        <span style={themedStyles.soldBadge}>
                          SOLD
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showSellModal && selectedInvestment && (
        <div style={themedStyles.modalOverlay}>
          <div style={themedStyles.modal}>
            <div style={themedStyles.modalIcon}>🪙</div>

            <h2 style={themedStyles.modalTitle}>Sell Gold?</h2>

            <p style={themedStyles.modalText}>
              Are you sure you want to sell this gold investment?
            </p>

            <div style={themedStyles.modalDetails}>
              <div style={themedStyles.modalDetailsRow}>
                <span>Gold Quantity</span>

                <strong>
                  {formatNumber(
                    selectedInvestment.quantityGrams
                  )}{" "}
                  g
                </strong>
              </div>

              <div style={themedStyles.modalDetailsRow}>
                <span>Current Value</span>

                <strong>
                  {formatCurrency(
                    selectedInvestment.currentValue
                  )}
                </strong>
              </div>

              <div style={themedStyles.modalDetailsRow}>
                <span>Current P/L</span>

                <strong
                  style={{
                    color:
                      Number(
                        selectedInvestment.profitLoss || 0
                      ) >= 0
                        ? "#198754"
                        : "#dc3545",
                  }}
                >
                  {Number(
                    selectedInvestment.profitLoss || 0
                  ) >= 0
                    ? "+"
                    : ""}
                  {formatCurrency(
                    selectedInvestment.profitLoss
                  )}
                </strong>
              </div>
            </div>

            <div style={themedStyles.modalActions}>
              <button
                type="button"
                onClick={closeSellModal}
                disabled={sellingId !== null}
                style={themedStyles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSell}
                disabled={sellingId !== null}
                style={{
                  ...themedStyles.confirmSellButton,
                  opacity: sellingId !== null ? 0.65 : 1,
                }}
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
    boxShadow: "0 10px 30px rgba(36, 87, 198, 0.18)",
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
    fontSize: "27px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
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
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.13)",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 650,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  successAlert: {
    background: "#eaf8ef",
    border: "1px solid #b9e6c8",
    color: "#176b36",
    borderRadius: "11px",
    padding: "12px 15px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 600,
  },

  errorAlert: {
    background: "#fff0f0",
    border: "1px solid #f2bcbc",
    color: "#a82929",
    borderRadius: "11px",
    padding: "12px 15px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 600,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
    boxShadow: "0 4px 14px rgba(26, 48, 79, 0.05)",
  },

  summaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
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

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.15fr) minmax(0, 0.85fr)",
    gap: "20px",
    marginBottom: "24px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "17px",
    padding: "22px",
    boxShadow: "0 5px 18px rgba(26, 48, 79, 0.05)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 750,
    color: "#172033",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#778196",
    fontSize: "13px",
  },

  goldBadge: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#fff7e6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  priceIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#eef4ff",
    color: "#2457c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    fontWeight: 800,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#354052",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d9dfe9",
    borderRadius: "10px",
    padding: "12px 13px",
    background: "#ffffff",
    color: "#1f2937",
    fontSize: "14px",
    outline: "none",
  },

  purityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  },

  purityButton: {
    border: "1px solid #dce2ec",
    background: "#ffffff",
    borderRadius: "11px",
    padding: "12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "flex-start",
    color: "#455064",
  },

  purityButtonActive: {
    border: "2px solid #2457c6",
    background: "#f1f5ff",
    color: "#2457c6",
  },

  amountWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d9dfe9",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#ffffff",
  },

  amountPrefix: {
    paddingLeft: "13px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#687386",
  },

  amountInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px 10px",
    fontSize: "15px",
    background: "transparent",
  },

  helperText: {
    margin: 0,
    color: "#7a8495",
    fontSize: "11px",
  },

  calculationBox: {
    background: "#f5f8ff",
    border: "1px solid #dce6fb",
    borderRadius: "12px",
    padding: "14px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "12px",
  },

  calculationLabel: {
    display: "block",
    color: "#758096",
    fontSize: "11px",
    marginBottom: "4px",
  },

  calculationValue: {
    fontSize: "14px",
    color: "#26334a",
  },

  calculationGold: {
    fontSize: "15px",
    color: "#2457c6",
  },

  calculationDivider: {
    width: "1px",
    height: "34px",
    background: "#d5deef",
  },

  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: "11px",
    padding: "13px",
    background:
      "linear-gradient(135deg, #165dcc, #2d74da)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 750,
    cursor: "pointer",
    boxShadow: "0 7px 16px rgba(36, 87, 198, 0.2)",
  },

  warningText: {
    margin: 0,
    textAlign: "center",
    color: "#b06b00",
    fontSize: "12px",
  },

  priceList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  priceRow: {
    border: "1px solid #e8ecf3",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pricePurity: {
    display: "block",
    color: "#172033",
    fontSize: "16px",
  },

  priceType: {
    display: "block",
    marginTop: "3px",
    color: "#7b8494",
    fontSize: "11px",
  },

  priceRight: {
    textAlign: "right",
  },

  priceAmount: {
    display: "block",
    color: "#2457c6",
    fontSize: "16px",
  },

  priceUnit: {
    display: "block",
    color: "#7b8494",
    fontSize: "11px",
    marginTop: "2px",
  },

  infoBox: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "10px",
    background: "#f7f9fc",
    color: "#687386",
    fontSize: "11px",
    lineHeight: 1.5,
    display: "flex",
    gap: "8px",
  },

  infoIcon: {
    color: "#2457c6",
    fontWeight: 800,
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "17px",
    padding: "22px",
    marginBottom: "24px",
    boxShadow: "0 5px 18px rgba(26, 48, 79, 0.05)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "18px",
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
    fontSize: "13px",
  },

  countBadge: {
    background: "#eef4ff",
    color: "#2457c6",
    borderRadius: "20px",
    padding: "7px 12px",
    fontSize: "11px",
    fontWeight: 750,
  },

  investmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  investmentCard: {
    border: "1px solid #e5e9f0",
    borderRadius: "14px",
    padding: "17px",
    background: "#ffffff",
  },

  investmentTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },

  goldTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  goldMiniIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "10px",
    background: "#fff7e6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  investmentTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 750,
  },

  investmentId: {
    color: "#8490a3",
    fontSize: "10px",
  },

  activeBadge: {
    background: "#eaf8ef",
    color: "#198754",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: 800,
  },

  investmentDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    paddingBottom: "15px",
    borderBottom: "1px solid #edf0f4",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  detailLabel: {
    color: "#8490a3",
    fontSize: "10px",
  },

  detailValue: {
    color: "#303a4d",
    fontSize: "12px",
  },

  valueBox: {
    marginTop: "15px",
    background: "#f8faff",
    borderRadius: "11px",
    padding: "12px",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },

  valueLabel: {
    display: "block",
    color: "#7b8494",
    fontSize: "10px",
    marginBottom: "4px",
  },

  valueAmount: {
    fontSize: "12px",
    color: "#303a4d",
  },

  currentValue: {
    fontSize: "12px",
    color: "#2457c6",
  },

  investmentFooter: {
    marginTop: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  purchaseDate: {
    color: "#7b8494",
    fontSize: "10px",
  },

  sellButton: {
    border: "1px solid #f0b6b6",
    background: "#fff5f5",
    color: "#c53030",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
  },

  emptyCard: {
    border: "1px dashed #d9dfe9",
    borderRadius: "13px",
    padding: "40px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "34px",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#354052",
  },

  emptyText: {
    margin: "7px 0 0",
    color: "#7b8494",
    fontSize: "12px",
  },

  emptyHistory: {
    border: "1px dashed #d9dfe9",
    borderRadius: "12px",
    padding: "25px",
    textAlign: "center",
    color: "#7b8494",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "750px",
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    background: "#f7f9fc",
    color: "#69758a",
    fontSize: "10px",
    fontWeight: 750,
    borderBottom: "1px solid #e5e9f0",
  },

  td: {
    padding: "13px 10px",
    fontSize: "11px",
    color: "#3c4658",
    borderBottom: "1px solid #edf0f4",
  },

  soldBadge: {
    background: "#f1f3f5",
    color: "#69758a",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: 800,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 28, 48, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    borderRadius: "17px",
    padding: "25px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    textAlign: "center",
  },

  modalIcon: {
    width: "55px",
    height: "55px",
    margin: "0 auto 12px",
    borderRadius: "50%",
    background: "#fff7e6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: 750,
    color: "#172033",
  },

  modalText: {
    margin: "8px 0 18px",
    color: "#737e91",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  modalDetails: {
    background: "#f7f9fc",
    borderRadius: "11px",
    padding: "13px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    textAlign: "left",
  },

  modalDetailsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  cancelButton: {
    flex: 1,
    border: "1px solid #d8dee8",
    background: "#ffffff",
    color: "#536075",
    borderRadius: "10px",
    padding: "11px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  confirmSellButton: {
    flex: 1,
    border: "none",
    background: "#dc3545",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "11px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  loadingCard: {
    maxWidth: "450px",
    margin: "120px auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "45px 25px",
    textAlign: "center",
    boxShadow: "0 10px 35px rgba(26, 48, 79, 0.08)",
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
