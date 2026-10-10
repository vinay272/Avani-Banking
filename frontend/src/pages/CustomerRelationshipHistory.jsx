import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerRelationshipHistory() {
  const navigate = useNavigate();

  // Responsive viewport handling
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);

  const [relationshipType, setRelationshipType] =
    useState("JOINT_ACCOUNT");

  const [description, setDescription] = useState("");
  const [relatedCustomerId, setRelatedCustomerId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Sync this page with the theme selected on the Dashboard.
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("avani-theme") === "dark";
  });

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const token = localStorage.getItem("token");

  // =========================
  // LOAD CUSTOMER + HISTORY
  // =========================

  useEffect(() => {
    loadCustomerAndHistory();
  }, []);

  const loadCustomerAndHistory = async () => {
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

      const historyResponse = await fetch(
        `http://localhost:8080/api/customer-relationship-history/customer/${customerData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        historyResponse.status === 401 ||
        historyResponse.status === 403
      ) {
        setError(
          "You are not authorized to view relationship history."
        );
        return;
      }

      if (!historyResponse.ok) {
        throw new Error(
          "Unable to fetch relationship history."
        );
      }

      const historyData =
        await historyResponse.json();

      setHistory(
        Array.isArray(historyData)
          ? historyData
          : []
      );
    } catch (err) {
      console.error(
        "Relationship History Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load relationship history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ADD HISTORY
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

    if (!relationshipType.trim()) {
      setError(
        "Please select a relationship type."
      );
      return;
    }

    if (!description.trim()) {
      setError(
        "Please enter a description."
      );
      return;
    }

    if (relatedCustomerId.trim()) {
      if (
        Number(relatedCustomerId) ===
        Number(customer.id)
      ) {
        setError(
          "Related customer cannot be the same as the primary customer."
        );
        return;
      }
    }

    try {
      setSaving(true);

      const params = new URLSearchParams();

      params.append(
        "customerId",
        customer.id
      );

      params.append(
        "relationshipType",
        relationshipType.trim()
      );

      params.append(
        "description",
        description.trim()
      );

      if (relatedCustomerId.trim()) {
        params.append(
          "relatedCustomerId",
          relatedCustomerId.trim()
        );
      }

      const response = await fetch(
        `http://localhost:8080/api/customer-relationship-history/add?${params.toString()}`,
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
            "Unable to add relationship history."
        );
      }

      const newHistory =
        await response.json();

      setHistory((previous) => [
        newHistory,
        ...previous,
      ]);

      setDescription("");
      setRelatedCustomerId("");

      setMessage(
        "Relationship history added successfully."
      );
    } catch (err) {
      console.error(
        "Add Relationship History Error:",
        err
      );

      setError(
        err.message ||
          "Unable to add relationship history."
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
  // RELATIONSHIP LABEL
  // =========================

  const getRelationshipLabel = (type) => {
    switch (type) {
      case "JOINT_ACCOUNT":
        return "Joint Account";

      case "NOMINEE":
        return "Nominee";

      case "FAMILY":
        return "Family Relationship";

      case "BENEFICIARY":
        return "Beneficiary";

      case "CUSTOMER_LINK":
        return "Customer Link";

      default:
        return type || "Relationship";
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={{ ...styles.loadingPage, ...(darkMode ? darkStyles.loadingPage : {}) }}>
        <div style={{ ...styles.loadingCard, ...(darkMode ? darkStyles.loadingCard : {}) }}>
          <div style={styles.loadingIcon}>
            🔗
          </div>

          <h2 style={{ ...styles.loadingTitle, ...(darkMode ? darkStyles.loadingTitle : {}) }}>
            Loading Relationship History
          </h2>

          <p style={{ ...styles.loadingText, ...(darkMode ? darkStyles.loadingText : {}) }}>
            Please wait...
          </p>

          <div style={{ ...styles.loader, ...(darkMode ? darkStyles.loader : {}) }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.page, ...(darkMode ? darkStyles.page : {}), ...(isMobile ? responsiveStyles.mobilePage : {}) }}>

      {/* =========================
          HEADER
      ========================= */}

      <header style={{ ...styles.header, ...(isMobile ? responsiveStyles.mobileHeader : {}) }}>
        <div>
          <p style={styles.eyebrow}>
            CUSTOMER MANAGEMENT
          </p>

          <h1 style={{ ...styles.title, ...(isMobile ? responsiveStyles.mobileTitle : {}) }}>
            Relationship History
          </h1>

          <p style={{ ...styles.subtitle, ...(isMobile ? responsiveStyles.mobileSubtitle : {}) }}>
            View and record important customer
            relationship events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{ ...styles.dashboardButton, ...(isMobile ? responsiveStyles.mobileDashboardButton : {}) }}
        >
          ← Dashboard
        </button>
      </header>

      {/* =========================
          CUSTOMER SUMMARY
      ========================= */}

      <section style={{ ...styles.customerCard, ...(darkMode ? darkStyles.customerCard : {}), ...(isMobile ? responsiveStyles.mobileCustomerCard : {}) }}>
        <div style={styles.avatar}>
          {customer?.fullName
            ?.charAt(0)
            ?.toUpperCase() || "C"}
        </div>

        <div style={{ ...styles.customerInfo, ...(isMobile ? responsiveStyles.mobileCustomerInfo : {}) }}>
          <p style={{ ...styles.smallLabel, ...(darkMode ? darkStyles.smallLabel : {}) }}>
            PRIMARY CUSTOMER
          </p>

          <h2 style={{ ...styles.customerName, ...(darkMode ? darkStyles.customerName : {}) }}>
            {customer?.fullName || "Customer"}
          </h2>

          <p style={{ ...styles.customerEmail, ...(darkMode ? darkStyles.customerEmail : {}), overflowWrap: "anywhere" }}>
            {customer?.email || "Email unavailable"}
          </p>
        </div>

        <div style={{ ...styles.customerIdBox, ...(isMobile ? responsiveStyles.mobileCustomerIdBox : {}), ...(darkMode ? (isMobile ? { borderTop: "1px solid #30405a", borderLeft: "none" } : darkStyles.customerIdBox) : {}) }}>
          <p style={{ ...styles.smallLabel, ...(darkMode ? darkStyles.smallLabel : {}) }}>
            CUSTOMER ID
          </p>

          <strong style={{ ...styles.customerId, ...(darkMode ? darkStyles.customerId : {}), overflowWrap: "anywhere" }}>
            {customer?.id || "N/A"}
          </strong>
        </div>
      </section>

      {/* =========================
          MESSAGES
      ========================= */}

      {error && (
        <div style={{ ...styles.errorMessage, ...(darkMode ? darkStyles.errorMessage : {}), overflowWrap: "anywhere" }}>
          ⚠️ {error}
        </div>
      )}

      {message && (
        <div style={{ ...styles.successMessage, ...(darkMode ? darkStyles.successMessage : {}), overflowWrap: "anywhere" }}>
          ✓ {message}
        </div>
      )}

      {/* =========================
          ADD HISTORY
      ========================= */}

      <section style={{ ...styles.formCard, ...(darkMode ? darkStyles.card : {}), ...(isMobile ? responsiveStyles.mobileCard : {}) }}>

        <div style={styles.cardHeader}>
          <div>
            <p style={{ ...styles.cardEyebrow, ...(darkMode ? darkStyles.cardEyebrow : {}) }}>
              RECORD EVENT
            </p>

            <h2 style={{ ...styles.cardTitle, ...(darkMode ? darkStyles.cardTitle : {}) }}>
              Add Relationship History
            </h2>

            <p style={{ ...styles.cardDescription, ...(darkMode ? darkStyles.cardDescription : {}) }}>
              Record a relationship or important
              customer event for future reference.
            </p>
          </div>

          <div style={{ ...styles.cardIcon, ...(darkMode ? darkStyles.cardIcon : {}) }}>
            🔗
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div style={{ ...styles.twoColumn, ...(isMobile ? responsiveStyles.mobileTwoColumn : {}) }}>

            {/* RELATIONSHIP TYPE */}

            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, ...(darkMode ? darkStyles.label : {}) }}>
                Relationship Type
              </label>

              <select
                value={relationshipType}
                onChange={(event) =>
                  setRelationshipType(
                    event.target.value
                  )
                }
                style={{ ...styles.input, ...(darkMode ? darkStyles.input : {}) }}
                disabled={saving}
              >
                <option value="JOINT_ACCOUNT">
                  Joint Account
                </option>

                <option value="NOMINEE">
                  Nominee
                </option>

                <option value="BENEFICIARY">
                  Beneficiary
                </option>

                <option value="FAMILY">
                  Family Relationship
                </option>

                <option value="CUSTOMER_LINK">
                  Customer Link
                </option>
              </select>
            </div>

            {/* RELATED CUSTOMER */}

            <div style={styles.fieldGroup}>
              <label style={{ ...styles.label, ...(darkMode ? darkStyles.label : {}) }}>
                Related Customer ID
                <span style={styles.optional}>
                  {" "}
                  (Optional)
                </span>
              </label>

              <input
                type="number"
                value={relatedCustomerId}
                onChange={(event) =>
                  setRelatedCustomerId(
                    event.target.value
                  )
                }
                placeholder="e.g. 6"
                style={{ ...styles.input, ...(darkMode ? darkStyles.input : {}) }}
                disabled={saving}
              />
            </div>

          </div>

          {/* DESCRIPTION */}

          <div style={styles.fieldGroup}>
            <label style={{ ...styles.label, ...(darkMode ? darkStyles.label : {}) }}>
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the relationship or event..."
              style={{ ...styles.textarea, ...(darkMode ? darkStyles.input : {}) }}
              rows={4}
              disabled={saving}
            />
          </div>

          <div style={{ ...styles.formFooter, ...(darkMode ? darkStyles.formFooter : {}), ...(isMobile ? responsiveStyles.mobileFormFooter : {}) }}>

            <p style={{ ...styles.footerNote, ...(darkMode ? darkStyles.footerNote : {}) }}>
              This record will be linked to customer ID{" "}
              <strong>
                {customer?.id}
              </strong>.
            </p>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.submitButton,
                 ...(isMobile ? responsiveStyles.mobileSubmitButton : {}),
                opacity: saving ? 0.7 : 1,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {saving
                ? "Saving..."
                : "Add History"}
            </button>

          </div>

        </form>
      </section>

      {/* =========================
          HISTORY LIST
      ========================= */}

      <section style={{ ...styles.historyCard, ...(darkMode ? darkStyles.card : {}), ...(isMobile ? responsiveStyles.mobileCard : {}) }}>

        <div style={styles.cardHeader}>
          <div>
            <p style={{ ...styles.cardEyebrow, ...(darkMode ? darkStyles.cardEyebrow : {}) }}>
              CUSTOMER RECORD
            </p>

            <h2 style={{ ...styles.cardTitle, ...(darkMode ? darkStyles.cardTitle : {}) }}>
              Relationship Timeline
            </h2>

            <p style={{ ...styles.cardDescription, ...(darkMode ? darkStyles.cardDescription : {}) }}>
              Previous relationship events associated
              with this customer.
            </p>
          </div>

          <div style={{ ...styles.countBadge, ...(darkMode ? darkStyles.countBadge : {}) }}>
            {history.length}
          </div>
        </div>

        {history.length === 0 ? (
          <div style={{ ...styles.emptyState, ...(darkMode ? darkStyles.emptyState : {}), ...(isMobile ? responsiveStyles.mobileEmptyState : {}) }}>
            <div style={{ ...styles.emptyIcon, ...(darkMode ? darkStyles.emptyIcon : {}) }}>
              📋
            </div>

            <h3 style={{ ...styles.emptyTitle, ...(darkMode ? darkStyles.emptyTitle : {}) }}>
              No Relationship History
            </h3>

            <p style={{ ...styles.emptyText, ...(darkMode ? darkStyles.emptyText : {}) }}>
              No relationship events have been
              recorded for this customer yet.
            </p>
          </div>
        ) : (
          <div style={styles.timeline}>

            {history.map((item, index) => (

              <div
                key={item.id || index}
                style={{ ...styles.timelineItem, ...(darkMode ? darkStyles.timelineItem : {}), ...(isMobile ? responsiveStyles.mobileTimelineItem : {}) }}
              >

                <div style={{ ...styles.timelineMarker, ...(darkMode ? darkStyles.timelineMarker : {}), ...(isMobile ? responsiveStyles.mobileTimelineMarker : {}) }}>
                  {index + 1}
                </div>

                <div style={styles.timelineContent}>

                  <div style={{ ...styles.timelineTop, ...(isMobile ? responsiveStyles.mobileTimelineTop : {}) }}>

                    <div>
                      <span
                        style={
                          { ...styles.relationshipBadge, ...(darkMode ? darkStyles.relationshipBadge : {}) }
                        }
                      >
                        {getRelationshipLabel(
                          item.relationshipType
                        )}
                      </span>

                      <h3
                        style={{ ...styles.timelineTitle, ...(darkMode ? darkStyles.timelineTitle : {}), overflowWrap: "anywhere" }}
                      >
                        {item.description ||
                          "Relationship event"}
                      </h3>
                    </div>

                    <div
                      style={{ ...styles.dateBlock, ...(isMobile ? responsiveStyles.mobileDateBlock : {}) }}
                    >
                      <span
                        style={{ ...styles.date, ...(darkMode ? darkStyles.date : {}) }}
                      >
                        {formatDate(
                          item.createdAt
                        )}
                      </span>

                      <span
                        style={{ ...styles.time, ...(darkMode ? darkStyles.time : {}) }}
                      >
                        {formatTime(
                          item.createdAt
                        )}
                      </span>
                    </div>

                  </div>

                  <div
                    style={{ ...styles.timelineMeta, ...(darkMode ? darkStyles.timelineMeta : {}), ...(isMobile ? responsiveStyles.mobileTimelineMeta : {}) }}
                  >
                    <span>
                      Customer ID:{" "}
                      {item.customer?.id ||
                        customer?.id ||
                        "N/A"}
                    </span>

                    <span>
                      Related Customer:{" "}
                      {item.relatedCustomer?.id ||
                        "Not linked"}
                    </span>
                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </section>

      {/* =========================
          INFORMATION
      ========================= */}

      <div style={{ ...styles.infoBox, ...(darkMode ? darkStyles.infoBox : {}), ...(isMobile ? responsiveStyles.mobileInfoBox : {}) }}>
        <span style={{ ...styles.infoIcon, ...(darkMode ? darkStyles.infoIcon : {}) }}>
          🔒
        </span>

        <div>
          <strong style={{ ...styles.infoTitle, ...(darkMode ? darkStyles.infoTitle : {}) }}>
            Secure Customer Record
          </strong>

          <p style={{ ...styles.infoText, ...(darkMode ? darkStyles.infoText : {}), overflowWrap: "anywhere" }}>
            Relationship history is stored against
            the customer record and can be used for
            future customer relationship management.
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
    color: "#ffffff",
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
    color: "#b0b9c9",
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

  timeline: {
    display: "flex",
    flexDirection: "column",
  },

  timelineItem: {
    display: "flex",
    gap: "12px",
    paddingBottom: "13px",
    marginBottom: "13px",
    borderBottom: "1px solid #edf0f5",
  },

  timelineMarker: {
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    background: "#eef4ff",
    color: "#2457c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: "800",
    flexShrink: 0,
  },

  timelineContent: {
    flex: 1,
    minWidth: 0,
  },

  timelineTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  relationshipBadge: {
    display: "inline-block",
    padding: "4px 7px",
    borderRadius: "5px",
    background: "#f0f5ff",
    color: "#315db5",
    fontSize: "8px",
    fontWeight: "800",
  },

  timelineTitle: {
    margin: "5px 0 0",
    color: "#263550",
    fontSize: "12px",
    fontWeight: "700",
  },

  dateBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    flexShrink: 0,
  },

  date: {
    color: "#69768b",
    fontSize: "9px",
    fontWeight: "700",
  },

  time: {
    marginTop: "2px",
    color: "#9aa3b1",
    fontSize: "8px",
  },

  timelineMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "8px",
    color: "#8993a5",
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
      "relationshipHistorySpin 0.8s linear infinite",
  },
};

// =====================================================
// LOADER ANIMATION
// =====================================================

const styleElement =
  document.createElement("style");

styleElement.innerHTML = `
  @keyframes relationshipHistorySpin {
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



// Dark theme overrides. The blue header, Dashboard button, and primary action
// intentionally keep their existing appearance.
const darkStyles = {
  page: { background: "linear-gradient(135deg, #0b1220 0%, #0e1728 100%)", color: "#e8eef7" },
  loadingPage: { background: "linear-gradient(135deg, #0b1220, #0e1728)" },
  loadingCard: { background: "#111a2b", boxShadow: "0 20px 50px rgba(0,0,0,0.40)" },
  loadingTitle: { color: "#edf3ff" },
  loadingText: { color: "#8795aa" },
  loader: { border: "3px solid #29384e", borderTop: "3px solid #5b91ff" },
  customerCard: { background: "#111a2b", border: "1px solid #26344b", boxShadow: "0 10px 30px rgba(0,0,0,0.28)" },
  smallLabel: { color: "#8795aa" },
  customerName: { color: "#edf3ff" },
  customerEmail: { color: "#8795aa" },
  customerIdBox: { borderLeft: "1px solid #30405a" },
  customerId: { color: "#b9c8dd" },
  errorMessage: { background: "#351b22", border: "1px solid #63303b", color: "#ff9da9" },
  successMessage: { background: "#123323", border: "1px solid #245c3c", color: "#65d995" },
  card: { background: "#111a2b", border: "1px solid #26344b", boxShadow: "0 10px 30px rgba(0,0,0,0.28)" },
  cardEyebrow: { color: "#7fa7f5" },
  cardTitle: { color: "#edf3ff" },
  cardDescription: { color: "#8795aa" },
  cardIcon: { background: "#192944" },
  countBadge: { background: "#172f63", color: "#9ebeff" },
  label: { color: "#b8c4d6" },
  input: { background: "#172235", border: "1px solid #34445e", color: "#e8eef7", colorScheme: "dark" },
  formFooter: { borderTop: "1px solid #30405a" },
  footerNote: { color: "#8795aa" },
  timelineItem: { borderBottom: "1px solid #30405a" },
  timelineMarker: { background: "#1d2c45", color: "#9ebeff" },
  relationshipBadge: { background: "#1b2e50", color: "#9ebeff" },
  timelineTitle: { color: "#dce5f1" },
  date: { color: "#b9c8dd" },
  time: { color: "#8795aa" },
  timelineMeta: { color: "#8795aa" },
  emptyState: { background: "#172235", border: "1px dashed #34445e" },
  emptyIcon: { background: "#1d2c45" },
  emptyTitle: { color: "#dce5f1" },
  emptyText: { color: "#8795aa" },
  infoBox: { background: "#172235", border: "1px solid #30405a" },
  infoIcon: { color: "#9ebeff" },
  infoTitle: { color: "#dce5f1" },
  infoText: { color: "#8795aa" },
};

// =====================================================
// RESPONSIVE OVERRIDES
// =====================================================

const responsiveStyles = {
  mobilePage: {
    padding: "14px",
  },
  mobileHeader: {
    padding: "18px 16px",
    minHeight: "auto",
    maxHeight: "none",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "14px",
  },
  mobileTitle: {
    fontSize: "22px",
    lineHeight: "1.25",
  },
  mobileSubtitle: {
    fontSize: "11px",
    lineHeight: "1.5",
  },
  mobileDashboardButton: {
    width: "100%",
    textAlign: "center",
    padding: "11px 14px",
  },
  mobileCustomerCard: {
    padding: "15px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  mobileCustomerInfo: {
    minWidth: 0,
    flex: "1 1 calc(100% - 62px)",
  },
  mobileCustomerIdBox: {
    width: "100%",
    paddingLeft: 0,
    paddingTop: "12px",
    marginTop: "2px",
    borderLeft: "none",
    borderTop: "1px solid #edf0f5",
    textAlign: "left",
  },
  mobileCard: {
    padding: "17px",
  },
  mobileCardHeader: {
    gap: "11px",
  },
  mobileCardTitle: {
    fontSize: "17px",
    lineHeight: "1.3",
  },
  mobileCardDescription: {
    fontSize: "10px",
  },
  mobileTwoColumn: {
    gridTemplateColumns: "1fr",
    gap: "0",
  },
  mobileFormFooter: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "12px",
  },
  mobileSubmitButton: {
    width: "100%",
  },
  mobileTimelineItem: {
    gap: "9px",
    paddingBottom: "12px",
    marginBottom: "12px",
  },
  mobileTimelineMarker: {
    width: "27px",
    height: "27px",
    borderRadius: "8px",
    fontSize: "8px",
  },
  mobileTimelineTop: {
    flexDirection: "column",
    gap: "9px",
  },
  mobileDateBlock: {
    alignItems: "flex-start",
    width: "100%",
  },
  mobileTimelineMeta: {
    flexDirection: "column",
    gap: "5px",
  },
  mobileEmptyState: {
    padding: "30px 14px",
  },
  mobileInfoBox: {
    padding: "13px 14px",
    alignItems: "flex-start",
  },
};


export default CustomerRelationshipHistory;