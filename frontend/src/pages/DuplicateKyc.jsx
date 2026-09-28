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

      const response = await fetch(
        "http://localhost:8080/api/customers/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to fetch customer details."
        );
      }

      const data = await response.json();

      setCustomer(data);
    } catch (err) {
      console.error("Customer Error:", err);

      setError(
        err.message ||
          "Unable to load customer details."
      );
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

      params.append(
        "documentType",
        documentType
      );

      params.append(
        "documentNumber",
        documentNumber.trim()
      );

      const response = await fetch(
        `http://localhost:8080/api/duplicate-kyc/check/${customer.id}?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      if (!response.ok) {
        const responseText =
          await response.text();

        throw new Error(
          responseText ||
            "Unable to check duplicate document."
        );
      }

      const data = await response.json();

      setResult(data);

      if (data.duplicate) {
        setMessage(
          "Duplicate document detected."
        );
      } else {
        setMessage(
          "No duplicate document detected."
        );
      }
    } catch (err) {
      console.error(
        "Duplicate KYC Error:",
        err
      );

      setError(
        err.message ||
          "Unable to check document."
      );
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
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            🛡️
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Duplicate KYC
          </h2>

          <p style={styles.loadingText}>
            Please wait...
          </p>

          <div style={styles.loader}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* =========================
          HEADER
      ========================= */}

      <header style={styles.header}>

        <div>
          <div style={styles.brand}>
            AVANI BANK
          </div>

          <h1 style={styles.title}>
            Duplicate KYC Check
          </h1>

          <p style={styles.subtitle}>
            Check whether a KYC document is already
            associated with another customer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={styles.dashboardButton}
        >
          ← Dashboard
        </button>

      </header>

      {/* =========================
          CUSTOMER CARD
      ========================= */}

      <div style={styles.customerCard}>

        <div style={styles.customerAvatar}>
          {customer?.fullName
            ?.charAt(0)
            ?.toUpperCase() || "C"}
        </div>

        <div style={styles.customerInfo}>

          <p style={styles.customerLabel}>
            CUSTOMER
          </p>

          <h2 style={styles.customerName}>
            {customer?.fullName || "Customer"}
          </h2>

          <p style={styles.customerEmail}>
            {customer?.email || "Email unavailable"}
          </p>

        </div>

        <div style={styles.accountInfo}>

          <p style={styles.customerLabel}>
            ACCOUNT NUMBER
          </p>

          <strong style={styles.accountNumber}>
            {customer?.accountNumber || "N/A"}
          </strong>

        </div>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div style={styles.errorMessage}>
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
          }}
        >
          {result?.duplicate ? "⚠️" : "✓"}{" "}
          {message}
        </div>
      )}

      {/* =========================
          CHECK CARD
      ========================= */}

      <div style={styles.mainCard}>

        <div style={styles.cardHeader}>

          <div>

            <p style={styles.cardEyebrow}>
              DOCUMENT VERIFICATION
            </p>

            <h2 style={styles.cardTitle}>
              Check KYC Document
            </h2>

            <p style={styles.cardDescription}>
              Enter a KYC document number to check
              whether it is already associated with
              another customer.
            </p>

          </div>

          <div style={styles.cardIcon}>
            🛡️
          </div>

        </div>

        <form onSubmit={handleCheck}>

          {/* DOCUMENT TYPE */}

          <div style={styles.fieldGroup}>

            <label style={styles.label}>
              Document Type
            </label>

            <select
              value={documentType}
              onChange={(event) =>
                setDocumentType(
                  event.target.value
                )
              }
              style={styles.input}
              disabled={checking}
            >
              <option value="AADHAAR">
                Aadhaar
              </option>

              <option value="PAN">
                PAN
              </option>

              <option value="PASSPORT">
                Passport
              </option>

              <option value="VOTER_ID">
                Voter ID
              </option>

              <option value="DRIVING_LICENSE">
                Driving License
              </option>
            </select>

          </div>

          {/* DOCUMENT NUMBER */}

          <div style={styles.fieldGroup}>

            <label style={styles.label}>
              Document Number
            </label>

            <input
              type="text"
              value={documentNumber}
              onChange={(event) =>
                setDocumentNumber(
                  event.target.value
                )
              }
              placeholder="Enter document number"
              style={styles.input}
              disabled={checking}
            />

          </div>

          {/* BUTTON */}

          <div style={styles.formFooter}>

            <p style={styles.footerNote}>
              The document will be checked against
              existing KYC records.
            </p>

            <button
              type="submit"
              disabled={checking}
              style={{
                ...styles.checkButton,
                opacity: checking ? 0.7 : 1,
                cursor: checking
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {checking
                ? "Checking..."
                : "Check Document"}
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
          }}
        >

          <div
            style={{
              ...styles.resultIcon,
              color: result.duplicate
                ? "#b42318"
                : "#15803d",
            }}
          >
            {result.duplicate
              ? "!"
              : "✓"}
          </div>

          <div style={styles.resultContent}>

            <p style={styles.resultLabel}>
              DUPLICATE CHECK RESULT
            </p>

            <h2 style={styles.resultTitle}>
              {result.duplicate
                ? "Duplicate Document Detected"
                : "Document is Unique"}
            </h2>

            <p style={styles.resultText}>
              {result.remarks ||
                (result.duplicate
                  ? "This document is already associated with another customer."
                  : "No duplicate document was found.")}
            </p>

            <div style={styles.resultDetails}>

              <div>
                <span style={styles.detailLabel}>
                  Document Type
                </span>

                <strong style={styles.detailValue}>
                  {result.documentType ||
                    documentType}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  Document Number
                </span>

                <strong style={styles.detailValue}>
                  {result.documentNumber ||
                    documentNumber}
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          INFORMATION
      ========================= */}

      <div style={styles.infoBox}>

        <span style={styles.infoIcon}>
          🔒
        </span>

        <div>

          <strong style={styles.infoTitle}>
            Duplicate KYC Protection
          </strong>

          <p style={styles.infoText}>
            This check helps identify whether the
            submitted KYC document is already associated
            with another customer account.
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
    background:
      "linear-gradient(135deg, #f5f7fb 0%, #eef3f9 100%)",
    padding: "32px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#172033",
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
    boxShadow:
      "0 4px 12px rgba(20,35,60,0.05)",
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
    boxShadow:
      "0 7px 22px rgba(30,45,70,0.05)",
    marginTop: "18px", 
  },

  customerAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
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
    boxShadow:
      "0 8px 25px rgba(30,45,70,0.06)",
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
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px 18px",
    fontSize: "11px",
    fontWeight: "700",
    boxShadow:
      "0 6px 14px rgba(37,99,199,0.2)",
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
  },

  resultDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
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
  },

  loadingPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f7fb, #edf2fb)",
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
    boxShadow:
      "0 15px 40px rgba(25,45,85,0.08)",
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