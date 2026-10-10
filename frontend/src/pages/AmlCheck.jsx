import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AmlCheck() {
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

  const [customer, setCustomer] = useState(null);
  const [status, setStatus] = useState("CLEAR");
  const [riskLevel, setRiskLevel] = useState("LOW");
  const [remarks, setRemarks] = useState("");

  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // AUTH HELPER
  // =====================================================

  const getToken = () => localStorage.getItem("token");

  // =====================================================
  // HANDLE AUTH ERROR
  // =====================================================

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // LOAD CUSTOMER
  // =====================================================

  useEffect(() => {
    const loadCustomer = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      try {
        setLoading(true);
        setError("");

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

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load customer details."
          );
        }

        const data = await response.json();

        setCustomer(data);

        localStorage.setItem(
          "customer",
          JSON.stringify(data)
        );

        await loadAmlHistory(data.id);
      } catch (err) {
        console.error(
          "AML Customer Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load customer information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [navigate]);

  // =====================================================
  // LOAD AML HISTORY
  // =====================================================

  const loadAmlHistory = async (customerId) => {
    const token = getToken();

    if (!token) {
      handleAuthError();
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/aml-check/customer/${customerId}`,
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
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load AML history."
        );
      }

      const data = await response.json();

      setChecks(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "AML History Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load AML history."
      );
    }
  };

  // =====================================================
  // RUN AML CHECK
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customer?.id) {
      setError(
        "Customer information is not available."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      handleAuthError();
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const params = new URLSearchParams();

      params.append(
        "customerId",
        customer.id
      );

      params.append(
        "status",
        status
      );

      params.append(
        "riskLevel",
        riskLevel
      );

      if (remarks.trim()) {
        params.append(
          "remarks",
          remarks.trim()
        );
      }

      const response = await fetch(
        `http://localhost:8080/api/aml-check/check?${params.toString()}`,
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
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `AML check failed (${response.status})`
        );
      }

      setMessage(
        "AML check completed successfully."
      );

      setRemarks("");

      await loadAmlHistory(customer.id);
    } catch (err) {
      console.error(
        "AML Check Error:",
        err
      );

      setError(
        err.message ||
          "AML check failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>

        <div className={`aml-loading-page ${darkMode ? "aml-dark" : ""}`}>
          <div className="aml-loading-card">
            <div className="aml-spinner"></div>

            <h2>
              Loading AML Check
            </h2>

            <p>
              Please wait while we securely
              load your AML information.
            </p>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // CUSTOMER LOAD ERROR
  // =====================================================

  if (error && !customer) {
    return (
      <>
        <style>{globalStyles}</style>

        <div className={`aml-loading-page ${darkMode ? "aml-dark" : ""}`}>
          <div className="aml-loading-card">

            <div className="error-circle">
              !
            </div>

            <h2>
              Something went wrong
            </h2>

            <p>
              {error}
            </p>

            <button
              className="primary-button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <style>{globalStyles}</style>

      <div className={`aml-page ${darkMode ? "aml-dark" : ""}`}>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="aml-header">

          <div className="header-left">

            <div className="page-icon">
              ✓
            </div>

            <div>
              <div className="header-label">
                COMPLIANCE
              </div>

              <h1>
                AML Check
              </h1>

              <p>
                Anti-Money Laundering screening
                & compliance
              </p>
            </div>

          </div>

          <div className="header-right">

  <div className="user-box">

    <div className="user-avatar">
      {(customer?.fullName || "C")
        .charAt(0)
        .toUpperCase()}
    </div>

    <div className="user-info">

      <strong>
        {customer?.fullName ||
          "Customer"}
      </strong>

      <span>
        {customer?.accountType ||
          "Savings"}{" "}
        Account
      </span>

    </div>

  </div>

  <button
    className="dashboard-button"
    onClick={() =>
      navigate("/dashboard")
    }
  >
    ← Dashboard
  </button>

</div>

        </header>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="aml-content">

          {/* =================================================
              PAGE TITLE CARD
          ================================================= */}

          <section className="intro-card">

            <div>

              <span className="intro-label">
                CUSTOMER COMPLIANCE
              </span>

              <h2>
                Anti-Money Laundering Check
              </h2>

              <p>
                Perform AML screening and
                securely review compliance
                information for this customer.
              </p>

            </div>

            <div className="secure-badge">
              <span>✓</span>
              Secure Compliance
            </div>

          </section>

          {/* =================================================
              TOP GRID
          ================================================= */}

          <section className="top-grid">

            {/* =================================================
                CUSTOMER DETAILS
            ================================================= */}

            <div className="customer-card">

              <div className="card-top">

                <div>

                  <span className="card-label">
                    CUSTOMER
                  </span>

                  <h3>
                    Customer Details
                  </h3>

                  <p>
                    Logged-in customer
                    information
                  </p>

                </div>

                <div className="customer-card-icon">
                  ◉
                </div>

              </div>

              <div className="customer-info-grid">

                <div className="customer-detail">

                  <span>
                    CUSTOMER ID
                  </span>

                  <strong>
                    {customer?.id || "-"}
                  </strong>

                </div>

                <div className="customer-detail">

                  <span>
                    FULL NAME
                  </span>

                  <strong>
                    {customer?.fullName ||
                      "-"}
                  </strong>

                </div>

                <div className="customer-detail">

                  <span>
                    EMAIL
                  </span>

                  <strong>
                    {customer?.email ||
                      "-"}
                  </strong>

                </div>

                <div className="customer-detail">

                  <span>
                    ACCOUNT STATUS
                  </span>

                  <strong className="active-status">
                    ●{" "}
                    {customer?.status ||
                      "ACTIVE"}
                  </strong>

                </div>

              </div>

            </div>

            {/* =================================================
                AML FORM
            ================================================= */}

            <div className="form-card">

              <div className="card-top">

                <div>

                  <span className="card-label blue">
                    AML SCREENING
                  </span>

                  <h3>
                    Run AML Check
                  </h3>

                  <p>
                    Submit a new compliance
                    screening
                  </p>

                </div>

                <div className="aml-card-icon">
                  ✓
                </div>

              </div>

              <form
                onSubmit={handleSubmit}
                className="aml-form"
              >

                {/* STATUS */}

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                  >

                    <option value="CLEAR">
                      CLEAR
                    </option>

                    <option value="FLAGGED">
                      FLAGGED
                    </option>

                    <option value="PENDING">
                      PENDING
                    </option>

                  </select>

                </div>

                {/* RISK */}

                <div className="form-group">

                  <label>
                    Risk Level
                  </label>

                  <select
                    value={riskLevel}
                    onChange={(e) =>
                      setRiskLevel(
                        e.target.value
                      )
                    }
                  >

                    <option value="LOW">
                      LOW
                    </option>

                    <option value="MEDIUM">
                      MEDIUM
                    </option>

                    <option value="HIGH">
                      HIGH
                    </option>

                  </select>

                </div>

                {/* REMARKS */}

                <div className="form-group">

                  <label>
                    Remarks
                  </label>

                  <textarea
                    value={remarks}
                    onChange={(e) =>
                      setRemarks(
                        e.target.value
                      )
                    }
                    placeholder="Enter AML remarks"
                    rows={4}
                  />

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  className="run-button"
                  disabled={submitting}
                >

                  {submitting
                    ? "Processing..."
                    : "Run AML Check"}

                  <span>
                    →
                  </span>

                </button>

              </form>

              {/* SUCCESS */}

              {message && (
                <div className="success-message">
                  <span>✓</span>
                  {message}
                </div>
              )}

              {/* ERROR */}

              {error && customer && (
                <div className="error-message">
                  <span>!</span>
                  {error}
                </div>
              )}

            </div>

          </section>

          {/* =================================================
              AML HISTORY
          ================================================= */}

          <section className="history-card">

            <div className="history-header">

              <div>

                <span className="card-label">
                  COMPLIANCE HISTORY
                </span>

                <h2>
                  AML Check History
                </h2>

                <p>
                  Previous AML screening
                  records
                </p>

              </div>

              <div className="record-count">
                {checks.length}{" "}
                {checks.length === 1
                  ? "Record"
                  : "Records"}
              </div>

            </div>

            {/* EMPTY */}

            {checks.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ✓
                </div>

                <h3>
                  No AML checks found
                </h3>

                <p>
                  Run your first AML check
                  using the form above.
                </p>

              </div>

            ) : (

              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        STATUS
                      </th>

                      <th>
                        RISK LEVEL
                      </th>

                      <th>
                        REMARKS
                      </th>

                      <th>
                        CHECKED AT
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {checks.map((check) => (

                      <tr
                        key={check.id}
                      >

                        <td className="id-cell">
                          #{check.id}
                        </td>

                        <td>

                          <span
                            className={`status-badge ${
                              check.status ===
                              "CLEAR"
                                ? "clear"
                                : check.status ===
                                  "FLAGGED"
                                ? "flagged"
                                : "pending"
                            }`}
                          >
                            {check.status}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`risk-badge ${
                              check.riskLevel ===
                              "LOW"
                                ? "low"
                                : check.riskLevel ===
                                  "MEDIUM"
                                ? "medium"
                                : "high"
                            }`}
                          >
                            {check.riskLevel}
                          </span>

                        </td>

                        <td className="remarks-cell">
                          {check.remarks ||
                            "-"}
                        </td>

                        <td>
                          {check.checkedAt ||
                            check.createdAt ||
                            "-"}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        </main>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="aml-footer">

          <span>
            © 2026 Avani Bank
          </span>

          <span>
            Secure Banking • Privacy •
            Terms
          </span>

        </footer>

      </div>
    </>
  );
}

// =========================================================
// GLOBAL STYLES
// =========================================================

const globalStyles = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
}

body {
  background: #f5f7fb;
  font-family:
    Inter,
    Arial,
    Helvetica,
    sans-serif;
  color: #172033;
}

button,
input,
select,
textarea {
  font-family: inherit;
}

button {
  transition:
    all 0.2s ease;
}

/* =====================================================
   PAGE
===================================================== */

.aml-page {
  min-height: 100vh;
  width: 100%;
  background: #f5f7fb;
  padding: 25px 32px;
}

/* =====================================================
   HEADER
===================================================== */

.aml-header {
  max-height: 100px;

  border-radius: 20px;

  background:
    linear-gradient(
      135deg,
      #102354 0%,
      #173b8c 58%,
      #2457c6 100%
    );

  color: #ffffff;

  padding: 28px 6%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 30px;

  box-sizing: border-box;

  box-shadow:
    0 10px 30px
    rgba(18, 51, 120, 0.14);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.page-icon {
  width: 46px;
  height: 46px;

  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #eaf2ff;
  color: #2563eb;

  font-size: 20px;
  font-weight: 700;
}

.header-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.7px;
  color: #c7cedf;
}

.aml-header h1 {
  margin: 3px 0 0;
  font-size: 25px;
  line-height: 1.2;
  color: #ffffff;
}

.aml-header p {
  margin: 4px 0 0;
  color: #8993a8;
  font-size: 11px;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 28px;
  flex-shrink: 0;
}

.dashboard-button {
  height: 40px;
  padding: 0 17px;

  border: 1px solid #dce3ee;
  border-radius: 9px;

  background: #ffffff;
  color: #173b8c;

  font-size: 12px;
  font-weight: 600;

  cursor: pointer;
}

.dashboard-button:hover {
  background: #f4f7fc;
  border-color: #bfcce1;
}

.user-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;

  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #4f46e5
    );

  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 15px;
  font-weight: 700;
}

.user-info strong {
  display: block;
  font-size: 13px;
  color: #ffffff;
}

.user-info span {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: #c7d2ea;
}

/* =====================================================
   CONTENT
===================================================== */

.aml-content {
  width: 100%;
  max-width: 1450px;

  margin: 0 auto;

  padding: 32px 48px 45px;
}

/* =====================================================
   INTRO
===================================================== */

.intro-card {
  background: #ffffff;

  border: 1px solid #e8ecf3;
  border-radius: 17px;

  padding: 25px 28px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 25px;

  margin-bottom: 22px;
}

.intro-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #2563eb;
}

.intro-card h2 {
  margin: 6px 0 5px;
  font-size: 22px;
  color: #172033;
}

.intro-card p {
  margin: 0;
  color: #8993a8;
  font-size: 11px;
}

.secure-badge {
  display: flex;
  align-items: center;
  gap: 7px;

  padding: 10px 14px;

  border-radius: 9px;

  background: #eaf9f0;
  color: #15965a;

  font-size: 10px;
  font-weight: 700;

  white-space: nowrap;
}

.secure-badge span {
  font-size: 13px;
}

/* =====================================================
   TOP GRID
===================================================== */

.top-grid {
  display: grid;

  grid-template-columns:
    minmax(300px, 0.9fr)
    minmax(400px, 1.35fr);

  gap: 22px;
}

/* =====================================================
   CUSTOMER CARD
===================================================== */

.customer-card {
  min-height: 385px;

  border-radius: 19px;

  padding: 27px;

  color: white;

  background:
    linear-gradient(
      135deg,
      #102354,
      #173b8c 55%,
      #2457c6
    );

  box-shadow:
    0 15px 35px
    rgba(18, 51, 120, 0.15);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 15px;
}

.card-label {
  display: block;

  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;

  color: #7b88a4;
}

.customer-card .card-label {
  color: #a9b8d6;
}

.card-label.blue {
  color: #2563eb;
}

.card-top h3 {
  margin: 6px 0 4px;

  font-size: 18px;
  line-height: 1.2;
}

.card-top p {
  margin: 0;

  font-size: 10px;
  color: #8993a8;
}

.customer-card .card-top p {
  color: #a9b8d6;
}

.customer-card-icon,
.aml-card-icon {
  width: 43px;
  height: 43px;

  border-radius: 11px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 18px;
}

.customer-card-icon {
  background: rgba(
    255,
    255,
    255,
    0.12
  );
}

.aml-card-icon {
  background: #eaf9f0;
  color: #15965a;
}

.customer-info-grid {
  margin-top: 55px;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 32px 25px;
}

.customer-detail span {
  display: block;

  font-size: 8px;
  letter-spacing: 1px;

  color: #a9b8d6;

  margin-bottom: 7px;
}

.customer-detail strong {
  font-size: 13px;
  color: white;
}

.active-status {
  color: #7ff0b2 !important;
}

/* =====================================================
   FORM CARD
===================================================== */

.form-card {
  background: white;

  border: 1px solid #e8ecf3;

  border-radius: 19px;

  padding: 27px;

  box-shadow:
    0 6px 25px
    rgba(20, 35, 70, 0.05);
}

.aml-form {
  margin-top: 17px;
}

.form-group {
  margin-top: 15px;
}

.form-group label {
  display: block;

  margin-bottom: 7px;

  color: #65728a;

  font-size: 10px;
  font-weight: 600;
}

.form-group select,
.form-group textarea {
  width: 100%;

  border: 1px solid #dfe5ee;

  border-radius: 9px;

  background: white;

  color: #172033;

  outline: none;

  font-size: 12px;
}

.form-group select {
  height: 43px;

  padding: 0 12px;

  cursor: pointer;
}

.form-group textarea {
  min-height: 82px;

  padding: 11px 12px;

  resize: vertical;
}

.form-group select:focus,
.form-group textarea:focus {
  border-color: #2563eb;

  box-shadow:
    0 0 0 3px
    rgba(37, 99, 235, 0.08);
}

.form-group textarea::placeholder {
  color: #a0a8b7;
}

.run-button {
  width: 100%;

  height: 45px;

  margin-top: 17px;

  border: none;
  border-radius: 9px;

  background:
    linear-gradient(
      90deg,
      #173b8c,
      #2563eb
    );

  color: white;

  font-size: 12px;
  font-weight: 700;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 10px;

  cursor: pointer;
}

.run-button:hover {
  transform: translateY(-1px);

  box-shadow:
    0 8px 18px
    rgba(37, 99, 235, 0.22);
}

.run-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* =====================================================
   MESSAGES
===================================================== */

.success-message,
.error-message {
  margin-top: 13px;

  padding: 10px 12px;

  border-radius: 8px;

  font-size: 10px;
  font-weight: 600;

  display: flex;
  align-items: center;
  gap: 7px;
}

.success-message {
  background: #e8f8ef;
  color: #15965a;
}

.error-message {
  background: #fff0f0;
  color: #dc2626;
}

/* =====================================================
   HISTORY
===================================================== */

.history-card {
  margin-top: 22px;

  background: white;

  border: 1px solid #e8ecf3;

  border-radius: 17px;

  padding: 25px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 22px;
}

.history-header h2 {
  margin: 5px 0 4px;

  font-size: 18px;
  color: #172033;
}

.history-header p {
  margin: 0;

  color: #8993a8;

  font-size: 10px;
}

.record-count {
  padding: 8px 12px;

  border-radius: 8px;

  background: #eaf2ff;
  color: #2563eb;

  font-size: 10px;
  font-weight: 700;

  white-space: nowrap;
}

/* =====================================================
   TABLE
===================================================== */

.table-wrapper {
  width: 100%;

  overflow-x: auto;
}

table {
  width: 100%;

  border-collapse: collapse;

  font-size: 11px;
}

thead th {
  padding: 11px 12px;

  text-align: left;

  border-bottom:
    1px solid #e8ecf3;

  color: #7b88a4;

  font-size: 8px;
  letter-spacing: 0.8px;
}

tbody td {
  padding: 13px 12px;

  border-bottom:
    1px solid #f0f2f6;

  color: #58647a;

  vertical-align: middle;
}

tbody tr:last-child td {
  border-bottom: none;
}

.id-cell {
  font-weight: 700;
  color: #173b8c !important;
}

.remarks-cell {
  min-width: 180px;
  max-width: 350px;
}

/* =====================================================
   STATUS BADGES
===================================================== */

.status-badge,
.risk-badge {
  display: inline-block;

  padding: 5px 9px;

  border-radius: 6px;

  font-size: 8px;
  font-weight: 700;
}

.status-badge.clear,
.risk-badge.low {
  background: #e8f8ef;
  color: #15965a;
}

.status-badge.flagged,
.risk-badge.high {
  background: #fff0f0;
  color: #dc2626;
}

.status-badge.pending,
.risk-badge.medium {
  background: #fff4df;
  color: #d97706;
}

/* =====================================================
   EMPTY
===================================================== */

.empty-state {
  text-align: center;

  padding: 45px 20px;
}

.empty-icon {
  width: 50px;
  height: 50px;

  margin:
    0 auto 14px;

  border-radius: 50%;

  background: #eaf9f0;
  color: #15965a;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;
  font-weight: 700;
}

.empty-state h3 {
  margin: 0;

  font-size: 15px;
}

.empty-state p {
  margin-top: 7px;

  color: #8993a8;

  font-size: 10px;
}

/* =====================================================
   FOOTER
===================================================== */

.aml-footer {
  width: 100%;

  padding:
    20px 48px;

  border-top:
    1px solid #e5e9f0;

  background: white;

  display: flex;
  justify-content: space-between;

  gap: 15px;

  color: #8993a8;

  font-size: 9px;
}

/* =====================================================
   LOADING
===================================================== */

.aml-loading-page {
  min-height: 100vh;

  background: #f5f7fb;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
}

.aml-loading-card {
  width: 100%;
  max-width: 420px;

  padding: 35px;

  border-radius: 18px;

  background: white;

  text-align: center;

  box-shadow:
    0 10px 35px
    rgba(20, 35, 70, 0.08);
}

.aml-loading-card h2 {
  margin: 0;

  font-size: 18px;
}

.aml-loading-card p {
  color: #8993a8;

  font-size: 11px;

  line-height: 1.6;
}

.aml-spinner {
  width: 40px;
  height: 40px;

  margin:
    0 auto 18px;

  border:
    4px solid #e5eaf5;

  border-top-color: #2563eb;

  border-radius: 50%;

  animation:
    amlSpin 0.8s linear infinite;
}

@keyframes amlSpin {
  to {
    transform: rotate(360deg);
  }
}

.error-circle {
  width: 50px;
  height: 50px;

  margin:
    0 auto 15px;

  border-radius: 50%;

  background: #fff0f0;

  color: #dc2626;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 22px;
  font-weight: 700;
}

.primary-button {
  margin-top: 15px;

  padding: 10px 20px;

  border: none;
  border-radius: 8px;

  background: #173b8c;

  color: white;

  font-weight: 600;

  cursor: pointer;
}

/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 1000px) {

  .aml-header {
    padding: 18px 25px;
  }

  .aml-content {
    padding:
      25px;
  }

  .top-grid {
    grid-template-columns: 1fr;
  }

  .customer-card {
    min-height: auto;
  }

}

@media (max-width: 700px) {

  .aml-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .intro-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .customer-info-grid {
    grid-template-columns: 1fr;
  }

  .aml-footer {
    padding:
      18px 25px;

    flex-direction: column;
  }

}

@media (max-width: 500px) {

  .aml-header {
    padding: 16px;
  }

  .aml-content {
    padding: 18px 16px 30px;
  }

  .header-right {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .dashboard-button {
    width: 100%;
  }

  .user-box {
    width: 100%;
  }

  .intro-card,
  .customer-card,
  .form-card,
  .history-card {
    padding: 20px;
  }

  .history-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .secure-badge {
    white-space: normal;
  }

}

/* =====================================================
   EXTRA MOBILE REFINEMENTS
   ===================================================== */

@media (max-width: 900px) {
  .aml-page {
    padding: 18px 20px;
  }

  .aml-header {
    gap: 18px;
  }

  .aml-content {
    padding: 24px 0 35px;
  }

  .intro-card {
    padding: 22px;
  }

  .top-grid {
    gap: 18px;
  }

  .customer-card,
  .form-card,
  .history-card {
    border-radius: 16px;
  }
}

@media (max-width: 600px) {
  .aml-page {
    padding: 12px;
  }

  .aml-header {
    width: 100%;
    max-height: none;
    padding: 18px;
    border-radius: 16px;
  }

  .header-left {
    width: 100%;
  }

  .aml-header h1 {
    font-size: 21px;
  }

  .aml-header p {
    line-height: 1.5;
  }

  .header-right {
    width: 100%;
  }

  .user-box {
    min-width: 0;
  }

  .user-info {
    min-width: 0;
  }

  .user-info strong,
  .user-info span {
    overflow-wrap: anywhere;
  }

  .aml-content {
    padding: 18px 0 28px;
  }

  .intro-card,
  .customer-card,
  .form-card,
  .history-card {
    padding: 18px;
  }

  .intro-card h2 {
    font-size: 19px;
    line-height: 1.35;
  }

  .intro-card p {
    line-height: 1.6;
  }

  .card-top h3,
  .history-header h2 {
    font-size: 17px;
  }

  .customer-info-grid {
    margin-top: 32px;
    gap: 20px;
  }

  .customer-detail strong {
    display: block;
    overflow-wrap: anywhere;
    word-break: break-word;
    line-height: 1.45;
  }

  .form-group select,
  .form-group textarea {
    font-size: 13px;
  }

  .run-button {
    min-height: 46px;
  }

  .success-message,
  .error-message {
    align-items: flex-start;
    line-height: 1.5;
  }

  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 8px;
  }

  table {
    min-width: 650px;
  }

  .remarks-cell {
    max-width: 260px;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .aml-footer {
    padding: 18px 0;
    line-height: 1.6;
    text-align: center;
  }
}

@media (max-width: 420px) {
  .aml-header {
    padding: 15px;
  }

  .page-icon {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
  }

  .aml-header h1 {
    font-size: 19px;
  }

  .header-label {
    font-size: 8px;
  }

  .intro-card,
  .customer-card,
  .form-card,
  .history-card {
    padding: 16px;
  }

  .secure-badge {
    width: 100%;
    justify-content: center;
  }

  .customer-card-icon,
  .aml-card-icon {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
  }

  .record-count {
    align-self: stretch;
    text-align: center;
  }

  .empty-state {
    padding: 35px 10px;
  }
}


/* =====================================================
   AVANI GLOBAL DARK MODE
   Dashboard button and blue customer/header cards stay unchanged.
===================================================== */

.aml-page.aml-dark {
  background: #0b1220;
  color: #e8eef7;
}

.aml-page.aml-dark .intro-card,
.aml-page.aml-dark .form-card,
.aml-page.aml-dark .history-card {
  background: #111a2b;
  border-color: #26344b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.aml-page.aml-dark .intro-card h2,
.aml-page.aml-dark .history-header h2,
.aml-page.aml-dark .card-top h3 {
  color: #edf3ff;
}

.aml-page.aml-dark .intro-card p,
.aml-page.aml-dark .history-header p,
.aml-page.aml-dark .card-top p {
  color: #9aa9bd;
}

.aml-page.aml-dark .form-group label {
  color: #b8c4d6;
}

.aml-page.aml-dark .form-group select,
.aml-page.aml-dark .form-group textarea {
  background: #172235;
  border-color: #34445e;
  color: #e8eef7;
  color-scheme: dark;
}

.aml-page.aml-dark .form-group textarea::placeholder {
  color: #71809a;
}

.aml-page.aml-dark .record-count {
  background: #172f63;
  color: #9ebeff;
}

.aml-page.aml-dark .table-wrapper {
  border-color: #26344b;
}

.aml-page.aml-dark thead th {
  background: #172235;
  border-bottom-color: #34445e;
  color: #a8b7cc;
}

.aml-page.aml-dark tbody td {
  border-bottom-color: #26344b;
  color: #c0ccdc;
}

.aml-page.aml-dark tbody tr:hover {
  background: #172235;
}

.aml-page.aml-dark .id-cell {
  color: #9ebeff !important;
}

.aml-page.aml-dark .empty-state {
  background: #172235;
  border: 1px dashed #34445e;
  border-radius: 12px;
}

.aml-page.aml-dark .empty-state h3 {
  color: #dce5f1;
}

.aml-page.aml-dark .empty-state p {
  color: #8795aa;
}

.aml-page.aml-dark .aml-footer {
  background: #111a2b;
  border-top-color: #26344b;
  color: #8795aa;
}

/* Keep the Dashboard button white in both themes. */
.aml-page.aml-dark .dashboard-button {
  background: #ffffff;
  color: #173b8c;
  border-color: #dce3ee;
}

.aml-loading-page.aml-dark {
  background: linear-gradient(135deg, #0b1220, #0e1728);
}

.aml-loading-page.aml-dark .aml-loading-card {
  background: #111a2b;
  color: #edf3ff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.aml-loading-page.aml-dark .aml-loading-card h2 {
  color: #edf3ff;
}

.aml-loading-page.aml-dark .aml-loading-card p {
  color: #8795aa;
}

.aml-loading-page.aml-dark .aml-spinner {
  border-color: #29384e;
  border-top-color: #5b91ff;
}

.aml-loading-page.aml-dark .error-circle {
  background: #351b22;
  color: #ff9da9;
}

`;

export default AmlCheck;