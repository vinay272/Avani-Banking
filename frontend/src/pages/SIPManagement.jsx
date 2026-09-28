import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";

function SIPManagement() {
  const [accounts, setAccounts] = useState([]);
  const [sips, setSips] = useState([]);

  const [form, setForm] = useState({
    accountId: "",
    monthlyAmount: "",
    expectedReturnRate: "12",
    tenureMonths: "12",
    startDate: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => localStorage.getItem("token");

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [accountResponse, sipResponse] = await Promise.all([
        fetch(`${API_BASE}/api/accounts`, {
          method: "GET",
          headers,
        }),
        fetch(`${API_BASE}/api/sips`, {
          method: "GET",
          headers,
        }),
      ]);

      if (
        accountResponse.status === 401 ||
        accountResponse.status === 403 ||
        sipResponse.status === 401 ||
        sipResponse.status === 403
      ) {
        throw new Error("Session expired. Please login again.");
      }

      if (!accountResponse.ok) {
        throw new Error("Unable to load accounts.");
      }

      if (!sipResponse.ok) {
        throw new Error("Unable to load SIPs.");
      }

      const accountData = await accountResponse.json();
      const sipData = await sipResponse.json();

      setAccounts(Array.isArray(accountData) ? accountData : []);

      setSips(Array.isArray(sipData) ? sipData : []);
    } catch (err) {
      console.error("SIP Management Error:", err);
      setError(err.message || "Unable to load SIP information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedAccount = useMemo(() => {
    return accounts.find(
      (account) => String(account.id) === String(form.accountId),
    );
  }, [accounts, form.accountId]);

  const projectedCalculation = useMemo(() => {
    const monthly = Number(form.monthlyAmount || 0);
    const annualRate = Number(form.expectedReturnRate || 0);
    const months = Number(form.tenureMonths || 0);

    if (monthly <= 0 || annualRate < 0 || months <= 0) {
      return {
        invested: 0,
        value: 0,
        profit: 0,
      };
    }

    const monthlyRate = annualRate / 1200;

    let value = 0;

    if (monthlyRate === 0) {
      value = monthly * months;
    } else {
      value =
        monthly *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);
    }

    const invested = monthly * months;

    return {
      invested,
      value,
      profit: value - invested,
    };
  }, [form.monthlyAmount, form.expectedReturnRate, form.tenureMonths]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleCreateSIP = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const monthlyAmount = Number(form.monthlyAmount);

    const expectedReturnRate = Number(form.expectedReturnRate);

    const tenureMonths = Number(form.tenureMonths);

    if (!form.accountId) {
      setError("Please select an account.");
      return;
    }

    if (!monthlyAmount || monthlyAmount <= 0) {
      setError("Monthly SIP amount must be greater than zero.");
      return;
    }

    if (expectedReturnRate < 0) {
      setError("Expected return rate cannot be negative.");
      return;
    }

    if (!tenureMonths || tenureMonths <= 0) {
      setError("SIP tenure must be greater than zero.");
      return;
    }

    if (!form.startDate) {
      setError("Please select a start date.");
      return;
    }

    setCreating(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const params = new URLSearchParams();

      params.append("accountId", form.accountId);

      params.append("monthlyAmount", monthlyAmount);

      params.append("expectedReturnRate", expectedReturnRate);

      params.append("tenureMonths", tenureMonths);

      params.append("startDate", form.startDate);

      const response = await fetch(
        `${API_BASE}/api/sips?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Unable to create SIP.");
      }

      setSuccess("SIP created successfully.");

      setForm({
        accountId: "",
        monthlyAmount: "",
        expectedReturnRate: "12",
        tenureMonths: "12",
        startDate: new Date().toISOString().split("T")[0],
      });

      await fetchData();
    } catch (err) {
      console.error("Create SIP Error:", err);

      setError(err.message || "Unable to create SIP.");
    } finally {
      setCreating(false);
    }
  };

  const handleSIPAction = async (sipId, action) => {
    setError("");
    setSuccess("");
    setActionId(sipId);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(`${API_BASE}/api/sips/${sipId}/${action}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(data?.message || `Unable to ${action} SIP.`);
      }

      const messages = {
        pause: "SIP paused successfully.",
        resume: "SIP resumed successfully.",
        cancel: "SIP cancelled successfully.",
      };

      setSuccess(messages[action] || "SIP updated successfully.");

      await fetchData();
    } catch (err) {
      console.error("SIP Action Error:", err);

      setError(err.message || "Unable to update SIP.");
    } finally {
      setActionId(null);
    }
  };

  const confirmCancel = (sipId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this SIP?",
    );

    if (!confirmed) {
      return;
    }

    handleSIPAction(sipId, "cancel");
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "ACTIVE") {
      return {
        background: "#ecfdf3",
        color: "#087443",
      };
    }

    if (normalized === "PAUSED") {
      return {
        background: "#fff7ed",
        color: "#c2410c",
      };
    }

    if (normalized === "MATURED") {
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
      };
    }

    if (normalized === "CANCELLED") {
      return {
        background: "#fff1f2",
        color: "#b42318",
      };
    }

    return {
      background: "#f2f4f7",
      color: "#667085",
    };
  };

  const activeSIPs = sips.filter(
    (sip) => String(sip.status).toUpperCase() === "ACTIVE",
  );

  const totalInvested = sips.reduce(
    (total, sip) => total + Number(sip.totalInvested || 0),
    0,
  );

  const totalProjectedValue = sips.reduce(
    (total, sip) => total + Number(sip.projectedValue || 0),
    0,
  );

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>🔄</div>

          <div style={styles.loadingTitle}>Loading SIP Management...</div>

          <div style={styles.loadingText}>Fetching your SIP information.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* =========================
    HEADER
========================= */}

        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>🔄</div>

            <div>
              <div style={styles.title}>SIP Management</div>

              <div style={styles.subtitle}>
                Start and manage your systematic investment plans.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/investments";
            }}
            style={styles.backButton}
          >
            ← Investment Page
          </button>
        </div>

        {/* =========================
            ALERTS
        ========================= */}

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {success && <div style={styles.successBox}>✅ {success}</div>}

        {/* =========================
            SUMMARY
        ========================= */}

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total SIPs</div>

            <div style={styles.summaryValue}>{sips.length}</div>

            <div style={styles.summaryHint}>All SIP plans</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Active SIPs</div>

            <div style={styles.summaryValue}>{activeSIPs.length}</div>

            <div style={styles.summaryHint}>Currently running</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total Invested</div>

            <div style={styles.summaryValue}>
              {formatCurrency(totalInvested)}
            </div>

            <div style={styles.summaryHint}>Actual SIP installments</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Projected Value</div>

            <div style={styles.summaryValue}>
              {formatCurrency(totalProjectedValue)}
            </div>

            <div style={styles.summaryHint}>Based on expected returns</div>
          </div>
        </div>

        {/* =========================
            CREATE SIP
        ========================= */}

        <div style={styles.sectionTitle}>Start New SIP</div>

        <div style={styles.createCard}>
          <form onSubmit={handleCreateSIP}>
            <div style={styles.formGrid}>
              {/* ACCOUNT */}

              <div style={styles.field}>
                <label style={styles.label}>Debit Account</label>

                <select
                  name="accountId"
                  value={form.accountId}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Select Account</option>

                  {accounts
                    .filter(
                      (account) =>
                        String(account.status).toUpperCase() === "ACTIVE",
                    )
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountNumber}
                        {" — "}
                        {formatCurrency(account.balance)}
                      </option>
                    ))}
                </select>
              </div>

              {/* MONTHLY AMOUNT */}

              <div style={styles.field}>
                <label style={styles.label}>Monthly SIP Amount</label>

                <input
                  type="number"
                  name="monthlyAmount"
                  value={form.monthlyAmount}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  min="1"
                  step="0.01"
                  style={styles.input}
                />
              </div>

              {/* EXPECTED RETURN */}

              <div style={styles.field}>
                <label style={styles.label}>Expected Annual Return (%)</label>

                <input
                  type="number"
                  name="expectedReturnRate"
                  value={form.expectedReturnRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  style={styles.input}
                />
              </div>

              {/* TENURE */}

              <div style={styles.field}>
                <label style={styles.label}>Tenure (Months)</label>

                <input
                  type="number"
                  name="tenureMonths"
                  value={form.tenureMonths}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  style={styles.input}
                />
              </div>

              {/* START DATE */}

              <div style={styles.field}>
                <label style={styles.label}>Start Date</label>

                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  style={styles.input}
                />
              </div>

              {/* FREQUENCY */}

              <div style={styles.field}>
                <label style={styles.label}>Frequency</label>

                <input
                  type="text"
                  value="MONTHLY"
                  disabled
                  style={{
                    ...styles.input,
                    background: "#f8fafc",
                    color: "#667085",
                  }}
                />
              </div>
            </div>

            {/* ACCOUNT INFO */}

            {selectedAccount && (
              <div style={styles.accountInfo}>
                <div>
                  <span>Account</span>

                  <strong>{selectedAccount.accountNumber}</strong>
                </div>

                <div>
                  <span>Available Balance</span>

                  <strong>{formatCurrency(selectedAccount.balance)}</strong>
                </div>
              </div>
            )}

            {/* PROJECTION */}

            <div style={styles.projectionBox}>
              <div style={styles.projectionTitle}>📈 SIP Projection</div>

              <div style={styles.projectionGrid}>
                <div>
                  <span style={styles.projectionLabel}>Total Investment</span>

                  <strong style={styles.projectionValue}>
                    {formatCurrency(projectedCalculation.invested)}
                  </strong>
                </div>

                <div>
                  <span style={styles.projectionLabel}>Projected Value</span>

                  <strong style={styles.projectionValue}>
                    {formatCurrency(projectedCalculation.value)}
                  </strong>
                </div>

                <div>
                  <span style={styles.projectionLabel}>Projected Profit</span>

                  <strong
                    style={{
                      ...styles.projectionValue,
                      color: "#087443",
                    }}
                  >
                    {formatCurrency(projectedCalculation.profit)}
                  </strong>
                </div>
              </div>

              <div style={styles.projectionNote}>
                Projection is an estimate based on the selected expected annual
                return. Actual market-linked returns may vary.
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              style={{
                ...styles.createButton,
                opacity: creating ? 0.7 : 1,
              }}
            >
              {creating ? "Creating SIP..." : "Start SIP"}
            </button>
          </form>
        </div>

        {/* =========================
            SIP LIST
        ========================= */}

        <div style={styles.listHeader}>
          <div>
            <div style={styles.sectionTitle}>My SIPs</div>

            <div style={styles.sectionSubtitle}>
              View and manage your SIP investments.
            </div>
          </div>
        </div>

        {sips.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>🔄</div>

            <div style={styles.emptyTitle}>No SIPs Found</div>

            <div style={styles.emptyText}>
              Start your first SIP using the form above.
            </div>
          </div>
        ) : (
          <div style={styles.sipGrid}>
            {sips.map((sip) => {
              const statusStyle = getStatusStyle(sip.status);

              const isProcessing = actionId === sip.id;

              return (
                <div key={sip.id} style={styles.sipCard}>
                  <div style={styles.sipCardHeader}>
                    <div>
                      <div style={styles.sipTitle}>SIP #{sip.id}</div>

                      <div style={styles.sipAccount}>
                        Account: {sip.accountNumber || "N/A"}
                      </div>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        background: statusStyle.background,
                        color: statusStyle.color,
                      }}
                    >
                      {sip.status}
                    </span>
                  </div>

                  <div style={styles.sipAmount}>
                    {formatCurrency(sip.monthlyAmount)}

                    <span>/ month</span>
                  </div>

                  <div style={styles.detailsGrid}>
                    <div>
                      <span>Expected Return</span>

                      <strong>
                        {Number(sip.expectedReturnRate || 0).toFixed(2)}%
                      </strong>
                    </div>

                    <div>
                      <span>Tenure</span>

                      <strong>{sip.tenureMonths} months</strong>
                    </div>

                    <div>
                      <span>Installments Paid</span>

                      <strong>{sip.installmentsPaid}</strong>
                    </div>

                    <div>
                      <span>Total Invested</span>

                      <strong>{formatCurrency(sip.totalInvested)}</strong>
                    </div>

                    <div>
                      <span>Projected Value</span>

                      <strong>{formatCurrency(sip.projectedValue)}</strong>
                    </div>

                    <div>
                      <span>Projected Profit</span>

                      <strong
                        style={{
                          color: "#087443",
                        }}
                      >
                        {formatCurrency(sip.projectedProfit)}
                      </strong>
                    </div>

                    <div>
                      <span>Start Date</span>

                      <strong>{sip.startDate || "N/A"}</strong>
                    </div>

                    <div>
                      <span>Next Installment</span>

                      <strong>{sip.nextInstallmentDate || "N/A"}</strong>
                    </div>

                    <div>
                      <span>Maturity Date</span>

                      <strong>{sip.maturityDate || "N/A"}</strong>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  {String(sip.status).toUpperCase() === "ACTIVE" && (
                    <div style={styles.actionRow}>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleSIPAction(sip.id, "pause")}
                        style={styles.pauseButton}
                      >
                        {isProcessing ? "Processing..." : "⏸ Pause"}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => confirmCancel(sip.id)}
                        style={styles.cancelButton}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}

                  {String(sip.status).toUpperCase() === "PAUSED" && (
                    <div style={styles.actionRow}>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleSIPAction(sip.id, "resume")}
                        style={styles.resumeButton}
                      >
                        {isProcessing ? "Processing..." : "▶ Resume"}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => confirmCancel(sip.id)}
                        style={styles.cancelButton}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "30px 20px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "25px",
  background: "linear-gradient(135deg, #0757b8, #0878e8)",
  borderRadius: "16px",
  padding: "20px 22px",
  boxSizing: "border-box",
  boxShadow: "0 8px 24px rgba(7, 87, 184, 0.18)",
},

  headerLeft: {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  minWidth: 0,
},

  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: "5px",
  },

  subtitle: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.88)",
  },

  headerIcon: {
  width: "48px",
  height: "48px",
  flexShrink: 0,
  borderRadius: "13px",
  background: "rgba(255, 255, 255, 0.16)",
  border: "1px solid rgba(255, 255, 255, 0.28)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "23px",
},

  backButton: {
  flexShrink: 0,
  border: "1px solid rgba(255, 255, 255, 0.65)",
  borderRadius: "9px",
  padding: "10px 15px",
  background: "rgba(255, 255, 255, 0.08)",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "800",
  cursor: "pointer",
},   

  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#b42318",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    marginBottom: "12px",
  },

  successBox: {
    background: "#ecfdf3",
    border: "1px solid #a7f3d0",
    color: "#087443",
    padding: "12px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    marginBottom: "12px",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "480px",
    margin: "120px auto",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "35px",
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
  },

  loadingIcon: {
    fontSize: "40px",
    marginBottom: "15px",
  },

  loadingTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "7px",
  },

  loadingText: {
    fontSize: "12px",
    color: "#667085",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "15px",
    marginBottom: "32px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    padding: "19px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },

  summaryLabel: {
    fontSize: "11px",
    color: "#667085",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    marginBottom: "9px",
  },

  summaryValue: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "6px",
  },

  summaryHint: {
    fontSize: "10px",
    color: "#667085",
  },

  sectionTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "5px",
  },

  sectionSubtitle: {
    fontSize: "11px",
    color: "#667085",
  },

  createCard: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    padding: "20px",
    marginTop: "14px",
    marginBottom: "32px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#344054",
  },

  input: {
    width: "100%",
    height: "40px",
    border: "1px solid #d9dee8",
    borderRadius: "8px",
    padding: "0 11px",
    fontSize: "11px",
    color: "#172033",
    background: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  },

  accountInfo: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    flexWrap: "wrap",
    marginTop: "18px",
    padding: "12px",
    borderRadius: "9px",
    background: "#f8fafc",
    border: "1px solid #eef0f4",
  },

  projectionBox: {
    marginTop: "18px",
    padding: "15px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e7eaf0",
  },

  projectionTitle: {
    fontSize: "12px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "13px",
  },

  projectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
  },

  projectionLabel: {
    display: "block",
    fontSize: "9px",
    color: "#667085",
    marginBottom: "4px",
  },

  projectionValue: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#172033",
  },

  projectionNote: {
    marginTop: "12px",
    fontSize: "9px",
    lineHeight: "1.5",
    color: "#98a2b3",
  },

  createButton: {
    width: "100%",
    marginTop: "18px",
    height: "42px",
    border: "none",
    borderRadius: "8px",
    background: "#172033",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
  },

  listHeader: {
    marginBottom: "14px",
  },

  sipGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "16px",
  },

  sipCard: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    padding: "18px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },

  sipCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },

  sipTitle: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "4px",
  },

  sipAccount: {
    fontSize: "9px",
    color: "#98a2b3",
  },

  statusBadge: {
    fontSize: "8px",
    fontWeight: "800",
    padding: "5px 8px",
    borderRadius: "20px",
    textTransform: "uppercase",
  },

  sipAmount: {
    fontSize: "23px",
    fontWeight: "900",
    color: "#172033",
    marginTop: "17px",
    marginBottom: "17px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    borderTop: "1px solid #eef0f4",
    paddingTop: "14px",
  },

  actionRow: {
    display: "flex",
    gap: "9px",
    marginTop: "17px",
    paddingTop: "14px",
    borderTop: "1px solid #eef0f4",
  },

  pauseButton: {
    flex: 1,
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    background: "#fff7ed",
    color: "#c2410c",
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },

  resumeButton: {
    flex: 1,
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    background: "#ecfdf3",
    color: "#087443",
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },

  cancelButton: {
    flex: 1,
    border: "none",
    borderRadius: "8px",
    padding: "10px",
    background: "#fff1f2",
    color: "#b42318",
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e7eaf0",
    borderRadius: "14px",
    padding: "40px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "34px",
    marginBottom: "10px",
  },

  emptyTitle: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "5px",
  },

  emptyText: {
    fontSize: "11px",
    color: "#667085",
  },
};

export default SIPManagement;
