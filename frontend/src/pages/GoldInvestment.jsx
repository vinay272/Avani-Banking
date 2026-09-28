import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8080";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("jwtToken") ||
  localStorage.getItem("accessToken");

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
};

const formatNumber = (value, digits = 4) => {
  return Number(value || 0).toFixed(digits);
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();

    if (typeof data === "string") {
      return data;
    }

    return (
      data?.message ||
      data?.error ||
      "Something went wrong. Please try again."
    );
  } catch {
    return "Something went wrong. Please try again.";
  }
};

export default function GoldInvestment() {
  const [accounts, setAccounts] = useState([]);
  const [goldPrices, setGoldPrices] = useState([]);
  const [investments, setInvestments] = useState([]);

  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedPurity, setSelectedPurity] = useState("24K");
  const [investmentAmount, setInvestmentAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [sellingId, setSellingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  // =====================================================
  // CURRENT SELECTED GOLD PRICE
  // =====================================================

  const selectedGoldPrice = useMemo(() => {
    return (
      goldPrices.find(
        (item) =>
          String(item.purity || "").toUpperCase() ===
          String(selectedPurity).toUpperCase()
      ) || null
    );
  }, [goldPrices, selectedPurity]);

  // =====================================================
  // CALCULATED GOLD QUANTITY
  // =====================================================

  const calculatedGrams = useMemo(() => {
    const amount = Number(investmentAmount || 0);
    const price = Number(selectedGoldPrice?.pricePerGram || 0);

    if (!amount || !price) {
      return 0;
    }

    return amount / price;
  }, [investmentAmount, selectedGoldPrice]);

  // =====================================================
  // LOAD ALL DATA
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [accountsResponse, pricesResponse, investmentsResponse] =
        await Promise.all([
          fetch(`${API_BASE}/api/accounts`, {
            method: "GET",
            headers,
          }),
          fetch(`${API_BASE}/api/gold-prices`, {
            method: "GET",
            headers,
          }),
          fetch(`${API_BASE}/api/gold-investments`, {
            method: "GET",
            headers,
          }),
        ]);

      if (!accountsResponse.ok) {
        throw new Error(
          await getErrorMessage(accountsResponse)
        );
      }

      if (!pricesResponse.ok) {
        throw new Error(
          await getErrorMessage(pricesResponse)
        );
      }

      if (!investmentsResponse.ok) {
        throw new Error(
          await getErrorMessage(investmentsResponse)
        );
      }

      const accountData = await accountsResponse.json();
      const priceData = await pricesResponse.json();
      const investmentData = await investmentsResponse.json();

      const activeAccounts = Array.isArray(accountData)
        ? accountData.filter(
            (account) =>
              String(account.status || "").toUpperCase() === "ACTIVE"
          )
        : [];

      setAccounts(activeAccounts);
      setGoldPrices(
        Array.isArray(priceData) ? priceData : []
      );
      setInvestments(
        Array.isArray(investmentData) ? investmentData : []
      );

      if (activeAccounts.length > 0) {
        setSelectedAccount(
          String(activeAccounts[0].id)
        );
      }
    } catch (err) {
      console.error("Gold Investment load error:", err);

      setError(
        err.message ||
          "Unable to load Gold Investment data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PURCHASE GOLD
  // =====================================================

  const handlePurchase = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const amount = Number(investmentAmount || 0);

    if (!selectedAccount) {
      setError("Please select an account.");
      return;
    }

    if (!selectedGoldPrice) {
      setError("Gold price is not available.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Please enter a valid investment amount.");
      return;
    }

    const minimumInvestment = Number(
      selectedGoldPrice.minimumInvestment || 0
    );

    if (
      minimumInvestment > 0 &&
      amount < minimumInvestment
    ) {
      setError(
        `Minimum investment is ${formatCurrency(
          minimumInvestment
        )}.`
      );
      return;
    }

    setPurchasing(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const params = new URLSearchParams();

      params.append("accountId", selectedAccount);
      params.append("goldType", "DIGITAL_GOLD");
      params.append("purity", selectedPurity);
      params.append("investmentAmount", amount.toFixed(2));

      const response = await fetch(
        `${API_BASE}/api/gold-investments?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response)
        );
      }

      const savedInvestment = await response.json();

      setInvestments((previous) => [
        savedInvestment,
        ...previous,
      ]);

      setInvestmentAmount("");

      setMessage(
        `Gold purchased successfully. ${formatNumber(
          savedInvestment.quantityGrams
        )} grams of ${savedInvestment.purity} gold added to your portfolio.`
      );

      // Refresh account balances as well
      await loadAccountsOnly();
    } catch (err) {
      console.error("Gold purchase error:", err);

      setError(
        err.message ||
          "Unable to purchase gold."
      );
    } finally {
      setPurchasing(false);
    }
  };

  // =====================================================
  // REFRESH ACCOUNTS
  // =====================================================

  const loadAccountsOnly = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE}/api/accounts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const activeAccounts = Array.isArray(data)
        ? data.filter(
            (account) =>
              String(account.status || "").toUpperCase() ===
              "ACTIVE"
          )
        : [];

      setAccounts(activeAccounts);
    } catch (err) {
      console.error(
        "Account refresh error:",
        err
      );
    }
  };

  // =====================================================
  // OPEN SELL MODAL
  // =====================================================

  const openSellModal = (investment) => {
    setSelectedInvestment(investment);
    setShowSellModal(true);
    setError("");
    setMessage("");
  };

  // =====================================================
  // CLOSE SELL MODAL
  // =====================================================

  const closeSellModal = () => {
    if (sellingId !== null) {
      return;
    }

    setShowSellModal(false);
    setSelectedInvestment(null);
  };

  // =====================================================
  // SELL GOLD
  // =====================================================

  const handleSell = async () => {
    if (!selectedInvestment?.id) {
      return;
    }

    setSellingId(selectedInvestment.id);
    setError("");
    setMessage("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE}/api/gold-investments/${selectedInvestment.id}/sell`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response)
        );
      }

      const soldInvestment = await response.json();

      setInvestments((previous) =>
        previous.map((investment) =>
          investment.id === soldInvestment.id
            ? soldInvestment
            : investment
        )
      );

      setShowSellModal(false);
      setSelectedInvestment(null);

      setMessage(
        `Gold sold successfully for ${formatCurrency(
          soldInvestment.currentValue
        )}.`
      );

      await loadAccountsOnly();
    } catch (err) {
      console.error("Gold sell error:", err);

      setError(
        err.message ||
          "Unable to sell gold."
      );
    } finally {
      setSellingId(null);
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const activeInvestments = investments.filter(
    (investment) =>
      String(investment.status || "").toUpperCase() ===
      "ACTIVE"
  );

  const soldInvestments = investments.filter(
    (investment) =>
      String(investment.status || "").toUpperCase() ===
      "SOLD"
  );

  const totalInvested = activeInvestments.reduce(
    (total, investment) =>
      total + Number(investment.investmentAmount || 0),
    0
  );

  const totalCurrentValue = activeInvestments.reduce(
    (total, investment) =>
      total + Number(investment.currentValue || 0),
    0
  );

  const totalProfitLoss = activeInvestments.reduce(
    (total, investment) =>
      total + Number(investment.profitLoss || 0),
    0
  );

  const totalGoldGrams = activeInvestments.reduce(
    (total, investment) =>
      total + Number(investment.quantityGrams || 0),
    0
  );

  const profitLossPositive =
    totalProfitLoss >= 0;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>🪙</div>
          <h2 style={styles.loadingTitle}>
            Loading Gold Investments...
          </h2>
          <p style={styles.loadingText}>
            Please wait while we load your portfolio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* =================================================
          HEADER
      ================================================= */}

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            🪙
          </div>

          <div>
            <h1 style={styles.headerTitle}>
              Gold Investment
            </h1>

            <p style={styles.headerSubtitle}>
              Invest, track and manage your digital gold
            </p>
          </div>
        </div>

        <button
          type="button"
          style={styles.backButton}
          onClick={() =>
            (window.location.href = "/investments")
          }
        >
          ← Back to Investment Page
        </button>
      </div>

      {/* =================================================
          ALERTS
      ================================================= */}

      {message && (
        <div style={styles.successAlert}>
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={styles.errorAlert}>
          <span>!</span>
          <span>{error}</span>
        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#eef4ff",
              color: "#2457c6",
            }}
          >
            🪙
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Gold Holdings
            </p>

            <h2 style={styles.summaryValue}>
              {formatNumber(totalGoldGrams)} g
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#eef8f1",
              color: "#198754",
            }}
          >
            💰
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Total Invested
            </p>

            <h2 style={styles.summaryValue}>
              {formatCurrency(totalInvested)}
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: "#fff7e8",
              color: "#d98b00",
            }}
          >
            📊
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Current Value
            </p>

            <h2 style={styles.summaryValue}>
              {formatCurrency(totalCurrentValue)}
            </h2>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              background: profitLossPositive
                ? "#eef8f1"
                : "#fff0f0",
              color: profitLossPositive
                ? "#198754"
                : "#dc3545",
            }}
          >
            {profitLossPositive ? "↗" : "↘"}
          </div>

          <div>
            <p style={styles.summaryLabel}>
              Overall P/L
            </p>

            <h2
              style={{
                ...styles.summaryValue,
                color: profitLossPositive
                  ? "#198754"
                  : "#dc3545",
              }}
            >
              {profitLossPositive ? "+" : ""}
              {formatCurrency(totalProfitLoss)}
            </h2>
          </div>
        </div>
      </div>

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div style={styles.mainGrid}>
        {/* =================================================
            PURCHASE CARD
        ================================================= */}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Buy Digital Gold
              </h2>

              <p style={styles.cardSubtitle}>
                Start your gold investment journey
              </p>
            </div>

            <div style={styles.goldBadge}>
              🪙
            </div>
          </div>

          <form
            onSubmit={handlePurchase}
            style={styles.form}
          >
            {/* ACCOUNT */}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Debit Account
              </label>

              <select
                value={selectedAccount}
                onChange={(event) =>
                  setSelectedAccount(
                    event.target.value
                  )
                }
                style={styles.input}
                required
              >
                <option value="">
                  Select Account
                </option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.accountNumber} —{" "}
                    {formatCurrency(account.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* GOLD TYPE */}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Gold Type
              </label>

              <input
                type="text"
                value="Digital Gold"
                readOnly
                style={{
                  ...styles.input,
                  background: "#f7f9fc",
                  color: "#495057",
                }}
              />
            </div>

            {/* PURITY */}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Gold Purity
              </label>

              <div style={styles.purityGrid}>
                {goldPrices.map((price) => {
                  const purity =
                    String(
                      price.purity || ""
                    ).toUpperCase();

                  const selected =
                    selectedPurity === purity;

                  return (
                    <button
                      type="button"
                      key={purity}
                      onClick={() =>
                        setSelectedPurity(purity)
                      }
                      style={{
                        ...styles.purityButton,
                        ...(selected
                          ? styles.purityButtonActive
                          : {}),
                      }}
                    >
                      <strong>
                        {purity}
                      </strong>

                      <span>
                        {formatCurrency(
                          price.pricePerGram
                        )}
                        /g
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* INVESTMENT AMOUNT */}

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Investment Amount
              </label>

              <div style={styles.amountWrapper}>
                <span style={styles.amountPrefix}>
                  ₹
                </span>

                <input
                  type="number"
                  min={
                    selectedGoldPrice?.minimumInvestment ||
                    100
                  }
                  step="0.01"
                  value={investmentAmount}
                  onChange={(event) =>
                    setInvestmentAmount(
                      event.target.value
                    )
                  }
                  placeholder="Enter amount"
                  style={styles.amountInput}
                  required
                />
              </div>

              <p style={styles.helperText}>
                Minimum investment:{" "}
                {formatCurrency(
                  selectedGoldPrice?.minimumInvestment
                )}
              </p>
            </div>

            {/* CALCULATION */}

            <div style={styles.calculationBox}>
              <div>
                <span style={styles.calculationLabel}>
                  Gold Price
                </span>

                <strong style={styles.calculationValue}>
                  {formatCurrency(
                    selectedGoldPrice?.pricePerGram
                  )}
                  / gram
                </strong>
              </div>

              <div style={styles.calculationDivider} />

              <div>
                <span style={styles.calculationLabel}>
                  You Receive
                </span>

                <strong style={styles.calculationGold}>
                  {formatNumber(
                    calculatedGrams
                  )}{" "}
                  grams
                </strong>
              </div>
            </div>

            {/* PURCHASE BUTTON */}

            <button
              type="submit"
              disabled={
                purchasing ||
                accounts.length === 0
              }
              style={{
                ...styles.primaryButton,
                opacity:
                  purchasing ||
                  accounts.length === 0
                    ? 0.65
                    : 1,
              }}
            >
              {purchasing
                ? "Processing..."
                : "🪙 Buy Gold"}
            </button>

            {accounts.length === 0 && (
              <p style={styles.warningText}>
                No active account available for
                investment.
              </p>
            )}
          </form>
        </div>

        {/* =================================================
            PRICE CARD
        ================================================= */}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Gold Price
              </h2>

              <p style={styles.cardSubtitle}>
                Current Avani Bank catalogue price
              </p>
            </div>

            <div style={styles.priceIcon}>
              ₹
            </div>
          </div>

          <div style={styles.priceList}>
            {goldPrices.map((price) => (
              <div
                key={`${price.goldType}-${price.purity}`}
                style={styles.priceRow}
              >
                <div>
                  <strong style={styles.pricePurity}>
                    {price.purity}
                  </strong>

                  <span style={styles.priceType}>
                    Digital Gold
                  </span>
                </div>

                <div style={styles.priceRight}>
                  <strong style={styles.priceAmount}>
                    {formatCurrency(
                      price.pricePerGram
                    )}
                  </strong>

                  <span style={styles.priceUnit}>
                    per gram
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>
              ℹ
            </span>

            <span>
              Gold value is calculated according to
              the current catalogue price and your
              purchased quantity.
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          ACTIVE INVESTMENTS
      ================================================= */}

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Active Gold Investments
            </h2>

            <p style={styles.sectionSubtitle}>
              Track your current gold holdings
            </p>
          </div>

          <span style={styles.countBadge}>
            {activeInvestments.length} Active
          </span>
        </div>

        {activeInvestments.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>
              🪙
            </div>

            <h3 style={styles.emptyTitle}>
              No Active Gold Investments
            </h3>

            <p style={styles.emptyText}>
              Your purchased gold investments will
              appear here.
            </p>
          </div>
        ) : (
          <div style={styles.investmentGrid}>
            {activeInvestments.map(
              (investment) => {
                const profit =
                  Number(
                    investment.profitLoss || 0
                  ) >= 0;

                return (
                  <div
                    key={investment.id}
                    style={styles.investmentCard}
                  >
                    <div style={styles.investmentTop}>
                      <div>
                        <div style={styles.goldTitleRow}>
                          <span style={styles.goldMiniIcon}>
                            🪙
                          </span>

                          <div>
                            <h3 style={styles.investmentTitle}>
                              Digital Gold
                            </h3>

                            <span style={styles.investmentId}>
                              Investment #
                              {investment.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span style={styles.activeBadge}>
                        ACTIVE
                      </span>
                    </div>

                    <div style={styles.investmentDetails}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>
                          Purity
                        </span>

                        <strong style={styles.detailValue}>
                          {investment.purity}
                        </strong>
                      </div>

                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>
                          Quantity
                        </span>

                        <strong style={styles.detailValue}>
                          {formatNumber(
                            investment.quantityGrams
                          )}{" "}
                          g
                        </strong>
                      </div>

                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>
                          Buy Price
                        </span>

                        <strong style={styles.detailValue}>
                          {formatCurrency(
                            investment.purchasePricePerGram
                          )}
                        </strong>
                      </div>

                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>
                          Current Price
                        </span>

                        <strong style={styles.detailValue}>
                          {formatCurrency(
                            investment.currentPricePerGram
                          )}
                        </strong>
                      </div>
                    </div>

                    <div style={styles.valueBox}>
                      <div>
                        <span style={styles.valueLabel}>
                          Invested
                        </span>

                        <strong style={styles.valueAmount}>
                          {formatCurrency(
                            investment.investmentAmount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.valueLabel}>
                          Current Value
                        </span>

                        <strong style={styles.currentValue}>
                          {formatCurrency(
                            investment.currentValue
                          )}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.valueLabel}>
                          Profit / Loss
                        </span>

                        <strong
                          style={{
                            ...styles.currentValue,
                            color: profit
                              ? "#198754"
                              : "#dc3545",
                          }}
                        >
                          {profit ? "+" : ""}
                          {formatCurrency(
                            investment.profitLoss
                          )}
                        </strong>
                      </div>
                    </div>

                    <div style={styles.investmentFooter}>
                      <span style={styles.purchaseDate}>
                        Purchased:{" "}
                        {investment.purchaseDate ||
                          "—"}
                      </span>

                      <button
                        type="button"
                        style={styles.sellButton}
                        onClick={() =>
                          openSellModal(
                            investment
                          )
                        }
                      >
                        Sell Gold
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* =================================================
          INVESTMENT HISTORY
      ================================================= */}

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Gold Investment History
            </h2>

            <p style={styles.sectionSubtitle}>
              Previously completed gold investments
            </p>
          </div>
        </div>

        {soldInvestments.length === 0 ? (
          <div style={styles.emptyHistory}>
            No sold gold investments yet.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Investment
                  </th>

                  <th style={styles.th}>
                    Purity
                  </th>

                  <th style={styles.th}>
                    Quantity
                  </th>

                  <th style={styles.th}>
                    Invested
                  </th>

                  <th style={styles.th}>
                    Sale Value
                  </th>

                  <th style={styles.th}>
                    Profit / Loss
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {soldInvestments.map(
                  (investment) => {
                    const profit =
                      Number(
                        investment.profitLoss || 0
                      ) >= 0;

                    return (
                      <tr key={investment.id}>
                        <td style={styles.td}>
                          <strong>
                            Gold #
                            {investment.id}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {investment.purity}
                        </td>

                        <td style={styles.td}>
                          {formatNumber(
                            investment.quantityGrams
                          )}{" "}
                          g
                        </td>

                        <td style={styles.td}>
                          {formatCurrency(
                            investment.investmentAmount
                          )}
                        </td>

                        <td style={styles.td}>
                          {formatCurrency(
                            investment.currentValue
                          )}
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            color: profit
                              ? "#198754"
                              : "#dc3545",
                            fontWeight: 700,
                          }}
                        >
                          {profit ? "+" : ""}
                          {formatCurrency(
                            investment.profitLoss
                          )}
                        </td>

                        <td style={styles.td}>
                          <span style={styles.soldBadge}>
                            SOLD
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          SELL CONFIRMATION MODAL
      ================================================= */}

      {showSellModal &&
        selectedInvestment && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalIcon}>
                🪙
              </div>

              <h2 style={styles.modalTitle}>
                Sell Gold?
              </h2>

              <p style={styles.modalText}>
                Are you sure you want to sell this
                gold investment?
              </p>

              <div style={styles.modalDetails}>
                <div>
                  <span>
                    Gold Quantity
                  </span>

                  <strong>
                    {formatNumber(
                      selectedInvestment.quantityGrams
                    )}{" "}
                    g
                  </strong>
                </div>

                <div>
                  <span>
                    Current Value
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedInvestment.currentValue
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Current P/L
                  </span>

                  <strong
                    style={{
                      color:
                        Number(
                          selectedInvestment.profitLoss ||
                            0
                        ) >= 0
                          ? "#198754"
                          : "#dc3545",
                    }}
                  >
                    {Number(
                      selectedInvestment.profitLoss ||
                        0
                    ) >= 0
                      ? "+"
                      : ""}
                    {formatCurrency(
                      selectedInvestment.profitLoss
                    )}
                  </strong>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeSellModal}
                  disabled={sellingId !== null}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSell}
                  disabled={sellingId !== null}
                  style={{
                    ...styles.confirmSellButton,
                    opacity:
                      sellingId !== null
                        ? 0.65
                        : 1,
                  }}
                >
                  {sellingId !== null
                    ? "Selling..."
                    : "Confirm Sell"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "28px",
    color: "#1f2937",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background:
      "linear-gradient(135deg, #165dcc 0%, #2d74da 100%)",
    borderRadius: "18px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow:
      "0 10px 30px rgba(36, 87, 198, 0.18)",
    marginBottom: "22px",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  headerIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.12)",
  },

  headerTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "25px",
    fontWeight: 750,
  },

  headerSubtitle: {
    margin: "4px 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: "13px",
  },

  backButton: {
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.13)",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 650,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  successAlert: {
    background: "#eaf8ef",
    border: "1px solid #b9e6c8",
    color: "#176b36",
    borderRadius: "11px",
    padding: "12px 15px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 600,
  },

  errorAlert: {
    background: "#fff0f0",
    border: "1px solid #f2bcbc",
    color: "#a82929",
    borderRadius: "11px",
    padding: "12px 15px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 600,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "15px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxShadow:
      "0 4px 14px rgba(26, 48, 79, 0.05)",
  },

  summaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    flexShrink: 0,
  },

  summaryLabel: {
    margin: 0,
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 600,
  },

  summaryValue: {
    margin: "5px 0 0",
    fontSize: "19px",
    fontWeight: 750,
    color: "#172033",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.15fr) minmax(0, 0.85fr)",
    gap: "20px",
    marginBottom: "24px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "17px",
    padding: "22px",
    boxShadow:
      "0 5px 18px rgba(26, 48, 79, 0.05)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 750,
    color: "#172033",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#778196",
    fontSize: "13px",
  },

  goldBadge: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#fff7e6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  priceIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#eef4ff",
    color: "#2457c6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    fontWeight: 800,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#354052",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d9dfe9",
    borderRadius: "10px",
    padding: "12px 13px",
    background: "#ffffff",
    color: "#1f2937",
    fontSize: "14px",
    outline: "none",
  },

  purityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  },

  purityButton: {
    border: "1px solid #dce2ec",
    background: "#ffffff",
    borderRadius: "11px",
    padding: "12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "flex-start",
    color: "#455064",
  },

  purityButtonActive: {
    border: "2px solid #2457c6",
    background: "#f1f5ff",
    color: "#2457c6",
  },

  amountWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d9dfe9",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#ffffff",
  },

  amountPrefix: {
    paddingLeft: "13px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#687386",
  },

  amountInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px 10px",
    fontSize: "15px",
    background: "transparent",
  },

  helperText: {
    margin: 0,
    color: "#7a8495",
    fontSize: "11px",
  },

  calculationBox: {
    background: "#f5f8ff",
    border: "1px solid #dce6fb",
    borderRadius: "12px",
    padding: "14px",
    display: "grid",
    gridTemplateColumns:
      "1fr auto 1fr",
    alignItems: "center",
    gap: "12px",
  },

  calculationLabel: {
    display: "block",
    color: "#758096",
    fontSize: "11px",
    marginBottom: "4px",
  },

  calculationValue: {
    fontSize: "14px",
    color: "#26334a",
  },

  calculationGold: {
    fontSize: "15px",
    color: "#2457c6",
  },

  calculationDivider: {
    width: "1px",
    height: "34px",
    background: "#d5deef",
  },

  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: "11px",
    padding: "13px",
    background:
      "linear-gradient(135deg, #165dcc, #2d74da)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 750,
    cursor: "pointer",
    boxShadow:
      "0 7px 16px rgba(36, 87, 198, 0.2)",
  },

  warningText: {
    margin: 0,
    textAlign: "center",
    color: "#b06b00",
    fontSize: "12px",
  },

  priceList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  priceRow: {
    border: "1px solid #e8ecf3",
    borderRadius: "12px",
    padding: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pricePurity: {
    display: "block",
    color: "#172033",
    fontSize: "16px",
  },

  priceType: {
    display: "block",
    marginTop: "3px",
    color: "#7b8494",
    fontSize: "11px",
  },

  priceRight: {
    textAlign: "right",
  },

  priceAmount: {
    display: "block",
    color: "#2457c6",
    fontSize: "16px",
  },

  priceUnit: {
    display: "block",
    color: "#7b8494",
    fontSize: "11px",
    marginTop: "2px",
  },

  infoBox: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "10px",
    background: "#f7f9fc",
    color: "#687386",
    fontSize: "11px",
    lineHeight: 1.5,
    display: "flex",
    gap: "8px",
  },

  infoIcon: {
    color: "#2457c6",
    fontWeight: 800,
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "17px",
    padding: "22px",
    marginBottom: "24px",
    boxShadow:
      "0 5px 18px rgba(26, 48, 79, 0.05)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 750,
    color: "#172033",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#778196",
    fontSize: "13px",
  },

  countBadge: {
    background: "#eef4ff",
    color: "#2457c6",
    borderRadius: "20px",
    padding: "7px 12px",
    fontSize: "11px",
    fontWeight: 750,
  },

  investmentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  investmentCard: {
    border: "1px solid #e5e9f0",
    borderRadius: "14px",
    padding: "17px",
    background: "#ffffff",
  },

  investmentTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "16px",
  },

  goldTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  goldMiniIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "10px",
    background: "#fff7e6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  investmentTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 750,
  },

  investmentId: {
    color: "#8490a3",
    fontSize: "10px",
  },

  activeBadge: {
    background: "#eaf8ef",
    color: "#198754",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: 800,
  },

  investmentDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    paddingBottom: "15px",
    borderBottom: "1px solid #edf0f4",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  detailLabel: {
    color: "#8490a3",
    fontSize: "10px",
  },

  detailValue: {
    color: "#303a4d",
    fontSize: "12px",
  },

  valueBox: {
    marginTop: "15px",
    background: "#f8faff",
    borderRadius: "11px",
    padding: "12px",
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },

  valueLabel: {
    display: "block",
    color: "#7b8494",
    fontSize: "10px",
    marginBottom: "4px",
  },

  valueAmount: {
    fontSize: "12px",
    color: "#303a4d",
  },

  currentValue: {
    fontSize: "12px",
    color: "#2457c6",
  },

  investmentFooter: {
    marginTop: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  purchaseDate: {
    color: "#7b8494",
    fontSize: "10px",
  },

  sellButton: {
    border: "1px solid #f0b6b6",
    background: "#fff5f5",
    color: "#c53030",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
  },

  emptyCard: {
    border: "1px dashed #d9dfe9",
    borderRadius: "13px",
    padding: "40px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "34px",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#354052",
  },

  emptyText: {
    margin: "7px 0 0",
    color: "#7b8494",
    fontSize: "12px",
  },

  emptyHistory: {
    border: "1px dashed #d9dfe9",
    borderRadius: "12px",
    padding: "25px",
    textAlign: "center",
    color: "#7b8494",
    fontSize: "13px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "750px",
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    background: "#f7f9fc",
    color: "#69758a",
    fontSize: "10px",
    fontWeight: 750,
    borderBottom: "1px solid #e5e9f0",
  },

  td: {
    padding: "13px 10px",
    fontSize: "11px",
    color: "#3c4658",
    borderBottom: "1px solid #edf0f4",
  },

  soldBadge: {
    background: "#f1f3f5",
    color: "#69758a",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: 800,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 28, 48, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    borderRadius: "17px",
    padding: "25px",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.2)",
    textAlign: "center",
  },

  modalIcon: {
    width: "55px",
    height: "55px",
    margin: "0 auto 12px",
    borderRadius: "50%",
    background: "#fff7e6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: 750,
    color: "#172033",
  },

  modalText: {
    margin: "8px 0 18px",
    color: "#737e91",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  modalDetails: {
    background: "#f7f9fc",
    borderRadius: "11px",
    padding: "13px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    textAlign: "left",
  },

  modalDetailsRow: {
    display: "flex",
    justifyContent: "space-between",
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  cancelButton: {
    flex: 1,
    border: "1px solid #d8dee8",
    background: "#ffffff",
    color: "#536075",
    borderRadius: "10px",
    padding: "11px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  confirmSellButton: {
    flex: 1,
    border: "none",
    background: "#dc3545",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "11px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  loadingCard: {
    maxWidth: "450px",
    margin: "120px auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "45px 25px",
    textAlign: "center",
    boxShadow:
      "0 10px 35px rgba(26, 48, 79, 0.08)",
  },

  loadingIcon: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  loadingTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#172033",
  },

  loadingText: {
    margin: "8px 0 0",
    color: "#7b8494",
    fontSize: "13px",
  },
};