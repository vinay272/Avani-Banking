import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FixedDeposit() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // FORM
  // =========================

  const [form, setForm] = useState({
    accountId: "",
    amount: "",
    interestRate: "7.00",
    tenureMonths: "12",
  });

  // =========================
  // FD PLAN CATALOGUE
  // =========================
  const [fdPlans, setFdPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [showCloseFDForm, setShowCloseFDForm] = useState(false);
  const [closeFDId, setCloseFDId] = useState(null);
  const [closingFD, setClosingFD] = useState(false);

  // =========================
  // TOKEN
  // =========================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================
  // FORMAT CURRENCY
  // =========================

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // =========================
  // FETCH ACCOUNTS + FD
  // =========================

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");
        // =========================
        // FD PLAN CATALOGUE
        // =========================

        const planResponse = await fetch(
          "http://localhost:8080/api/fixed-deposit-plans",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!planResponse.ok) {
          throw new Error("Unable to fetch fixed deposit plans.");
        }
        // if (planResponse.status === 401 || planResponse.status === 403) {
        //   localStorage.removeItem("token");
        //   localStorage.removeItem("customer");
        //   navigate("/login");
        //   return;
        // }

        if (!planResponse.ok) {
          throw new Error("Unable to fetch fixed deposit plans.");
        }

        const planData = await planResponse.json();

        console.log("FD Plans API Response:", planData);

        const planList = Array.isArray(planData) ? planData : [];

        setFdPlans(planList);

        if (planList.length > 0) {
          setForm((previous) => ({
            ...previous,
            interestRate: String(planList[0].interestRate),
            tenureMonths: String(planList[0].tenureMonths),
          }));
        }

        setPlansLoading(false);
        // =========================
        // ACCOUNTS
        // =========================

        const accountResponse = await fetch(
          "http://localhost:8080/api/accounts",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (accountResponse.status === 401 || accountResponse.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!accountResponse.ok) {
          const errorText = await accountResponse.text();

          console.error("ACCOUNT API STATUS:", accountResponse.status);
          console.error("ACCOUNT API ERROR:", errorText);

          throw new Error(
            `Account API Error (${accountResponse.status}): ${
              errorText || "Unknown error"
            }`,
          );
        }

        // if (!accountResponse.ok) {
        //   throw new Error("Unable to fetch account details.");
        // }

        const accountData = await accountResponse.json();

        console.log("Accounts API Response:", accountData);

        const accountList = Array.isArray(accountData) ? accountData : [];

        setAccounts(accountList);

        // Select first account automatically
        if (accountList.length > 0) {
          setForm((previous) => ({
            ...previous,
            accountId: previous.accountId || accountList[0].id,
          }));
        }

        // =========================
        // FIXED DEPOSITS
        // =========================

        const fdResponse = await fetch(
          "http://localhost:8080/api/fixed-deposits",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (fdResponse.status === 401 || fdResponse.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!fdResponse.ok) {
          throw new Error("Unable to fetch fixed deposit details.");
        }

        const fdData = await fdResponse.json();

        console.log("Fixed Deposit API Response:", fdData);

        setFixedDeposits(
          Array.isArray(fdData)
            ? fdData.filter(
                (fd) => String(fd.status || "").toUpperCase() !== "CLOSED",
              )
            : [],
        );
      } catch (err) {
        console.error("Fixed Deposit Error:", err);

        setError(err.message || "Unable to load fixed deposit information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================
  // FD PLAN CHANGE
  // =========================

  const handlePlanChange = (event) => {
    const planCode = event.target.value;

    const selectedPlan = fdPlans.find((plan) => plan.planCode === planCode);

    if (!selectedPlan) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      interestRate: String(selectedPlan.interestRate),
      tenureMonths: String(selectedPlan.tenureMonths),
    }));

    setError("");
    setSuccess("");
  };

  // =========================
  // CALCULATE ESTIMATED MATURITY
  // =========================

  const calculateMaturityAmount = () => {
    const principal = Number(form.amount || 0);
    const rate = Number(form.interestRate || 0);
    const months = Number(form.tenureMonths || 0);

    if (principal <= 0 || rate < 0 || months <= 0) {
      return 0;
    }

    // Simple interest calculation
    const interest = (principal * rate * (months / 12)) / 100;

    return principal + interest;
  };

  const handleCloseFixedDeposit = async () => {
    if (!closeFDId) {
      alert("Fixed Deposit not selected.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to close this Fixed Deposit before maturity?\n\n" +
        "Premature closure will be processed using the applicable reduced interest rate.\n\n" +
        "Do you want to continue?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setClosingFD(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Login session expired. Please login again.");
      }

      const response = await fetch(
        `http://localhost:8080/api/fixed-deposits/${closeFDId}/close`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Fixed Deposit closure failed (${response.status})`,
        );
      }

      alert(
        "Fixed Deposit closed successfully! The closure amount has been credited to your account.",
      );

      setShowCloseFDForm(false);
      setCloseFDId(null);

      // Refresh the page so FD status and account balance are updated
      window.location.reload();
    } catch (error) {
      console.error("Premature FD Closure Error:", error);
      alert(error.message || "Failed to close Fixed Deposit.");
    } finally {
      setClosingFD(false);
    }
  };

  // =========================
  // CREATE FIXED DEPOSIT
  // =========================

  const handleCreateFD = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setSuccess("");

    // =========================
    // VALIDATION
    // =========================

    if (!form.accountId) {
      setError("Please select an account.");
      return;
    }

    const amount = Number(form.amount);
    const interestRate = Number(form.interestRate);
    const tenureMonths = Number(form.tenureMonths);

    const selectedAccount = accounts.find(
      (account) => String(account.id) === String(form.accountId),
    );

    console.log("Selected Account ID:", form.accountId);
    console.log("Selected Account:", selectedAccount);

    if (!amount || amount <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    if (interestRate < 0) {
      setError("Interest rate cannot be negative.");
      return;
    }

    if (!tenureMonths || tenureMonths <= 0) {
      setError("Please enter a valid tenure.");
      return;
    }

    const selectedPlan = fdPlans.find(
      (plan) =>
        String(plan.interestRate) === String(form.interestRate) &&
        String(plan.tenureMonths) === String(form.tenureMonths),
    );

    if (!selectedPlan) {
      setError("Please select a valid Fixed Deposit plan.");
      return;
    }

    if (!selectedAccount) {
      setError("Please select a valid account.");
      return;
    }
    // =========================
    // CONFIRM
    // =========================

    const confirmed = window.confirm(
      `Create Fixed Deposit using "${selectedPlan.planName}"?\n\n` +
        `Amount: ₹${formatCurrency(amount)}\n` +
        `Tenure: ${tenureMonths} months\n` +
        `Interest Rate: ${interestRate}% p.a.\n\n` +
        `Do you want to continue?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setCreating(true);

      // =========================
      // REQUEST
      // =========================

      const params = new URLSearchParams();

      params.append("accountId", form.accountId);
      params.append("amount", amount);
      params.append("interestRate", interestRate);
      params.append("tenureMonths", tenureMonths);

      const response = await fetch(
        `http://localhost:8080/api/fixed-deposits?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // =========================
      // AUTH ERROR
      // =========================

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("customer");
        navigate("/login");
        return;
      }

      // =========================
      // ERROR
      // =========================

      if (!response.ok) {
        let message = "Unable to create fixed deposit. (${response.status})";

        try {
          const data = await response.json();

          console.log("FD CREATE ERROR:", data);

          if (data.message) {
            message = data.message;
          }
        } catch (error) {
          console.error("Error response is not JSON:", error);
        }

        throw new Error(message);
      }

      // =========================
      // CREATED FD
      // =========================

      const createdFD = await response.json();

      console.log("Created Fixed Deposit:", createdFD);

      setFixedDeposits((previous) => [createdFD, ...previous]);

      setSuccess("Fixed Deposit created successfully.");

      // Reset amount
      setForm((previous) => ({
        ...previous,
        amount: "",
      }));
    } catch (err) {
      console.error("Create Fixed Deposit Error:", err);

      setError(err.message || "Unable to create fixed deposit.");
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status) => {
    const normalized = status?.toUpperCase();

    if (normalized === "MATURED") {
      return {
        background: "#eef4ff",
        color: "#2457c6",
      };
    }

    if (normalized === "CLOSED") {
      return {
        background: "#f1f3f5",
        color: "#6b7280",
      };
    }

    return {
      background: "#ecfdf5",
      color: "#14875a",
    };
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>💰</div>

          <h2 style={styles.loadingTitle}>Loading Fixed Deposits</h2>

          <p style={styles.loadingText}>
            Please wait while we fetch your fixed deposit information...
          </p>

          <div style={styles.loader}></div>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div style={styles.page}>
      {/* =========================
          TOP NAVIGATION
      ========================= */}

      <header style={styles.navbar}>
        <div style={styles.brandArea}>
          <div style={styles.brandIcon}>💰</div>

          <div>
            <div style={styles.brandName}>AVANI BANK</div>

            <div style={styles.brandSubtitle}>Fixed Deposit</div>
          </div>
        </div>

        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate("/accounts")}
        >
          ← Back to Accounts
        </button>
      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main style={styles.container}>
        {/* =========================
            HERO
        ========================= */}

        <section style={styles.heroSection}>
          <p style={styles.heroEyebrow}>NEW INVESTMENT</p>

          <h1 style={styles.heroTitle}>Create Fixed Deposit</h1>

          <p style={styles.heroSubtitle}>
            Choose your account, deposit amount and investment period.
          </p>
        </section>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.messageIcon}>⚠</span>

            <span>{error}</span>
          </div>
        )}

        {/* =========================
            SUCCESS
        ========================= */}

        {success && (
          <div style={styles.successBox}>
            <span style={styles.messageIcon}>✓</span>

            <span>{success}</span>
          </div>
        )}

        {/* =========================
            CREATE FD CARD
        ========================= */}

        <section style={styles.createCard}>
          <form onSubmit={handleCreateFD} style={styles.form}>
            {/* =========================
                ACCOUNT
            ========================= */}

            <div style={styles.formGroup}>
              <label style={styles.label}>DEBIT ACCOUNT</label>

              <div style={styles.selectWrapper}>
                <select
                  name="accountId"
                  value={form.accountId}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select Account</option>

                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountType || "Account"} —{" "}
                      {account.accountNumber || "N/A"}
                    </option>
                  ))}
                </select>

                <span style={styles.selectArrow}>▼</span>
              </div>
            </div>

            {/* =========================
                DEPOSIT AMOUNT
            ========================= */}

            <div style={styles.formGroup}>
              <label style={styles.label}>DEPOSIT AMOUNT</label>

              <div style={styles.inputWrapper}>
                <span style={styles.currency}>₹</span>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  style={styles.inputField}
                />
              </div>
            </div>

            {/* FD PLAN */}

            <div style={styles.formGroup}>
              <label style={styles.label}>FIXED DEPOSIT PLAN</label>

              {plansLoading ? (
                <div style={styles.planLoading}>Loading FD plans...</div>
              ) : (
                <select
                  value={
                    fdPlans.find(
                      (plan) =>
                        String(plan.interestRate) ===
                          String(form.interestRate) &&
                        String(plan.tenureMonths) === String(form.tenureMonths),
                    )?.planCode || ""
                  }
                  onChange={handlePlanChange}
                  style={styles.planSelect}
                  disabled={fdPlans.length === 0}
                >
                  <option value="">Select FD Plan</option>

                  {fdPlans.map((plan) => (
                    <option key={plan.planCode} value={plan.planCode}>
                      {plan.planName} — {plan.tenureMonths} Months —{" "}
                      {plan.interestRate}% p.a.
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* =========================
                INTEREST RATE
            ========================= */}

            {/* <div style={styles.formGroup}>
              <label style={styles.label}>INTEREST RATE (% PER ANNUM)</label>

              <div style={styles.inputWrapper}>
                <input
                  type="number"
                  name="interestRate"
                  value={form.interestRate}
                  onChange={handleChange}
                  placeholder="Interest rate"
                  min="0"
                  step="0.01"
                  style={styles.inputField}
                />

                <span style={styles.inputSuffix}>%</span>
              </div>
            </div> */}

            {/* =========================
                TENURE
            ========================= */}

            {/* <div style={styles.formGroup}>
              <label style={styles.label}>TENURE</label>

              <div style={styles.inputWrapper}>
                <input
                  type="number"
                  name="tenureMonths"
                  value={form.tenureMonths}
                  onChange={handleChange}
                  placeholder="Months"
                  min="1"
                  style={styles.inputField}
                />

                <span style={styles.monthSuffix}>Months</span>
              </div>
            </div>  */}

            {/* SELECTED PLAN DETAILS */}

            <div style={styles.formGroup}>
              <label style={styles.label}>SELECTED PLAN DETAILS</label>

              <div style={styles.planDetailsBox}>
                {(() => {
                  const selectedPlan = fdPlans.find(
                    (plan) =>
                      String(plan.interestRate) === String(form.interestRate) &&
                      String(plan.tenureMonths) === String(form.tenureMonths),
                  );

                  if (!selectedPlan) {
                    return (
                      <span style={styles.planPlaceholder}>
                        Select an FD plan
                      </span>
                    );
                  }

                  return (
                    <div>
                      <div style={styles.planSelectedName}>
                        {selectedPlan.planName}
                      </div>

                      <div style={styles.planMeta}>
                        {selectedPlan.tenureMonths} Months
                        {" • "}
                        {selectedPlan.interestRate}% p.a.
                      </div>

                      <div style={styles.planDescription}>
                        {selectedPlan.description}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* =========================
                ESTIMATED MATURITY
            ========================= */}

            <div style={styles.estimateCard}>
              <div>
                <p style={styles.estimateLabel}>ESTIMATED MATURITY AMOUNT</p>

                <h2 style={styles.estimateAmount}>
                  ₹{formatCurrency(calculateMaturityAmount())}
                </h2>
              </div>

              <div style={styles.estimateIcon}>💰</div>
            </div>

            {/* =========================
                CREATE BUTTON
            ========================= */}

            <button
              type="submit"
              disabled={creating}
              style={
                creating ? styles.createButtonDisabled : styles.createButton
              }
            >
              {creating
                ? "Creating Fixed Deposit..."
                : "Create Fixed Deposit →"}
            </button>
          </form>
        </section>

        {/* =========================
            MY FIXED DEPOSITS
        ========================= */}

        <section style={styles.myFdSection}>
          <div style={styles.myFdHeader}>
            <div>
              <p style={styles.sectionEyebrow}>MY INVESTMENTS</p>

              <h2 style={styles.sectionTitle}>My Fixed Deposits</h2>

              <p style={styles.sectionDescription}>
                View your active and previous fixed deposits.
              </p>
            </div>

            <div style={styles.fdCount}>
              {fixedDeposits.length} FD
              {fixedDeposits.length !== 1 ? "s" : ""}
            </div>
          </div>

          {fixedDeposits.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>💰</div>

              <h3 style={styles.emptyTitle}>No Fixed Deposit Found</h3>

              <p style={styles.emptyText}>
                You have not created any fixed deposit yet.
              </p>
            </div>
          ) : (
            <div style={styles.fdGrid}>
              {fixedDeposits.map((fd) => {
                const statusStyle = getStatusStyle(fd.status);

                return (
                  <div key={fd.id} style={styles.fdCard}>
                    {/* TOP */}

                    <div style={styles.fdTop}>
                      <div style={styles.fdIcon}>💰</div>

                      <div style={styles.fdTopText}>
                        <p style={styles.accountLabel}>FIXED DEPOSIT</p>

                        <h3 style={styles.fdId}>FD #{fd.id}</h3>
                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...statusStyle,
                        }}
                      >
                        ● {fd.status || "ACTIVE"}
                      </span>
                    </div>

                    {String(fd.status).toUpperCase() === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => {
                          alert("Premature Close button clicked!");
                          setCloseFDId(fd.id);
                          setShowCloseFDForm(true);
                        }}
                        style={styles.closeFDButton}
                      >
                        🔒 Premature Close
                      </button>
                    )}

                    {/* PRINCIPAL */}

                    <div style={styles.fdAmountBox}>
                      <p style={styles.accountLabel}>PRINCIPAL AMOUNT</p>

                      <h2 style={styles.fdAmount}>
                        ₹{formatCurrency(fd.principalAmount)}
                      </h2>
                    </div>

                    {/* DETAILS */}

                    <div style={styles.detailsGrid}>
                      <div>
                        <p style={styles.detailLabel}>INTEREST RATE</p>

                        <p style={styles.detailValue}>
                          {fd.interestRate ?? 0}%
                        </p>
                      </div>

                      <div>
                        <p style={styles.detailLabel}>TENURE</p>

                        <p style={styles.detailValue}>
                          {fd.tenureMonths ?? 0} Months
                        </p>
                      </div>

                      <div>
                        <p style={styles.detailLabel}>CREATED</p>

                        <p style={styles.detailValue}>
                          {formatDate(fd.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p style={styles.detailLabel}>MATURITY</p>

                        <p style={styles.detailValue}>
                          {formatDate(fd.maturityDate)}
                        </p>
                      </div>
                    </div>

                    {/* MATURITY */}

                    <div style={styles.maturityBox}>
                      <p style={styles.detailLabel}>MATURITY AMOUNT</p>

                      <p style={styles.maturityAmount}>
                        ₹{formatCurrency(fd.maturityAmount)}
                      </p>
                    </div>
                    {showCloseFDForm && (
                      <div style={styles.closeModalOverlay}>
                        <div style={styles.closeModal}>
                          <div style={styles.closeModalTitle}>
                            🔒 Premature FD Closure
                          </div>

                          <div style={styles.closeModalText}>
                            Are you sure you want to close this Fixed Deposit
                            before its maturity date?
                          </div>

                          <div style={styles.closeModalWarning}>
                            ⚠️ Premature closure will use the applicable reduced
                            interest rate.
                          </div>

                          <div style={styles.closeModalActions}>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCloseFDForm(false);
                                setCloseFDId(null);
                              }}
                              style={styles.closeCancelButton}
                              disabled={closingFD}
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={handleCloseFixedDeposit}
                              style={styles.closeConfirmButton}
                              disabled={closingFD}
                            >
                              {closingFD ? "Closing..." : "Confirm Closure"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer style={styles.footer}>
        <div>© {new Date().getFullYear()} Avani Bank</div>

        <div>Secure • Reliable • Digital Banking</div>
      </footer>
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  // =========================
  // PAGE
  // =========================

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
  },

  // =========================
  // NAVBAR
  // =========================

  navbar: {
    minHeight: "72px",
    background: "linear-gradient(135deg, #173b8c, #2866cf)",
    borderBottom: "none",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxSizing: "border-box",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  brandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.16)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  brandName: {
    fontSize: "15px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#ffffff",
  },

  brandSubtitle: {
    marginTop: "2px",
    fontSize: "10px",
    color: "rgba(255,255,255,0.75)",
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "9px 15px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // =========================
  // MAIN CONTAINER
  // =========================

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "55px 24px 70px",
    boxSizing: "border-box",
  },

  // =========================
  // HERO
  // =========================

  heroSection: {
    textAlign: "center",
    marginBottom: "32px",
  },

  heroEyebrow: {
    margin: 0,
    color: "#5574b4",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "2.2px",
  },

  heroTitle: {
    margin: "18px 0 14px",
    color: "#102450",
    fontSize: "34px",
    lineHeight: "1.2",
    fontWeight: "500",
    letterSpacing: "-0.7px",
  },

  heroSubtitle: {
    margin: 0,
    color: "#8993a8",
    fontSize: "15px",
    lineHeight: "1.6",
  },

  // =========================
  // MESSAGES
  // =========================

  errorBox: {
    maxWidth: "950px",
    margin: "0 auto 18px",
    padding: "13px 16px",
    background: "#fff1f1",
    border: "1px solid #f3cccc",
    borderRadius: "10px",
    color: "#c93636",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxSizing: "border-box",
  },

  successBox: {
    maxWidth: "950px",
    margin: "0 auto 18px",
    padding: "13px 16px",
    background: "#ecfdf5",
    border: "1px solid #bfe6d5",
    borderRadius: "10px",
    color: "#14875a",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxSizing: "border-box",
  },

  messageIcon: {
    fontWeight: "900",
    fontSize: "14px",
  },

  // =========================
  // CREATE CARD
  // =========================

  createCard: {
    width: "100%",
    maxWidth: "1050px",
    margin: "0 auto",
    background: "#ffffff",
    border: "1px solid #e3e8f1",
    borderRadius: "22px",
    padding: "38px",
    boxShadow: "0 12px 35px rgba(24,43,83,0.06)",
    boxSizing: "border-box",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    columnGap: "26px",
    rowGap: "30px",
  },

  // =========================
  // FORM GROUP
  // =========================

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: 0,
  },

  label: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#8a96aa",
    letterSpacing: "1.5px",
    textAlign: "center",
  },

  // =========================
  // SELECT
  // =========================

  selectWrapper: {
    position: "relative",
    width: "100%",
    height: "60px",
  },

  select: {
    width: "100%",
    height: "60px",
    border: "1px solid #dce4ef",
    borderRadius: "14px",
    padding: "0 48px 0 25px",
    fontSize: "15px",
    color: "#24395f",
    background: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    appearance: "none",
    cursor: "pointer",
  },

  selectArrow: {
    position: "absolute",
    right: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#193f88",
    fontSize: "14px",
    pointerEvents: "none",
  },

  // =========================
  // INPUT WRAPPER
  // =========================

  inputWrapper: {
    width: "100%",
    height: "60px",
    border: "1px solid #dce4ef",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  currency: {
    padding: "0 16px 0 22px",
    color: "#1e57ba",
    fontWeight: "800",
    fontSize: "21px",
    flexShrink: 0,
  },

  inputField: {
    flex: 1,
    width: "10%",
    height: "100%",
    border: "none",
    outline: "none",
    padding: "0 8px",
    fontSize: "15px",
    color: "#253657",
    background: "#ffffff",
    minWidth: 0,
    boxSizing: "border-box",
  },

  inputSuffix: {
    height: "100%",
    minWidth: "52px",
    padding: "0 14px",
    borderLeft: "1px solid #e1e7f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e57ba",
    fontWeight: "800",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  monthSuffix: {
    height: "100%",
    minWidth: "90px",
    padding: "0 14px",
    borderLeft: "1px solid #e1e7f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8993a8",
    fontWeight: "700",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  // =========================
  // ESTIMATE
  // =========================

  estimateCard: {
    gridColumn: "1 / -1",
    minHeight: "120px",
    background: "linear-gradient(135deg, #f2f6ff, #edf3ff)",
    border: "1px solid #d9e5fc",
    borderRadius: "18px",
    padding: "22px 26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
  },

  estimateLabel: {
    margin: 0,
    fontSize: "11px",
    color: "#7483a0",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  estimateAmount: {
    margin: "10px 0 0",
    fontSize: "34px",
    lineHeight: "1",
    color: "#174696",
    fontWeight: "500",
  },

  estimateIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "18px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    boxShadow: "0 5px 18px rgba(30,63,125,0.06)",
    flexShrink: 0,
  },

  // =========================
  // CREATE BUTTON
  // =========================

  createButton: {
    gridColumn: "1 / -1",
    height: "66px",
    border: "none",
    background: "linear-gradient(135deg, #173b8c, #2866cf)",
    color: "#ffffff",
    borderRadius: "17px",
    padding: "0 20px",
    fontSize: "17px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(32,86,181,0.16)",
  },

  createButtonDisabled: {
    gridColumn: "1 / -1",
    height: "66px",
    border: "none",
    background: "#aeb9ca",
    color: "#ffffff",
    borderRadius: "17px",
    padding: "0 20px",
    fontSize: "17px",
    fontWeight: "800",
    cursor: "not-allowed",
  },

  // =========================
  // MY FD
  // =========================

  myFdSection: {
    width: "100%",
    maxWidth: "none",
    margin: "65px auto 0",
  },

  myFdHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "20px",
  },

  sectionEyebrow: {
    margin: 0,
    color: "#5574b4",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  sectionTitle: {
    margin: "7px 0 5px",
    fontSize: "24px",
    color: "#17233f",
    fontWeight: "600",
  },

  sectionDescription: {
    margin: 0,
    color: "#8993a8",
    fontSize: "12px",
  },

  fdCount: {
    background: "#eef3ff",
    color: "#355db2",
    padding: "10px 15px",
    borderRadius: "18px",
    fontSize: "11px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  closeFDButton: {
    width: "100%",
    marginTop: "8px",
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#fff1f2",
    color: "#b42318",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
  },

  // =========================
  // FD GRID
  // =========================

  fdGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  fdCard: {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #e5e9f1",
    borderRadius: "18px",
    padding: "21px",
    boxShadow: "0 7px 24px rgba(24,43,83,0.045)",
    boxSizing: "border-box",
  },

  fdTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  fdIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#fff8e7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    flexShrink: 0,
  },

  fdTopText: {
    flex: 1,
    minWidth: 0,
  },

  accountLabel: {
    margin: 0,
    color: "#929bad",
    fontSize: "8px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  fdId: {
    margin: "4px 0 0",
    fontSize: "15px",
    color: "#1c2947",
  },

  statusBadge: {
    padding: "6px 9px",
    borderRadius: "14px",
    fontSize: "8px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  fdAmountBox: {
    marginTop: "20px",
    padding: "18px",
    background: "#f7f9fc",
    borderRadius: "14px",
    textAlign: "center",
  },

  fdAmount: {
    margin: "5px 0 0",
    fontSize: "23px",
    color: "#182440",
  },

  detailsGrid: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },

  detailLabel: {
    margin: 0,
    color: "#929bad",
    fontSize: "8px",
    fontWeight: "800",
    letterSpacing: "0.8px",
  },

  detailValue: {
    margin: "5px 0 0",
    color: "#263653",
    fontSize: "11px",
    fontWeight: "700",
  },

  maturityBox: {
    marginTop: "18px",
    padding: "16px",
    background: "#ecfdf5",
    border: "1px solid #d5f1e4",
    borderRadius: "14px",
    textAlign: "center",
  },

  maturityAmount: {
    margin: "5px 0 0",
    fontSize: "18px",
    fontWeight: "800",
    color: "#14875a",
  },

  // =========================
  // EMPTY
  // =========================

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e5e9f1",
    borderRadius: "18px",
    minHeight: "230px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "25px",
    boxSizing: "border-box",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "15px",
    background: "#fff8e7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  emptyTitle: {
    margin: "13px 0 5px",
    fontSize: "16px",
    color: "#25314d",
  },

  emptyText: {
    margin: 0,
    color: "#929bad",
    fontSize: "11px",
  },

  // =========================
  // FOOTER
  // =========================

  footer: {
    borderTop: "1px solid #e5e9f0",
    background: "#ffffff",
    padding: "20px 6%",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    color: "#939baa",
    fontSize: "9px",
    boxSizing: "border-box",
  },

  // =========================
  // LOADING
  // =========================

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
    borderRadius: "20px",
    padding: "35px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(25,45,85,0.08)",
    boxSizing: "border-box",
  },

  loadingIcon: {
    fontSize: "42px",
  },

  loadingTitle: {
    margin: "15px 0 6px",
    fontSize: "18px",
    color: "#1c2947",
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
    animation: "spin 0.8s linear infinite",
  },

  planLoading: {
    width: "100%",
    height: "43px",
    border: "1px solid #dfe5ef",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    fontSize: "11px",
    color: "#8993a8",
    background: "#f8fafc",
    boxSizing: "border-box",
  },

  planSelect: {
    width: "100%",
    height: "43px",
    padding: "0 42px 0 14px",
    border: "1px solid #dce6fb",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#173b8c",
    fontSize: "12px",
    fontWeight: "700",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",

    backgroundImage:
      "linear-gradient(45deg, transparent 50%, #2457a6 50%), linear-gradient(135deg, #2457a6 50%, transparent 50%)",
    backgroundPosition: "calc(100% - 18px) 18px, calc(100% - 12px) 18px",
    backgroundSize: "6px 6px, 6px 6px",
    backgroundRepeat: "no-repeat",

    transition: "all 0.2s ease",
  },

  planDetailsBox: {
    width: "100%",
    minHeight: "43px",
    border: "1px solid #dce6fb",
    borderRadius: "9px",
    padding: "9px 12px",
    background: "#f3f7ff",
    boxSizing: "border-box",
  },

  planPlaceholder: {
    fontSize: "11px",
    color: "#8993a8",
  },

  planSelectedName: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#173b8c",
  },

  planMeta: {
    marginTop: "3px",
    fontSize: "10px",
    fontWeight: "700",
    color: "#5572af",
  },

  planDescription: {
    marginTop: "4px",
    fontSize: "9px",
    color: "#8993a8",
    lineHeight: "1.4",
  },

  closeModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
    boxSizing: "border-box",
  },

  closeModal: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "22px",
    boxSizing: "border-box",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.18)",
  },

  closeModalTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "12px",
  },

  closeModalText: {
    fontSize: "12px",
    lineHeight: "1.6",
    color: "#4b5563",
    marginBottom: "12px",
  },

  closeModalWarning: {
    padding: "11px 12px",
    borderRadius: "9px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    fontSize: "11px",
    lineHeight: "1.5",
    marginBottom: "20px",
  },

  closeModalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },

  closeCancelButton: {
    padding: "10px 16px",
    border: "1px solid #d9dee8",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#4b5563",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  closeConfirmButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#b42318",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default FixedDeposit;
