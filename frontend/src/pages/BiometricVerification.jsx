import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BiometricVerification() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [verifications, setVerifications] = useState([]);

  const [biometricType, setBiometricType] =
    useState("FINGERPRINT");

  const [status, setStatus] =
    useState("VERIFIED");

  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // LOAD CUSTOMER + RECORDS
  // =========================

  useEffect(() => {
    loadBiometricData();
  }, []);

  const loadBiometricData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const customerResponse = await fetch(
        "http://localhost:8080/api/customers/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        customerResponse.status === 401 ||
        customerResponse.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!customerResponse.ok) {
        throw new Error(
          "Unable to fetch customer details."
        );
      }

      const customerData =
        await customerResponse.json();

      setCustomer(customerData);

      const verificationResponse =
        await fetch(
          `http://localhost:8080/api/biometric-verification/customer/${customerData.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (
        verificationResponse.status === 401 ||
        verificationResponse.status === 403
      ) {
        setError(
          "You are not authorized to view biometric records."
        );
        return;
      }

      if (!verificationResponse.ok) {
        throw new Error(
          "Unable to fetch biometric records."
        );
      }

      const verificationData =
        await verificationResponse.json();

      setVerifications(
        Array.isArray(verificationData)
          ? verificationData
          : []
      );
    } catch (err) {
      console.error(
        "Biometric Verification Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load biometric verification."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE VERIFICATION
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!customer?.id) {
      setError(
        "Customer information is unavailable."
      );
      return;
    }

    if (!biometricType) {
      setError(
        "Please select biometric type."
      );
      return;
    }

    if (!status) {
      setError(
        "Please select verification status."
      );
      return;
    }

    try {
      setSaving(true);

      const params = new URLSearchParams();

      params.append(
        "customerId",
        customer.id
      );

      params.append(
        "biometricType",
        biometricType
      );

      params.append(
        "status",
        status
      );

      if (remarks.trim()) {
        params.append(
          "remarks",
          remarks.trim()
        );
      }

      const response = await fetch(
        `http://localhost:8080/api/biometric-verification/verify?${params.toString()}`,
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
          "Your session has expired or you are not authorized."
        );
        return;
      }

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text ||
            "Unable to save biometric verification."
        );
      }

      const newVerification =
        await response.json();

      setVerifications((previous) => [
        newVerification,
        ...previous,
      ]);

      setRemarks("");

      setMessage(
        "Biometric verification recorded successfully."
      );
    } catch (err) {
      console.error(
        "Save Biometric Verification Error:",
        err
      );

      setError(
        err.message ||
          "Unable to save biometric verification."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (value) => {
    if (!value) {
      return "Date unavailable";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (value) => {
    if (value === "VERIFIED") {
      return {
        background: "#ecfdf5",
        color: "#15803d",
        border: "1px solid #bbf7d0",
      };
    }

    if (value === "FAILED") {
      return {
        background: "#fff1f1",
        color: "#b42318",
        border: "1px solid #fecaca",
      };
    }

    return {
      background: "#fff8e7",
      color: "#a16207",
      border: "1px solid #fde68a",
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
            Loading Biometric Verification
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
          <p style={styles.eyebrow}>
            CUSTOMER VERIFICATION
          </p>

          <h1 style={styles.title}>
            Biometric Verification
          </h1>

          <p style={styles.subtitle}>
            Manage biometric verification records
            associated with your customer profile.
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
          CUSTOMER SUMMARY
      ========================= */}

      <section style={styles.customerCard}>

        <div style={styles.avatar}>
          {customer?.fullName
            ?.charAt(0)
            ?.toUpperCase() || "C"}
        </div>

        <div style={styles.customerInfo}>
          <p style={styles.smallLabel}>
            CUSTOMER
          </p>

          <h2 style={styles.customerName}>
            {customer?.fullName || "Customer"}
          </h2>

          <p style={styles.customerEmail}>
            {customer?.email ||
              "Email unavailable"}
          </p>
        </div>

        <div style={styles.customerIdBox}>
          <p style={styles.smallLabel}>
            CUSTOMER ID
          </p>

          <strong style={styles.customerId}>
            {customer?.id || "N/A"}
          </strong>
        </div>

      </section>

      {/* =========================
          MESSAGES
      ========================= */}

      {error && (
        <div style={styles.errorMessage}>
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div style={styles.successMessage}>
          ✓ {message}
        </div>
      )}

      {/* =========================
          VERIFICATION FORM
      ========================= */}

      <section style={styles.formCard}>

        <div style={styles.cardHeader}>
          <div>
            <p style={styles.cardEyebrow}>
              VERIFY IDENTITY
            </p>

            <h2 style={styles.cardTitle}>
              Record Biometric Verification
            </h2>

            <p style={styles.cardDescription}>
              Record the biometric verification
              result for this customer.
            </p>
          </div>

          <div style={styles.cardIcon}>
            🛡️
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div style={styles.twoColumn}>

            {/* BIOMETRIC TYPE */}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Biometric Type
              </label>

              <select
                value={biometricType}
                onChange={(event) =>
                  setBiometricType(
                    event.target.value
                  )
                }
                style={styles.input}
                disabled={saving}
              >
                <option value="FINGERPRINT">
                  Fingerprint
                </option>

                <option value="FACE">
                  Face Recognition
                </option>

                <option value="IRIS">
                  Iris Scan
                </option>
              </select>
            </div>

            {/* STATUS */}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Verification Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                style={styles.input}
                disabled={saving}
              >
                <option value="VERIFIED">
                  Verified
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="FAILED">
                  Failed
                </option>
              </select>
            </div>

          </div>

          {/* REMARKS */}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Remarks
              <span style={styles.optional}>
                {" "}
                (Optional)
              </span>
            </label>

            <textarea
              value={remarks}
              onChange={(event) =>
                setRemarks(
                  event.target.value
                )
              }
              placeholder="Enter verification remarks..."
              style={styles.textarea}
              rows={4}
              disabled={saving}
            />
          </div>

          <div style={styles.formFooter}>

            <p style={styles.footerNote}>
              Customer ID{" "}
              <strong>
                {customer?.id}
              </strong>
            </p>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.submitButton,
                opacity: saving ? 0.7 : 1,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : "Record Verification"}
            </button>

          </div>

        </form>
      </section>

      {/* =========================
          VERIFICATION HISTORY
      ========================= */}

      <section style={styles.historyCard}>

        <div style={styles.cardHeader}>
          <div>
            <p style={styles.cardEyebrow}>
              VERIFICATION RECORDS
            </p>

            <h2 style={styles.cardTitle}>
              Biometric History
            </h2>

            <p style={styles.cardDescription}>
              Previous biometric verification
              records for this customer.
            </p>
          </div>

          <div style={styles.countBadge}>
            {verifications.length}
          </div>
        </div>

        {verifications.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              🛡️
            </div>

            <h3 style={styles.emptyTitle}>
              No Verification Records
            </h3>

            <p style={styles.emptyText}>
              No biometric verification has been
              recorded for this customer yet.
            </p>
          </div>
        ) : (
          <div style={styles.recordList}>

            {verifications.map(
              (verification, index) => (
                <div
                  key={
                    verification.id || index
                  }
                  style={styles.recordItem}
                >

                  <div style={styles.recordIcon}>
                    {verification.biometricType ===
                    "FINGERPRINT"
                      ? "☝"
                      : verification.biometricType ===
                        "FACE"
                      ? "◉"
                      : "◎"}
                  </div>

                  <div style={styles.recordDetails}>

                    <div
                      style={
                        styles.recordTop
                      }
                    >
                      <div>
                        <p
                          style={
                            styles.recordLabel
                          }
                        >
                          BIOMETRIC TYPE
                        </p>

                        <h3
                          style={
                            styles.recordTitle
                          }
                        >
                          {verification.biometricType ||
                            "Unknown"}
                        </h3>
                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(
                            verification.status
                          ),
                        }}
                      >
                        {verification.status ||
                          "UNKNOWN"}
                      </span>
                    </div>

                    <p
                      style={
                        styles.recordRemarks
                      }
                    >
                      {verification.remarks ||
                        "No remarks provided."}
                    </p>

                    <div
                      style={
                        styles.recordMeta
                      }
                    >
                      <span>
                        {formatDate(
                          verification.verifiedAt
                        )}
                      </span>

                      <span>
                        {formatTime(
                          verification.verifiedAt
                        )}
                      </span>
                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* =========================
          INFORMATION
      ========================= */}

      <div style={styles.infoBox}>
        <span style={styles.infoIcon}>
          🔒
        </span>

        <div>
          <strong style={styles.infoTitle}>
            Secure Biometric Record
          </strong>

          <p style={styles.infoText}>
            This page records verification results.
            It does not capture or store raw biometric
            data such as fingerprint or face images.
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

  eyebrow: {
    margin: "0 0 4px",
    fontSize: "8px",
    letterSpacing: "1.7px",
    fontWeight: "800",
    color: "#fafbfd",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.6px",
    color: "#ffffff",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#bcc3ce",
    fontSize: "12px",
  },

  dashboardButton: {
    border: "1px solid #d9e0ea",
    background: "#ffffff",
    color: "#26344a",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow:
      "0 4px 12px rgba(20,35,60,0.05)",
  },

  customerCard: {
    maxWidth: "1100px",
    margin: "0 auto 17px",
    padding: "17px 20px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 7px 22px rgba(30,45,70,0.05)",
    marginTop: "18px",  
  },

  avatar: {
    width: "47px",
    height: "47px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
    flexShrink: 0,
  },

  customerInfo: {
    flex: 1,
    minWidth: 0,
  },

  smallLabel: {
    margin: 0,
    color: "#98a1b0",
    fontSize: "8px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  customerName: {
    margin: "3px 0 2px",
    color: "#1d2944",
    fontSize: "15px",
    fontWeight: "800",
  },

  customerEmail: {
    margin: 0,
    color: "#7c879a",
    fontSize: "10px",
  },

  customerIdBox: {
    textAlign: "right",
    paddingLeft: "20px",
    borderLeft: "1px solid #edf0f5",
  },

  customerId: {
    display: "block",
    marginTop: "4px",
    color: "#263550",
    fontSize: "12px",
  },

  errorMessage: {
    maxWidth: "1100px",
    margin: "0 auto 15px",
    padding: "11px 14px",
    borderRadius: "9px",
    background: "#fff1f1",
    border: "1px solid #ffd0d0",
    color: "#b42318",
    fontSize: "11px",
    fontWeight: "600",
  },

  successMessage: {
    maxWidth: "1100px",
    margin: "0 auto 15px",
    padding: "11px 14px",
    borderRadius: "9px",
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    fontSize: "11px",
    fontWeight: "600",
  },

  formCard: {
    maxWidth: "1100px",
    margin: "0 auto 17px",
    padding: "22px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    boxShadow:
      "0 8px 25px rgba(30,45,70,0.06)",
  },

  historyCard: {
    maxWidth: "1100px",
    margin: "0 auto 17px",
    padding: "22px",
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
    marginBottom: "20px",
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
    color: "#1d2944",
    fontSize: "19px",
    fontWeight: "800",
  },

  cardDescription: {
    margin: "5px 0 0",
    maxWidth: "650px",
    color: "#7c879a",
    fontSize: "10px",
    lineHeight: "1.5",
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

  countBadge: {
    minWidth: "25px",
    height: "25px",
    padding: "0 8px",
    borderRadius: "8px",
    background: "#edf3ff",
    color: "#2457c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "800",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  fieldGroup: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#526078",
    fontSize: "10px",
    fontWeight: "700",
  },

  optional: {
    color: "#9aa3b1",
    fontWeight: "500",
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

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    border: "1px solid #dce3ed",
    background: "#fbfcfe",
    borderRadius: "9px",
    padding: "11px 12px",
    outline: "none",
    color: "#263550",
    fontSize: "11px",
    fontFamily: "inherit",
    lineHeight: "1.5",
  },

  formFooter: {
    marginTop: "4px",
    paddingTop: "16px",
    borderTop: "1px solid #edf0f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  footerNote: {
    margin: 0,
    color: "#8993a5",
    fontSize: "9px",
  },

  submitButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px 18px",
    fontSize: "10px",
    fontWeight: "700",
    boxShadow:
      "0 6px 14px rgba(37,99,199,0.2)",
  },

  recordList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  recordItem: {
    padding: "14px",
    border: "1px solid #e8edf3",
    borderRadius: "12px",
    background: "#fbfcfe",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  recordIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#eef4ff",
    color: "#2457c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  recordDetails: {
    flex: 1,
    minWidth: 0,
  },

  recordTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
  },

  recordLabel: {
    margin: 0,
    color: "#98a1b0",
    fontSize: "7px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  recordTitle: {
    margin: "3px 0 0",
    color: "#263550",
    fontSize: "13px",
    fontWeight: "800",
  },

  statusBadge: {
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "8px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  recordRemarks: {
    margin: "8px 0 0",
    color: "#778397",
    fontSize: "9px",
    lineHeight: "1.5",
  },

  recordMeta: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
    color: "#9aa3b1",
    fontSize: "8px",
  },

  emptyState: {
    padding: "38px 20px",
    textAlign: "center",
    border: "1px dashed #dce3ed",
    borderRadius: "12px",
    background: "#fbfcfe",
  },

  emptyIcon: {
    width: "50px",
    height: "50px",
    margin: "0 auto 10px",
    borderRadius: "50%",
    background: "#eef3fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  emptyTitle: {
    margin: 0,
    color: "#263550",
    fontSize: "15px",
  },

  emptyText: {
    maxWidth: "420px",
    margin: "6px auto 0",
    color: "#7d8799",
    fontSize: "10px",
    lineHeight: "1.5",
  },

  infoBox: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "14px 17px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "#f5f8fc",
    border: "1px solid #e1e8f1",
    borderRadius: "11px",
  },

  infoIcon: {
    fontSize: "14px",
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
    animation:
      "biometricVerificationSpin 0.8s linear infinite",
  },
};

// =====================================================
// LOADER ANIMATION
// =====================================================

const styleElement =
  document.createElement("style");

styleElement.innerHTML = `
  @keyframes biometricVerificationSpin {
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

export default BiometricVerification;