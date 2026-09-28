import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";

export default function BondManagement() {
  const [accounts, setAccounts] = useState([]);
  const [bondPlans, setBondPlans] = useState([]);
  const [bonds, setBonds] = useState([]);

  const [selectedPlanCode, setSelectedPlanCode] = useState("");
  const [accountId, setAccountId] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [sellingId, setSellingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [sellBondData, setSellBondData] = useState(null);

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken");

    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [accountsResponse, plansResponse, bondsResponse] =
        await Promise.all([
          fetch(`${API_BASE}/api/accounts`, {
            headers: getHeaders(),
          }),
          fetch(`${API_BASE}/api/bond-plans`, {
            headers: getHeaders(),
          }),
          fetch(`${API_BASE}/api/bonds`, {
            headers: getHeaders(),
          }),
        ]);

      if (!accountsResponse.ok) {
        throw new Error("Unable to load accounts");
      }

      if (!plansResponse.ok) {
        throw new Error("Unable to load bond plans");
      }

      if (!bondsResponse.ok) {
        throw new Error("Unable to load bonds");
      }

      const accountData = await accountsResponse.json();
      const planData = await plansResponse.json();
      const bondData = await bondsResponse.json();

      setAccounts(
        Array.isArray(accountData)
          ? accountData.filter(
              (account) =>
                String(account.status || "").toUpperCase() === "ACTIVE"
            )
          : []
      );

      setBondPlans(
        Array.isArray(planData)
          ? planData
          : []
      );

      setBonds(
        Array.isArray(bondData)
          ? bondData
          : []
      );

      if (Array.isArray(planData) && planData.length > 0) {
        setSelectedPlanCode(planData[0].planCode);
      }

      if (Array.isArray(accountData)) {
        const activeAccount = accountData.find(
          (account) =>
            String(account.status || "").toUpperCase() === "ACTIVE"
        );

        if (activeAccount) {
          setAccountId(String(activeAccount.id));
        }
      }
    } catch (err) {
      setError(
        err.message || "Unable to load Bond Management data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // SELECTED PLAN
  // =====================================================

  const selectedPlan = useMemo(() => {
    return bondPlans.find(
      (plan) =>
        plan.planCode === selectedPlanCode
    );
  }, [bondPlans, selectedPlanCode]);

  // =====================================================
  // EXPECTED INTEREST
  // =====================================================

  const expectedInterest = useMemo(() => {
    if (
      !selectedPlan ||
      !investmentAmount ||
      Number(investmentAmount) <= 0
    ) {
      return 0;
    }

    const amount = Number(investmentAmount);
    const rate = Number(selectedPlan.couponRate);
    const months = Number(selectedPlan.tenureMonths);

    return (
      (amount * rate * (months / 12)) /
      100
    );
  }, [selectedPlan, investmentAmount]);

  // =====================================================
  // HANDLE PLAN CHANGE
  // =====================================================

  const handlePlanChange = (event) => {
    setSelectedPlanCode(event.target.value);
    setInvestmentAmount("");
    setMessage("");
    setError("");
  };

  // =====================================================
  // PURCHASE BOND
  // =====================================================

  const handlePurchase = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedPlan) {
      setError("Please select a bond plan.");
      return;
    }

    if (!accountId) {
      setError("Please select an account.");
      return;
    }

    const amount = Number(investmentAmount);

    if (!amount || amount <= 0) {
      setError("Please enter a valid investment amount.");
      return;
    }

    const minimumInvestment =
      Number(selectedPlan.minimumInvestment);

    if (amount < minimumInvestment) {
      setError(
        `Minimum investment is ₹${minimumInvestment.toLocaleString(
          "en-IN"
        )}.`
      );
      return;
    }

    const account = accounts.find(
      (item) => String(item.id) === String(accountId)
    );

    if (
      account &&
      account.balance != null &&
      Number(account.balance) < amount
    ) {
      setError("Insufficient account balance.");
      return;
    }

    const confirmed = window.confirm(
      `Confirm Bond Investment?\n\n` +
        `${selectedPlan.bondName}\n` +
        `Investment: ₹${amount.toLocaleString("en-IN")}\n` +
        `Coupon Rate: ${selectedPlan.couponRate}%\n` +
        `Tenure: ${selectedPlan.tenureMonths} months`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPurchasing(true);

      const params = new URLSearchParams();

      params.append("accountId", accountId);
      params.append(
        "bondName",
        selectedPlan.bondName
      );
      params.append(
        "bondType",
        selectedPlan.bondType
      );
      params.append(
        "faceValue",
        selectedPlan.faceValue
      );
      params.append(
        "investmentAmount",
        amount
      );
      params.append(
        "couponRate",
        selectedPlan.couponRate
      );
      params.append(
        "tenureMonths",
        selectedPlan.tenureMonths
      );

      const response = await fetch(
        `${API_BASE}/api/bonds?${params.toString()}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Bond purchase failed."
        );
      }

      setMessage(
        "Bond purchased successfully."
      );

      setInvestmentAmount("");

      await loadData();
    } catch (err) {
      setError(
        err.message || "Bond purchase failed."
      );
    } finally {
      setPurchasing(false);
    }
  };

  // =====================================================
  // SELL CONFIRMATION
  // =====================================================

  const openSellConfirmation = (bond) => {
    setSellBondData(bond);
    setMessage("");
    setError("");
  };

  const closeSellConfirmation = () => {
    if (sellingId === null) {
      setSellBondData(null);
    }
  };

  // =====================================================
  // SELL BOND
  // =====================================================

  const handleSellBond = async () => {
    if (!sellBondData) {
      return;
    }

    try {
      setSellingId(sellBondData.id);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE}/api/bonds/${sellBondData.id}/sell`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Bond sale failed."
        );
      }

      setSellBondData(null);

      setMessage(
        "Bond sold successfully and amount credited to your account."
      );

      await loadData();
    } catch (err) {
      setError(
        err.message || "Bond sale failed."
      );
    } finally {
      setSellingId(null);
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const activeBonds = bonds.filter(
    (bond) =>
      String(bond.status || "").toUpperCase() ===
      "ACTIVE"
  );

  const totalInvestment = activeBonds.reduce(
    (sum, bond) =>
      sum + Number(bond.investmentAmount || 0),
    0
  );

  const totalInterest = activeBonds.reduce(
    (sum, bond) =>
      sum + Number(bond.totalInterestEarned || 0),
    0
  );

  const currentValue = activeBonds.reduce(
    (sum, bond) =>
      sum + Number(bond.currentValue || 0),
    0
  );

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div style={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={styles.header}>

        <div style={styles.headerLeft}>

          <div style={styles.headerIcon}>
            🏦
          </div>

          <div>
            <h1 style={styles.headerTitle}>
              Bond Management
            </h1>

            <p style={styles.headerSubtitle}>
              Invest in bonds and manage your fixed-income portfolio
            </p>
          </div>

        </div>

        <button
          style={styles.backButton}
          onClick={() => {
            window.location.href =
              "/investments";
          }}
        >
          ← Back to Investment Page
        </button>

      </div>

      <div style={styles.container}>

        {/* =================================================
            MESSAGES
        ================================================= */}

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

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div style={styles.summaryGrid}>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              💰
            </div>

            <div>
              <div style={styles.summaryLabel}>
                Total Investment
              </div>

              <div style={styles.summaryValue}>
                {formatMoney(totalInvestment)}
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              📈
            </div>

            <div>
              <div style={styles.summaryLabel}>
                Interest Earned
              </div>

              <div style={styles.summaryValue}>
                {formatMoney(totalInterest)}
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              🏦
            </div>

            <div>
              <div style={styles.summaryLabel}>
                Current Value
              </div>

              <div style={styles.summaryValue}>
                {formatMoney(currentValue)}
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>
              📊
            </div>

            <div>
              <div style={styles.summaryLabel}>
                Active Bonds
              </div>

              <div style={styles.summaryValue}>
                {activeBonds.length}
              </div>
            </div>
          </div>

        </div>

        {/* =================================================
            PURCHASE SECTION
        ================================================= */}

        <div style={styles.mainGrid}>

          <div style={styles.card}>

            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Invest in Bonds
                </h2>

                <p style={styles.sectionSubtitle}>
                  Choose a bond plan and start investing
                </p>
              </div>

              <div style={styles.sectionIcon}>
                💼
              </div>
            </div>

            {loading ? (
              <div style={styles.loading}>
                Loading bond plans...
              </div>
            ) : (
              <form onSubmit={handlePurchase}>

                <label style={styles.label}>
                  Select Bond Plan
                </label>

                <select
                  value={selectedPlanCode}
                  onChange={handlePlanChange}
                  style={styles.input}
                  required
                >
                  <option value="">
                    Select a bond plan
                  </option>

                  {bondPlans.map((plan) => (
                    <option
                      key={plan.planCode}
                      value={plan.planCode}
                    >
                      {plan.bondName} — {plan.couponRate}%
                    </option>
                  ))}
                </select>

                {selectedPlan && (
                  <div style={styles.planDetails}>

                    <div style={styles.planTop}>
                      <div>
                        <h3 style={styles.planName}>
                          {selectedPlan.bondName}
                        </h3>

                        <span style={styles.planType}>
                          {selectedPlan.bondType}
                        </span>
                      </div>

                      <div style={styles.rateBox}>
                        <strong>
                          {selectedPlan.couponRate}%
                        </strong>

                        <span>
                          Coupon Rate
                        </span>
                      </div>
                    </div>

                    <div style={styles.detailGrid}>

                      <div>
                        <span style={styles.detailLabel}>
                          Face Value
                        </span>

                        <strong>
                          {formatMoney(
                            selectedPlan.faceValue
                          )}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.detailLabel}>
                          Minimum Investment
                        </span>

                        <strong>
                          {formatMoney(
                            selectedPlan.minimumInvestment
                          )}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.detailLabel}>
                          Tenure
                        </span>

                        <strong>
                          {selectedPlan.tenureMonths} months
                        </strong>
                      </div>

                      <div>
                        <span style={styles.detailLabel}>
                          Interest
                        </span>

                        <strong>
                          {selectedPlan.interestFrequency}
                        </strong>
                      </div>

                    </div>

                    <p style={styles.description}>
                      {selectedPlan.description}
                    </p>

                  </div>
                )}

                <label style={styles.label}>
                  Debit Account
                </label>

                <select
                  value={accountId}
                  onChange={(e) =>
                    setAccountId(e.target.value)
                  }
                  style={styles.input}
                  required
                >
                  <option value="">
                    Select account
                  </option>

                  {accounts.map((account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.accountNumber}
                      {" — "}
                      Balance:{" "}
                      {formatMoney(account.balance)}
                    </option>
                  ))}
                </select>

                <label style={styles.label}>
                  Investment Amount
                </label>

                <div style={styles.amountWrapper}>
                  <span style={styles.currency}>
                    ₹
                  </span>

                  <input
                    type="number"
                    min={
                      selectedPlan
                        ? selectedPlan.minimumInvestment
                        : 1
                    }
                    step="0.01"
                    value={investmentAmount}
                    onChange={(e) =>
                      setInvestmentAmount(
                        e.target.value
                      )
                    }
                    placeholder="Enter investment amount"
                    style={styles.amountInput}
                    required
                  />
                </div>

                {selectedPlan &&
                  Number(investmentAmount) > 0 && (
                    <div style={styles.calculationBox}>

                      <div style={styles.calcRow}>
                        <span>
                          Investment
                        </span>

                        <strong>
                          {formatMoney(
                            investmentAmount
                          )}
                        </strong>
                      </div>

                      <div style={styles.calcRow}>
                        <span>
                          Expected Total Interest
                        </span>

                        <strong style={styles.greenText}>
                          {formatMoney(
                            expectedInterest
                          )}
                        </strong>
                      </div>

                      <div style={styles.calcDivider} />

                      <div style={styles.calcRow}>
                        <span>
                          Expected Total Value
                        </span>

                        <strong>
                          {formatMoney(
                            Number(investmentAmount) +
                              expectedInterest
                          )}
                        </strong>
                      </div>

                    </div>
                  )}

                <button
                  type="submit"
                  disabled={
                    purchasing ||
                    loading ||
                    !selectedPlan
                  }
                  style={{
                    ...styles.primaryButton,
                    opacity:
                      purchasing ||
                      loading ||
                      !selectedPlan
                        ? 0.6
                        : 1,
                  }}
                >
                  {purchasing
                    ? "Processing..."
                    : "Invest in Bond"}
                </button>

              </form>
            )}

          </div>

          {/* =================================================
              BOND INFO
          ================================================= */}

          <div style={styles.infoCard}>

            <div style={styles.infoIcon}>
              🛡️
            </div>

            <h2 style={styles.infoTitle}>
              Why Invest in Bonds?
            </h2>

            <div style={styles.infoItem}>
              <span>✓</span>
              <div>
                <strong>Fixed Coupon Income</strong>
                <p>
                  Earn periodic interest according
                  to the selected bond plan.
                </p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span>✓</span>
              <div>
                <strong>Defined Maturity</strong>
                <p>
                  Your investment has a predefined
                  maturity date.
                </p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span>✓</span>
              <div>
                <strong>Portfolio Tracking</strong>
                <p>
                  Track investment, interest and
                  current value from one place.
                </p>
              </div>
            </div>

            <div style={styles.infoNote}>
              Bond returns and availability are
              based on the selected Avani Bank
              product plan.
            </div>

          </div>

        </div>

        {/* =================================================
            ACTIVE BONDS
        ================================================= */}

        <div style={styles.card}>

          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                My Active Bonds
              </h2>

              <p style={styles.sectionSubtitle}>
                Manage your currently active bond investments
              </p>
            </div>

            <div style={styles.activeBadge}>
              {activeBonds.length} Active
            </div>
          </div>

          {loading ? (
            <div style={styles.loading}>
              Loading bonds...
            </div>
          ) : activeBonds.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                📋
              </div>

              <h3>
                No Active Bonds
              </h3>

              <p>
                Your active bond investments will
                appear here.
              </p>
            </div>
          ) : (
            <div style={styles.bondGrid}>

              {activeBonds.map((bond) => {

                const bondInterest =
                  Number(
                    bond.totalInterestEarned || 0
                  );

                const investment =
                  Number(
                    bond.investmentAmount || 0
                  );

                return (
                  <div
                    key={bond.id}
                    style={styles.bondCard}
                  >

                    <div style={styles.bondHeader}>

                      <div>
                        <h3 style={styles.bondName}>
                          {bond.bondName}
                        </h3>

                        <span style={styles.bondType}>
                          {bond.bondType}
                        </span>
                      </div>

                      <span style={styles.statusBadge}>
                        ACTIVE
                      </span>

                    </div>

                    <div style={styles.bondAmount}>
                      {formatMoney(investment)}

                      <span>
                        Investment
                      </span>
                    </div>

                    <div style={styles.bondDetails}>

                      <div>
                        <span>
                          Coupon Rate
                        </span>

                        <strong>
                          {bond.couponRate}%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Tenure
                        </span>

                        <strong>
                          {bond.tenureMonths} months
                        </strong>
                      </div>

                      <div>
                        <span>
                          Purchase Date
                        </span>

                        <strong>
                          {formatDate(
                            bond.purchaseDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Maturity Date
                        </span>

                        <strong>
                          {formatDate(
                            bond.maturityDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Interest Earned
                        </span>

                        <strong style={styles.greenText}>
                          {formatMoney(
                            bondInterest
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Current Value
                        </span>

                        <strong>
                          {formatMoney(
                            bond.currentValue
                          )}
                        </strong>
                      </div>

                    </div>

                    <button
                      style={styles.sellButton}
                      onClick={() =>
                        openSellConfirmation(bond)
                      }
                    >
                      Sell Bond
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* =================================================
            BOND HISTORY
        ================================================= */}

        {bonds.some(
          (bond) =>
            String(bond.status || "").toUpperCase() !==
            "ACTIVE"
        ) && (
          <div style={styles.card}>

            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Bond History
                </h2>

                <p style={styles.sectionSubtitle}>
                  Previously sold or matured investments
                </p>
              </div>
            </div>

            <div style={styles.historyTableWrapper}>

              <table style={styles.table}>

                <thead>
                  <tr>
                    <th style={styles.th}>
                      Bond
                    </th>

                    <th style={styles.th}>
                      Investment
                    </th>

                    <th style={styles.th}>
                      Interest
                    </th>

                    <th style={styles.th}>
                      Purchase Date
                    </th>

                    <th style={styles.th}>
                      Maturity Date
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {bonds
                    .filter(
                      (bond) =>
                        String(
                          bond.status || ""
                        ).toUpperCase() !==
                        "ACTIVE"
                    )
                    .map((bond) => (

                      <tr key={bond.id}>

                        <td style={styles.td}>
                          <strong>
                            {bond.bondName}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {formatMoney(
                            bond.investmentAmount
                          )}
                        </td>

                        <td style={styles.td}>
                          {formatMoney(
                            bond.totalInterestEarned
                          )}
                        </td>

                        <td style={styles.td}>
                          {formatDate(
                            bond.purchaseDate
                          )}
                        </td>

                        <td style={styles.td}>
                          {formatDate(
                            bond.maturityDate
                          )}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={
                              String(
                                bond.status || ""
                              ).toUpperCase() ===
                              "MATURED"
                                ? styles.maturedBadge
                                : styles.soldBadge
                            }
                          >
                            {bond.status}
                          </span>
                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

      {/* ===================================================
          SELL CONFIRMATION MODAL
      =================================================== */}

      {sellBondData && (
        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalIcon}>
              ⚠️
            </div>

            <h2 style={styles.modalTitle}>
              Sell Bond?
            </h2>

            <p style={styles.modalText}>
              Are you sure you want to sell this
              bond before maturity?
            </p>

            <div style={styles.modalDetails}>

              <div>
                <span>Bond</span>
                <strong>
                  {sellBondData.bondName}
                </strong>
              </div>

              <div>
                <span>Investment</span>
                <strong>
                  {formatMoney(
                    sellBondData.investmentAmount
                  )}
                </strong>
              </div>

              <div>
                <span>Interest Earned</span>
                <strong>
                  {formatMoney(
                    sellBondData.totalInterestEarned
                  )}
                </strong>
              </div>

            </div>

            <div style={styles.warningBox}>
              Premature selling may reduce your
              earned interest according to the
              applicable early-exit adjustment.
            </div>

            <div style={styles.modalActions}>

              <button
                style={styles.cancelButton}
                onClick={closeSellConfirmation}
                disabled={sellingId !== null}
              >
                Cancel
              </button>

              <button
                style={styles.confirmSellButton}
                onClick={handleSellBond}
                disabled={sellingId !== null}
              >
                {sellingId !== null
                  ? "Selling..."
                  : "Confirm Sell"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          RESPONSIVE STYLES
      =================================================== */}

      <style>
        {`
          @media (max-width: 900px) {
            .bond-main-grid {
              grid-template-columns: 1fr !important;
            }

            .bond-summary-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          @media (max-width: 600px) {
            .bond-summary-grid {
              grid-template-columns: 1fr !important;
            }

            .bond-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 15px !important;
            }

            .bond-back-button {
              width: 100% !important;
            }

            .bond-detail-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

    </div>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    color: "#172033",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background:
      "linear-gradient(135deg, #0756c9 0%, #0b72e7 55%, #1591f0 100%)",
    color: "#ffffff",
    margin: "20px",
    padding: "22px 28px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow:
      "0 10px 28px rgba(7, 86, 201, 0.22)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  headerIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    border:
      "1px solid rgba(255,255,255,0.25)",
  },

  headerTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: 750,
  },

  headerSubtitle: {
    margin: "5px 0 0",
    fontSize: "13px",
    opacity: 0.88,
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.15)",
    color: "#ffffff",
    padding: "11px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 650,
    fontSize: "13px",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0 20px 40px",
  },

  successMessage: {
    background: "#eaf8ef",
    color: "#137333",
    border: "1px solid #b8e0c2",
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
    fontSize: "14px",
    fontWeight: 600,
  },

  errorMessage: {
    background: "#fff0f0",
    color: "#b42318",
    border: "1px solid #f2b8b5",
    padding: "13px 16px",
    borderRadius: "10px",
    marginBottom: "18px",
    fontSize: "14px",
    fontWeight: 600,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e4eaf2",
    borderRadius: "15px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 5px 18px rgba(30, 55, 90, 0.06)",
  },

  summaryIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#edf5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  summaryLabel: {
    color: "#6b778c",
    fontSize: "12px",
    marginBottom: "4px",
  },

  summaryValue: {
    fontSize: "20px",
    fontWeight: 750,
    color: "#172033",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.7fr) minmax(280px, 0.8fr)",
    gap: "20px",
    marginBottom: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e4eaf2",
    borderRadius: "17px",
    padding: "23px",
    boxShadow:
      "0 5px 18px rgba(30, 55, 90, 0.06)",
    marginBottom: "20px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "22px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#18243a",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#718096",
    fontSize: "13px",
  },

  sectionIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#edf5ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  activeBadge: {
    background: "#e9f7ee",
    color: "#18794e",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },

  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "16px",
    fontSize: "13px",
    fontWeight: 650,
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    border: "1px solid #d8e0eb",
    borderRadius: "10px",
    background: "#ffffff",
    fontSize: "14px",
    color: "#172033",
    outline: "none",
  },

  amountWrapper: {
    display: "flex",
    alignItems: "center",
    border:
      "1px solid #d8e0eb",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#ffffff",
  },

  currency: {
    paddingLeft: "14px",
    fontSize: "17px",
    fontWeight: 700,
    color: "#0756c9",
  },

  amountInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px",
    fontSize: "14px",
  },

  planDetails: {
    marginTop: "17px",
    padding: "17px",
    background:
      "linear-gradient(145deg, #f5f9ff, #eef5ff)",
    border:
      "1px solid #d8e8ff",
    borderRadius: "13px",
  },

  planTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "17px",
  },

  planName: {
    margin: 0,
    fontSize: "16px",
    color: "#15345e",
  },

  planType: {
    display: "inline-block",
    marginTop: "6px",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#dcecff",
    color: "#0756c9",
    fontSize: "10px",
    fontWeight: 750,
  },

  rateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  rateBoxStrong: {
    fontSize: "20px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "12px",
  },

  detailLabel: {
    display: "block",
    color: "#718096",
    fontSize: "10px",
    marginBottom: "4px",
  },

  description: {
    margin: "15px 0 0",
    color: "#617089",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  calculationBox: {
    marginTop: "16px",
    padding: "14px",
    background: "#f8fafc",
    border: "1px solid #e4eaf2",
    borderRadius: "11px",
  },

  calcRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "6px 0",
    fontSize: "13px",
  },

  calcDivider: {
    borderTop:
      "1px dashed #d7deea",
    margin: "7px 0",
  },

  greenText: {
    color: "#15803d",
  },

  primaryButton: {
    width: "100%",
    marginTop: "20px",
    border: "none",
    background:
      "linear-gradient(135deg, #0756c9, #0b72e7)",
    color: "#ffffff",
    padding: "13px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow:
      "0 7px 16px rgba(7,86,201,0.2)",
  },

  infoCard: {
    background:
      "linear-gradient(150deg, #0756c9, #123f8d)",
    color: "#ffffff",
    borderRadius: "17px",
    padding: "25px",
    boxShadow:
      "0 8px 22px rgba(7, 63, 140, 0.18)",
  },

  infoIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    marginBottom: "17px",
  },

  infoTitle: {
    margin: "0 0 22px",
    fontSize: "20px",
  },

  infoItem: {
    display: "flex",
    gap: "11px",
    marginBottom: "18px",
  },

  infoItemSpan: {
    fontWeight: 800,
  },

  infoItemP: {
    margin: "4px 0 0",
    fontSize: "12px",
    lineHeight: 1.5,
    opacity: 0.82,
  },

  infoNote: {
    marginTop: "23px",
    padding: "12px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.1)",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  bondGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "17px",
  },

  bondCard: {
    border: "1px solid #e1e8f1",
    borderRadius: "14px",
    padding: "18px",
    background: "#fbfcfe",
  },

  bondHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "18px",
  },

  bondName: {
    margin: 0,
    fontSize: "16px",
    color: "#172033",
  },

  bondType: {
    display: "inline-block",
    marginTop: "6px",
    color: "#66758b",
    fontSize: "10px",
    fontWeight: 700,
  },

  statusBadge: {
    background: "#e8f7ed",
    color: "#18794e",
    padding: "5px 9px",
    borderRadius: "7px",
    fontSize: "10px",
    fontWeight: 750,
  },

  bondAmount: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#0756c9",
    marginBottom: "18px",
  },

  bondAmountSpan: {
    display: "block",
    color: "#77859a",
    fontSize: "10px",
    fontWeight: 500,
    marginTop: "3px",
  },

  bondDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "13px",
    marginBottom: "17px",
  },

  bondDetailsSpan: {
    display: "block",
    fontSize: "10px",
    color: "#7b8798",
    marginBottom: "4px",
  },

  bondDetailsStrong: {
    fontSize: "12px",
    color: "#26364d",
  },

  sellButton: {
    width: "100%",
    padding: "10px",
    borderRadius: "9px",
    border:
      "1px solid #f0b4b4",
    background: "#fff6f6",
    color: "#c0392b",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },

  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#718096",
  },

  emptyIcon: {
    fontSize: "35px",
    marginBottom: "8px",
  },

  historyTableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "750px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f5f8fc",
    color: "#607086",
    fontSize: "11px",
    fontWeight: 700,
    borderBottom:
      "1px solid #e2e8f0",
  },

  td: {
    padding: "13px 12px",
    borderBottom:
      "1px solid #edf1f5",
    fontSize: "12px",
    color: "#334155",
  },

  maturedBadge: {
    background: "#eaf7ef",
    color: "#18794e",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
  },

  soldBadge: {
    background: "#fff1f1",
    color: "#b42318",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 700,
  },

  loading: {
    padding: "30px",
    textAlign: "center",
    color: "#718096",
    fontSize: "14px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "450px",
    background: "#ffffff",
    borderRadius: "17px",
    padding: "25px",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.22)",
  },

  modalIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#fff4e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    marginBottom: "15px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "21px",
  },

  modalText: {
    color: "#68758a",
    fontSize: "13px",
    lineHeight: 1.5,
    margin: "9px 0 18px",
  },

  modalDetails: {
    display: "grid",
    gap: "10px",
    background: "#f7f9fc",
    borderRadius: "11px",
    padding: "14px",
  },

  modalDetailsSpan: {
    display: "block",
    fontSize: "10px",
    color: "#77859a",
    marginBottom: "3px",
  },

  modalDetailsStrong: {
    fontSize: "13px",
  },

  warningBox: {
    marginTop: "14px",
    padding: "11px",
    background: "#fff8e8",
    color: "#8a5a00",
    border:
      "1px solid #f1d38a",
    borderRadius: "9px",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  cancelButton: {
    padding: "10px 17px",
    borderRadius: "9px",
    border:
      "1px solid #d7dee8",
    background: "#ffffff",
    color: "#4b5563",
    cursor: "pointer",
    fontWeight: 650,
  },

  confirmSellButton: {
    padding: "10px 17px",
    borderRadius: "9px",
    border: "none",
    background: "#c0392b",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
};