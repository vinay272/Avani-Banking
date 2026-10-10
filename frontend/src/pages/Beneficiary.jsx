import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Beneficiary() {
  const navigate = useNavigate();

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
    typeof window !== "undefined" && window.innerWidth <= 600
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================
  // LOAD BENEFICIARIES
  // =========================

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Login session expired. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/beneficiaries",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      let data = [];

      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        data = [];
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load beneficiaries."
        );
      }

      setBeneficiaries(
        Array.isArray(data) ? data : []
      );

    } catch (err) {
      console.error("Beneficiary loading error:", err);
      setError(
        err.message || "Unable to load beneficiaries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  // =========================
  // ADD BENEFICIARY
  // =========================

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!beneficiaryName.trim()) {
      setError("Please enter beneficiary name.");
      return;
    }

    if (!accountNumber.trim()) {
      setError("Please enter account number.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Login session expired. Please login again.");
      return;
    }

    try {
      setAdding(true);

      const formData = new URLSearchParams();

      formData.append(
        "beneficiaryName",
        beneficiaryName.trim()
      );

      formData.append(
        "accountNumber",
        accountNumber.trim()
      );

      const response = await fetch(
        "http://localhost:8080/api/beneficiaries",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {
          message: text,
        };
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to add beneficiary."
        );
      }

      setMessage(
        "Beneficiary added successfully."
      );

      setBeneficiaryName("");
      setAccountNumber("");

      await loadBeneficiaries();

    } catch (err) {
      console.error("Add beneficiary error:", err);

      setError(
        err.message ||
          "Unable to add beneficiary."
      );
    } finally {
      setAdding(false);
    }
  };

  // =========================
  // DELETE BENEFICIARY
  // =========================

  const handleDelete = async (id) => {
    setMessage("");
    setError("");

    const confirmed = window.confirm(
      "Are you sure you want to delete this beneficiary?"
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Login session expired. Please login again.");
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        `http://localhost:8080/api/beneficiaries/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {
          message: text,
        };
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete beneficiary."
        );
      }

      setMessage(
        "Beneficiary deleted successfully."
      );

      setBeneficiaries((previous) =>
        previous.filter(
          (beneficiary) =>
            beneficiary.id !== id
        )
      );

    } catch (err) {
      console.error(
        "Delete beneficiary error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete beneficiary."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // TRANSFER
  // =========================

  const handleTransfer = (account) => {
    navigate("/transfer", {
      state: {
        receiverAccountNumber: account,
      },
    });
  };

  const darkStyleOverrides = {
    page: { background: "#0b1220", color: "#e8eef7" },
    dashboardButton: { background: "#ffffff", color: "#173b8c", border: "1px solid #dce3ee", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
    success: { background: "#123526", color: "#a7f3c5", border: "1px solid #245b40" },
    error: { background: "#3a2027", color: "#ffc2c2", border: "1px solid #69313b" },
    card: { background: "#111a2b", border: "1px solid #26344b", boxShadow: "0 8px 25px rgba(0,0,0,0.18)" },
    cardTitle: { color: "#e8eef7" },
    cardSubtitle: { color: "#a6b4c8" },
    label: { color: "#c5d0e0" },
    input: { background: "#172235", color: "#e8eef7", border: "1px solid #34445e", colorScheme: "dark" },
    beneficiaryCard: { background: "#151f31", border: "1px solid #2a3a52" },
    name: { color: "#e8eef7" },
    account: { color: "#c0ccdd" },
    date: { color: "#9eacc1" },
    emptyTitle: { color: "#e8eef7" },
    emptyText: { color: "#a6b4c8" },
    loading: { color: "#c0ccdd" },
    loader: { border: "3px solid #34445e", borderTop: "3px solid #6ea0ff" },
  };

  const themedStyles = darkMode
    ? Object.fromEntries(
        Object.entries(styles).map(([key, value]) => [
          key,
          { ...value, ...(darkStyleOverrides[key] || {}) },
        ])
      )
    : styles;

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={{ ...themedStyles.page, ...(isMobile ? responsiveStyles.page : {}) }}>
        <div style={themedStyles.loading}>
          <div style={themedStyles.loader}></div>
          <p>Loading beneficiaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={themedStyles.page}>
      <div style={{ ...themedStyles.container, ...(isMobile ? responsiveStyles.container : {}) }}>

        {/* HEADER */}

        <div style={{ ...themedStyles.header, ...(isMobile ? responsiveStyles.header : {}) }}>

          <div>
            <p style={themedStyles.brand}>
              AVANI BANK
            </p>

            <h1 style={{ ...themedStyles.title, ...(isMobile ? responsiveStyles.title : {}) }}>
              Beneficiaries
            </h1>

            <p style={{ ...themedStyles.subtitle, ...(isMobile ? responsiveStyles.subtitle : {}) }}>
              Manage your saved beneficiaries securely.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            style={{ ...themedStyles.dashboardButton, ...(isMobile ? responsiveStyles.dashboardButton : {}) }}
          >
            ← Dashboard
          </button>

        </div>

        {/* MESSAGES */}

        {message && (
          <div style={themedStyles.success}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div style={themedStyles.error}>
            ⚠ {error}
          </div>
        )}

        {/* ADD BENEFICIARY */}

        <div style={{ ...themedStyles.card, ...(isMobile ? responsiveStyles.card : {}) }}>

          <div style={{ ...themedStyles.cardHeader, ...(isMobile ? responsiveStyles.cardHeader : {}) }}>
            <div>
              <h2 style={themedStyles.cardTitle}>
                Add Beneficiary
              </h2>

              <p style={themedStyles.cardSubtitle}>
                Save another Avani Bank account for quick transfers.
              </p>
            </div>

            <div style={themedStyles.addIcon}>
              +
            </div>
          </div>

          <form
            onSubmit={handleAddBeneficiary}
          >

            <div style={{ ...themedStyles.formGrid, ...(isMobile ? responsiveStyles.formGrid : {}) }}>

              <div style={themedStyles.field}>
                <label style={themedStyles.label}>
                  Beneficiary Name
                </label>

                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) =>
                    setBeneficiaryName(
                      e.target.value
                    )
                  }
                  placeholder="Enter beneficiary name"
                  style={themedStyles.input}
                />
              </div>

              <div style={themedStyles.field}>
                <label style={themedStyles.label}>
                  Account Number
                </label>

                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(
                      e.target.value
                    )
                  }
                  placeholder="Enter account number"
                  style={themedStyles.input}
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={adding}
              style={{
                ...themedStyles.addButton,
                ...(isMobile ? responsiveStyles.addButton : {}),
                opacity: adding ? 0.7 : 1,
                cursor: adding
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {adding
                ? "Adding..."
                : "+ Add Beneficiary"}
            </button>

          </form>
        </div>

        {/* BENEFICIARY LIST */}

        <div style={themedStyles.card}>

          <div style={themedStyles.cardHeader}>

            <div>
              <h2 style={themedStyles.cardTitle}>
                My Beneficiaries
              </h2>

              <p style={themedStyles.cardSubtitle}>
                Your saved beneficiary accounts.
              </p>
            </div>

            <span style={themedStyles.count}>
              {beneficiaries.length}
            </span>

          </div>

          {beneficiaries.length === 0 ? (

            <div style={{ ...themedStyles.empty, ...(isMobile ? responsiveStyles.empty : {}) }}>

              <div style={themedStyles.emptyIcon}>
                👥
              </div>

              <h3 style={themedStyles.emptyTitle}>
                No Beneficiaries
              </h3>

              <p style={themedStyles.emptyText}>
                Add a beneficiary to make future transfers faster.
              </p>

            </div>

          ) : (

            <div style={themedStyles.list}>

              {beneficiaries.map(
                (beneficiary) => (

                  <div
                    key={beneficiary.id}
                    style={{ ...themedStyles.beneficiaryCard, ...(isMobile ? responsiveStyles.beneficiaryCard : {}) }}
                  >

                    <div style={themedStyles.personIcon}>
                      {beneficiary.beneficiaryName
                        ?.charAt(0)
                        ?.toUpperCase() || "B"}
                    </div>

                    <div style={{ ...themedStyles.info, ...(isMobile ? responsiveStyles.info : {}) }}>

                      <h3 style={themedStyles.name}>
                        {beneficiary.beneficiaryName}
                      </h3>

                      <p style={themedStyles.account}>
                        A/C:{" "}
                        {beneficiary.accountNumber}
                      </p>

                      <p style={themedStyles.date}>
                        Added:{" "}
                        {beneficiary.createdAt
                          ? new Date(
                              beneficiary.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "Date unavailable"}
                      </p>

                    </div>

                    <div style={{ ...themedStyles.actions, ...(isMobile ? responsiveStyles.actions : {}) }}>

                      <button
                        onClick={() =>
                          handleTransfer(
                            beneficiary.accountNumber
                          )
                        }
                        style={{ ...themedStyles.transferButton, ...(isMobile ? responsiveStyles.actionButton : {}) }}
                      >
                        Transfer
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            beneficiary.id
                          )
                        }
                        disabled={
                          deletingId ===
                          beneficiary.id
                        }
                        style={{ ...themedStyles.deleteButton, ...(isMobile ? responsiveStyles.actionButton : {}) }}
                      >
                        {deletingId ===
                        beneficiary.id
                          ? "..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#172033",
    padding: "35px 20px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "950px",
    margin: "0 auto",
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
    margin: 0,
    fontSize: "11px",
    letterSpacing: "2px",
    opacity: 0.7,
    fontWeight: "700",
  },

  title: {
    margin: "8px 0 5px",
    fontSize: "28px",
    fontWeight: "800",
    lineSpacing: "1.5px", 
   },
   
  subtitle: {
    margin: 0,
    color: "#d7e2ff",
    fontSize: "13px",
  },

  dashboardButton: {
    border:
      "1px solid rgba(255,255,255,0.25)",
    background:
      "rgba(255,255,255,0.10)",
    color: "white",
    borderRadius: "9px",
    padding: "10px 14px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  success: {
    marginTop: "18px",
    padding: "13px 15px",
    borderRadius: "10px",
    background: "#eaf8f0",
    color: "#168653",
    border: "1px solid #cdeedb",
    fontSize: "12px",
    fontWeight: "600",
  },

  error: {
    marginTop: "18px",
    padding: "13px 15px",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#c43d3d",
    border: "1px solid #ffd4d4",
    fontSize: "12px",
    fontWeight: "600",
  },

  card: {
    background: "white",
    marginTop: "20px",
    padding: "25px",
    borderRadius: "17px",
    border: "1px solid #e7ebf2",
    boxShadow:
      "0 8px 25px rgba(20,35,70,0.05)",
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
    fontSize: "18px",
    fontWeight: "800",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#7d899b",
  },

  addIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: "#edf3ff",
    color: "#173b8c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
  },

  count: {
    minWidth: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "#edf3ff",
    color: "#173b8c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
    padding: "0 7px",
    boxSizing: "border-box",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "15px",
  },

  field: {
    marginBottom: "15px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#526078",
  },

  input: {
    width: "100%",
    height: "48px",
    padding: "0 14px",
    border: "1px solid #dfe5ee",
    borderRadius: "10px",
    outline: "none",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  addButton: {
    width: "100%",
    height: "48px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "white",
    fontSize: "13px",
    fontWeight: "700",
    marginTop: "5px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",
  },

  beneficiaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "15px",
    border: "1px solid #e8edf4",
    borderRadius: "12px",
    background: "#fcfdff",
  },

  personIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#edf3ff",
    color: "#173b8c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "800",
    flexShrink: 0,
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "800",
  },

  account: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: "#647187",
    wordBreak: "break-word",
  },

  date: {
    margin: "4px 0 0",
    fontSize: "10px",
    color: "#929caf",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },

  transferButton: {
    border: "none",
    background: "#173b8c",
    color: "white",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  deleteButton: {
    border:
      "1px solid #ffd4d4",
    background: "#fff5f5",
    color: "#c43d3d",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  empty: {
    textAlign: "center",
    padding: "35px 15px",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#f0f4fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
    fontSize: "22px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "800",
  },

  emptyText: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: "#8994a6",
  },

  loading: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#68768b",
    fontSize: "13px",
  },

  loader: {
    width: "28px",
    height: "28px",
    border: "3px solid #dce4ef",
    borderTop:
      "3px solid #173b8c",
    borderRadius: "50%",
    marginBottom: "12px",
    animation:
      "spin 1s linear infinite",
  },
};


/* =====================================================
   RESPONSIVE STYLE OVERRIDES
   ===================================================== */

const responsiveStyles = {
  page: {
    padding: "12px",
  },

  container: {
    maxWidth: "100%",
  },

  header: {
    maxHeight: "none",
    padding: "18px",
    borderRadius: "16px",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "16px",
  },

  title: {
    fontSize: "22px",
    lineHeight: 1.25,
  },

  subtitle: {
    fontSize: "12px",
    lineHeight: 1.55,
  },

  dashboardButton: {
    width: "100%",
    minHeight: "44px",
  },

  card: {
    padding: "18px",
    borderRadius: "14px",
  },

  cardHeader: {
    gap: "12px",
    marginBottom: "17px",
  },

  formGrid: {
    gridTemplateColumns: "1fr",
    gap: "0",
  },

  addButton: {
    minHeight: "46px",
    marginTop: "3px",
  },

  beneficiaryCard: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: "13px",
    padding: "15px",
  },

  info: {
    width: "100%",
    minWidth: 0,
  },

  actions: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    flexShrink: 1,
    paddingTop: "11px",
    borderTop: "1px solid #e8edf4",
  },

  actionButton: {
    width: "100%",
    minHeight: "42px",
    padding: "10px 12px",
    fontSize: "11px",
  },

  empty: {
    padding: "32px 8px",
  },
};

export default Beneficiary;