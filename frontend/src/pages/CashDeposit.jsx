import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CashDeposit() {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("cashierTheme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("cashierTheme", isDark ? "dark" : "light");
  }, [isDark]);

  const heroImage = "/avani-bank-header-image.png";

  const [accountNumber, setAccountNumber] = useState("");
  const [counterCode, setCounterCode] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [transaction, setTransaction] = useState(null);

  const staffName = localStorage.getItem("staffName") || "Cashier";

  const employeeCode = localStorage.getItem("employeeCode") || "-";

  const branchCode = localStorage.getItem("branchCode") || "-";

  // Responsive viewport state
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 700 : false
  );
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 980 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
      setIsTablet(window.innerWidth <= 980);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setTransaction(null);

    const cleanAccountNumber = accountNumber.trim();
    const cleanCounterCode = counterCode.trim();
    const depositAmount = Number(amount);

    if (!cleanAccountNumber) {
      setError("Please enter customer account number.");
      return;
    }

    if (!cleanCounterCode) {
      setError("Please enter cash counter code.");
      return;
    }

    if (!amount || depositAmount <= 0) {
      setError("Deposit amount must be greater than ₹0.");
      return;
    }

    const token =
      localStorage.getItem("staffToken") || localStorage.getItem("token");

    if (!token) {
      setError("Cashier session expired. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/cash-deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountNumber: cleanAccountNumber,
          counterCode: cleanCounterCode,
          amount: depositAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Cash deposit failed.");
      }

      setTransaction(data);
      setSuccess("Cash deposited successfully.");

      setAccountNumber("");
      setCounterCode("");
      setAmount("");
    } catch (err) {
      setError(err.message || "Unable to process cash deposit.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewDeposit = () => {
    setTransaction(null);
    setSuccess("");
    setError("");
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #eef5fc 0%, #f7fbff 55%, #eaf3fb 100%)",
      padding: "22px",
      boxSizing: "border-box",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      color: "#12345a",
    },

    container: {
      maxWidth: "1280px",
      margin: "0 auto",
    },

    topBar: {
      background: "rgba(255,255,255,0.96)",
      border: "1px solid #dce8f5",
      borderRadius: "16px",
      minHeight: "70px",
      padding: "10px 16px 10px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "18px",
      boxShadow: "0 8px 24px rgba(20, 55, 90, 0.08)",
      marginBottom: "18px",
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    brandLogo: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #0b5ed7, #1684d8)",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: "900",
      boxShadow: "0 7px 18px rgba(11,94,215,0.22)",
    },

    brandName: {
      fontSize: "19px",
      fontWeight: "900",
      color: "#0b2d5c",
      letterSpacing: "0.8px",
      lineHeight: 1.1,
    },

    brandTagline: {
      fontSize: "10px",
      color: "#70839b",
      marginTop: "3px",
      letterSpacing: "0.2px",
    },

    topRight: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    cashierBadge: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      padding: "8px 12px",
      border: "1px solid #dce8f5",
      borderRadius: "11px",
      background: "#f8fbff",
    },

    cashierAvatar: {
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #0b5ed7, #1684d8)",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "800",
      fontSize: "14px",
    },

    cashierName: {
      fontSize: "12px",
      fontWeight: "800",
      color: "#15385f",
    },

    cashierRole: {
      fontSize: "10px",
      color: "#74869b",
      marginTop: "2px",
    },

    onlineBadge: {
      fontSize: "10px",
      fontWeight: "800",
      color: "#12804a",
      background: "#e8f8ef",
      border: "1px solid #bde8ce",
      borderRadius: "20px",
      padding: "6px 9px",
    },

    backButton: {
      border: "1px solid #bc3f52",
      background: "#b80a0a42",
      color: "#a00707",
      padding: "10px 15px",
      borderRadius: "20px",
      cursor: "pointer",
      fontSize: "10px",
      fontWeight: "800",
      boxShadow: "0 3px 10px rgba(20,55,90,0.05)",
    },

    hero: {
      minHeight: "215px",
      borderRadius: "18px",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      alignItems: "stretch",
      background: "linear-gradient(110deg, #052f65 0%, #0a57a8 57%, #0b70c9 100%)",
      boxShadow: "0 14px 32px rgba(8, 53, 103, 0.18)",
      marginBottom: "20px",
    },

    heroContent: {
      width: "63%",
      padding: "28px 34px",
      boxSizing: "border-box",
      color: "#ffffff",
      position: "relative",
      zIndex: 2,
    },

    heroEyebrow: {
      fontSize: "11px",
      fontWeight: "800",
      letterSpacing: "1.8px",
      opacity: 0.86,
      marginBottom: "8px",
    },

    heroTitle: {
      margin: 0,
      fontSize: "34px",
      lineHeight: 1.1,
      fontWeight: "850",
      letterSpacing: "-0.6px",
    },

    heroText: {
      margin: "10px 0 18px",
      maxWidth: "560px",
      fontSize: "14px",
      lineHeight: 1.55,
      opacity: 0.9,
    },

    heroFeatures: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },

    heroFeature: {
      padding: "7px 10px",
      borderRadius: "20px",
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.20)",
      fontSize: "10px",
      fontWeight: "700",
    },

    heroImage: {
      position: "absolute",
      right: 0,
      top: 0,
      width: "43%",
      height: "100%",
      backgroundImage: `linear-gradient(90deg, rgba(5,47,101,0.92) 0%, rgba(5,47,101,0.28) 38%, rgba(5,47,101,0.04) 100%), url(${heroImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      clipPath: "polygon(16% 0, 100% 0, 100% 100%, 0 100%)",
    },

    mainLayout: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) 300px",
      gap: "18px",
      alignItems: "start",
    },

    card: {
      background: "rgba(255,255,255,0.98)",
      borderRadius: "18px",
      padding: "26px",
      boxShadow: "0 10px 30px rgba(20, 55, 90, 0.09)",
      border: "1px solid #dfeaf5",
    },

    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      paddingBottom: "18px",
      marginBottom: "20px",
      borderBottom: "1px solid #e7eef6",
    },

    cardIcon: {
      width: "43px",
      height: "43px",
      borderRadius: "13px",
      background: "linear-gradient(135deg, #0b6fe4, #1684d8)",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      boxShadow: "0 6px 16px rgba(11,94,215,0.20)",
    },

    sectionTitle: {
      margin: 0,
      color: "#102f56",
      fontSize: "21px",
      fontWeight: "800",
    },

    sectionText: {
      margin: "4px 0 0",
      color: "#718096",
      fontSize: "12px",
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "18px",
    },

    fullField: {
      gridColumn: "1 / -1",
    },

    label: {
      display: "block",
      marginBottom: "7px",
      color: "#183a63",
      fontSize: "12px",
      fontWeight: "800",
    },

    required: {
      color: "#d13c3c",
    },

    input: {
      width: "100%",
      height: "50px",
      boxSizing: "border-box",
      border: "1px solid #d4e1ee",
      borderRadius: "10px",
      padding: "0 14px",
      fontSize: "14px",
      color: "#17365d",
      background: "#fbfdff",
      outline: "none",
      transition: "all 0.2s ease",
    },

    amountInput: {
      width: "100%",
      height: "58px",
      boxSizing: "border-box",
      border: "1px solid #c8d9ea",
      borderRadius: "11px",
      padding: "0 17px",
      fontSize: "20px",
      color: "#123b68",
      background: "#fbfdff",
      outline: "none",
      fontWeight: "700",
    },

    hint: {
      marginTop: "6px",
      fontSize: "10px",
      color: "#8393a6",
    },

    quickAmounts: {
      display: "grid",
      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
      gap: "8px",
      marginTop: "12px",
    },

    quickAmount: {
      height: "38px",
      border: "1px solid #cfe0f2",
      borderRadius: "9px",
      background: "#f7fbff",
      color: "#0754a0",
      fontWeight: "800",
      fontSize: "11px",
      cursor: "pointer",
    },

    actionArea: {
      marginTop: "22px",
      padding: "14px",
      border: "1px dashed #a9cdef",
      borderRadius: "12px",
      background: "#f7fbff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "15px",
    },

    verificationText: {
      fontSize: "11px",
      lineHeight: 1.45,
      color: "#506b87",
    },

    buttonRow: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "0",
    },

    depositButton: {
      border: "none",
      background: "linear-gradient(135deg, #0754c7 0%, #1684d8 100%)",
      color: "#ffffff",
      minWidth: "205px",
      minHeight: "48px",
      padding: "12px 22px",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: "800",
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(11, 94, 215, 0.24)",
    },

    disabledButton: {
      opacity: 0.65,
      cursor: "not-allowed",
    },

    message: {
      marginTop: "16px",
      padding: "12px 14px",
      borderRadius: "10px",
      fontSize: "12px",
      fontWeight: "600",
    },

    error: {
      background: "#fff3f3",
      border: "1px solid #ffd3d3",
      color: "#b42318",
    },

    success: {
      background: "#effcf5",
      border: "1px solid #c7efd9",
      color: "#087443",
    },

    sideStack: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },

    sideCard: {
      background: "#ffffff",
      border: "1px solid #dfeaf5",
      borderRadius: "16px",
      padding: "17px",
      boxShadow: "0 8px 24px rgba(20,55,90,0.07)",
    },

    sideHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "13px",
    },

    sideTitle: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#12345a",
      fontSize: "13px",
      fontWeight: "800",
    },

    sideIcon: {
      width: "30px",
      height: "30px",
      borderRadius: "9px",
      background: "#eaf4ff",
      color: "#0754a0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "15px",
    },

    staffGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "8px",
    },

    staffItem: {
      padding: "10px",
      background: "#f7faff",
      border: "1px solid #e7eef7",
      borderRadius: "9px",
    },

    staffItemWide: {
      gridColumn: "1 / -1",
    },

    sideLabel: {
      display: "block",
      fontSize: "9px",
      color: "#8191a4",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "4px",
      fontWeight: "700",
    },

    sideValue: {
      fontSize: "12px",
      color: "#173b65",
      fontWeight: "800",
    },

    secureCard: {
      background: "linear-gradient(135deg, #fff8df, #fffdf3)",
      border: "1px solid #f2dfaa",
    },

    secureText: {
      fontSize: "10px",
      lineHeight: 1.5,
      color: "#6f5a20",
      margin: 0,
    },

    guideline: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      padding: "8px 0",
      borderBottom: "1px solid #edf1f5",
      fontSize: "10px",
      color: "#435c76",
      lineHeight: 1.35,
    },

    "guideline:lastChild": {
      borderBottom: "none",
    },

    step: {
      flex: "0 0 auto",
      width: "23px",
      height: "23px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #0b63ce, #1684d8)",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: "800",
    },

    receipt: {
  width: "100%",
  maxWidth: "850px",
  margin: "24px auto",
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  boxShadow: "0 10px 30px rgba(15, 45, 75, 0.10)",
  overflow: "hidden",
  color: "#172b4d",
},

receiptHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "22px 26px",
  background: "linear-gradient(135deg, #063b78, #0b63ce)",
  color: "#ffffff",
},

bankBrand: {
  display: "flex",
  alignItems: "center",
  gap: "12px",
},

bankLogo: {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "#ffffff",
  color: "#0754a0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "27px",
  fontWeight: "900",
  border: "3px solid rgba(255,255,255,0.75)",
},

bankName: {
  fontSize: "23px",
  fontWeight: "900",
  letterSpacing: "1.2px",
},

bankTagline: {
  fontSize: "11px",
  opacity: 0.9,
  marginTop: "3px",
},

receiptTitleBox: {
  textAlign: "right",
},

receiptTitle: {
  fontSize: "18px",
  fontWeight: "800",
  letterSpacing: "0.7px",
},

receiptSubtitle: {
  fontSize: "11px",
  marginTop: "4px",
  opacity: 0.85,
},

receiptLine: {
  height: "3px",
  background: "linear-gradient(90deg, #0b63ce, #39a0ff, #0b63ce)",
},

receiptMeta: {
  display: "flex",
  justifyContent: "space-between",
  padding: "17px 26px",
  borderBottom: "1px solid #e2e8f0",
},

metaLabel: {
  display: "block",
  fontSize: "10px",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "4px",
},

metaRight: {
  textAlign: "right",
},

referenceValue: {
  fontSize: "14px",
  color: "#0754a0",
  letterSpacing: "0.4px",
},

sectionHeading: {
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "0.8px",
  color: "#0754a0",
  padding: "17px 26px 10px",
},

receiptDetailsGrid: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  padding: "0 26px 17px",
},

detailBox: {
  border: "1px solid #dce5ef",
  background: "#f8fafc",
  borderRadius: "7px",
  padding: "11px 13px",
},

detailLabel: {
  display: "block",
  fontSize: "10px",
  color: "#64748b",
  marginBottom: "4px",
  textTransform: "uppercase",
},

amountSection: {
  margin: "5px 26px 15px",
  padding: "17px 20px",
  borderRadius: "8px",
  border: "1px solid #b9d5f5",
  background: "linear-gradient(135deg, #eef6ff, #f8fbff)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
},

amountLabel: {
  fontSize: "11px",
  fontWeight: "800",
  color: "#0754a0",
  letterSpacing: "0.8px",
},

amountWords: {
  fontSize: "10px",
  color: "#64748b",
  marginTop: "4px",
},

amountValue: {
  fontSize: "25px",
  fontWeight: "900",
  color: "#063b78",
  whiteSpace: "nowrap",
},

receiptTable: {
  width: "calc(100% - 52px)",
  margin: "0 26px 17px",
  borderCollapse: "collapse",
  fontSize: "12px",
},

tableLabel: {
  width: "50%",
  padding: "9px 12px",
  border: "1px solid #dce5ef",
  background: "#f8fafc",
  color: "#64748b",
},

tableValue: {
  padding: "9px 12px",
  border: "1px solid #dce5ef",
  fontWeight: "700",
},

successBadge: {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "20px",
  background: "#dcfce7",
  color: "#15803d",
  fontSize: "10px",
  fontWeight: "800",
},

acknowledgementBox: {
  margin: "0 26px",
  border: "1px solid #dce5ef",
  borderRadius: "8px",
  background: "#ffffff",
},

acknowledgementText: {
  padding: "0 17px",
  margin: "0 0 20px",
  fontSize: "11px",
  lineHeight: "1.6",
  color: "#475569",
},

signatureGrid: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "50px",
  padding: "15px 22px 22px",
},

signatureBox: {
  textAlign: "center",
},

signatureLine: {
  height: "32px",
  borderBottom: "1px solid #334155",
  marginBottom: "7px",
},

signatureLabel: {
  fontSize: "10px",
  color: "#475569",
  fontWeight: "700",
},

receiptNotice: {
  margin: "17px 26px",
  padding: "11px 14px",
  borderLeft: "3px solid #0b63ce",
  background: "#f8fafc",
  fontSize: "10px",
  lineHeight: "1.5",
  color: "#475569",
},

receiptFooter: {
  textAlign: "center",
  padding: "16px 20px",
  borderTop: "1px dashed #cbd5e1",
  background: "#f8fafc",
},

footerMain: {
  fontSize: "13px",
  fontWeight: "900",
  color: "#063b78",
  letterSpacing: "1px",
},

footerText: {
  fontSize: "9px",
  color: "#64748b",
  marginTop: "4px",
},

receiptActions: {
  display: "flex",
  gap: "10px",
  padding: "18px 26px",
  borderTop: "1px solid #e2e8f0",
},

printButton: {
  flex: 1,
  height: "44px",
  border: "none",
  background: "linear-gradient(135deg, #0b5ed7, #1684d8)",
  color: "#ffffff",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "700",
},

newDepositButton: {
  flex: 1,
  height: "44px",
  border: "1px solid #cbdceb",
  background: "#ffffff",
  color: "#155ca8",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "700",
},    
    themeButton: {
      border: "1px solid #cbdceb",
      background: "#f7fbff",
      color: "#155ca8",
      borderRadius: "9px",
      padding: "8px 11px",
      cursor: "pointer",
      fontSize: "10px",
      fontWeight: "800",
      whiteSpace: "nowrap",
    },
  };


  const responsiveStyles = {
    page: {
      padding: isMobile ? "12px" : isTablet ? "16px" : "22px",
    },
    container: {
      width: "100%",
    },
    topBar: {
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "stretch" : "center",
      padding: isMobile ? "12px" : isTablet ? "12px 14px" : "10px 16px 10px 20px",
      gap: isMobile ? "12px" : "18px",
    },
    brand: {
      width: isMobile ? "100%" : "auto",
    },
    topRight: {
      width: isMobile ? "100%" : "auto",
      flexWrap: "wrap",
      justifyContent: isMobile ? "stretch" : "flex-end",
      gap: "8px",
    },
    cashierBadge: {
      flex: isMobile ? "1 1 100%" : "0 1 auto",
    },
    onlineBadge: {
      flex: isMobile ? "1 1 auto" : "0 0 auto",
      textAlign: "center",
    },
    themeButton: {
      flex: isMobile ? "1 1 auto" : "0 0 auto",
    },
    backButton: {
      flex: isMobile ? "1 1 auto" : "0 0 auto",
      minHeight: isMobile ? "40px" : "auto",
    },
    hero: {
      minHeight: isMobile ? "auto" : isTablet ? "190px" : "215px",
      flexDirection: isMobile ? "column" : "row",
    },
    heroContent: {
      width: isMobile ? "100%" : isTablet ? "68%" : "63%",
      padding: isMobile ? "22px 20px" : isTablet ? "24px" : "28px 34px",
    },
    heroTitle: {
      fontSize: isMobile ? "28px" : isTablet ? "31px" : "34px",
    },
    heroText: {
      fontSize: isMobile ? "12px" : "14px",
      maxWidth: isMobile ? "100%" : "560px",
    },
    heroFeatures: {
      gap: "7px",
    },
    heroFeature: {
      fontSize: isMobile ? "9px" : "10px",
      padding: isMobile ? "6px 8px" : "7px 10px",
    },
    heroImage: {
      position: isMobile ? "relative" : "absolute",
      width: isMobile ? "100%" : "43%",
      height: isMobile ? "125px" : "100%",
      minHeight: isMobile ? "125px" : "0",
      clipPath: isMobile ? "none" : "polygon(16% 0, 100% 0, 100% 100%, 0 100%)",
    },
    mainLayout: {
      gridTemplateColumns: isTablet ? "1fr" : "minmax(0, 1fr) 300px",
      gap: isMobile ? "14px" : "18px",
    },
    card: {
      padding: isMobile ? "18px" : isTablet ? "22px" : "26px",
    },
    cardHeader: {
      alignItems: isMobile ? "flex-start" : "center",
    },
    sectionTitle: {
      fontSize: isMobile ? "18px" : "21px",
    },
    formGrid: {
      gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(2, minmax(0, 1fr))",
      gap: isMobile ? "14px" : "18px",
    },
    input: {
      height: isMobile ? "48px" : "50px",
    },
    amountInput: {
      height: isMobile ? "54px" : "58px",
      fontSize: isMobile ? "18px" : "20px",
    },
    quickAmounts: {
      gridTemplateColumns: isMobile ? "repeat(3, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))",
      gap: isMobile ? "7px" : "8px",
    },
    quickAmount: {
      fontSize: isMobile ? "10px" : "11px",
      padding: isMobile ? "0 4px" : "0",
    },
    actionArea: {
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "stretch" : "center",
      gap: "12px",
    },
    verificationText: {
      fontSize: isMobile ? "10px" : "11px",
    },
    buttonRow: {
      width: isMobile ? "100%" : "auto",
    },
    depositButton: {
      width: isMobile ? "100%" : "auto",
      minWidth: isMobile ? "0" : "205px",
    },
    sideStack: {
      width: "100%",
    },
    staffGrid: {
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    },
    staffItemWide: {
      gridColumn: isMobile ? "auto" : "1 / -1",
    },
    receipt: {
      margin: isMobile ? "14px auto" : "24px auto",
      borderRadius: isMobile ? "8px" : "10px",
    },
    receiptHeader: {
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      gap: isMobile ? "12px" : "0",
      padding: isMobile ? "18px" : "22px 26px",
    },
    receiptTitleBox: {
      textAlign: isMobile ? "left" : "right",
      width: isMobile ? "100%" : "auto",
    },
    receiptMeta: {
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "12px" : "0",
      padding: isMobile ? "14px 18px" : "17px 26px",
    },
    metaRight: {
      textAlign: isMobile ? "left" : "right",
    },
    receiptDetailsGrid: {
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      padding: isMobile ? "0 18px 14px" : "0 26px 17px",
    },
    sectionHeading: {
      padding: isMobile ? "14px 18px 9px" : "17px 26px 10px",
    },
    amountSection: {
      margin: isMobile ? "5px 18px 14px" : "5px 26px 15px",
      padding: isMobile ? "14px 15px" : "17px 20px",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      gap: isMobile ? "8px" : "0",
    },
    amountValue: {
      fontSize: isMobile ? "22px" : "25px",
      alignSelf: isMobile ? "flex-end" : "auto",
    },
    receiptTable: {
      width: isMobile ? "calc(100% - 36px)" : "calc(100% - 52px)",
      margin: isMobile ? "0 18px 14px" : "0 26px 17px",
      fontSize: isMobile ? "11px" : "12px",
    },
    tableLabel: {
      width: isMobile ? "45%" : "50%",
      padding: isMobile ? "8px 9px" : "9px 12px",
    },
    tableValue: {
      padding: isMobile ? "8px 9px" : "9px 12px",
      wordBreak: "break-word",
    },
    acknowledgementBox: {
      margin: isMobile ? "0 18px" : "0 26px",
    },
    acknowledgementText: {
      padding: isMobile ? "0 14px" : "0 17px",
      fontSize: isMobile ? "10px" : "11px",
    },
    signatureGrid: {
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: isMobile ? "25px" : "50px",
      padding: isMobile ? "12px 16px 18px" : "15px 22px 22px",
    },
    receiptNotice: {
      margin: isMobile ? "14px 18px" : "17px 26px",
    },
    receiptFooter: {
      padding: isMobile ? "14px 15px" : "16px 20px",
    },
    receiptActions: {
      flexDirection: isMobile ? "column" : "row",
      padding: isMobile ? "14px 18px" : "18px 26px",
    },
    printButton: {
      width: isMobile ? "100%" : "auto",
    },
    newDepositButton: {
      width: isMobile ? "100%" : "auto",
    },
  };

  const getResponsiveStyle = (name) => ({
    ...(styles[name] || {}),
    ...(isMobile
      ? responsiveStyles[name] || {}
      : isTablet
        ? responsiveStyles[name] || {}
        : {}),
  });

  return (
    <div className={isDark ? "cash-deposit-page dark-mode" : "cash-deposit-page"} style={getResponsiveStyle("page")}>
    <style>
  {`
    .cash-deposit-page.dark-mode {
      background: linear-gradient(135deg, #08111f 0%, #0d1728 55%, #101e31 100%) !important;
      color: #e7edf7 !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-topbar,
    .cash-deposit-page.dark-mode .cash-deposit-card,
    .cash-deposit-page.dark-mode .cash-deposit-side-card {
      background: #111c2e !important;
      border-color: #26364f !important;
      box-shadow: 0 10px 30px rgba(0,0,0,.24) !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-cashier-badge {
      background: #17253b !important;
      border-color: #2b3d59 !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-cashier-badge div {
      color: #edf3ff !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-card h2,
    .cash-deposit-page.dark-mode .cash-deposit-side-card {
      color: #e8eef8 !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-card p,
    .cash-deposit-page.dark-mode .cash-deposit-side-card p {
      color: #9aa9bd !important;
    }

    .cash-deposit-page.dark-mode label {
      color: #cbd8e8 !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-input,
    .cash-deposit-page.dark-mode .cash-deposit-amount-input {
      background: #0d1829 !important;
      border-color: #30435f !important;
      color: #edf3ff !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-input::placeholder {
      color: #718198 !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-quick-amount {
      background: #16263d !important;
      border-color: #30445f !important;
      color: #82b1ff !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-secure-card {
      background: linear-gradient(135deg, #2b2718, #292719) !important;
      border-color: #66582d !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-secure-card p {
      color: #d3c27e !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-side-card span {
      color: #aab8ca !important;
    }

    /* Receipt remains light for professional printing/readability. */
    .cash-deposit-page.dark-mode .cash-deposit-receipt {
      background: #ffffff !important;
      color: #172b4d !important;
    }


    /* Complete dark-mode coverage for inline-styled components */
    .cash-deposit-page.dark-mode .cash-deposit-topbar,
    .cash-deposit-page.dark-mode .cash-deposit-card,
    .cash-deposit-page.dark-mode .cash-deposit-side-card,
    .cash-deposit-page.dark-mode .cash-deposit-side-stack > div {
      background: #111c2e !important;
      color: #e7edf7 !important;
      border-color: #26364f !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-topbar *:not(button):not(.cashierAvatar),
    .cash-deposit-page.dark-mode .cash-deposit-card h2,
    .cash-deposit-page.dark-mode .cash-deposit-side-card h2,
    .cash-deposit-page.dark-mode .cash-deposit-side-card strong,
    .cash-deposit-page.dark-mode .cash-deposit-side-card span,
    .cash-deposit-page.dark-mode .cash-deposit-card p,
    .cash-deposit-page.dark-mode .cash-deposit-side-card p,
    .cash-deposit-page.dark-mode .cash-deposit-side-card div {
      color: #e7edf7;
    }

    .cash-deposit-page.dark-mode .cash-deposit-card p,
    .cash-deposit-page.dark-mode .cash-deposit-side-card p,
    .cash-deposit-page.dark-mode .cash-deposit-side-card span {
      color: #aab8ca !important;
    }

    .cash-deposit-page.dark-mode input,
    .cash-deposit-page.dark-mode select,
    .cash-deposit-page.dark-mode textarea {
      background: #0d1829 !important;
      color: #edf3ff !important;
      border-color: #30435f !important;
    }

    .cash-deposit-page.dark-mode input::placeholder,
    .cash-deposit-page.dark-mode textarea::placeholder {
      color: #8797ad !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-side-stack > div > div[style],
    .cash-deposit-page.dark-mode .cash-deposit-side-stack > div div[style*="background"] {
      background-color: #17253b !important;
      border-color: #30435f !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-secure-card {
      background: linear-gradient(135deg, #2b2718, #292719) !important;
      border-color: #66582d !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-secure-card p {
      color: #e3d59b !important;
    }

    /* Fix remaining light controls and low-contrast side-panel headings. */
    .cash-deposit-page.dark-mode .cash-deposit-quick-amount {
      background: #172943 !important;
      color: #dbeafe !important;
      border-color: #385273 !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-action-area {
      background: #17253b !important;
      color: #e7edf7 !important;
      border-color: #385273 !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-action-area strong,
    .cash-deposit-page.dark-mode .cash-deposit-action-area div {
      color: #dbe7f7 !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-side-title,
    .cash-deposit-page.dark-mode .cash-deposit-side-title * {
      color: #e7edf7 !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-side-icon {
      background: #203754 !important;
      color: #8fc2ff !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-guideline {
      background: #17253b !important;
      color: #c5d3e6 !important;
      border-color: #30435f !important;
    }

    .cash-deposit-page.dark-mode .cash-deposit-receipt {
      background: #ffffff !important;
      color: #172b4d !important;
    }

    @media (max-width: 760px) {
      .cash-deposit-page.dark-mode .cash-deposit-topbar {
        flex-wrap: wrap;
      }
    }

    @media (max-width: 980px) {
      .cash-deposit-responsive-grid {
        grid-template-columns: 1fr !important;
      }
    }

    @media (max-width: 700px) {
      .cash-deposit-responsive-grid {
        display: block !important;
      }
    }

    @media print {

      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
      }

      body * {
        visibility: hidden;
      }

      .cash-deposit-receipt,
      .cash-deposit-receipt * {
        visibility: visible;
      }

      .cash-deposit-receipt {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        border: 1px solid #999 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      .receipt-actions {
        display: none !important;
      }

      @page {
        size: A4;
        margin: 10mm;
      }
    }

    @media (max-width: 650px) {

      .cash-deposit-receipt {
        width: 100% !important;
      }

      .cash-deposit-receipt
      .receipt-header {
        flex-direction: column;
        gap: 12px;
      }
    }
  `}
</style> 
      <div style={getResponsiveStyle("container")}>
        {/* TOP BAR */}
        <div className="cash-deposit-topbar" style={getResponsiveStyle("topBar")}>
          <div style={getResponsiveStyle("brand")}>
            <div style={getResponsiveStyle("brandLogo")}>A</div>
            <div>
              <div style={getResponsiveStyle("brandName")}>AVANI BANK</div>
              <div style={getResponsiveStyle("brandTagline")}>Secure • Simple • Trusted Banking</div>
            </div>
          </div>

          <div style={getResponsiveStyle("topRight")}>
            <div className="cash-deposit-cashier-badge" style={getResponsiveStyle("cashierBadge")}>
              <div style={getResponsiveStyle("cashierAvatar")}>
                {(staffName || "C").charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={getResponsiveStyle("cashierName")}>{staffName}</div>
                <div style={getResponsiveStyle("cashierRole")}>Cashier • Employee {employeeCode}</div>
              </div>
            </div>

            <div style={getResponsiveStyle("onlineBadge")}>● ONLINE</div>

            <button
              type="button"
              style={getResponsiveStyle("themeButton")}
              onClick={() => setIsDark((prev) => !prev)}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>

            <button
              type="button"
              style={getResponsiveStyle("backButton")}
              onClick={() => navigate("/cashier/login")}
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* PROFESSIONAL HERO */}
        <div style={getResponsiveStyle("hero")}>
          <div style={getResponsiveStyle("heroContent")}>
            <div style={getResponsiveStyle("heroEyebrow")}>BRANCH OPERATIONS</div>
            <h1 style={getResponsiveStyle("heroTitle")}>Cash Deposit</h1>
            <p style={getResponsiveStyle("heroText")}>
              Receive cash from customers and credit their accounts securely through
              the verified branch cash counter.
            </p>

            <div style={getResponsiveStyle("heroFeatures")}>
              <span style={getResponsiveStyle("heroFeature")}>✓ Secure Processing</span>
              <span style={getResponsiveStyle("heroFeature")}>✓ Real-time Credit</span>
              <span style={getResponsiveStyle("heroFeature")}>✓ Branch Verified</span>
              <span style={getResponsiveStyle("heroFeature")}>✓ Instant Receipt</span>
            </div>
          </div>

          <div style={getResponsiveStyle("heroImage")} aria-hidden="true" />
        </div>

        {/* MAIN CONTENT */}
        <div className="cash-deposit-responsive-grid" style={getResponsiveStyle("mainLayout")}>
          <div className="cash-deposit-card" style={getResponsiveStyle("card")}>
            <div style={getResponsiveStyle("cardHeader")}>
              <div style={getResponsiveStyle("cardIcon")}>▣</div>
              <div>
                <h2 style={getResponsiveStyle("sectionTitle")}>Deposit Details</h2>
                <p style={getResponsiveStyle("sectionText")}>
                  Enter customer account information and the cash amount received.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeposit}>
              <div style={getResponsiveStyle("formGrid")}>
                {/* ACCOUNT */}
                <div>
                  <label style={getResponsiveStyle("label")}>
                    Customer Account Number <span style={getResponsiveStyle("required")}>*</span>
                  </label>

                  <input className="cash-deposit-input"
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    style={getResponsiveStyle("input")}
                    disabled={loading}
                    autoComplete="off"
                  />

                  <div style={getResponsiveStyle("hint")}>
                    Verify the customer account before processing the deposit.
                  </div>
                </div>

                {/* COUNTER */}
                <div>
                  <label style={getResponsiveStyle("label")}>
                    Cash Counter Code <span style={getResponsiveStyle("required")}>*</span>
                  </label>

                  <input className="cash-deposit-input"
                    type="text"
                    value={counterCode}
                    onChange={(e) => setCounterCode(e.target.value.toUpperCase())}
                    placeholder="Example: CC-001"
                    style={getResponsiveStyle("input")}
                    disabled={loading}
                    autoComplete="off"
                  />

                  <div style={getResponsiveStyle("hint")}>
                    Use the active cash counter assigned to you.
                  </div>
                </div>

                {/* AMOUNT */}
                <div style={getResponsiveStyle("fullField")}>
                  <label style={getResponsiveStyle("label")}>
                    Deposit Amount <span style={getResponsiveStyle("required")}>*</span>
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={getResponsiveStyle("amountInput")}
                    disabled={loading}
                  />

                  <div style={getResponsiveStyle("hint")}>
                    Enter the exact cash amount received from the customer. Minimum ₹1.
                  </div>

                  <div style={getResponsiveStyle("quickAmounts")}>
                    {[500, 1000, 5000, 10000, 50000, 100000].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className="cash-deposit-quick-amount"
                        style={getResponsiveStyle("quickAmount")}
                        disabled={loading}
                        onClick={() => setAmount(String(value))}
                      >
                        ₹{value.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div
                  style={{
                    ...styles.message,
                    ...styles.error,
                  }}
                >
                  ⚠ {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div
                  style={{
                    ...styles.message,
                    ...styles.success,
                  }}
                >
                  ✓ {success}
                </div>
              )}

              {!transaction && (
                <div className="cash-deposit-action-area" style={getResponsiveStyle("actionArea")}>
                  <div style={getResponsiveStyle("verificationText")}>
                    <strong>Important:</strong> Verify the account number and count
                    the cash carefully before processing this transaction.
                  </div>

                  <div style={getResponsiveStyle("buttonRow")}>
                    <button
                      type="submit"
                      style={{
                        ...styles.depositButton,
                        ...(loading ? styles.disabledButton : {}),
                      }}
                      disabled={loading}
                    >
                      {loading ? "Processing Deposit..." : "Deposit Cash  →"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* OPERATION INFORMATION */}
          <div className="cash-deposit-side-stack" style={getResponsiveStyle("sideStack")}>
            <div className="cash-deposit-side-card" style={getResponsiveStyle("sideCard")}>
              <div style={getResponsiveStyle("sideHeader")}>
                <div className="cash-deposit-side-title" style={getResponsiveStyle("sideTitle")}>
                  <div className="cash-deposit-side-icon" style={getResponsiveStyle("sideIcon")}>▣</div>
                  Cashier Information
                </div>
                <span style={getResponsiveStyle("onlineBadge")}>ONLINE</span>
              </div>

              <div style={getResponsiveStyle("staffGrid")}>
                <div style={getResponsiveStyle("staffItem")}>
                  <span style={getResponsiveStyle("sideLabel")}>Cashier</span>
                  <span style={getResponsiveStyle("sideValue")}>{staffName}</span>
                </div>

                <div style={getResponsiveStyle("staffItem")}>
                  <span style={getResponsiveStyle("sideLabel")}>Employee Code</span>
                  <span style={getResponsiveStyle("sideValue")}>{employeeCode}</span>
                </div>

                <div style={{ ...styles.staffItem, ...styles.staffItemWide }}>
                  <span style={getResponsiveStyle("sideLabel")}>Branch</span>
                  <span style={getResponsiveStyle("sideValue")}>{branchCode}</span>
                </div>
              </div>
            </div>

            <div className="cash-deposit-side-card cash-deposit-secure-card" style={{ ...styles.sideCard, ...styles.secureCard }}>
              <div className="cash-deposit-side-title" style={getResponsiveStyle("sideTitle")}>
                <div className="cash-deposit-side-icon" style={getResponsiveStyle("sideIcon")}>🛡</div>
                Secure Transaction
              </div>
              <p style={getResponsiveStyle("secureText")}>
                All cash deposits are recorded and monitored for security,
                reconciliation and compliance.
              </p>
            </div>

            <div style={getResponsiveStyle("sideCard")}>
              <div style={getResponsiveStyle("sideHeader")}>
                <div className="cash-deposit-side-title" style={getResponsiveStyle("sideTitle")}>
                  <div className="cash-deposit-side-icon" style={getResponsiveStyle("sideIcon")}>☷</div>
                  Quick Guidelines
                </div>
              </div>

              {["Verify customer account number", "Confirm the assigned cash counter", "Enter the exact cash received", "Review details before processing", "Provide the receipt to customer"].map((item, index) => (
                <div key={item} style={getResponsiveStyle("guideline")}>
                  <span style={getResponsiveStyle("step")}>{index + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* =====================================================
    BANK COUNTER RECEIPT
===================================================== */}

          {transaction && (
            <div className="cash-deposit-receipt" style={getResponsiveStyle("receipt")}>
              {/* BANK HEADER */}
              <div style={getResponsiveStyle("receiptHeader")}>
                <div style={getResponsiveStyle("bankBrand")}>
                  <div style={getResponsiveStyle("bankLogo")}>A</div>

                  <div>
                    <div style={getResponsiveStyle("bankName")}>AVANI BANK</div>

                    <div style={getResponsiveStyle("bankTagline")}>
                      Secure • Simple • Trusted Banking
                    </div>
                  </div>
                </div>

                <div style={getResponsiveStyle("receiptTitleBox")}>
                  <div style={getResponsiveStyle("receiptTitle")}>CASH DEPOSIT RECEIPT</div>

                  <div style={getResponsiveStyle("receiptSubtitle")}>
                    Branch Counter Transaction
                  </div>
                </div>
              </div>

              {/* SEPARATOR */}
              <div style={getResponsiveStyle("receiptLine")} />

              {/* RECEIPT META */}
              <div style={getResponsiveStyle("receiptMeta")}>
                <div>
                  <span style={getResponsiveStyle("metaLabel")}>Transaction Reference</span>

                  <strong style={getResponsiveStyle("referenceValue")}>
                    {transaction.transactionReference || "-"}
                  </strong>
                </div>

                <div style={getResponsiveStyle("metaRight")}>
                  <span style={getResponsiveStyle("metaLabel")}>Transaction Date</span>

                  <strong>
                    {transaction.transactionDate
                      ? new Date(transaction.transactionDate).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : new Date().toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              {/* CUSTOMER DETAILS */}
              <div style={getResponsiveStyle("sectionHeading")}>CUSTOMER DETAILS</div>

              <div style={getResponsiveStyle("receiptDetailsGrid")}>
                <div style={getResponsiveStyle("detailBox")}>
                  <span style={getResponsiveStyle("detailLabel")}>Account Number</span>

                  <strong>{transaction.receiverAccountNumber || "-"}</strong>
                </div>

                <div style={getResponsiveStyle("detailBox")}>
                  <span style={getResponsiveStyle("detailLabel")}>Transaction Type</span>

                  <strong>CASH DEPOSIT</strong>
                </div>

                <div style={getResponsiveStyle("detailBox")}>
                  <span style={getResponsiveStyle("detailLabel")}>Branch Code</span>

                  <strong>{transaction.branchCode || branchCode || "-"}</strong>
                </div>

                <div style={getResponsiveStyle("detailBox")}>
                  <span style={getResponsiveStyle("detailLabel")}>Cash Counter</span>

                  <strong>{transaction.cashCounterCode || "-"}</strong>
                </div>
              </div>

              {/* AMOUNT SECTION */}
              <div style={getResponsiveStyle("amountSection")}>
                <div>
                  <div style={getResponsiveStyle("amountLabel")}>DEPOSIT AMOUNT</div>

                  <div style={getResponsiveStyle("amountWords")}>
                    Cash received and credited to the above account
                  </div>
                </div>

                <div style={getResponsiveStyle("amountValue")}>
                  ₹{" "}
                  {Number(transaction.amount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              {/* TRANSACTION INFORMATION */}
              <div style={getResponsiveStyle("sectionHeading")}>TRANSACTION INFORMATION</div>

              <table style={getResponsiveStyle("receiptTable")}>
                <tbody>
                  <tr>
                    <td style={getResponsiveStyle("tableLabel")}>Transaction ID</td>

                    <td style={getResponsiveStyle("tableValue")}>{transaction.id || "-"}</td>
                  </tr>

                  <tr>
                    <td style={getResponsiveStyle("tableLabel")}>Transaction Status</td>

                    <td style={getResponsiveStyle("tableValue")}>
                      <span style={getResponsiveStyle("successBadge")}>
                        {transaction.status || "SUCCESS"}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td style={getResponsiveStyle("tableLabel")}>Cashier Employee Code</td>

                    <td style={getResponsiveStyle("tableValue")}>
                      {transaction.cashierEmployeeCode || employeeCode || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ACKNOWLEDGEMENT */}
              <div style={getResponsiveStyle("acknowledgementBox")}>
                <div style={getResponsiveStyle("sectionHeading")}>
                  CUSTOMER ACKNOWLEDGEMENT
                </div>

                <p style={getResponsiveStyle("acknowledgementText")}>
                  I acknowledge that the above cash deposit has been received
                  and credited to the account mentioned on this receipt. I have
                  verified the transaction details.
                </p>

                <div style={getResponsiveStyle("signatureGrid")}>
                  <div style={getResponsiveStyle("signatureBox")}>
                    <div style={getResponsiveStyle("signatureLine")} />

                    <div style={getResponsiveStyle("signatureLabel")}>Customer Signature</div>
                  </div>

                  <div style={getResponsiveStyle("signatureBox")}>
                    <div style={getResponsiveStyle("signatureLine")} />

                    <div style={getResponsiveStyle("signatureLabel")}>Cashier Signature</div>
                  </div>
                </div>
              </div>

              {/* IMPORTANT NOTICE */}
              <div style={getResponsiveStyle("receiptNotice")}>
                <strong>Important:</strong> Please retain this receipt for your
                records. In case of any discrepancy, please contact your branch
                immediately.
              </div>

              {/* FOOTER */}
              <div style={getResponsiveStyle("receiptFooter")}>
                <div style={getResponsiveStyle("footerMain")}>AVANI BANK</div>

                <div style={getResponsiveStyle("footerText")}>
                  This is a system generated receipt and does not require a
                  physical stamp.
                </div>

                <div style={getResponsiveStyle("footerText")}>
                  Thank you for banking with Avani Bank.
                </div>
              </div>

              {/* PRINT / NEW DEPOSIT BUTTONS */}
              <div className="receipt-actions" style={getResponsiveStyle("receiptActions")}>
                <button
                  type="button"
                  style={getResponsiveStyle("printButton")}
                  onClick={handlePrintReceipt}
                >
                  🖨 Print Receipt
                </button>

                <button
                  type="button"
                  style={getResponsiveStyle("newDepositButton")}
                  onClick={handleNewDeposit}
                >
                  + New Cash Deposit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    //</div>
  );
}

export default CashDeposit;
