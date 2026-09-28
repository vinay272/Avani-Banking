import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Beneficiary() {
  const navigate = useNavigate();

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

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <div style={styles.loader}></div>
          <p>Loading beneficiaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>

          <div>
            <p style={styles.brand}>
              AVANI BANK
            </p>

            <h1 style={styles.title}>
              Beneficiaries
            </h1>

            <p style={styles.subtitle}>
              Manage your saved beneficiaries securely.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            style={styles.dashboardButton}
          >
            ← Dashboard
          </button>

        </div>

        {/* MESSAGES */}

        {message && (
          <div style={styles.success}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            ⚠ {error}
          </div>
        )}

        {/* ADD BENEFICIARY */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Add Beneficiary
              </h2>

              <p style={styles.cardSubtitle}>
                Save another Avani Bank account for quick transfers.
              </p>
            </div>

            <div style={styles.addIcon}>
              +
            </div>
          </div>

          <form
            onSubmit={handleAddBeneficiary}
          >

            <div style={styles.formGrid}>

              <div style={styles.field}>
                <label style={styles.label}>
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
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
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
                  style={styles.input}
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={adding}
              style={{
                ...styles.addButton,
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

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div>
              <h2 style={styles.cardTitle}>
                My Beneficiaries
              </h2>

              <p style={styles.cardSubtitle}>
                Your saved beneficiary accounts.
              </p>
            </div>

            <span style={styles.count}>
              {beneficiaries.length}
            </span>

          </div>

          {beneficiaries.length === 0 ? (

            <div style={styles.empty}>

              <div style={styles.emptyIcon}>
                👥
              </div>

              <h3 style={styles.emptyTitle}>
                No Beneficiaries
              </h3>

              <p style={styles.emptyText}>
                Add a beneficiary to make future transfers faster.
              </p>

            </div>

          ) : (

            <div style={styles.list}>

              {beneficiaries.map(
                (beneficiary) => (

                  <div
                    key={beneficiary.id}
                    style={styles.beneficiaryCard}
                  >

                    <div style={styles.personIcon}>
                      {beneficiary.beneficiaryName
                        ?.charAt(0)
                        ?.toUpperCase() || "B"}
                    </div>

                    <div style={styles.info}>

                      <h3 style={styles.name}>
                        {beneficiary.beneficiaryName}
                      </h3>

                      <p style={styles.account}>
                        A/C:{" "}
                        {beneficiary.accountNumber}
                      </p>

                      <p style={styles.date}>
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

                    <div style={styles.actions}>

                      <button
                        onClick={() =>
                          handleTransfer(
                            beneficiary.accountNumber
                          )
                        }
                        style={styles.transferButton}
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
                        style={styles.deleteButton}
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

export default Beneficiary;