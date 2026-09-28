import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Nominee() {
  const navigate = useNavigate();

  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    relationship: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    sharePercentage: 100,
  });

  const token = localStorage.getItem("token");

  // =========================
  // FETCH NOMINEES
  // =========================

  useEffect(() => {
    fetchNominees();
  }, []);

  const fetchNominees = async () => {
    try {
      setLoading(true);
      setError("");

      const customerResponse = await fetch(
        "http://localhost:8080/api/customers/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!customerResponse.ok) {
        throw new Error("Unable to fetch customer details.");
      }

      const customer = await customerResponse.json();

      const nomineeResponse = await fetch(
        `http://localhost:8080/api/nominees/customer/${customer.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!nomineeResponse.ok) {
        throw new Error("Unable to fetch nominees.");
      }

      const data = await nomineeResponse.json();

      setNominees(data);
    } catch (err) {
      console.error("Error fetching nominees:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      fullName: "",
      relationship: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      sharePercentage: 100,
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // OPEN ADD FORM
  // =========================

  const openAddForm = () => {
    setMessage("");
    setError("");

    setEditingId(null);

    setFormData({
      fullName: "",
      relationship: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      sharePercentage: 100,
    });

    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const openEditForm = (nominee) => {
    setMessage("");
    setError("");

    setEditingId(nominee.id);

    setFormData({
      fullName: nominee.fullName || "",
      relationship: nominee.relationship || "",
      phone: nominee.phone || "",
      dateOfBirth: nominee.dateOfBirth || "",
      address: nominee.address || "",
      sharePercentage: nominee.sharePercentage ?? 100,
    });

    setShowForm(true);
  };

  // =========================
  // ADD / UPDATE NOMINEE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Basic validation
    if (!formData.fullName.trim()) {
      setError("Please enter nominee full name.");
      return;
    }

    if (!formData.relationship.trim()) {
      setError("Please select nominee relationship.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    const share = Number(formData.sharePercentage);

    if (share <= 0 || share > 100) {
      setError("Share percentage must be between 1 and 100.");
      return;
    }

    try {
      setSaving(true);

      let url;
      let method;

      if (editingId) {
        url = `http://localhost:8080/api/nominees/${editingId}`;
        method = "PUT";
      } else {
        const customerResponse = await fetch(
          "http://localhost:8080/api/customers/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!customerResponse.ok) {
          throw new Error("Unable to identify logged-in customer.");
        }

        const customer = await customerResponse.json();

        url = `http://localhost:8080/api/nominees/customer/${customer.id}`;
        method = "POST";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          relationship: formData.relationship,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth || null,
          address: formData.address.trim(),
          sharePercentage: share,
        }),
      });

      if (!response.ok) {
        throw new Error(
          editingId
            ? "Failed to update nominee."
            : "Failed to add nominee."
        );
      }

      setMessage(
        editingId
          ? "Nominee updated successfully."
          : "Nominee added successfully."
      );

      resetForm();

      await fetchNominees();
    } catch (err) {
      console.error("Nominee save error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE NOMINEE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this nominee?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/nominees/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete nominee.");
      }

      setMessage("Nominee deleted successfully.");

      await fetchNominees();
    } catch (err) {
      console.error("Nominee delete error:", err);
      setError(err.message);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loader}></div>
          <p>Loading nominee details...</p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div style={styles.page}>

      {/* =========================
          HEADER
      ========================= */}

      <div style={styles.header}>

        <div>
          <div style={styles.brand}>AVANI BANK</div>

          <h1 style={styles.title}>
            Nominee Management
          </h1>

          <p style={styles.subtitle}>
            Manage the nominee details linked to your bank account.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          style={styles.dashboardButton}
        >
          ← Dashboard
        </button>

      </div>

      {/* =========================
          MESSAGES
      ========================= */}

      {message && (
        <div style={styles.successMessage}>
          ✓ {message}
        </div>
      )}

      {error && (
        <div style={styles.errorMessage}>
          ⚠ {error}
        </div>
      )}

      {/* =========================
          TOP CARD
      ========================= */}

      <div style={styles.summaryCard}>

        <div style={styles.summaryIcon}>
          👥
        </div>

        <div style={styles.summaryContent}>
          <h2 style={styles.summaryTitle}>
            Your Nominee
          </h2>

          <p style={styles.summaryText}>
            Add or update the person who can receive benefits
            associated with your account.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={openAddForm}
            style={styles.addButton}
          >
            + Add Nominee
          </button>
        )}

      </div>

      {/* =========================
          FORM
      ========================= */}

      {showForm && (
        <div style={styles.formCard}>

          <div style={styles.formHeader}>
            <div>
              <h2 style={styles.formTitle}>
                {editingId ? "Edit Nominee" : "Add Nominee"}
              </h2>

              <p style={styles.formSubtitle}>
                Enter the nominee's details carefully.
              </p>
            </div>

            <button
              onClick={resetForm}
              style={styles.closeButton}
              type="button"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div style={styles.formGrid}>

              {/* Full Name */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter nominee full name"
                  style={styles.input}
                  required
                />
              </div>

              {/* Relationship */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Relationship
                </label>

                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">
                    Select relationship
                  </option>

                  <option value="Father">
                    Father
                  </option>

                  <option value="Mother">
                    Mother
                  </option>

                  <option value="Brother">
                    Brother
                  </option>

                  <option value="Sister">
                    Sister
                  </option>

                  <option value="Spouse">
                    Spouse
                  </option>

                  <option value="Son">
                    Son
                  </option>

                  <option value="Daughter">
                    Daughter
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* Phone */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  maxLength="10"
                  style={styles.input}
                  required
                />
              </div>

              {/* DOB */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              {/* Share */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Share Percentage
                </label>

                <input
                  type="number"
                  name="sharePercentage"
                  value={formData.sharePercentage}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  style={styles.input}
                  required
                />
              </div>

              {/* Address */}

              <div style={styles.fieldFull}>
                <label style={styles.label}>
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter nominee address"
                  rows="3"
                  style={styles.textarea}
                />
              </div>

            </div>

            {/* Form Buttons */}

            <div style={styles.formActions}>

              <button
                type="button"
                onClick={resetForm}
                style={styles.cancelButton}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.saveButton}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Nominee"
                  : "Save Nominee"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =========================
          NOMINEE LIST
      ========================= */}

      <div style={styles.listCard}>

        <div style={styles.listHeader}>
          <div>
            <h2 style={styles.listTitle}>
              Nominee Details
            </h2>

            <p style={styles.listSubtitle}>
              {nominees.length === 0
                ? "No nominee has been added yet."
                : `${nominees.length} nominee${
                    nominees.length > 1 ? "s" : ""
                  } registered`}
            </p>
          </div>
        </div>

        {nominees.length === 0 ? (

          <div style={styles.emptyState}>

            <div style={styles.emptyIcon}>
              👤
            </div>

            <h3 style={styles.emptyTitle}>
              No Nominee Added
            </h3>

            <p style={styles.emptyText}>
              Add a nominee to keep your account information
              complete.
            </p>

            <button
              onClick={openAddForm}
              style={styles.emptyButton}
            >
              + Add Your Nominee
            </button>

          </div>

        ) : (

          <div style={styles.nomineeList}>

            {nominees.map((nominee) => (

              <div
                key={nominee.id}
                style={styles.nomineeCard}
              >

                <div style={styles.nomineeIcon}>
                  {nominee.fullName
                    ? nominee.fullName
                        .charAt(0)
                        .toUpperCase()
                    : "N"}
                </div>

                <div style={styles.nomineeInfo}>

                  <h3 style={styles.nomineeName}>
                    {nominee.fullName}
                  </h3>

                  <p style={styles.relationship}>
                    {nominee.relationship}
                  </p>

                  <div style={styles.detailsRow}>

                    <span>
                      📱 {nominee.phone}
                    </span>

                    <span>
                      🎂{" "}
                      {nominee.dateOfBirth ||
                        "Not provided"}
                    </span>

                    <span>
                      📍{" "}
                      {nominee.address ||
                        "Address not provided"}
                    </span>

                  </div>

                </div>

                <div style={styles.nomineeRight}>

                  <div style={styles.shareBadge}>
                    {nominee.sharePercentage}%
                  </div>

                  <span style={styles.shareLabel}>
                    Share
                  </span>

                  <div style={styles.actionButtons}>

                    <button
                      onClick={() =>
                        openEditForm(nominee)
                      }
                      style={styles.editButton}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(nominee.id)
                      }
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

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
    color: "#ffffff",
    marginBottom: "6px",
  },

  title: {
    margin: "0",
    fontSize: "30px",
    fontWeight: "800",
    letterSpacing: "-0.7px",
    color: "#ffffff",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#a8b1be",
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
    boxShadow: "0 4px 12px rgba(20, 35, 60, 0.06)",
    whiteSpace: "nowrap",
  },

  successMessage: {
    maxWidth: "1150px",
    margin: "0 auto 16px",
    padding: "13px 16px",
    borderRadius: "10px",
    background: "#eaf8ef",
    color: "#19713b",
    border: "1px solid #c9ecd6",
    fontSize: "13px",
    fontWeight: "600",
  },

  errorMessage: {
    maxWidth: "1150px",
    margin: "0 auto 16px",
    padding: "13px 16px",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#b42318",
    border: "1px solid #ffd2d2",
    fontSize: "13px",
    fontWeight: "600",
  },

  summaryCard: {
    maxWidth: "1150px",
    margin: "0 auto 20px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "17px",
    boxShadow: "0 8px 25px rgba(30, 45, 70, 0.06)",
    marginTop: "20px", 
  },

  summaryIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "13px",
    background: "#edf4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    margin: "0 0 5px",
    fontSize: "17px",
    fontWeight: "750",
  },

  summaryText: {
    margin: "0",
    fontSize: "13px",
    color: "#778399",
  },

  addButton: {
    border: "none",
    background: "#172b4d",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "12px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  formCard: {
    maxWidth: "1150px",
    margin: "0 auto 20px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 8px 25px rgba(30, 45, 70, 0.06)",
  },

  formHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "22px",
  },

  formTitle: {
    margin: "0",
    fontSize: "20px",
    fontWeight: "800",
  },

  formSubtitle: {
    margin: "5px 0 0",
    color: "#7a8699",
    fontSize: "13px",
  },

  closeButton: {
    border: "none",
    background: "#f3f5f8",
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    fontSize: "22px",
    color: "#657184",
    cursor: "pointer",
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

  fieldFull: {
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
    border: "1px solid #d9e0ea",
    borderRadius: "9px",
    padding: "11px 12px",
    fontSize: "13px",
    outline: "none",
    background: "#fbfcfe",
    color: "#202b3c",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d9e0ea",
    borderRadius: "9px",
    padding: "11px 12px",
    fontSize: "13px",
    outline: "none",
    background: "#fbfcfe",
    color: "#202b3c",
    resize: "vertical",
    fontFamily: "inherit",
  },

  formActions: {
    marginTop: "23px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  cancelButton: {
    border: "1px solid #d7dee8",
    background: "#ffffff",
    color: "#4c5a70",
    borderRadius: "9px",
    padding: "11px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  saveButton: {
    border: "none",
    background: "#172b4d",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px 20px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  listCard: {
    maxWidth: "1150px",
    margin: "0 auto",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 8px 25px rgba(30, 45, 70, 0.06)",
  },

  listHeader: {
    marginBottom: "20px",
  },

  listTitle: {
    margin: "0",
    fontSize: "19px",
    fontWeight: "800",
  },

  listSubtitle: {
    margin: "5px 0 0",
    color: "#7a8699",
    fontSize: "13px",
  },

  nomineeList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  nomineeCard: {
    border: "1px solid #e6ebf2",
    borderRadius: "13px",
    padding: "17px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "#fcfdff",
  },

  nomineeIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#edf3fb",
    color: "#243b61",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
    flexShrink: 0,
  },

  nomineeInfo: {
    flex: 1,
    minWidth: 0,
  },

  nomineeName: {
    margin: "0",
    fontSize: "15px",
    fontWeight: "800",
  },

  relationship: {
    margin: "4px 0 9px",
    color: "#6f7d91",
    fontSize: "12px",
  },

  detailsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    color: "#657287",
    fontSize: "11px",
  },

  nomineeRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "3px",
  },

  shareBadge: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#172b4d",
  },

  shareLabel: {
    fontSize: "10px",
    color: "#8894a6",
  },

  actionButtons: {
    display: "flex",
    gap: "7px",
    marginTop: "8px",
  },

  editButton: {
    border: "1px solid #d8e0eb",
    background: "#ffffff",
    color: "#294365",
    borderRadius: "7px",
    padding: "7px 11px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  deleteButton: {
    border: "1px solid #f0d0d0",
    background: "#fff8f8",
    color: "#b42318",
    borderRadius: "7px",
    padding: "7px 11px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyState: {
    textAlign: "center",
    padding: "45px 20px",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 13px",
    borderRadius: "50%",
    background: "#f0f4fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  emptyTitle: {
    margin: "0",
    fontSize: "17px",
    fontWeight: "800",
  },

  emptyText: {
    maxWidth: "430px",
    margin: "7px auto 18px",
    color: "#7b8799",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  emptyButton: {
    border: "none",
    background: "#172b4d",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "11px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  loadingCard: {
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
    border: "3px solid #dce4ef",
    borderTop: "3px solid #172b4d",
    borderRadius: "50%",
    marginBottom: "12px",
    animation: "spin 1s linear infinite",
  },
};

export default Nominee;