import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function JointAccount() {
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
  const [accounts, setAccounts] = useState([]);

  const [jointCustomerId, setJointCustomerId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ownershipType, setOwnershipType] = useState("JOINT");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // LOAD CUSTOMER + ACCOUNTS
  // =========================

  useEffect(() => {
    loadJointAccounts();
  }, []);

  const loadJointAccounts = async () => {
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
        throw new Error("Unable to fetch customer details.");
      }

      const customerData = await customerResponse.json();

      setCustomer(customerData);

      const accountResponse = await fetch(
        `http://localhost:8080/api/joint-accounts/primary/${customerData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        accountResponse.status === 401 ||
        accountResponse.status === 403
      ) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!accountResponse.ok) {
        throw new Error("Unable to fetch joint accounts.");
      }

      const accountData = await accountResponse.json();

      setAccounts(accountData);
    } catch (err) {
      console.error("Joint Account Error:", err);

      setError(
        err.message || "Unable to load joint account details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE JOINT ACCOUNT
  // =========================

  const handleCreate = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!jointCustomerId.trim()) {
      setError("Please enter joint customer ID.");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please enter account number.");
      return;
    }

    if (!customer?.id) {
      setError("Customer information is unavailable.");
      return;
    }

    if (
      Number(jointCustomerId) ===
      Number(customer.id)
    ) {
      setError(
        "Primary customer and joint customer cannot be the same."
      );
      return;
    }

    try {
      setSaving(true);

      const params = new URLSearchParams();

      params.append(
        "primaryCustomerId",
        customer.id
      );

      params.append(
        "jointCustomerId",
        jointCustomerId.trim()
      );

      params.append(
        "accountNumber",
        accountNumber.trim()
      );

      params.append(
        "ownershipType",
        ownershipType
      );

      const response = await fetch(
        `http://localhost:8080/api/joint-accounts/create?${params.toString()}`,
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
        const text = await response.text();

        throw new Error(
          text || "Unable to create joint account."
        );
      }

      const data = await response.json();

      setAccounts((previous) => [
        ...previous,
        data,
      ]);

      setJointCustomerId("");
      setAccountNumber("");
      setOwnershipType("JOINT");

      setMessage(
        "Joint account created successfully."
      );
    } catch (err) {
      console.error(
        "Create Joint Account Error:",
        err
      );

      setError(
        err.message ||
          "Unable to create joint account."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================

  const handleStatusChange = async (
    accountId,
    status
  ) => {
    try {
      setUpdatingId(accountId);
      setError("");
      setMessage("");

      const params = new URLSearchParams();

      params.append("status", status);

      const response = await fetch(
        `http://localhost:8080/api/joint-accounts/${accountId}/status?${params.toString()}`,
        {
          method: "PUT",
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
        const text = await response.text();

        throw new Error(
          text || "Unable to update account status."
        );
      }

      const updatedAccount =
        await response.json();

      setAccounts((previous) =>
        previous.map((account) =>
          account.id === updatedAccount.id
            ? updatedAccount
            : account
        )
      );

      setMessage(
        `Joint account status updated to ${status}.`
      );
    } catch (err) {
      console.error(
        "Update Joint Account Error:",
        err
      );

      setError(
        err.message ||
          "Unable to update account status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status) => {
    if (status === "ACTIVE") {
      return {
        background: "#ecfdf5",
        color: "#15803d",
        border: "1px solid #bbf7d0",
      };
    }

    return {
      background: "#fff1f1",
      color: "#b42318",
      border: "1px solid #fecaca",
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
            👥
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Joint Accounts
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
    <div style={{ ...styles.page, ...(isMobile ? responsiveStyles.mobilePage : {}) }}>

      {/* =========================
          HEADER
      ========================= */}

      <header style={{ ...styles.header, ...(isMobile ? responsiveStyles.mobileHeader : {}) }}>
        <div>
          <div style={styles.brand}>
            AVANI BANK
          </div>

          <h1 style={{ ...styles.title, ...(isMobile ? responsiveStyles.mobileTitle : {}) }}>
            Joint Account Management
          </h1>

          <p style={{ ...styles.subtitle, ...(isMobile ? responsiveStyles.mobileSubtitle : {}) }}>
            Manage accounts shared with another customer.
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
          CUSTOMER CARD
      ========================= */}

      <div style={{ ...styles.customerCard, ...(isMobile ? responsiveStyles.mobileCustomerCard : {}) }}>
        <div style={styles.customerAvatar}>
          {customer?.fullName
            ?.charAt(0)
            ?.toUpperCase() || "C"}
        </div>

        <div style={{ ...styles.customerInfo, ...(isMobile ? responsiveStyles.mobileCustomerInfo : {}) }}>
          <p style={styles.customerLabel}>
            PRIMARY CUSTOMER
          </p>

          <h2 style={styles.customerName}>
            {customer?.fullName || "Customer"}
          </h2>

          <p style={{ ...styles.customerEmail, overflowWrap: "anywhere" }}>
            {customer?.email || "Email unavailable"}
          </p>
        </div>

        <div style={{ ...styles.accountInfo, ...(isMobile ? responsiveStyles.mobileAccountInfo : {}) }}>
          <p style={styles.customerLabel}>
            CUSTOMER ID
          </p>

          <strong style={{ ...styles.accountNumber, overflowWrap: "anywhere" }}>
            {customer?.id || "N/A"}
          </strong>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div style={{ ...styles.errorMessage, overflowWrap: "anywhere" }}>
          ⚠️ {error}
        </div>
      )}

      {/* =========================
          SUCCESS
      ========================= */}

      {message && (
        <div style={{ ...styles.successMessage, overflowWrap: "anywhere" }}>
          ✓ {message}
        </div>
      )}

      {/* =========================
          CREATE JOINT ACCOUNT
      ========================= */}

      <div style={{ ...styles.formCard, ...(isMobile ? responsiveStyles.mobileCard : {}) }}>

        <div style={styles.cardHeader}>
          <div>
            <p style={styles.cardEyebrow}>
              JOINT ACCOUNT
            </p>

            <h2 style={styles.cardTitle}>
              Add Joint Account
            </h2>

            <p style={styles.cardDescription}>
              Enter the details of the customer who
              will be associated with this joint account.
            </p>
          </div>

          <div style={styles.cardIcon}>
            👥
          </div>
        </div>

        <form onSubmit={handleCreate}>

          <div style={{ ...styles.twoColumn, ...(isMobile ? responsiveStyles.mobileTwoColumn : {}) }}>

            {/* JOINT CUSTOMER ID */}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Joint Customer ID
              </label>

              <input
                type="number"
                value={jointCustomerId}
                onChange={(event) =>
                  setJointCustomerId(
                    event.target.value
                  )
                }
                placeholder="Enter customer ID"
                style={styles.input}
                disabled={saving}
              />
            </div>

            {/* ACCOUNT NUMBER */}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Account Number
              </label>

              <input
                type="text"
                value={accountNumber}
                onChange={(event) =>
                  setAccountNumber(
                    event.target.value
                  )
                }
                placeholder="Enter account number"
                style={styles.input}
                disabled={saving}
              />
            </div>

          </div>

          {/* OWNERSHIP TYPE */}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Ownership Type
            </label>

            <select
              value={ownershipType}
              onChange={(event) =>
                setOwnershipType(
                  event.target.value
                )
              }
              style={styles.input}
              disabled={saving}
            >
              <option value="JOINT">
                Joint
              </option>

              <option value="EITHER_OR_SURVIVOR">
                Either or Survivor
              </option>

              <option value="FORMER_OR_SURVIVOR">
                Former or Survivor
              </option>
            </select>
          </div>

          <div style={{ ...styles.formFooter, ...(isMobile ? responsiveStyles.mobileFormFooter : {}) }}>

            <p style={styles.footerNote}>
              The joint customer must be a valid
              registered customer.
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
                ? "Creating..."
                : "Create Joint Account"}
            </button>

          </div>

        </form>
      </div>

      {/* =========================
          EXISTING ACCOUNTS
      ========================= */}

      <div style={{ ...styles.accountsCard, ...(isMobile ? responsiveStyles.mobileCard : {}) }}>

        <div style={styles.cardHeader}>
          <div>
            <p style={styles.cardEyebrow}>
              YOUR JOINT ACCOUNTS
            </p>

            <h2 style={styles.cardTitle}>
              Account List
            </h2>
          </div>

          <span style={styles.countBadge}>
            {accounts.length}
          </span>
        </div>

        {accounts.length === 0 ? (
          <div style={{ ...styles.emptyState, ...(isMobile ? responsiveStyles.mobileEmptyState : {}) }}>
            <div style={styles.emptyIcon}>
              👥
            </div>

            <h3 style={styles.emptyTitle}>
              No Joint Accounts
            </h3>

            <p style={styles.emptyText}>
              You currently do not have any joint
              accounts as the primary customer.
            </p>
          </div>
        ) : (
          <div style={styles.accountList}>

            {accounts.map((account) => (

              <div
                key={account.id}
                style={{ ...styles.accountItem, ...(isMobile ? responsiveStyles.mobileAccountItem : {}) }}
              >

                <div style={styles.accountIcon}>
                  👥
                </div>

                <div style={{ ...styles.accountDetails, ...(isMobile ? responsiveStyles.mobileAccountDetails : {}) }}>

                  <p style={styles.accountLabel}>
                    ACCOUNT NUMBER
                  </p>

                  <h3 style={{ ...styles.accountTitle, overflowWrap: "anywhere" }}>
                    {account.accountNumber}
                  </h3>

                  <p style={{ ...styles.jointHolder, overflowWrap: "anywhere" }}>
                    Joint Holder ID:{" "}
                    {account.jointCustomer?.id ||
                      "N/A"}
                  </p>

                </div>

                <div style={{ ...styles.accountMeta, ...(isMobile ? responsiveStyles.mobileAccountMeta : {}) }}>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(
                        account.status
                      ),
                    }}
                  >
                    {account.status}
                  </span>

                  <span style={{ ...styles.ownershipText, overflowWrap: "anywhere" }}>
                    {account.ownershipType}
                  </span>

                  <button
                    type="button"
                    disabled={
                      updatingId === account.id
                    }
                    onClick={() =>
                      handleStatusChange(
                        account.id,
                        account.status ===
                          "ACTIVE"
                          ? "INACTIVE"
                          : "ACTIVE"
                      )
                    }
                    style={{ ...styles.statusButton, ...(isMobile ? responsiveStyles.mobileStatusButton : {}) }}
                  >
                    {updatingId === account.id
                      ? "Updating..."
                      : account.status ===
                        "ACTIVE"
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

      {/* =========================
          INFORMATION
      ========================= */}

      <div style={{ ...styles.infoBox, ...(isMobile ? responsiveStyles.mobileInfoBox : {}) }}>
        <span style={styles.infoIcon}>
          🔒
        </span>

        <div>
          <strong style={styles.infoTitle}>
            Joint Account Information
          </strong>

          <p style={{ ...styles.infoText, overflowWrap: "anywhere" }}>
            Joint account details are linked to the
            registered customer accounts. Account
            status changes are managed through the
            bank system.
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

  successMessage: {
    maxWidth: "1100px",
    margin: "0 auto 16px",
    padding: "12px 15px",
    borderRadius: "10px",
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "600",
  },

  formCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "23px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    boxShadow:
      "0 8px 25px rgba(30,45,70,0.06)",
  },

  accountsCard: {
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

  submitButton: {
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

  accountList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  accountItem: {
    padding: "15px",
    border: "1px solid #e8edf3",
    borderRadius: "12px",
    background: "#fbfcfe",
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  accountIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#eef4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    flexShrink: 0,
  },

  accountDetails: {
    flex: 1,
    minWidth: 0,
  },

  accountLabel: {
    margin: 0,
    color: "#98a1b1",
    fontSize: "7px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  accountTitle: {
    margin: "3px 0",
    color: "#263550",
    fontSize: "14px",
    fontWeight: "800",
  },

  jointHolder: {
    margin: 0,
    color: "#7d8799",
    fontSize: "9px",
  },

  accountMeta: {
    display: "flex",
    alignItems: "flex-end",
    flexDirection: "column",
    gap: "6px",
  },

  statusBadge: {
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "8px",
    fontWeight: "800",
  },

  ownershipText: {
    color: "#7c879a",
    fontSize: "8px",
    fontWeight: "600",
  },

  statusButton: {
    border: "1px solid #dce3ed",
    background: "#ffffff",
    color: "#34445d",
    borderRadius: "7px",
    padding: "6px 9px",
    fontSize: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyState: {
    padding: "40px 20px",
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
    fontSize: "22px",
  },

  emptyTitle: {
    margin: 0,
    color: "#263550",
    fontSize: "15px",
  },

  emptyText: {
    maxWidth: "400px",
    margin: "6px auto 0",
    color: "#7d8799",
    fontSize: "10px",
    lineHeight: "1.5",
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
    animation: "jointAccountSpin 0.8s linear infinite",
  },
};

// =====================================================
// LOADER ANIMATION
// =====================================================

const styleElement = document.createElement("style");

styleElement.innerHTML = `
  @keyframes jointAccountSpin {
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
  mobileAccountInfo: {
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
  mobileCardTitle: {
    fontSize: "17px",
    lineHeight: "1.3",
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
  mobileAccountItem: {
    alignItems: "flex-start",
    flexWrap: "wrap",
    padding: "13px",
  },
  mobileAccountDetails: {
    flex: "1 1 calc(100% - 55px)",
    minWidth: 0,
  },
  mobileAccountMeta: {
    width: "100%",
    paddingTop: "10px",
    marginTop: "2px",
    borderTop: "1px solid #edf0f5",
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "8px",
  },
  mobileStatusButton: {
    flex: "1 1 100%",
    width: "100%",
    padding: "9px 10px",
  },
  mobileEmptyState: {
    padding: "32px 15px",
  },
  mobileInfoBox: {
    padding: "13px 14px",
    alignItems: "flex-start",
  },
};

export default JointAccount;