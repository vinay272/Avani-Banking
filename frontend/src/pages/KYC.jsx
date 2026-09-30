import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function KYC() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("token");

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 600 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // =====================================================
  // LOAD CUSTOMER + KYC DATA
  // =====================================================

  useEffect(() => {
    loadKycData();
  }, []);

  const loadKycData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      // GET LOGGED-IN CUSTOMER

      const customerResponse = await fetch(
        "http://localhost:8080/api/customers/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!customerResponse.ok) {
        const responseText =
          await customerResponse.text();

        throw new Error(
          responseText ||
            "Unable to fetch customer details."
        );
      }

      const customerData =
        await customerResponse.json();

      setCustomer(customerData);

      // GET CUSTOMER KYC DOCUMENTS

      const kycResponse = await fetch(
        `http://localhost:8080/api/kyc/customer/${customerData.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!kycResponse.ok) {
        const responseText =
          await kycResponse.text();

        throw new Error(
          responseText ||
            "Unable to fetch KYC details."
        );
      }

      const kycData =
        await kycResponse.json();

      setDocuments(
        Array.isArray(kycData)
          ? kycData
          : []
      );

    } catch (err) {
      console.error(
        "KYC loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load KYC details."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // FILE CHANGE
  // =====================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setMessage("");
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    const maxSize =
      5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only PDF, JPG, JPEG and PNG files are allowed."
      );

      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > maxSize) {
      setError(
        "File size must be less than 5 MB."
      );

      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({
      documentType: "",
      documentNumber: "",
    });

    setSelectedFile(null);

    const fileInput =
      document.getElementById(
        "kyc-file-input"
      );

    if (fileInput) {
      fileInput.value = "";
    }

    setMessage("");
    setError("");
  };

  // =====================================================
  // SUBMIT KYC DOCUMENT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError(
        "Session expired. Please login again."
      );
      return;
    }

    if (!customer?.id) {
      setError(
        "Customer information is not available."
      );
      return;
    }

    if (!formData.documentType) {
      setError(
        "Please select a document type."
      );
      return;
    }

    if (!formData.documentNumber.trim()) {
      setError(
        "Please enter document number."
      );
      return;
    }

    if (!selectedFile) {
      setError(
        "Please select a KYC document file."
      );
      return;
    }

    try {
      setSubmitting(true);

      // =================================================
      // MULTIPART FORM DATA
      // =================================================

      const formDataToSend =
        new FormData();

      formDataToSend.append(
        "documentType",
        formData.documentType
      );

      formDataToSend.append(
        "documentNumber",
        formData.documentNumber.trim()
      );

      formDataToSend.append(
        "file",
        selectedFile
      );

      // =================================================
      // BACKEND API
      // =================================================

      const response = await fetch(
        `http://localhost:8080/api/kyc/upload/${customer.id}`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formDataToSend,
        }
      );

      const responseText =
        await response.text();

      let responseData = null;

      try {
        responseData =
          responseText
            ? JSON.parse(responseText)
            : null;
      } catch {
        responseData = null;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            responseText ||
            "Unable to submit KYC document."
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setMessage(
        "KYC document uploaded successfully."
      );

      resetForm();

      // Refresh documents

      await loadKycData();

    } catch (err) {
      console.error(
        "KYC submission error:",
        err
      );

      setError(
        err.message ||
          "Unable to upload KYC document."
      );

    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    const normalized =
      status?.toUpperCase();

    if (normalized === "VERIFIED") {
      return {
        background: "#eaf8ef",
        color: "#18723c",
        border:
          "1px solid #c8ecd5",
      };
    }

    if (normalized === "REJECTED") {
      return {
        background: "#fff0f0",
        color: "#b42318",
        border:
          "1px solid #ffd1d1",
      };
    }

    return {
      background: "#fff8e7",
      color: "#9a6700",
      border:
        "1px solid #f2dfaa",
    };
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div
          style={styles.loadingContainer}
        >
          <div
            style={styles.loader}
          ></div>

          <p>
            Loading KYC details...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        ...styles.page,
        ...(isMobile ? styles.mobilePage : {}),
      }}
    >

      {/* ================= HEADER ================= */}

      <div
        style={{
          ...styles.header,
          ...(isMobile ? styles.mobileHeader : {}),
        }}
      >

        <div>

          <div style={styles.brand}>
            AVANI BANK
          </div>

          <h1
            style={{
              ...styles.title,
              ...(isMobile ? styles.mobileTitle : {}),
            }}
          >
            KYC Verification
          </h1>

          <p style={styles.subtitle}>
            Manage your identity verification
            documents securely.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard")
          }
          style={{
            ...styles.dashboardButton,
            ...(isMobile ? styles.mobileDashboardButton : {}),
          }}
        >
          ← Dashboard
        </button>

      </div>

      {/* ================= MESSAGES ================= */}

      {message && (
        <div
          style={{
            ...styles.successMessage,
            ...(isMobile ? styles.mobileMessage : {}),
          }}
        >
          <span
            style={styles.messageIcon}
          >
            ✓
          </span>

          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            ...styles.errorMessage,
            ...(isMobile ? styles.mobileMessage : {}),
          }}
        >
          <span
            style={styles.messageIcon}
          >
            !
          </span>

          {error}
        </div>
      )}

      {/* ================= KYC STATUS ================= */}

      <div
        style={{
          ...styles.statusCard,
          ...(isMobile ? styles.mobileStatusCard : {}),
        }}
      >

        <div style={styles.statusIcon}>
          🛡️
        </div>

        <div
          style={styles.statusContent}
        >

          <div
            style={{
              ...styles.statusTopRow,
              ...(isMobile ? styles.mobileStatusTopRow : {}),
            }}
          >

            <div>

              <div
                style={styles.statusLabel}
              >
                OVERALL KYC STATUS
              </div>

              <div
                style={{
                  ...styles.statusBadge,
                  ...getStatusStyle(
                    customer?.kycStatus
                  ),
                }}
              >
                {customer?.kycStatus ||
                  "PENDING"}
              </div>

            </div>

            <div
              style={styles.statusIndicator}
            >

              <span
                style={{
                  ...styles.statusDot,
                  background:
                    customer?.kycStatus ===
                    "VERIFIED"
                      ? "#2e9b5d"
                      : customer?.kycStatus ===
                        "REJECTED"
                      ? "#d14343"
                      : "#d99b20",
                }}
              />

              KYC Monitoring

            </div>

          </div>

          <p style={styles.statusText}>

            {customer?.kycStatus ===
            "VERIFIED"
              ? "Your KYC verification has been successfully completed."
              : customer?.kycStatus ===
                "REJECTED"
              ? "Your KYC verification requires attention."
              : "Your KYC verification is currently pending."}

          </p>

        </div>

      </div>

      {/* ================= CUSTOMER DETAILS ================= */}

      <div
        style={{
          ...styles.card,
          ...(isMobile ? styles.mobileCard : {}),
        }}
      >

        <div
          style={{
            ...styles.cardHeader,
            ...(isMobile ? styles.mobileCardHeader : {}),
          }}
        >

          <div>

            <h2
              style={styles.cardTitle}
            >
              Account Information
            </h2>

            <p
              style={styles.cardSubtitle}
            >
              Customer details associated with
              this KYC profile.
            </p>

          </div>

          <span
            style={styles.accountBadge}
          >
            CUSTOMER
          </span>

        </div>

        <div
          style={{
            ...styles.customerGrid,
            ...(isMobile ? styles.mobileCustomerGrid : {}),
          }}
        >

          <div style={styles.infoItem}>

            <span
              style={styles.infoLabel}
            >
              Full Name
            </span>

            <strong
              style={styles.infoValue}
            >
              {customer?.fullName ||
                "Not available"}
            </strong>

          </div>

          <div style={styles.infoItem}>

            <span
              style={styles.infoLabel}
            >
              Email
            </span>

            <strong
              style={styles.infoValue}
            >
              {customer?.email ||
                "Not available"}
            </strong>

          </div>

          <div style={styles.infoItem}>

            <span
              style={styles.infoLabel}
            >
              Account Number
            </span>

            <strong
              style={styles.infoValue}
            >
              {customer?.accountNumber ||
                "Not available"}
            </strong>

          </div>

          <div style={styles.infoItem}>

            <span
              style={styles.infoLabel}
            >
              Account Type
            </span>

            <strong
              style={styles.infoValue}
            >
              {customer?.accountType ||
                "Not available"}
            </strong>

          </div>

        </div>

      </div>

      {/* ================= SUBMIT KYC ================= */}

      <div
        style={{
          ...styles.card,
          ...(isMobile ? styles.mobileCard : {}),
        }}
      >

        <div
          style={{
            ...styles.cardHeader,
            ...(isMobile ? styles.mobileCardHeader : {}),
          }}
        >

          <div>

            <h2
              style={styles.cardTitle}
            >
              Submit KYC Document
            </h2>

            <p
              style={styles.cardSubtitle}
            >
              Submit your identity document
              for verification.
            </p>

          </div>

          <div
            style={styles.secureBadge}
          >
            🔒 Secure
          </div>

        </div>

        <form
          onSubmit={handleSubmit}
        >

          <div
            style={{
              ...styles.formGrid,
              ...(isMobile ? styles.mobileFormGrid : {}),
            }}
          >

            {/* DOCUMENT TYPE */}

            <div
              style={styles.field}
            >

              <label
                style={styles.label}
              >
                Document Type
              </label>

              <select
                name="documentType"
                value={
                  formData.documentType
                }
                onChange={handleChange}
                style={styles.input}
                required
                disabled={submitting}
              >

                <option value="">
                  Select document
                </option>

                <option value="PAN">
                  PAN Card
                </option>

                <option value="AADHAAR">
                  Aadhaar Card
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

              <span
                style={styles.fieldHint}
              >
                Select the identity document
                you want to submit.
              </span>

            </div>

            {/* DOCUMENT NUMBER */}

            <div
              style={styles.field}
            >

              <label
                style={styles.label}
              >
                Document Number
              </label>

              <input
                type="text"
                name="documentNumber"
                value={
                  formData.documentNumber
                }
                onChange={handleChange}
                placeholder="Enter document number"
                style={styles.input}
                required
                disabled={submitting}
                autoComplete="off"
              />

              <span
                style={styles.fieldHint}
              >
                Enter the number exactly as
                shown on your document.
              </span>

            </div>

            {/* FILE UPLOAD */}

            <div
              style={styles.fileUploadField}
            >

              <label
                style={styles.label}
              >
                KYC Document File
              </label>

              <div
                style={
                  styles.fileUploadBox
                }
              >

                <div
                  style={styles.fileIcon}
                >
                  📎
                </div>

                <div
                  style={styles.fileUploadContent}
                >

                  <input
                    id="kyc-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={
                      handleFileChange
                    }
                    disabled={submitting}
                    style={
                      styles.fileInput
                    }
                  />

                  <p
                    style={
                      styles.fileHelpText
                    }
                  >
                    PDF, JPG, JPEG or PNG
                    • Maximum 5 MB
                  </p>

                  {selectedFile && (
                    <div
                      style={
                        styles.selectedFile
                      }
                    >
                      ✓{" "}
                      {selectedFile.name}
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

          <div
            style={{
              ...styles.formActions,
              ...(isMobile ? styles.mobileFormActions : {}),
            }}
          >

            <button
              type="button"
              onClick={resetForm}
              style={styles.cancelButton}
              disabled={submitting}
            >
              Clear
            </button>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: submitting
                  ? 0.7
                  : 1,
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
              }}
              disabled={submitting}
            >

              {submitting && (
                <span
                  style={
                    styles.buttonSpinner
                  }
                />
              )}

              {submitting
                ? "Uploading..."
                : "Submit Document"}

            </button>

          </div>

        </form>

      </div>

      {/* ================= DOCUMENT LIST ================= */}

      <div
        style={{
          ...styles.card,
          ...(isMobile ? styles.mobileCard : {}),
        }}
      >

        <div
          style={{
            ...styles.cardHeader,
            ...(isMobile ? styles.mobileCardHeader : {}),
          }}
        >

          <div>

            <h2
              style={styles.cardTitle}
            >
              Submitted Documents
            </h2>

            <p
              style={styles.cardSubtitle}
            >
              Track the verification status of
              your submitted documents.
            </p>

          </div>

          <span
            style={styles.documentCount}
          >
            {documents.length} Document
            {documents.length !== 1
              ? "s"
              : ""}
          </span>

        </div>

        {documents.length === 0 ? (

          <div
            style={styles.emptyState}
          >

            <div
              style={styles.emptyIcon}
            >
              📄
            </div>

            <h3
              style={styles.emptyTitle}
            >
              No KYC Documents
            </h3>

            <p
              style={styles.emptyText}
            >
              You haven't submitted any KYC
              documents yet.
            </p>

          </div>

        ) : (

          <div
            style={styles.documentList}
          >

            {documents.map(
              (document) => (

                <div
                  key={document.id}
                  style={
                    styles.documentCard
                  }
                >

                  <div
                    style={
                      styles.documentIcon
                    }
                  >
                    📄
                  </div>

                  <div
                    style={
                      styles.documentInfo
                    }
                  >

                    <div
                      style={
                        styles.documentTitleRow
                      }
                    >

                      <h3
                        style={
                          styles.documentName
                        }
                      >
                        {
                          document.documentType
                        }
                      </h3>

                      <div
                        style={{
                          ...styles.documentStatus,
                          ...getStatusStyle(
                            document.verificationStatus
                          ),
                        }}
                      >
                        {
                          document.verificationStatus ||
                          "PENDING"
                        }
                      </div>

                    </div>

                    <p
                      style={
                        styles.documentNumber
                      }
                    >
                      Document No:{" "}
                      {
                        document.documentNumber
                      }
                    </p>

                    {document.uploadedAt && (
                      <p
                        style={
                          styles.dateText
                        }
                      >
                        Submitted:{" "}
                        {new Date(
                          document.uploadedAt
                        ).toLocaleString()}
                      </p>
                    )}

                    {document.verifiedAt && (
                      <p
                        style={
                          styles.dateText
                        }
                      >
                        Verified:{" "}
                        {new Date(
                          document.verifiedAt
                        ).toLocaleString()}
                      </p>
                    )}

                    {document.documentFileName && (
                      <p
                        style={
                          styles.fileText
                        }
                      >
                        📎{" "}
                        {
                          document.documentFileName
                        }
                      </p>
                    )}

                    {document.verificationRemarks && (
                      <div
                        style={
                          styles.remarksBox
                        }
                      >
                        <strong>
                          Remarks:
                        </strong>{" "}
                        {
                          document.verificationRemarks
                        }
                      </div>
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* ================= INFORMATION ================= */}

      <div
        style={{
          ...styles.infoBox,
          ...(isMobile ? styles.mobileInfoBox : {}),
        }}
      >

        <div
          style={styles.infoBoxIcon}
        >
          i
        </div>

        <div>

          <strong
            style={styles.infoBoxTitle}
          >
            KYC Verification
          </strong>

          <p
            style={styles.infoBoxText}
          >
            Your submitted documents are reviewed
            by the bank verification system. Once
            verified, your KYC status will be updated
            automatically.
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
      "linear-gradient(135deg, #f4f7fb 0%, #eef3f9 100%)",
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
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
    color: "#64748b",
    marginBottom: "6px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-0.7px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#718096",
    fontSize: "14px",
  },

  dashboardButton: {
    border: "1px solid #d7dee9",
    background: "#ffffff",
    color: "#26344a",
    borderRadius: "10px",
    padding: "11px 17px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 4px 12px rgba(20, 35, 60, 0.06)",
    whiteSpace: "nowrap",
  },

  successMessage: {
    maxWidth: "1150px",
    margin: "0 auto 16px",
    padding: "13px 16px",
    borderRadius: "10px",
    background: "#eaf8ef",
    color: "#19713b",
    border:
      "1px solid #c9ecd6",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  errorMessage: {
    maxWidth: "1150px",
    margin: "0 auto 16px",
    padding: "13px 16px",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#b42318",
    border:
      "1px solid #ffd2d2",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  messageIcon: {
    width: "21px",
    height: "21px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    flexShrink: 0,
  },

  statusCard: {
    maxWidth: "1150px",
    margin: "0 auto 20px",
    padding: "22px",
    borderRadius: "16px",
    background: "#ffffff",
    border:
      "1px solid #e4e9f0",
    boxShadow:
      "0 8px 25px rgba(30, 45, 70, 0.06)",
    display: "flex",
    alignItems: "center",
    gap: "17px",
    boxSizing: "border-box",
    marginTop: "18px",  
  },

  statusIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "14px",
    background: "#edf4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    flexShrink: 0,
  },

  statusContent: {
    flex: 1,
    minWidth: 0,
  },

  statusTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  statusLabel: {
    color: "#7a8699",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.5px",
    marginBottom: "6px",
  },

  statusBadge: {
    display: "inline-block",
    padding: "6px 11px",
    borderRadius: "7px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },

  statusIndicator: {
    color: "#7a8699",
    fontSize: "11px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    display: "inline-block",
  },

  statusText: {
    margin: "8px 0 0",
    color: "#66748a",
    fontSize: "13px",
  },

  card: {
    maxWidth: "1150px",
    margin: "0 auto 20px",
    padding: "25px",
    background: "#ffffff",
    border:
      "1px solid #e4e9f0",
    borderRadius: "16px",
    boxShadow:
      "0 8px 25px rgba(30, 45, 70, 0.06)",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "800",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#7a8699",
    fontSize: "13px",
  },

  accountBadge: {
    padding: "7px 10px",
    borderRadius: "7px",
    background: "#f2f5f9",
    color: "#5c6a7e",
    fontSize: "11px",
    fontWeight: "700",
  },

  secureBadge: {
    padding: "7px 10px",
    borderRadius: "7px",
    background: "#f1f7f3",
    color: "#277346",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  customerGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "20px",
  },

  infoItem: {
    minWidth: 0,
  },

  infoLabel: {
    display: "block",
    color: "#8894a6",
    fontSize: "11px",
    marginBottom: "5px",
  },

  infoValue: {
    display: "block",
    fontSize: "13px",
    color: "#26344a",
    wordBreak: "break-word",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  fileUploadField: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#46536a",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #d9e0ea",
    borderRadius: "9px",
    padding: "11px 12px",
    fontSize: "13px",
    outline: "none",
    background: "#fbfcfe",
    color: "#202b3c",
  },

  fieldHint: {
    color: "#8995a7",
    fontSize: "10px",
  },

  fileUploadBox: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px dashed #cbd5e1",
    borderRadius: "11px",
    padding: "15px",
    background: "#fbfcfe",
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  fileIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#edf3fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  fileUploadContent: {
    flex: 1,
    minWidth: 0,
  },

  fileInput: {
    width: "100%",
    fontSize: "12px",
    color: "#46536a",
  },

  fileHelpText: {
    margin: "7px 0 0",
    color: "#8995a7",
    fontSize: "10px",
  },

  selectedFile: {
    marginTop: "7px",
    color: "#18723c",
    fontSize: "11px",
    fontWeight: "700",
    wordBreak: "break-word",
  },

  formActions: {
    marginTop: "22px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  cancelButton: {
    border:
      "1px solid #d7dee8",
    background: "#ffffff",
    color: "#4c5a70",
    borderRadius: "9px",
    padding: "11px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  submitButton: {
    border: "none",
    background: "#172b4d",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px 20px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonSpinner: {
    width: "12px",
    height: "12px",
    border:
      "2px solid rgba(255,255,255,0.4)",
    borderTop:
      "2px solid #ffffff",
    borderRadius: "50%",
    marginRight: "8px",
    animation:
      "spin 1s linear infinite",
  },

  documentCount: {
    color: "#68768b",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  documentList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  documentCard: {
    border:
      "1px solid #e6ebf2",
    borderRadius: "13px",
    padding: "17px",
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    background: "#fcfdff",
  },

  documentIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "11px",
    background: "#edf3fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    color: "#334b70",
    flexShrink: 0,
  },

  documentInfo: {
    flex: 1,
    minWidth: 0,
  },

  documentTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  documentName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "800",
  },

  documentNumber: {
    margin: "6px 0 4px",
    color: "#6d7a8e",
    fontSize: "12px",
    overflowWrap: "anywhere",
  },

  dateText: {
    margin: "3px 0",
    color: "#7b8799",
    fontSize: "11px",
  },

  documentStatus: {
    padding: "7px 10px",
    borderRadius: "7px",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  remarksBox: {
    marginTop: "8px",
    padding: "8px 10px",
    background: "#f6f8fb",
    borderRadius: "7px",
    color: "#59687d",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  fileText: {
    margin: "7px 0 0",
    color: "#53647b",
    fontSize: "11px",
    overflowWrap: "anywhere",
  },

  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
  },

  emptyIcon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 12px",
    borderRadius: "50%",
    background: "#f0f4fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800",
  },

  emptyText: {
    margin: "7px 0 0",
    color: "#7b8799",
    fontSize: "13px",
  },

  infoBox: {
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "17px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    background: "#f5f8fc",
    border:
      "1px solid #e1e8f1",
    borderRadius: "12px",
    boxSizing: "border-box",
  },

  infoBoxIcon: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#e5edf8",
    color: "#526b8d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
    flexShrink: 0,
  },

  infoBoxTitle: {
    fontSize: "12px",
    color: "#33435a",
  },

  infoBoxText: {
    margin: "4px 0 0",
    color: "#728096",
    fontSize: "11px",
    lineHeight: "1.6",
    overflowWrap: "anywhere",
  },

  // =====================================================
  // RESPONSIVE STYLES
  // =====================================================

  mobilePage: {
    padding: "14px 10px",
  },

  mobileHeader: {
    maxHeight: "none",
    padding: "20px 16px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "15px",
    borderRadius: "15px",
  },

  mobileTitle: {
    fontSize: "23px",
    lineHeight: "1.2",
  },

  mobileDashboardButton: {
    width: "100%",
    minHeight: "40px",
    padding: "10px 12px",
  },

  mobileMessage: {
    fontSize: "12px",
    padding: "11px 12px",
    lineHeight: "1.5",
  },

  mobileStatusCard: {
    padding: "15px",
    marginTop: "14px",
    marginBottom: "14px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "12px",
  },

  mobileStatusTopRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
  },

  mobileCard: {
    padding: "15px",
    marginBottom: "14px",
    borderRadius: "14px",
  },

  mobileCardHeader: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "10px",
    marginBottom: "15px",
  },

  mobileCustomerGrid: {
    gridTemplateColumns: "1fr",
    gap: "13px",
  },

  mobileFormGrid: {
    gridTemplateColumns: "1fr",
    gap: "14px",
  },

  mobileFileUploadBox: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: "13px",
    gap: "10px",
  },

  mobileFormActions: {
    flexDirection: "column-reverse",
    alignItems: "stretch",
    gap: "8px",
    marginTop: "18px",
  },

  mobileDocumentList: {
    gap: "9px",
  },

  mobileDocumentCard: {
    padding: "12px",
    gap: "10px",
  },

  mobileDocumentTitleRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: "6px",
  },

  mobileInfoBox: {
    padding: "13px",
    gap: "9px",
    marginBottom: "4px",
  },

  loadingContainer: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#68768b",
    fontSize: "14px",
  },

  loader: {
    width: "28px",
    height: "28px",
    border:
      "3px solid #dce4ef",
    borderTop:
      "3px solid #172b4d",
    borderRadius: "50%",
    marginBottom: "12px",
    animation:
      "spin 1s linear infinite",
  },
};

export default KYC;