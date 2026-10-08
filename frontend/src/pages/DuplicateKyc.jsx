import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DuplicateKyc() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  const [documentType, setDocumentType] = useState("AADHAAR");
  const [documentNumber, setDocumentNumber] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("avani-theme") === "dark";
  });

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => {
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  // Responsive viewport state
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 600,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const token = localStorage.getItem("token");

  // =========================
  // LOAD CUSTOMER
  // =========================

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/api/customers/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to fetch customer details.");
      }

      const data = await response.json();

      setCustomer(data);
    } catch (err) {
      console.error("Customer Error:", err);

      setError(err.message || "Unable to load customer details.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CHECK DUPLICATE
  // =========================

  const handleCheck = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setResult(null);

    if (!documentNumber.trim()) {
      setError("Please enter the document number.");
      return;
    }

    if (!customer?.id) {
      setError("Customer information is unavailable.");
      return;
    }

    try {
      setChecking(true);

      const params = new URLSearchParams();

      params.append("documentType", documentType);

      params.append("documentNumber", documentNumber.trim());

      const response = await fetch(
        `http://localhost:8080/api/duplicate-kyc/check/${customer.id}?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        setError("Your session has expired. Please login again.");
        return;
      }

      if (!response.ok) {
        const responseText = await response.text();

        throw new Error(responseText || "Unable to check duplicate document.");
      }

      const data = await response.json();

      setResult(data);

      if (data.duplicate) {
        setMessage("Duplicate document detected.");
      } else {
        setMessage("No duplicate document detected.");
      }
    } catch (err) {
      console.error("Duplicate KYC Error:", err);

      setError(err.message || "Unable to check document.");
    } finally {
      setChecking(false);
    }
  };

  // =========================
  // RESULT STYLE
  // =========================

  const getResultStyle = () => {
    if (!result) {
      return {
        background: "#f8fafc",
        border: "1px solid #e4e9f0",
        color: "#64748b",
      };
    }

    if (result.duplicate) {
      return {
        background: "#fff1f1",
        border: "1px solid #fecaca",
        color: "#b42318",
      };
    }

    return {
      background: "#ecfdf5",
      border: "1px solid #bbf7d0",
      color: "#15803d",
    };
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
        style={{
          ...styles.loadingPage,
          ...(darkMode ? styles.darkLoadingPage : {}),
        }}
      >
        <div
          style={{
            ...styles.loadingCard,
            ...(darkMode ? styles.darkLoadingCard : {}),
          }}
        >
          <div
            style={{
              ...styles.loadingIcon,
              ...(darkMode ? styles.darkLoadingIcon : {}),
            }}
          >
            🛡️
          </div>

          <h2
            style={{
              ...styles.loadingTitle,
              ...(darkMode ? styles.darkLoadingTitle : {}),
            }}
          >
            Loading Duplicate KYC
          </h2>

          <p
            style={{
              ...styles.loadingText,
              ...(darkMode ? styles.darkLoadingText : {}),
            }}
          >
            Please wait...
          </p>

          <div
            style={{
              ...styles.loader,
              ...(darkMode ? styles.darkLoader : {}),
            }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.page,
        ...(darkMode ? styles.darkPage : {}),
        ...(isMobile ? styles.mobilePage : {}),
      }}
    >
      {" "}
      {/* =========================
          HEADER
      ========================= */}
      <header
        style={{ ...styles.header, ...(isMobile ? styles.mobileHeader : {}) }}
      >
        <div>
          <div style={styles.brand}>AVANI BANK</div>

          <h1
            style={{ ...styles.title, ...(isMobile ? styles.mobileTitle : {}) }}
          >
            Duplicate KYC Check
          </h1>

          <p
            style={{
              ...styles.subtitle,
              ...(isMobile ? styles.mobileSubtitle : {}),
            }}
          >
            Check whether a KYC document is already associated with another
            customer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            ...styles.dashboardButton,
            ...(isMobile ? styles.mobileDashboardButton : {}),
          }}
        >
          ← Dashboard
        </button>
      </header>
      {/* =========================
          CUSTOMER CARD
      ========================= */}
      <div
        style={{
          ...styles.customerCard,
          ...(darkMode ? styles.darkCustomerCard : {}),
          ...(isMobile ? styles.mobileCustomerCard : {}),
        }}
      >
        <div style={styles.customerAvatar}>
          {customer?.fullName?.charAt(0)?.toUpperCase() || "C"}
        </div>

        <div
          style={{
            ...styles.customerInfo,
            ...(isMobile ? styles.mobileCustomerInfo : {}),
          }}
        >
          <p
            style={{
              ...styles.customerLabel,
              ...(darkMode ? styles.darkCustomerLabel : {}),
            }}
          >
            CUSTOMER
          </p>

          <h2
            style={{
              ...styles.customerName,
              ...(darkMode ? styles.darkCustomerName : {}),
            }}
          >
            {customer?.fullName || "Customer"}
          </h2>

          <p
            style={{
              ...styles.customerEmail,
              ...(darkMode ? styles.darkCustomerEmail : {}),
            }}
          >
            {customer?.email || "Email unavailable"}
          </p>
        </div>

        <div
          style={{
            ...styles.accountInfo,
            ...(darkMode ? styles.darkAccountInfo : {}),
            ...(isMobile ? styles.mobileAccountInfo : {}),
          }}
        >
          <p style={styles.customerLabel}>ACCOUNT NUMBER</p>

          <strong
            style={{
              ...styles.accountNumber,
              ...(darkMode ? styles.darkAccountNumber : {}),
            }}
          >
            {customer?.accountNumber || "N/A"}
          </strong>
        </div>
      </div>
      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div
          style={{
            ...styles.errorMessage,
            ...(darkMode ? styles.darkErrorMessage : {}),
          }}
        >
          ⚠️ {error}
        </div>
      )}
      {/* =========================
          SUCCESS / RESULT MESSAGE
      ========================= */}
      {message && !error && (
        <div
          style={{
            ...styles.message,
            ...(result?.duplicate
              ? styles.warningMessage
              : styles.successMessage),

            ...(darkMode
              ? result?.duplicate
                ? styles.darkWarningMessage
                : styles.darkSuccessMessage
              : {}),
          }}
        >
          {result?.duplicate ? "⚠️" : "✓"} {message}
        </div>
      )}
      {/* =========================
          CHECK CARD
      ========================= */}
      <div
        style={{
          ...styles.mainCard,
          ...(darkMode ? styles.darkMainCard : {}),
          ...(isMobile ? styles.mobileMainCard : {}),
        }}
      >
        <div
          style={{
            ...styles.cardHeader,
            ...(isMobile ? styles.mobileCardHeader : {}),
          }}
        >
          <div>
            <p
              style={{
                ...styles.cardEyebrow,
                ...(darkMode ? styles.darkCardEyebrow : {}),
              }}
            >
              DOCUMENT VERIFICATION
            </p>

            <h2
              style={{
                ...styles.cardTitle,
                ...(darkMode ? styles.darkCardTitle : {}),
              }}
            >
              Check KYC Document
            </h2>

            <p
              style={{
                ...styles.cardDescription,
                ...(darkMode ? styles.darkCardDescription : {}),
              }}
            >
              Enter a KYC document number to check whether it is already
              associated with another customer.
            </p>
          </div>

          <div
            style={{
              ...styles.cardIcon,
              ...(darkMode ? styles.darkCardIcon : {}),
              ...(isMobile ? styles.mobileCardIcon : {}),
            }}
          >
            🛡️
          </div>
        </div>

        <form onSubmit={handleCheck}>
          {/* DOCUMENT TYPE */}

          <div style={styles.fieldGroup}>
            <label
              style={{
                ...styles.label,
                ...(darkMode ? styles.darkLabel : {}),
              }}
            >
              Document Type
            </label>

            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              style={{
                ...styles.input,
                ...(darkMode ? styles.darkInput : {}),
              }}
              disabled={checking}
            >
              <option value="AADHAAR">Aadhaar</option>

              <option value="PAN">PAN</option>

              <option value="PASSPORT">Passport</option>

              <option value="VOTER_ID">Voter ID</option>

              <option value="DRIVING_LICENSE">Driving License</option>
            </select>
          </div>

          {/* DOCUMENT NUMBER */}

          <div style={styles.fieldGroup}>
            <label
              style={{
                ...styles.label,
                ...(darkMode ? styles.darkLabel : {}),
              }}
            >
              Document Number
            </label>

            <input
              type="text"
              value={documentNumber}
              onChange={(event) => setDocumentNumber(event.target.value)}
              placeholder="Enter document number"
              style={{
                ...styles.input,
                ...(darkMode ? styles.darkInput : {}),
              }}
              disabled={checking}
            />
          </div>

          {/* BUTTON */}

          <div
            style={{
              ...styles.formFooter,
              ...(darkMode ? styles.darkFormFooter : {}),
              ...(isMobile ? styles.mobileFormFooter : {}),
            }}
          >
            <p
              style={{
                ...styles.footerNote,
                ...(darkMode ? styles.darkFooterNote : {}),
              }}
            >
              The document will be checked against existing KYC records.
            </p>

            <button
              type="submit"
              disabled={checking}
              style={{
                ...styles.checkButton,
                opacity: checking ? 0.7 : 1,
                cursor: checking ? "not-allowed" : "pointer",
              }}
            >
              {checking ? "Checking..." : "Check Document"}
            </button>
          </div>
        </form>
      </div>
      {/* =========================
          RESULT
      ========================= */}
      {result && (
        <div
          style={{
            ...styles.resultCard,
            ...getResultStyle(),
            ...(darkMode
              ? result?.duplicate
                ? styles.darkDuplicateResult
                : styles.darkUniqueResult
              : {}),
          }}
        >
          <div
            style={{
              ...styles.resultIcon,
              ...(darkMode ? styles.darkResultIcon : {}),
              color: result.duplicate ? "#ff9da9" : "#65d995",
            }}
          >
            {result.duplicate ? "!" : "✓"}
          </div>

          <div
            style={{
              ...styles.resultContent,
              ...(isMobile ? styles.mobileResultContent : {}),
            }}
          >
            <p
              style={{
                ...styles.resultLabel,
                ...(darkMode ? styles.darkResultLabel : {}),
              }}
            >
              DUPLICATE CHECK RESULT
            </p>

            <h2
              style={{
                ...styles.resultTitle,
                ...(darkMode ? styles.darkResultTitle : {}),
              }}
            >
              {result.duplicate
                ? "Duplicate Document Detected"
                : "Document is Unique"}
            </h2>

            <p
              style={{
                ...styles.resultText,
                ...(darkMode ? styles.darkResultText : {}),
              }}
            >
              {result.remarks ||
                (result.duplicate
                  ? "This document is already associated with another customer."
                  : "No duplicate document was found.")}
            </p>

            <div
              style={{
                ...styles.resultDetails,
                ...(isMobile ? styles.mobileResultDetails : {}),
              }}
            >
              <div>
                <span
                  style={{
                    ...styles.detailLabel,
                    ...(darkMode ? styles.darkDetailLabel : {}),
                  }}
                >
                  Document Type
                </span>

                <strong
                  style={{
                    ...styles.detailValue,
                    ...(darkMode ? styles.darkDetailValue : {}),
                  }}
                >
                  {result.documentType || documentType}
                </strong>
              </div>

              <div>
                <span
                  style={{
                    ...styles.detailLabel,
                    ...(darkMode ? styles.darkDetailLabel : {}),
                  }}
                >
                  Document Number
                </span>

                <strong
                  style={{
                    ...styles.detailValue,
                    ...(darkMode ? styles.darkDetailValue : {}),
                  }}
                >
                  {result.documentNumber || documentNumber}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* =========================
          INFORMATION
      ========================= */}
      <div
        style={{
          ...styles.infoBox,
          ...(darkMode ? styles.darkInfoBox : {}),
          ...(isMobile ? styles.mobileInfoBox : {}),
        }}
      >
        <span
          style={{
            ...styles.infoIcon,
            ...(darkMode ? styles.darkInfoIcon : {}),
          }}
        >
          🔒
        </span>

        <div>
          <strong
            style={{
              ...styles.infoTitle,
              ...(darkMode ? styles.darkInfoTitle : {}),
            }}
          >
            Duplicate KYC Protection
          </strong>

          <p
            style={{
              ...styles.infoText,
              ...(darkMode ? styles.darkInfoText : {}),
            }}
          >
            This check helps identify whether the submitted KYC document is
            already associated with another customer account.
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fb 0%, #eef3f9 100%)",
    padding: "32px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#172033",
  },

  // =====================================================
  // DARK MODE
  // =====================================================

  darkPage: {
    background: "linear-gradient(135deg, #0b1220 0%, #0e1728 100%)",
    color: "#e8eef7",
  },

  // CUSTOMER
  darkCustomerCard: {
    background: "#111a2b",
    border: "1px solid #26344b",
    boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
  },

  darkCustomerLabel: {
    color: "#8795aa",
  },

  darkCustomerName: {
    color: "#edf3ff",
  },

  darkCustomerEmail: {
    color: "#8795aa",
  },

  darkAccountNumber: {
    color: "#b9c8dd",
  },

  darkAccountInfo: {
    borderLeft: "1px solid #30405a",
    borderTop: "1px solid #30405a",
  },

  // MESSAGES
  darkErrorMessage: {
    background: "#351b22",
    border: "1px solid #63303b",
    color: "#ff9da9",
  },

  darkSuccessMessage: {
    background: "#123323",
    border: "1px solid #245c3c",
    color: "#65d995",
  },

  darkWarningMessage: {
    background: "#352b17",
    border: "1px solid #665525",
    color: "#f1d16b",
  },

  // MAIN CARD
  darkMainCard: {
    background: "#111a2b",
    border: "1px solid #26344b",
    boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
  },

  darkCardEyebrow: {
    color: "#7fa7f5",
  },

  darkCardTitle: {
    color: "#edf3ff",
  },

  darkCardDescription: {
    color: "#8795aa",
  },

  darkCardIcon: {
    background: "#192944",
  },

  // FORM
  darkLabel: {
    color: "#b8c4d6",
  },

  darkInput: {
    background: "#172235",
    border: "1px solid #34445e",
    color: "#e8eef7",
  },

  darkFormFooter: {
    borderTop: "1px solid #30405a",
  },

  darkFooterNote: {
    color: "#71809a",
  },

  // RESULT — DUPLICATE
  darkDuplicateResult: {
    background: "#351b22",
    border: "1px solid #63303b",
    color: "#ffb0ba",
  },

  // RESULT — UNIQUE
  darkUniqueResult: {
    background: "#123323",
    border: "1px solid #245c3c",
    color: "#8ce3aa",
  },

  darkResultIcon: {
    background: "#111a2b",
  },

  darkResultLabel: {
    color: "#aebbd0",
  },

  darkResultTitle: {
    color: "#edf3ff",
  },

  darkResultText: {
    color: "#b9c8dd",
  },

  darkDetailLabel: {
    color: "#8795aa",
  },

  darkDetailValue: {
    color: "#dce5f1",
  },

  // INFORMATION
  darkInfoBox: {
    background: "#172235",
    border: "1px solid #30405a",
  },

  darkInfoIcon: {
    color: "#9ebeff",
  },

  darkInfoTitle: {
    color: "#dce5f1",
  },

  darkInfoText: {
    color: "#8795aa",
  },

  // LOADING
  darkLoadingPage: {
    background: "linear-gradient(135deg, #0b1220, #0e1728)",
  },

  darkLoadingCard: {
    background: "#111a2b",
    boxShadow: "0 20px 50px rgba(0,0,0,0.40)",
  },

  darkLoadingTitle: {
    color: "#edf3ff",
  },

  darkLoadingText: {
    color: "#8795aa",
  },

  darkLoader: {
    border: "3px solid #29384e",
    borderTop: "3px solid #5b91ff",
  },

  header: {
    maxHeight: "100px",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #102354 0%, #173b8c 58%, #2457c6 100%)",
    color: "#ffffff",
    padding: "28px 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    boxSizing: "border-box",
    boxShadow: "0 10px 30px rgba(18,51,120,0.14)",
  },

  brand: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "2px",
    color: "#64748b",
    marginBottom: "5px",
  },

  title: {
    margin: 0,
    fontSize: "29px",
    fontWeight: "800",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#7a8699",
    fontSize: "13px",
  },

  dashboardButton: {
    border: "1px solid #d9e0ea",
    background: "#ffffff",
    color: "#26344a",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 12px rgba(20,35,60,0.05)",
  },

  customerCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "18px 20px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 7px 22px rgba(30,45,70,0.05)",
    marginTop: "18px",
  },

  customerAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    background: "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "800",
    flexShrink: 0,
  },

  customerInfo: {
    flex: 1,
    minWidth: 0,
  },

  customerLabel: {
    margin: 0,
    color: "#97a0b0",
    fontSize: "8px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  customerName: {
    margin: "3px 0 2px",
    fontSize: "15px",
    fontWeight: "800",
    color: "#1d2944",
  },

  customerEmail: {
    margin: 0,
    color: "#7c879a",
    fontSize: "10px",
    overflowWrap: "anywhere",
  },

  accountInfo: {
    textAlign: "right",
    paddingLeft: "20px",
    borderLeft: "1px solid #edf0f5",
  },

  accountNumber: {
    display: "block",
    marginTop: "4px",
    color: "#253453",
    fontSize: "12px",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  errorMessage: {
    maxWidth: "1100px",
    margin: "0 auto 16px",
    padding: "12px 15px",
    borderRadius: "10px",
    background: "#fff1f1",
    border: "1px solid #ffd0d0",
    color: "#b42318",
    fontSize: "12px",
    fontWeight: "600",
  },

  message: {
    maxWidth: "1100px",
    margin: "0 auto 16px",
    padding: "12px 15px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "600",
  },

  successMessage: {
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#15803d",
  },

  warningMessage: {
    background: "#fff8e7",
    border: "1px solid #f3dfaa",
    color: "#9a6700",
  },

  mainCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "23px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(30,45,70,0.06)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "22px",
  },

  cardEyebrow: {
    margin: 0,
    color: "#5572af",
    fontSize: "8px",
    letterSpacing: "1.5px",
    fontWeight: "800",
  },

  cardTitle: {
    margin: "4px 0 0",
    fontSize: "19px",
    fontWeight: "800",
    color: "#1d2944",
  },

  cardDescription: {
    margin: "5px 0 0",
    color: "#7c879a",
    fontSize: "11px",
    lineHeight: "1.5",
    maxWidth: "600px",
  },

  cardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#eef4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  fieldGroup: {
    marginBottom: "17px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#526078",
    fontSize: "10px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dce3ed",
    background: "#fbfcfe",
    borderRadius: "9px",
    padding: "11px 12px",
    outline: "none",
    color: "#263550",
    fontSize: "11px",
    fontFamily: "inherit",
  },

  formFooter: {
    marginTop: "6px",
    paddingTop: "17px",
    borderTop: "1px solid #edf0f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  footerNote: {
    margin: 0,
    color: "#8993a5",
    fontSize: "10px",
    lineHeight: "1.5",
  },

  checkButton: {
    border: "none",
    background: "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px 18px",
    fontSize: "11px",
    fontWeight: "700",
    boxShadow: "0 6px 14px rgba(37,99,199,0.2)",
  },

  resultCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "20px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
  },

  resultIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "900",
    flexShrink: 0,
  },

  resultContent: {
    flex: 1,
  },

  resultLabel: {
    margin: 0,
    fontSize: "8px",
    letterSpacing: "1.4px",
    fontWeight: "800",
    opacity: 0.75,
  },

  resultTitle: {
    margin: "4px 0 5px",
    fontSize: "17px",
    fontWeight: "800",
  },

  resultText: {
    margin: 0,
    fontSize: "11px",
    lineHeight: "1.5",
    overflowWrap: "anywhere",
  },

  resultDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "15px",
  },

  detailLabel: {
    display: "block",
    fontSize: "8px",
    opacity: 0.65,
    marginBottom: "4px",
    fontWeight: "700",
  },

  detailValue: {
    fontSize: "10px",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  infoBox: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "15px 17px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "#f5f8fc",
    border: "1px solid #e1e8f1",
    borderRadius: "11px",
  },

  infoIcon: {
    fontSize: "15px",
  },

  infoTitle: {
    display: "block",
    color: "#33435a",
    fontSize: "10px",
  },

  infoText: {
    margin: "4px 0 0",
    color: "#778397",
    fontSize: "9px",
    lineHeight: "1.5",
    overflowWrap: "anywhere",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fb, #edf2fb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "380px",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "35px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(25,45,85,0.08)",
  },

  loadingIcon: {
    fontSize: "40px",
  },

  loadingTitle: {
    margin: "13px 0 5px",
    fontSize: "18px",
    color: "#25314d",
  },

  loadingText: {
    margin: 0,
    color: "#8993a8",
    fontSize: "11px",
  },

  loader: {
    width: "28px",
    height: "28px",
    border: "3px solid #dfe6f2",
    borderTop: "3px solid #2457c6",
    borderRadius: "50%",
    margin: "20px auto 0",
    animation: "duplicateKycSpin 0.8s linear infinite",
  },

  // =========================
  // RESPONSIVE OVERRIDES
  // =========================

  mobilePage: {
    padding: "12px",
    overflowX: "hidden",
  },

  mobileHeader: {
    minHeight: "auto",
    maxHeight: "none",
    padding: "18px 16px",
    borderRadius: "14px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
  },

  mobileTitle: {
    fontSize: "21px",
    lineHeight: "1.2",
    letterSpacing: "-0.3px",
  },

  mobileSubtitle: {
    fontSize: "11px",
    lineHeight: "1.45",
    marginTop: "5px",
  },

  mobileDashboardButton: {
    width: "100%",
    textAlign: "center",
    padding: "11px 14px",
    fontSize: "11px",
    boxSizing: "border-box",
  },

  mobileCustomerCard: {
    margin: "12px 0 14px",
    padding: "14px",
    borderRadius: "13px",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "11px",
  },

  mobileCustomerInfo: {
    flex: "1 1 calc(100% - 65px)",
    minWidth: "0",
  },

  mobileAccountInfo: {
    width: "100%",
    paddingLeft: "0",
    paddingTop: "11px",
    borderLeft: "none",
    borderTop: "1px solid #edf0f5",
    textAlign: "left",
  },

  mobileMainCard: {
    margin: "0 0 14px",
    padding: "16px 14px",
    borderRadius: "14px",
  },

  mobileCardHeader: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
    marginBottom: "17px",
  },

  mobileCardIcon: {
    width: "38px",
    height: "38px",
    fontSize: "16px",
  },

  mobileFormFooter: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "11px",
  },

  mobileCheckButton: {
    width: "100%",
    padding: "12px 16px",
  },

  mobileResultCard: {
    padding: "15px 14px",
    borderRadius: "13px",
    gap: "11px",
    flexDirection: "column",
  },

  mobileResultContent: {
    width: "100%",
    minWidth: "0",
  },

  mobileResultDetails: {
    gridTemplateColumns: "1fr",
    gap: "10px",
    marginTop: "13px",
  },

  mobileInfoBox: {
    padding: "13px 14px",
    gap: "9px",
    marginBottom: "4px",
  },
};

// =====================================================
// LOADER ANIMATION
// =====================================================

const styleElement = document.createElement("style");

styleElement.innerHTML = `
  @keyframes duplicateKycSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`;

if (!document.head.contains(styleElement)) {
  document.head.appendChild(styleElement);
}

export default DuplicateKyc;
