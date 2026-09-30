import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8080";

function Cards() {
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const [pinCardId, setPinCardId] = useState(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [settingPin, setSettingPin] = useState(false);
  const [blockingCardId, setBlockingCardId] = useState(null);
  const [showChangePinForm, setShowChangePinForm] = useState(false);
  const [changePinCardId, setChangePinCardId] = useState(null);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [changingPin, setChangingPin] = useState(false);
  const [showLimitsForm, setShowLimitsForm] = useState(false);
  const [limitsCardId, setLimitsCardId] = useState(null);
  const [dailyLimit, setDailyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [updatingLimits, setUpdatingLimits] = useState(false);
  const [showInternationalForm, setShowInternationalForm] = useState(false);
  const [internationalCardId, setInternationalCardId] = useState(null);
  const [internationalUsage, setInternationalUsage] = useState(false);
  const [updatingInternational, setUpdatingInternational] = useState(false);
  const [showRewardsForm, setShowRewardsForm] = useState(false);
  const [rewardsCardId, setRewardsCardId] = useState(null);
  const [rewardPoints, setRewardPoints] = useState("");
  const [addingRewards, setAddingRewards] = useState(false);
  const [showStatementForm, setShowStatementForm] = useState(false);
  const [statementCardId, setStatementCardId] = useState(null);
  const [cardStatement, setCardStatement] = useState([]);
  const [loadingStatement, setLoadingStatement] = useState(false);

  const [issueForm, setIssueForm] = useState({
    accountId: "",
    cardType: "DEBIT",
    cardNetwork: "VISA",
  });

  const [issuing, setIssuing] = useState(false);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Login token not found");
      }

      const response = await fetch(`${API_BASE_URL}/api/cards`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load cards (${response.status})`);
      }

      const data = await response.json();

      setCards(
    Array.isArray(data)
        ? data.filter((card) => {
              const status = String(card.status || "").toUpperCase();

              return status !== "BLOCKED" && status !== "REPLACED";
          })
        : []
);
    } catch (err) {
      console.error("Load cards error:", err);
      setError(err.message || "Unable to load cards");
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load accounts");
      }

      const data = await response.json();

      // Store accounts for Issue New Card dropdown
      setAccounts(Array.isArray(data) ? data : []);

      // Automatically select first account
      if (Array.isArray(data) && data.length > 0) {
        setIssueForm((prev) => ({
          ...prev,
          accountId: String(data[0].id),
        }));
      }
    } catch (err) {
      console.error("Accounts loading error:", err);
    }
  };

  const handleIssueCard = async (e) => {
    e.preventDefault();

    try {
      setIssuing(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return;
      }

      if (!issueForm.accountId) {
        alert("Please select an account.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/cards/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: Number(issueForm.accountId),
          cardType: issueForm.cardType,
          cardNetwork: issueForm.cardNetwork,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to issue card");
      }

      alert("Card issued successfully! 💳");

      setShowIssueForm(false);

      setIssueForm({
        accountId: "",
        cardType: "DEBIT",
        cardNetwork: "VISA",
      });

      await loadCards();
    } catch (err) {
      console.error("Card issuance error:", err);
      alert(err.message || "Unable to issue card.");
    } finally {
      setIssuing(false);
    }
  };

  // =====================================================
  // CARD ACTIVATION
  // =====================================================

  const handleActivateCard = async (cardId) => {
    const confirmed = window.confirm(
      "Are you sure you want to activate this card?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Login session expired. Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cards/${cardId}/activate`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        alert("Login session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Card activation failed (${response.status})`,
        );
      }

      alert("Card activated successfully! 💳");

      // Refresh cards so ISSUED becomes ACTIVE
      await loadCards();
    } catch (err) {
      console.error("Card activation error:", err);

      alert(err.message || "Unable to activate the card. Please try again.");
    }
  };

  // =====================================================
  // SET CARD PIN
  // =====================================================

  const handleSetPin = async (e) => {
    e.preventDefault();

    if (!pinCardId) {
      alert("Card not selected.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      alert("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      alert("PIN and Confirm PIN do not match.");
      return;
    }

    try {
      setSettingPin(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Login session expired. Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cards/${pinCardId}/pin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pin: pin,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data.message || data.error || `PIN setup failed (${response.status})`,
        );
      }

      if (response.status === 401 || response.status === 403) {
        alert("Login session expired. Please login again.");
        return;
      }

      alert("Card PIN set successfully! 🔐");

      setShowPinForm(false);
      setPinCardId(null);
      setPin("");
      setConfirmPin("");

      await loadCards();
    } catch (err) {
      console.error("Card PIN setup error:", err);

      alert(err.message || "Unable to set card PIN. Please try again.");
    } finally {
      setSettingPin(false);
    }
  };

  const handleChangePin = async () => {
    if (!currentPin || !newPin || !confirmNewPin) {
      alert("Please fill all PIN fields.");
      return;
    }

    if (!/^\d{4}$/.test(currentPin)) {
      alert("Current PIN must contain exactly 4 digits.");
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      alert("New PIN must contain exactly 4 digits.");
      return;
    }

    if (newPin !== confirmNewPin) {
      alert("New PIN and Confirm PIN do not match.");
      return;
    }

    if (currentPin === newPin) {
      alert("New PIN must be different from current PIN.");
      return;
    }

    try {
      setChangingPin(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/api/cards/${changePinCardId}/pin/change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPin: currentPin,
            newPin: newPin,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `PIN change failed (${response.status})`,
        );
      }

      alert("Card PIN changed successfully! 🔐");

      setShowChangePinForm(false);
      setChangePinCardId(null);
      setCurrentPin("");
      setNewPin("");
      setConfirmNewPin("");

      await loadCards();
    } catch (error) {
      console.error("Change PIN error:", error);
      alert(error.message || "Failed to change PIN.");
    } finally {
      setChangingPin(false);
    }
  };

  const handleUpdateLimits = async () => {
    const daily = Number(dailyLimit);
    const monthly = Number(monthlyLimit);

    if (!dailyLimit || !monthlyLimit) {
        alert("Please enter both daily and monthly limits.");
        return;
    }

    if (!Number.isFinite(daily) || daily <= 0) {
        alert("Daily transaction limit must be greater than 0.");
        return;
    }

    if (!Number.isFinite(monthly) || monthly <= 0) {
        alert("Monthly transaction limit must be greater than 0.");
        return;
    }

    if (daily > monthly) {
        alert("Daily limit cannot be greater than monthly limit.");
        return;
    }

    try {
        setUpdatingLimits(true);

        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Login session expired. Please login again.");
        }

        const response = await fetch(
            `http://localhost:8080/api/cards/${limitsCardId}/limits`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    dailyTransactionLimit: daily,
                    monthlyTransactionLimit: monthly,
                }),
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                `Limit update failed (${response.status})`
            );
        }

        alert("Transaction limits updated successfully! 💳");

        setShowLimitsForm(false);
        setLimitsCardId(null);
        setDailyLimit("");
        setMonthlyLimit("");

        await loadCards();
    } catch (error) {
        console.error("Update Limits Error:", error);

        alert(
            error.message ||
            "Failed to update transaction limits."
        );
    } finally {
        setUpdatingLimits(false);
    }
};

// =====================================================
// UPDATE INTERNATIONAL USAGE
// =====================================================

const handleUpdateInternationalUsage = async () => {
    if (!internationalCardId) {
        alert("Card not selected.");
        return;
    }

    try {
        setUpdatingInternational(true);

        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error(
                "Login session expired. Please login again."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/api/cards/${internationalCardId}/international-usage`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(internationalUsage),
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                `International usage update failed (${response.status})`
            );
        }

        alert(
            internationalUsage
                ? "International usage enabled successfully! 🌍"
                : "International usage disabled successfully! 🌍"
        );

        setShowInternationalForm(false);
        setInternationalCardId(null);

        await loadCards();

    } catch (error) {
        console.error(
            "International Usage Error:",
            error
        );

        alert(
            error.message ||
            "Failed to update international usage."
        );

    } finally {
        setUpdatingInternational(false);
    }
};

// =====================================================
// ADD REWARD POINTS
// =====================================================

const handleAddRewardPoints = async () => {
    const points = Number(rewardPoints);

    if (!rewardsCardId) {
        alert("Card not selected.");
        return;
    }

    if (!rewardPoints) {
        alert("Please enter reward points.");
        return;
    }

    if (!Number.isInteger(points) || points <= 0) {
        alert("Reward points must be a positive whole number.");
        return;
    }

    try {
        setAddingRewards(true);

        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error(
                "Login session expired. Please login again."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/api/cards/${rewardsCardId}/rewards`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    points: points,
                }),
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                `Reward points update failed (${response.status})`
            );
        }

        alert("Reward points added successfully! 🎁");

        setShowRewardsForm(false);
        setRewardsCardId(null);
        setRewardPoints("");

        await loadCards();

    } catch (error) {
        console.error(
            "Reward Points Error:",
            error
        );

        alert(
            error.message ||
            "Failed to add reward points."
        );

    } finally {
        setAddingRewards(false);
    }
};

const handleViewStatement = async (cardId) => {
  if (!cardId) {
    alert("Card not selected.");
    return;
  }

  try {
    setLoadingStatement(true);
    setStatementCardId(cardId);
    setShowStatementForm(true);
    setCardStatement([]);

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Login session expired. Please login again.");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/cards/${cardId}/statement`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        `Failed to load card statement (${response.status})`
      );
    }

    setCardStatement(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Card Statement Error:", error);
    setShowStatementForm(false);
    setStatementCardId(null);
    alert(error.message || "Failed to load card statement.");
  } finally {
    setLoadingStatement(false);
  }
};

  const handleViewDetails = async (cardId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/cards/${cardId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load card details");
      }

      const data = await response.json();

      setSelectedCard(data);
      setShowDetails(true);
    } catch (err) {
      console.error("Card details error:", err);
      alert("Unable to load card details.");
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) {
      return "₹0";
    }

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatExpiry = (expiryDate) => {
    if (!expiryDate) return "-";

    const date = new Date(expiryDate);

    if (Number.isNaN(date.getTime())) {
      return expiryDate;
    }

    return date.toLocaleDateString("en-IN", {
      month: "2-digit",
      year: "numeric",
    });
  };

  // =====================================================
  // BLOCK CARD
  // =====================================================

  const handleBlockCard = async (cardId) => {
    const confirmed = window.confirm(
      "Are you sure you want to block this card?\n\n" +
        "The card will no longer be usable after blocking.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setBlockingCardId(cardId);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Login session expired. Please login again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cards/${cardId}/block`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {
          message: responseText,
        };
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error("Your login session has expired. Please login again.");
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Card blocking failed (${response.status})`,
        );
      }

      alert("Card blocked successfully! 🔒\n\n" + "The card is now BLOCKED.");

      await loadCards();
    } catch (err) {
      console.error("Card blocking error:", err);

      alert(err.message || "Unable to block the card. Please try again.");
    } finally {
      setBlockingCardId(null);
    }
  };

  const handleReplaceCard = async (cardId) => {
    const confirmed = window.confirm(
      "Are you sure you want to replace this card?\n\nThe blocked card will permanently become REPLACED and a new card will be issued.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Login session expired. Please login again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/cards/${cardId}/replace`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Card replacement failed (${response.status})`,
        );
      }

      alert(
        "Card replaced successfully!\n\nYour new card has been issued and is currently in ISSUED status.",
      );

      await loadCards();
    } catch (err) {
      console.error("Card replacement error:", err);

      alert(err.message || "Unable to replace the card. Please try again.");
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "card-status active";

      case "BLOCKED":
        return "card-status blocked";

      case "REPLACED":
        return "card-status replaced";

      case "ISSUED":
        return "card-status issued";

      default:
        return "card-status";
    }
  };

  if (loading) {
    return (
      <>
        <style>{cardsStyles}</style>

        <div className="cards-page">
          <div className="cards-loading">
            <div className="loading-spinner"></div>
            <p>Loading your cards...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{cardsStyles}</style>

      <div className="cards-page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="cards-page-header"
          style={{
            width: "100%",
            maxHeight: "none",
            margin: "0 0 32px 0",
            padding: "26px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "30px",
            position: "relative",
            overflow: "hidden",
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)",
            color: "#ffffff",
            boxShadow: "0 14px 32px rgba(13, 71, 161, 0.25)",
          }}
        >
          <div className="cards-header-left">
            <div className="cards-header-icon">💳</div>

            <div className="cards-header-text">
              <div className="header-eyebrow">AVANI BANK</div>
              <h1>My Cards</h1>
              <p>Manage your Avani Bank debit and credit cards</p>
            </div>
          </div>

          <div className="cards-header-actions">
            <button
              type="button"
              className="dashboard-btn"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              <span className="dashboard-icon">⌂</span>
              Dashboard
            </button>

            <button
              type="button"
              className="issue-card-btn"
              onClick={() => {
                setShowIssueForm(true);
                loadAccounts();
              }}
            >
              <span>＋</span>
              Issue New Card
            </button>
          </div>
        </div>

        {/* =====================================================
    ISSUE NEW CARD MODAL
===================================================== */}

        {showIssueForm && (
          <div className="modal-overlay">
            <div className="modal issue-card-modal">
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Issue New Card</h2>

                  <p
                    className="modal-subtitle"
                    style={{
                      fontWeight: "700",
                      marginBottom: "15px",
                    }}
                  >
                    Choose your account, card type and network
                  </p>
                </div>

                 <button
          type="button"
          className="close-button"
          onClick={() => setShowIssueForm(false)}
        >
          ×
        </button> 
              </div>

              <form onSubmit={handleIssueCard}>
                {/* ACCOUNT */}

                <div className="issue-form-group">
                  <label>Select Account</label>

                  <select
                    value={issueForm.accountId}
                    onChange={(e) =>
                      setIssueForm({
                        ...issueForm,
                        accountId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select your account</option>

                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountNumber} — {account.accountType}
                        {" — ₹"}
                        {Number(account.balance || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CARD TYPE */}

                <div className="issue-form-group">
                  <label>Card Type</label>

                  <div className="issue-option-grid">
                    <button
                      type="button"
                      className={
                        issueForm.cardType === "DEBIT"
                          ? "issue-option selected"
                          : "issue-option"
                      }
                      onClick={() =>
                        setIssueForm({
                          ...issueForm,
                          cardType: "DEBIT",
                        })
                      }
                    >
                      <span className="issue-option-icon">💳</span>

                      <span>
                        <strong>Debit Card</strong>
                        <small>Linked to your bank account</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        issueForm.cardType === "CREDIT"
                          ? "issue-option selected"
                          : "issue-option"
                      }
                      onClick={() =>
                        setIssueForm({
                          ...issueForm,
                          cardType: "CREDIT",
                        })
                      }
                    >
                      <span className="issue-option-icon">💰</span>

                      <span>
                        <strong>Credit Card</strong>
                        <small>Credit limit based card</small>
                      </span>
                    </button>
                  </div>
                </div>

                {/* CARD NETWORK */}

                <div className="issue-form-group">
                  <label>Card Network</label>

                  <div className="issue-option-grid">
                    <button
                      type="button"
                      className={
                        issueForm.cardNetwork === "VISA"
                          ? "issue-option selected"
                          : "issue-option"
                      }
                      onClick={() =>
                        setIssueForm({
                          ...issueForm,
                          cardNetwork: "VISA",
                        })
                      }
                    >
                      <span className="network-logo">VISA</span>

                      <span>
                        <strong>Visa</strong>
                        <small>International acceptance</small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        issueForm.cardNetwork === "MASTERCARD"
                          ? "issue-option selected"
                          : "issue-option"
                      }
                      onClick={() =>
                        setIssueForm({
                          ...issueForm,
                          cardNetwork: "MASTERCARD",
                        })
                      }
                    >
                      <span className="network-logo">MC</span>

                      <span>
                        <strong>Mastercard</strong>
                        <small>Global card network</small>
                      </span>
                    </button>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="issue-form-footer">
                  <button
                    type="button"
                    className="issue-cancel-btn"
                    onClick={() => setShowIssueForm(false)}
                    disabled={issuing}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="issue-submit-btn"
                    disabled={issuing}
                  >
                    {issuing ? (
                      <>
                        <span className="button-spinner"></span>
                        Issuing...
                      </>
                    ) : (
                      <>💳 Issue Card</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="cards-error">
            <div className="error-icon">⚠</div>

            <div>
              <strong>Unable to load cards</strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {/* =====================================================
            PAGE INTRO
        ===================================================== */}

        {!error && cards.length > 0 && (
          <div className="cards-section-heading">
            <div>
              <h2>Your Cards</h2>

              <p>View and manage all your Avani Bank cards</p>
            </div>

            <div className="card-count">
              {cards.length} {cards.length === 1 ? "Card" : "Cards"}
            </div>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!error && cards.length === 0 && (
          <div className="no-cards">
            <div className="empty-card-icon">💳</div>

            <h3>No Cards Found</h3>

            <p>You don't have any debit or credit cards yet.</p>

            <button className="issue-card-btn dark">
              <span>＋</span>
              Issue New Card
            </button>
          </div>
        )}

        {/* =====================================================
            CARDS
        ===================================================== */}

        <div className="cards-grid">
          {cards.map((card) => (
            <div className="card-item" key={card.id}>
              {/* =================================================
                  PHYSICAL CARD
              ================================================= */}

              <div className="bank-card">
                <div className="card-background-circle circle-one"></div>
                <div className="card-background-circle circle-two"></div>

                <div className="card-top">
                  <div className="bank-brand">
                    <div className="bank-logo">A</div>

                    <div>
                      <div className="bank-name">AVANI BANK</div>

                      <div className="bank-subtitle">DIGITAL BANKING</div>
                    </div>
                  </div>

                  <div className="card-network">{card.cardNetwork}</div>
                </div>

                {/* CHIP */}

                <div className="card-chip">
                  <div className="chip-horizontal"></div>

                  <div className="chip-vertical"></div>

                  <div className="chip-small-line"></div>
                </div>

                {/* CARD NUMBER */}

                <div className="card-number">{card.maskedCardNumber}</div>

                {/* CARD BOTTOM */}

                <div className="card-bottom">
                  <div className="card-type-block">
                    <span className="card-label">CARD TYPE</span>

                    <strong>{card.cardType}</strong>
                  </div>

                  <div className="card-validity">
                    <span className="card-label">VALID THRU</span>

                    <strong>{formatExpiry(card.expiryDate)}</strong>
                  </div>

                  <div className="card-network-small">{card.cardNetwork}</div>
                </div>
              </div>

              {/* =================================================
                  CARD INFORMATION
              ================================================= */}

              <div className="card-info">
                <div className="card-info-header">
                  <div>
                    <div className="card-title-row">
                      <h3>{card.cardType} Card</h3>

                      <span className={getStatusClass(card.status)}>
                        <span className="status-dot"></span>
                        {card.status}
                      </span>
                    </div>

                    <p className="card-subtitle">{card.cardNetwork} Network</p>
                  </div>

                  <div className="card-id">CARD #{card.id}</div>
                </div>

                {/* =================================================
                    DETAILS
                ================================================= */}

                <div className="card-details-grid">
                  {/* PIN */}

                  <div className="detail-box">
                    <div className="detail-icon blue">🔐</div>

                    <div className="detail-content">
                      <span>PIN</span>

                      <strong>
                        {card.pinSet ? (
                          <>
                            <span className="success-icon">✓</span>
                            Set
                          </>
                        ) : (
                          "Not Set"
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* INTERNATIONAL */}

                  <div className="detail-box">
                    <div className="detail-icon purple">✈</div>

                    <div className="detail-content">
                      <span>International</span>

                      <strong>
                        {card.internationalUsageEnabled ? (
                          <>
                            <span className="success-icon">✓</span>
                            Enabled
                          </>
                        ) : (
                          "Disabled"
                        )}
                      </strong>
                    </div>
                  </div>

                  {/* DAILY LIMIT */}

                  <div className="detail-box">
                    <div className="detail-icon green">₹</div>

                    <div className="detail-content">
                      <span>Daily Limit</span>

                      <strong>
                        {formatAmount(card.dailyTransactionLimit)}
                      </strong>
                    </div>
                  </div>

                  {/* MONTHLY LIMIT */}

                  <div className="detail-box">
                    <div className="detail-icon orange">◫</div>

                    <div className="detail-content">
                      <span>Monthly Limit</span>

                      <strong>
                        {formatAmount(card.monthlyTransactionLimit)}
                      </strong>
                    </div>
                  </div>

                  {/* REWARD POINTS */}

                  <div className="detail-box reward-box">
                    <div className="detail-icon reward">⭐</div>

                    <div className="detail-content">
                      <span>Reward Points</span>

                      <strong>{card.rewardPoints ?? 0}</strong>
                    </div>
                  </div>

                  {/* CREDIT LIMIT */}

                  {card.creditLimit !== null &&
                    card.creditLimit !== undefined && (
                      <div className="detail-box">
                        <div className="detail-icon red">💰</div>

                        <div className="detail-content">
                          <span>Credit Limit</span>

                          <strong>{formatAmount(card.creditLimit)}</strong>
                        </div>
                      </div>
                    )}
                </div>

                {/* =================================================
                    VIEW BUTTON
                ================================================= */}

                <button
                  className="view-card-btn"
                  type="button"
                  onClick={() => handleViewDetails(card.id)}
                >
                  <span>View Card Details</span>

                  <span className="view-arrow">→</span>
                </button>

                {card.status?.toUpperCase() === "ISSUED" && (
                  <button
                    type="button"
                    className="activate-card-btn"
                    onClick={() => handleActivateCard(card.id)}
                  >
                    <span>✓</span>
                    Activate Card
                  </button>
                )}

                {card.status?.toUpperCase() === "ACTIVE" && !card.pinSet && (
                  <button
                    type="button"
                    className="set-pin-card-btn"
                    onClick={() => {
                      setPinCardId(card.id);
                      setPin("");
                      setConfirmPin("");
                      setShowPinForm(true);
                    }}
                  >
                    <span>🔐</span>
                    Set PIN
                  </button>
                )}

                {card.status === "ACTIVE" && card.pinSet && (
                  <button
                    className="card-action-btn"
                    onClick={() => {
                      setChangePinCardId(card.id);
                      setCurrentPin("");
                      setNewPin("");
                      setConfirmNewPin("");
                      setShowChangePinForm(true);
                    }}
                  >
                    🔐 Change PIN
                  </button>
                )}

  {card.status?.toUpperCase() === "ACTIVE" && (
    <button
        type="button"
        className="manage-limits-btn"
        onClick={() => {
            setLimitsCardId(card.id);
            setDailyLimit(
                String(card.dailyTransactionLimit ?? "")
            );
            setMonthlyLimit(
                String(card.monthlyTransactionLimit ?? "")
            );
            setShowLimitsForm(true);
        }}
    >
        💳 Manage Limits
    </button>
)}

{/* REWARDS */}
{card.status?.toUpperCase() === "ACTIVE" && (
    <button
        type="button"
        className="rewards-btn"
        onClick={() => {
            setRewardsCardId(card.id);
            setRewardPoints("");
            setShowRewardsForm(true);
        }}
    >
        🎁 Manage Rewards
    </button>
)}

{card.status?.toUpperCase() === "ACTIVE" && (
    <button
        type="button"
        className="international-usage-btn"
        onClick={() => {
            setInternationalCardId(card.id);
            setInternationalUsage(
                Boolean(card.internationalUsageEnabled)
            );
            setShowInternationalForm(true);
        }}
    >
        🌍 International Usage
    </button>
)}

{card.status?.toUpperCase() === "ACTIVE" && (
  <button
    type="button"
    className="statement-btn"
    onClick={() => handleViewStatement(card.id)}
  >
    📄 View Statement
  </button>
)}

                {showChangePinForm && changePinCardId === card.id &&(
                  <div className="modal-overlay">
                    <div className="modal-content">
                      <h2>🔐 Change Card PIN</h2>

                      <p>
                        Enter your current PIN and choose a new 4-digit PIN.
                      </p>

                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength="4"
                        placeholder="Current PIN"
                        value={currentPin}
                        onChange={(e) =>
                          setCurrentPin(e.target.value.replace(/\D/g, ""))
                        }
                      />

                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength="4"
                        placeholder="New PIN"
                        value={newPin}
                        onChange={(e) =>
                          setNewPin(e.target.value.replace(/\D/g, ""))
                        }
                      />

                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength="4"
                        placeholder="Confirm New PIN"
                        value={confirmNewPin}
                        onChange={(e) =>
                          setConfirmNewPin(e.target.value.replace(/\D/g, ""))
                        }
                      />

                      <div className="modal-actions">
                        <button
                          onClick={handleChangePin}
                          disabled={changingPin}
                        >
                          {changingPin ? "Changing..." : "Change PIN"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowChangePinForm(false);
                            setChangePinCardId(null);
                            setCurrentPin("");
                            setNewPin("");
                            setConfirmNewPin("");
                          }}
                          disabled={changingPin}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {card.status?.toUpperCase() === "ACTIVE" && (
                  <button
                    type="button"
                    className="block-card-btn"
                    onClick={() => handleBlockCard(card.id)}
                    disabled={blockingCardId === card.id}
                  >
                    <span>🔒</span>

                    {blockingCardId === card.id
                      ? "Blocking Card..."
                      : "Block Card"}
                  </button>
                )}

                {card.status?.toUpperCase() === "BLOCKED" && (
                  <button
                    className="replace-card-btn"
                    onClick={() => handleReplaceCard(card.id)}
                  >
                    <span>↻</span>
                    Replace Card
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {showDetails && selectedCard && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Card Details</h2>
                  <p className="modal-subtitle">
                    Complete information about your card
                  </p>
                </div>

                 <button
                  type="button"
                  className="pin-close-button"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedCard(null);
                  }}
                >
                  ×
                </button> 
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span>Card Type</span>
                  <strong>{selectedCard.cardType}</strong>
                </div>

                <div className="detail-item">
                  <span>Card Network</span>
                  <strong>{selectedCard.cardNetwork}</strong>
                </div>

                <div className="detail-item">
                  <span>Card Number</span>
                  <strong>{selectedCard.maskedCardNumber}</strong>
                </div>

                <div className="detail-item">
                  <span>Expiry Date</span>
                  <strong>{formatExpiry(selectedCard.expiryDate)}</strong>
                </div>

                <div className="detail-item">
                  <span>Status</span>
                  <strong>{selectedCard.status}</strong>
                </div>

                <div className="detail-item">
                  <span>PIN Status</span>
                  <strong>
                    {selectedCard.pinSet ? "PIN Set" : "PIN Not Set"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>International Usage</span>
                  <strong>
                    {selectedCard.internationalUsageEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Daily Transaction Limit</span>
                  <strong>
                    {formatAmount(selectedCard.dailyTransactionLimit)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Monthly Transaction Limit</span>
                  <strong>
                    {formatAmount(selectedCard.monthlyTransactionLimit)}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Reward Points</span>
                  <strong>{selectedCard.rewardPoints ?? 0}</strong>
                </div>

                {selectedCard.creditLimit != null && (
                  <div className="detail-item">
                    <span>Credit Limit</span>
                    <strong>{formatAmount(selectedCard.creditLimit)}</strong>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="close-modal-button"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedCard(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

{/* =====================================================
    TRANSACTION LIMITS MODAL
    ===================================================== */}

{showLimitsForm && (
  <div className="limits-modal-overlay">
    <div className="limits-modal">

      {/* HEADER */}
      <div className="limits-modal-header">
        <div className="limits-header-icon">
          💳
        </div>

        <div className="limits-header-text">
          <h2>Transaction Limits</h2>
          <p>
            Manage your daily and monthly card spending limits
          </p>
        </div>

        <button
          type="button"
          className="limits-close-button"
          onClick={() => {
            if (updatingLimits) return;

            setShowLimitsForm(false);
            setLimitsCardId(null);
            setDailyLimit("");
            setMonthlyLimit("");
          }}
        >
          ×
        </button>
      </div>

      {/* BODY */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateLimits();
        }}
      >
        <div className="limits-modal-body">

          {/* DAILY LIMIT */}
          <div className="limit-form-group">
            <label htmlFor="dailyLimit">
              Daily Transaction Limit
            </label>

            <div className="limit-input-wrapper">
              <span className="currency-symbol">₹</span>

              <input
                id="dailyLimit"
                type="number"
                min="1"
                step="1"
                value={dailyLimit}
                onChange={(e) =>
                  setDailyLimit(e.target.value)
                }
                placeholder="Enter daily limit"
                disabled={updatingLimits}
              />
            </div>

            <small>
              Maximum amount that can be spent/transacted in one day.
            </small>
          </div>

          {/* MONTHLY LIMIT */}
          <div className="limit-form-group">
            <label htmlFor="monthlyLimit">
              Monthly Transaction Limit
            </label>

            <div className="limit-input-wrapper">
              <span className="currency-symbol">₹</span>

              <input
                id="monthlyLimit"
                type="number"
                min="1"
                step="1"
                value={monthlyLimit}
                onChange={(e) =>
                  setMonthlyLimit(e.target.value)
                }
                placeholder="Enter monthly limit"
                disabled={updatingLimits}
              />
            </div>

            <small>
              Maximum amount that can be spent/transacted in one month.
            </small>
          </div>

          {/* INFO */}
          <div className="limits-info-note">
            <span>🔐</span>

            <div>
              <strong>Secure Limit Control</strong>
              <p>
                Your daily limit cannot be greater than your
                monthly limit.
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="limits-modal-footer">

          <button
            type="button"
            className="limits-cancel-button"
            onClick={() => {
              if (updatingLimits) return;

              setShowLimitsForm(false);
              setLimitsCardId(null);
              setDailyLimit("");
              setMonthlyLimit("");
            }}
            disabled={updatingLimits}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="limits-update-button"
            disabled={
              updatingLimits ||
              !dailyLimit ||
              !monthlyLimit
            }
          >
            {updatingLimits
              ? "Updating..."
              : "Update Limits"}
          </button>

        </div>
      </form>
    </div>
  </div>
)}

{/* =====================================================
    INTERNATIONAL USAGE MODAL
    ===================================================== */}

{showInternationalForm && (
    <div className="international-modal-overlay">

        <div className="international-modal">

            {/* HEADER */}
            <div className="international-modal-header">

                <div className="international-header-icon">
                    🌍
                </div>

                <div className="international-header-text">
                    <h2>International Usage</h2>

                    <p>
                        Control international transactions for your card
                    </p>
                </div>

                <button
                    type="button"
                    className="international-close-button"
                    onClick={() => {
                        if (updatingInternational) return;

                        setShowInternationalForm(false);
                        setInternationalCardId(null);
                    }}
                >
                    ×
                </button>

            </div>


            {/* BODY */}
            <div className="international-modal-body">

                {/* STATUS CARD */}
                <div className="international-status-card">

                    <div className="international-status-icon">
                        {internationalUsage ? "🌍" : "🚫"}
                    </div>

                    <div className="international-status-content">

                        <span>
                            Current International Usage
                        </span>

                        <strong
                            className={
                                internationalUsage
                                    ? "international-enabled"
                                    : "international-disabled"
                            }
                        >
                            {internationalUsage
                                ? "Enabled"
                                : "Disabled"}
                        </strong>

                    </div>

                </div>


                {/* TOGGLE */}
                <div className="international-toggle-section">

                    <div className="international-toggle-text">

                        <strong>
                            International Transactions
                        </strong>

                        <p>
                            {internationalUsage
                                ? "Your card can currently be used for international transactions."
                                : "Your card is currently restricted from international transactions."}
                        </p>

                    </div>


                    <button
                        type="button"
                        className={`international-toggle ${
                            internationalUsage
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            setInternationalUsage(
                                !internationalUsage
                            )
                        }
                        disabled={updatingInternational}
                        aria-label="Toggle international usage"
                    >
                        <span className="international-toggle-slider">
                            {internationalUsage ? "✓" : ""}
                        </span>
                    </button>

                </div>


                {/* SECURITY NOTE */}
                <div className="international-security-note">

                    <span>🔐</span>

                    <div>
                        <strong>
                            Secure International Usage
                        </strong>

                        <p>
                            Enable international usage only when you
                            need to make transactions outside India.
                            You can disable it anytime.
                        </p>
                    </div>

                </div>

            </div>


            {/* FOOTER */}
            <div className="international-modal-footer">

                <button
                    type="button"
                    className="international-cancel-button"
                    onClick={() => {
                        if (updatingInternational) return;

                        setShowInternationalForm(false);
                        setInternationalCardId(null);
                    }}
                    disabled={updatingInternational}
                >
                    Cancel
                </button>


                <button
                    type="button"
                    className="international-update-button"
                    onClick={handleUpdateInternationalUsage}
                    disabled={updatingInternational}
                >
                    {updatingInternational
                        ? "Updating..."
                        : "Update Usage"}
                </button>

            </div>

        </div>

    </div>
)}

{/* =====================================================
    REWARDS MANAGEMENT MODAL
    ===================================================== */}

{showRewardsForm && (
    <div className="rewards-modal-overlay">

        <div className="rewards-modal">

            {/* HEADER */}
            <div className="rewards-modal-header">

                <div className="rewards-header-icon">
                    🎁
                </div>

                <div className="rewards-header-text">
                    <h2>Rewards Management</h2>

                    <p>
                        Manage your card reward points
                    </p>
                </div>

                <button
                    type="button"
                    className="rewards-close-button"
                    onClick={() => {
                        if (addingRewards) return;

                        setShowRewardsForm(false);
                        setRewardsCardId(null);
                        setRewardPoints("");
                    }}
                >
                    ×
                </button>

            </div>


            {/* BODY */}
            <div className="rewards-modal-body">

                {/* CURRENT REWARD POINTS */}
                <div className="rewards-balance-card">

                    <div className="rewards-balance-icon">
                        ⭐
                    </div>

                    <div className="rewards-balance-content">

                        <span>
                            Current Reward Points
                        </span>

                        <strong>
                            {cards.find(
                                (card) =>
                                    card.id === rewardsCardId
                            )?.rewardPoints ?? 0}
                        </strong>

                        <small>
                            points available on this card
                        </small>

                    </div>

                </div>


                {/* ADD POINTS */}
                <div className="rewards-form-group">

                    <label htmlFor="rewardPoints">
                        Add Reward Points
                    </label>

                    <div className="rewards-input-wrapper">

                        <span className="rewards-input-icon">
                            ⭐
                        </span>

                        <input
                            id="rewardPoints"
                            type="number"
                            min="1"
                            step="1"
                            value={rewardPoints}
                            onChange={(e) =>
                                setRewardPoints(
                                    e.target.value
                                )
                            }
                            placeholder="Enter reward points"
                            disabled={addingRewards}
                        />

                    </div>

                    <small>
                        Enter the number of reward points you
                        want to add to this card.
                    </small>

                </div>


                {/* INFO */}
                <div className="rewards-info-note">

                    <span>🎁</span>

                    <div>

                        <strong>
                            Reward Points
                        </strong>

                        <p>
                            Reward points are added to your
                            existing balance and cannot be
                            negative.
                        </p>

                    </div>

                </div>

            </div>


            {/* FOOTER */}
            <div className="rewards-modal-footer">

                <button
                    type="button"
                    className="rewards-cancel-button"
                    onClick={() => {
                        if (addingRewards) return;

                        setShowRewardsForm(false);
                        setRewardsCardId(null);
                        setRewardPoints("");
                    }}
                    disabled={addingRewards}
                >
                    Cancel
                </button>


                <button
                    type="button"
                    className="rewards-add-button"
                    onClick={handleAddRewardPoints}
                    disabled={
                        addingRewards ||
                        !rewardPoints
                    }
                >
                    {addingRewards
                        ? "Adding..."
                        : "Add Points"}
                </button>

            </div>

        </div>

    </div>
)}

{showStatementForm && (
  <div className="statement-modal-overlay">
    <div className="statement-modal">

      <div className="statement-modal-header">
        <div className="statement-header-icon">📄</div>

        <div className="statement-header-text">
          <h2>Card Statement</h2>
          <p>
            {cards.find((card) => card.id === statementCardId)
              ?.maskedCardNumber || "Card"} transaction history
          </p>
        </div>

        <button
          type="button"
          className="statement-close-button"
          onClick={() => {
            setShowStatementForm(false);
            setStatementCardId(null);
            setCardStatement([]);
          }}
        >
          ×
        </button>
      </div>

      <div className="statement-modal-body">
        {loadingStatement ? (
          <div className="statement-loading">
            <div className="statement-spinner"></div>
            <p>Loading statement...</p>
          </div>
        ) : cardStatement.length === 0 ? (
          <div className="statement-empty">
            <div className="statement-empty-icon">📭</div>
            <h3>No Transactions Found</h3>
            <p>
              There are no transactions available for this card yet.
            </p>
          </div>
        ) : (
          <div className="statement-table-wrapper">
            <table className="statement-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {cardStatement.map((transaction, index) => {
                  const amount = Number(transaction.amount || 0);

                  return (
                    <tr
                      key={
                        transaction.id ??
                        `${transaction.transactionDate}-${index}`
                      }
                    >
                      <td>
                        {transaction.transactionDate
                          ? new Date(
                              transaction.transactionDate
                            ).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>

                      <td>
                        <span className="statement-type">
                          {transaction.transactionType || "—"}
                        </span>
                      </td>

                      <td>
                        {transaction.senderAccountNumber || "—"}
                      </td>

                      <td>
                        {transaction.receiverAccountNumber || "—"}
                      </td>

                      <td>
                        <strong className="statement-amount">
                          ₹{amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`statement-status statement-status-${String(
                            transaction.status || ""
                          ).toLowerCase()}`}
                        >
                          {transaction.status || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="statement-modal-footer">
        <button
          type="button"
          className="statement-close-footer-button"
          onClick={() => {
            setShowStatementForm(false);
            setStatementCardId(null);
            setCardStatement([]);
          }}
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}

        {/* =====================================================
            SET PIN MODAL
            ===================================================== */}

        {showPinForm && (
          <div className="pin-modal-overlay">
            <div className="pin-modal">
              {/* HEADER */}

              <div className="pin-modal-header">
                <div>
                  <h2 className="pin-modal-title">Set Card PIN</h2>

                  <p className="pin-modal-subtitle">
                    Create a secure 4-digit PIN for your card
                  </p>
                </div>

                <button
                  type="button"
                  className="close-button"
                  onClick={() => {
                    if (settingPin) return;

                    setShowPinForm(false);
                    setPinCardId(null);
                    setPin("");
                    setConfirmPin("");
                  }}
                >
                  ×
                </button>
              </div>

              {/* FORM */}

              <form onSubmit={handleSetPin}>
                {/* ENTER PIN */}

                <div className="pin-form-group">
                  <label>Enter 4-Digit PIN</label>

                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);

                      setPin(value);
                    }}
                    placeholder="••••"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {/* CONFIRM PIN */}

                <div className="pin-form-group">
                  <label>Confirm PIN</label>

                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);

                      setConfirmPin(value);
                    }}
                    placeholder="••••"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {/* SECURITY MESSAGE */}

                <div className="pin-security-note">
                  🔒 Never share your PIN with anyone.
                </div>

                {/* BUTTONS */}

                <div className="pin-form-footer">
                  <button
                    type="button"
                    className="pin-cancel-btn"
                    onClick={() => {
                      if (settingPin) return;

                      setShowPinForm(false);
                      setPinCardId(null);
                      setPin("");
                      setConfirmPin("");
                    }}
                    disabled={settingPin}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="pin-submit-btn"
                    disabled={
                      settingPin || pin.length !== 4 || confirmPin.length !== 4
                    }
                  >
                    {settingPin ? "Setting PIN..." : "Set PIN"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="cards-footer">
          <span>Avani Bank • Secure Card Management</span>

          <span>🔒 Protected by secure banking infrastructure</span>
        </div>
      </div>
    </>
  );
}

/* =====================================================
   CARDS PAGE STYLING
   UI ONLY — EXISTING LOGIC UNCHANGED
===================================================== */

const cardsStyles = `

  * {
    box-sizing: border-box;
  }


  /* =====================================================
     PAGE
  ===================================================== */

  .cards-page {

    width: 100%;
    min-height: 100vh;

    padding: 30px 38px 45px;

    background:
      linear-gradient(
        180deg,
        #f4f7fc 0%,
        #f8faff 100%
      );

    font-family:
      Inter,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Arial,
      sans-serif;

    color: #172033;
  };

    /* =====================================================
   HEADER
===================================================== */

.cards-page-header {
  width: 100%;
  min-height: 130px;

  margin: 0 0 32px 0;
  padding: 26px 30px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 30px;

  position: relative;
  overflow: hidden;

  border-radius: 22px;

  background: linear-gradient(
    135deg,
    #102354 0%, #173f9d 48%, #2563d4 100%
  );

  color: #ffffff;

  box-shadow:
    0 12px 30px rgba(13, 71, 161, 0.20);
}





/* =====================================================
   HEADER LEFT
===================================================== */

.cards-header-left {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;

  gap: 17px;

  min-width: 0;
}


/* Card icon */

.cards-header-icon {
  width: 58px;
  height: 58px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 16px;

  background: rgba(255, 255, 255, 0.14);

  border: 1px solid rgba(255, 255, 255, 0.22);

  font-size: 28px;

  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.12);
}


/* Header text */

.cards-header-text {
  min-width: 0;
}


/* AVANI BANK */

.header-eyebrow {
  margin-bottom: 4px;

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 2px;

  color: rgba(255, 255, 255, 0.70);
}


/* My Cards */

.cards-page-header h1 {
  margin: 0;

  color: #ffffff;

  font-size: 32px;
  line-height: 1.15;

  font-weight: 800;

  letter-spacing: -0.5px;
}


/* Subtitle */

.cards-page-header p {
  margin: 7px 0 0;

  color: rgba(255, 255, 255, 0.82);

  font-size: 14px;
}


/* =====================================================
   HEADER RIGHT
===================================================== */

.cards-header-actions {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;

  gap: 12px;

  flex-shrink: 0;
}


/* Dashboard */

.dashboard-btn {
  height: 46px;

  padding: 0 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  border: 1px solid rgba(255, 255, 255, 0.28);

  border-radius: 12px;

  background: #ffffff;

  color: #173b8c;

  font-size: 14px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
    
.dashboard-icon {
  font-size: 18px;
  line-height: 1;
}


/* =====================================================
   ISSUE NEW CARD
===================================================== */

.cards-page-header .issue-card-btn {
  height: 46px;

  padding: 0 20px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  border: none;

  border-radius: 12px;

  background: #ffffff;

  color: #0d47a1;

  font-size: 14px;
  font-weight: 800;

  cursor: pointer;

  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.15);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}


.cards-page-header .issue-card-btn:hover {
  background: #f5f8ff;

  transform: translateY(-1px);

  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.18);
}


.cards-page-header .issue-card-btn span {
  font-size: 20px;
  line-height: 1;
}

/* =====================================================
   ACTIVATE CARD BUTTON
===================================================== */

.activate-card-btn {
  width: 100%;

  min-height:42px;

  margin-top: 10px;

  border: none;

  border-radius: 11px;

  background: linear-gradient(
    135deg,
    #15803d,
    #16a34a
  );

  color: #ffffff;

  font-size: 13px;

  font-weight: 800;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  box-shadow:
    0 7px 16px rgba(22, 163, 74, 0.20);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.activate-card-btn:hover {
  transform: translateY(-1px);

  box-shadow:
    0 10px 20px rgba(22, 163, 74, 0.25);
}

.activate-card-btn span {
  font-size: 17px;
  line-height: 1;
}


/* =====================================================
   CHANGE PIN BUTTON
===================================================== */

.card-action-btn {
  width: 100%;

  height: 46px;

  margin-top: 10px;

  border: none;

  border-radius: 11px;

  background: linear-gradient(
    135deg,
    #4e8ab4,
    #9aadb8
  );

  color: #ffffff;

  font-size: 13px;

  font-weight: 800;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  box-shadow:
    0 7px 16px rgba(22, 163, 74, 0.20);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card-action-btn:hover {
  transform: translateY(-1px);

  box-shadow:
    0 10px 20px rgba(22, 163, 74, 0.25);
}

.card-action-btn span {
  font-size: 17px;
  line-height: 1;
}

/* =====================================================
   SET PIN BUTTON
===================================================== */

.set-pin-card-btn {
  width: 100%;
  min-height:42px;
  margin-top: 10px;

  border: none;
  border-radius: 11px;

  background: linear-gradient(
    135deg,
    #4f46e5,
    #2563eb
  );

  color: #ffffff;

  font-size: 13px;
  font-weight: 800;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  box-shadow:
    0 7px 16px rgba(37, 99, 235, 0.20);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.set-pin-card-btn:hover {
  transform: translateY(-1px);

  box-shadow:
    0 10px 20px rgba(37, 99, 235, 0.25);
}

.set-pin-card-btn span {
  font-size: 16px;
}

/* ================================
   CHANGE PIN MODAL
================================ */

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
}

.modal-content {
    width: 100%;
    max-width: 430px;
    background: #ffffff;
    border-radius: 18px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    animation: changePinModalIn 0.25s ease-out;
}

.modal-content h2 {
    margin: 0 0 8px;
    color: #172554;
    font-size: 24px;
    font-weight: 700;
}

.modal-content p {
    margin: 0 0 24px;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
}

.modal-content input {
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 0 14px;
    margin-bottom: 14px;
    font-size: 16px;
    color: #0f172a;
    background: #f8fafc;
    outline: none;
    transition: all 0.2s ease;
}

.modal-content input::placeholder {
    color: #94a3b8;
}

.modal-content input:focus {
    border-color: #2563eb;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
}

.modal-actions button {
    flex: 1;
    height: 46px;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal-actions button:first-child {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #ffffff;
    box-shadow: 0 5px 14px rgba(37, 99, 235, 0.25);
}

.modal-actions button:first-child:hover {
    transform: translateY(-1px);
    box-shadow: 0 7px 18px rgba(37, 99, 235, 0.35);
}

.modal-actions button:last-child {
    background: #f1f5f9;
    color: #475569;
}

.modal-actions button:last-child:hover {
    background: #e2e8f0;
}

.modal-actions button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}


/* Modal animation */
@keyframes changePinModalIn {
    from {
        opacity: 0;
        transform: translateY(15px) scale(0.97);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}


/* Mobile */
@media (max-width: 500px) {
    .modal-content {
        padding: 24px 20px;
        border-radius: 15px;
    }

    .modal-content h2 {
        font-size: 21px;
    }

    .modal-actions {
        flex-direction: column;
    }

    .modal-actions button {
        width: 100%;
    }
}

/* =====================================================
   BLOCK CARD BUTTON
===================================================== */

.block-card-btn {
  width: 100%;
  min-height:42px;
  margin-top: 10px;

  border: 1px solid #fecaca;
  border-radius: 11px;

  background: #fff5f5;
  color: #b42318;

  font-size: 13px;
  font-weight: 800;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.block-card-btn:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  transform: translateY(-1px);
}

.block-card-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.block-card-btn span {
  font-size: 15px;
}

/* =====================================================
   PIN MODAL
===================================================== */

.pin-modal {
  max-width: 460px;
}

.pin-security-note {
  margin-top: 4px;
  margin-bottom: 22px;

  padding: 12px 14px;

  border-radius: 10px;

  background: #f5f8ff;
  border: 1px solid #dce7fb;

  color: #52627a;

  font-size: 12px;
  font-weight: 650;
}

/* =====================================================
   TRANSACTION LIMITS MODAL
   ===================================================== */

.limits-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(7px);

    overflow: hidden;
}


/* =====================================================
   MODAL
   ===================================================== */

.limits-modal {
    width: 100%;
    max-width: 760px;

    max-height: calc(100vh - 40px);

    display: flex;
    flex-direction: column;

    background: #ffffff;

    border-radius: 24px;

    box-shadow:
        0 25px 70px rgba(15, 23, 42, 0.35),
        0 8px 25px rgba(15, 23, 42, 0.15);

    overflow: hidden;

    animation: limitsModalOpen 0.25s ease-out;
}


/* =====================================================
   HEADER
   ===================================================== */

.limits-modal-header {
    flex: 0 0 auto;

    display: flex;
    align-items: center;

    gap: 18px;

    padding: 25px 28px;

    background: linear-gradient(
        135deg,
        #2563eb 0%,
        #1d4ed8 55%,
        #1e40af 100%
    );

    color: #ffffff;
}


/* ICON */

.limits-header-icon {
    flex: 0 0 72px;

    width: 72px;
    height: 72px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 18px;

    background: rgba(255, 255, 255, 0.18);

    font-size: 34px;

    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}


/* HEADER TEXT */

.limits-header-text {
    flex: 1;
    min-width: 0;
}

.limits-header-text h2 {
    margin: 0;

    font-size: 30px;
    line-height: 1.2;

    font-weight: 800;

    color: #ffffff;
}

.limits-header-text p {
    margin: 7px 0 0;

    font-size: 15px;
    line-height: 1.5;

    color: rgba(255, 255, 255, 0.88);
}


/* CLOSE BUTTON */

.limits-close-button {
    flex: 0 0 auto;

    width: 48px;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;
    border-radius: 13px;

    background: rgba(255, 255, 255, 0.18);

    color: #ffffff;

    font-size: 30px;
    font-weight: 700;

    line-height: 1;

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.2s ease;
}

.limits-close-button:hover {
    background: rgba(255, 255, 255, 0.28);

    transform: scale(1.05);
}

.limits-close-button:active {
    transform: scale(0.96);
}


/* =====================================================
   FORM
   IMPORTANT: FORM MUST BE FLEX
   ===================================================== */

.limits-modal > form {
    min-height: 0;

    flex: 1 1 auto;

    display: flex;
    flex-direction: column;
}


/* =====================================================
   BODY
   ===================================================== */

.limits-modal-body {
    min-height: 0;

    flex: 1 1 auto;

    overflow-y: auto;
    overflow-x: hidden;

    padding: 30px 34px 26px;

    background: #ffffff;
}


/* =====================================================
   FORM GROUP
   ===================================================== */

.limit-form-group {
    margin-bottom: 28px;
}

.limit-form-group:last-of-type {
    margin-bottom: 24px;
}


/* LABEL */

.limit-form-group label {
    display: block;

    margin-bottom: 10px;

    text-align: center;

    color: #334155;

    font-size: 18px;
    font-weight: 800;
}


/* =====================================================
   INPUT WRAPPER
   ===================================================== */

.limit-input-wrapper {
    position: relative;

    width: 100%;
}


/* CURRENCY */

.currency-symbol {
    position: absolute;

    left: 24px;
    top: 50%;

    transform: translateY(-50%);

    z-index: 2;

    color: #475569;

    font-size: 23px;
    font-weight: 700;

    pointer-events: none;
}


/* INPUT */

.limit-input-wrapper input {
    width: 100%;

    min-height: 60px;

    padding: 14px 20px 14px 66px;

    border: 1px solid #cbd5e1;

    border-radius: 15px;

    outline: none;

    background: #f8fafc;

    color: #172033;

    font-size: 20px;
    font-weight: 700;

    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

.limit-input-wrapper input:focus {
    border-color: #2563eb;

    background: #ffffff;

    box-shadow:
        0 0 0 4px rgba(37, 99, 235, 0.12);
}

.limit-input-wrapper input:disabled {
    opacity: 0.65;

    cursor: not-allowed;
}


/* Remove number arrows */

.limit-input-wrapper input::-webkit-outer-spin-button,
.limit-input-wrapper input::-webkit-inner-spin-button {
    margin: 0;

    -webkit-appearance: none;
}

.limit-input-wrapper input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
}


/* DESCRIPTION */

.limit-form-group small {
    display: block;

    margin-top: 9px;

    text-align: center;

    color: #71829d;

    font-size: 14px;

    line-height: 1.5;
}


/* =====================================================
   SECURE INFO BOX
   ===================================================== */

.limits-info-note {
    display: flex;
    align-items: center;

    gap: 15px;

    width: 100%;

    padding: 19px 20px;

    border: 1px solid #bfdbfe;

    border-radius: 16px;

    background: #eff6ff;

    color: #1e3a8a;
}

.limits-info-note > span {
    flex: 0 0 auto;

    font-size: 22px;
}

.limits-info-note > div {
    flex: 1;
}

.limits-info-note strong {
    display: block;

    margin-bottom: 4px;

    color: #1e3a8a;

    font-size: 16px;
    font-weight: 800;
}

.limits-info-note p {
    margin: 0;

    color: #64748b;

    font-size: 13px;

    line-height: 1.5;
}


/* =====================================================
   FOOTER
   ALWAYS VISIBLE
   ===================================================== */

.limits-modal-footer {
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    gap: 12px;

    padding: 18px 28px;

    border-top: 1px solid #e2e8f0;

    background: #ffffff;

    box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.04);
}


/* =====================================================
   CANCEL BUTTON
   ===================================================== */

.limits-cancel-button {
    min-width: 120px;
    min-height: 44px;

    padding: 10px 20px;

    border: 1px solid #cbd5e1;

    border-radius: 10px;

    background: #ffffff;

    color: #475569;

    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.limits-cancel-button:hover {
    background: #f8fafc;

    border-color: #94a3b8;

    transform: translateY(-1px);
}

.limits-cancel-button:disabled {
    opacity: 0.6;

    cursor: not-allowed;

    transform: none;
}


/* =====================================================
   UPDATE BUTTON
   ===================================================== */

.limits-update-button {
    min-width: 155px;
    min-height: 44px;

    padding: 10px 22px;

    border: 1px solid #2563eb;

    border-radius: 10px;

    background: #2563eb;

    color: #ffffff;

    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.limits-update-button:hover:not(:disabled) {
    background: #1d4ed8;

    border-color: #1d4ed8;

    transform: translateY(-1px);

    box-shadow:
        0 6px 15px rgba(37, 99, 235, 0.22);
}

.limits-update-button:disabled {
    opacity: 0.55;

    cursor: not-allowed;

    transform: none;

    box-shadow: none;
}


/* =====================================================
   SCROLLBAR
   ===================================================== */

.limits-modal-body::-webkit-scrollbar {
    width: 7px;
}

.limits-modal-body::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.limits-modal-body::-webkit-scrollbar-thumb {
    background: #94a3b8;

    border-radius: 10px;
}

.limits-modal-body::-webkit-scrollbar-thumb:hover {
    background: #64748b;
}


/* =====================================================
   ANIMATION
   ===================================================== */

@keyframes limitsModalOpen {
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}


/* =====================================================
   TABLET
   ===================================================== */

@media (max-width: 700px) {

    .limits-modal-overlay {
        padding: 12px;
    }

    .limits-modal {
        max-height: calc(100vh - 24px);

        border-radius: 20px;
    }

    .limits-modal-header {
        padding: 20px;
    }

    .limits-header-icon {
        width: 58px;
        height: 58px;

        flex-basis: 58px;

        border-radius: 15px;

        font-size: 28px;
    }

    .limits-header-text h2 {
        font-size: 24px;
    }

    .limits-header-text p {
        font-size: 13px;
    }

    .limits-close-button {
        width: 42px;
        height: 42px;

        font-size: 25px;
    }

    .limits-modal-body {
        padding: 24px 20px;
    }

    .limit-form-group label {
        font-size: 17px;
    }

    .limit-input-wrapper input {
        min-height: 56px;

        font-size: 18px;
    }
}


/* =====================================================
   MOBILE
   ===================================================== */

@media (max-width: 480px) {

    .limits-modal-overlay {
        padding: 8px;
    }

    .limits-modal {
        max-height: calc(100vh - 16px);

        border-radius: 17px;
    }

    .limits-modal-header {
        gap: 11px;

        padding: 17px 15px;
    }

    .limits-header-icon {
        width: 48px;
        height: 48px;

        flex-basis: 48px;

        border-radius: 12px;

        font-size: 23px;
    }

    .limits-header-text h2 {
        font-size: 20px;
    }

    .limits-header-text p {
        margin-top: 4px;

        font-size: 11px;
    }

    .limits-close-button {
        width: 38px;
        height: 38px;

        border-radius: 10px;

        font-size: 23px;
    }

    .limits-modal-body {
        padding: 20px 15px;
    }

    .limit-form-group {
        margin-bottom: 22px;
    }

    .limit-form-group label {
        margin-bottom: 8px;

        font-size: 15px;
    }

    .limit-input-wrapper input {
        min-height: 52px;

        padding-left: 55px;

        border-radius: 12px;

        font-size: 17px;
    }

    .currency-symbol {
        left: 18px;

        font-size: 20px;
    }

    .limit-form-group small {
        font-size: 10px;
    }

    .limits-info-note {
        gap: 10px;

        padding: 10px;
    }

    .limits-info-note strong {
        font-size: 14px;
    }

    .limits-info-note p {
        font-size: 11px;
    }

    .limits-modal-footer {
        gap: 8px;

        padding: 13px 15px;
    }

    .limits-cancel-button,
    .limits-update-button {
        min-width: 0;

        flex: 1;

        min-height: 43px;

        padding: 9px 10px;

        font-size: 13px;
    }
}


/* =====================================================
   VERY SHORT SCREEN
   ===================================================== */

@media (max-height: 650px) {

    .limits-modal-header {
        padding-top: 15px;
        padding-bottom: 15px;
    }

    .limits-header-icon {
        width: 50px;
        height: 50px;

        flex-basis: 50px;

        font-size: 24px;
    }

    .limits-header-text h2 {
        font-size: 22px;
    }

    .limits-modal-body {
        padding-top: 18px;
        padding-bottom: 18px;
    }

    .limit-form-group {
        margin-bottom: 18px;
    }

    .limit-input-wrapper input {
        min-height: 50px;
    }

    .limits-info-note {
        padding: 14px 16px;
    }

    .limits-modal-footer {
        padding-top: 11px;
        padding-bottom: 11px;
    }
}

/* =========================================================
   MANAGE LIMITS BUTTON
========================================================= */

.manage-limits-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    margin-top:10px;
    width: 100%;
    min-height: 42px;

    padding: 10px 16px;

    border: 1px solid #bfdbfe;
    border-radius: 10px;

    background: #b2cbec;

    color: #1d4ed8;

    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.manage-limits-btn:hover {
    background: #dbeafe;

    border-color: #93c5fd;

    color: #1e40af;

    transform: translateY(-1px);

    box-shadow:
        0 5px 14px rgba(37, 99, 235, 0.12);
}

.manage-limits-btn:active {
    transform: translateY(0);

    box-shadow: none;
}

.manage-limits-btn:focus-visible {
    outline: none;

    box-shadow:
        0 0 0 3px rgba(37, 99, 235, 0.18);
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {

    .manage-limits-btn {
        min-height: 44px;

        font-size: 13px;

        padding: 10px 14px;
    }
}

/* =====================================================
   ISSUE CARD FORM
===================================================== */

.issue-card-modal {
  max-width: 620px;
}


/* FORM GROUP */

.issue-form-group {
  margin-bottom: 22px;
  
}

.issue-form-group label {
  display: block;

  margin-bottom: 8px;

  font-size: 13px;
  font-weight: 700;

  color: #334155;
}


/* ACCOUNT SELECT */

.issue-form-group select {
  width: 100%;

  height: 48px;

  padding: 0 14px;

  border: 1px solid #dbe3ef;

  border-radius: 11px;

  background: #ffffff;

  color: #172033;

  font-size: 14px;

  outline: none;

  cursor: pointer;
}

.issue-form-group select:focus {
  border-color: #2563eb;

  box-shadow:
    0 0 0 3px rgba(37, 99, 235, 0.10);
}


/* OPTIONS */

.issue-option-grid {
  display: grid;

  grid-template-columns: repeat(2, 1fr);

  gap: 12px;
}


.issue-option {
  min-height: 76px;

  padding: 13px;

  display: flex;

  align-items: center;

  gap: 12px;

  text-align: left;

  border: 1px solid #dbe3ef;

  border-radius: 12px;

  background: #ffffff;

  color: #172033;

  cursor: pointer;

  transition: all 0.2s ease;
}


.issue-option:hover {
  border-color: #93c5fd;

  background: #f8fbff;
}


.issue-option.selected {
  border-color: #2563eb;

  background: #eff6ff;

  box-shadow:
    0 0 0 2px rgba(37, 99, 235, 0.08);
}


/* ICON */

.issue-option-icon {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #eaf2ff;

  font-size: 20px;
}


.issue-option span:last-child {
  display: flex;

  flex-direction: column;

  gap: 4px;
}


.issue-option strong {
  font-size: 13px;

  color: #172033;
}


.issue-option small {
  font-size: 11px;

  color: #64748b;

  line-height: 1.3;
}


/* NETWORK */

.network-logo {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #172554;

  color: #ffffff;

  font-size: 11px;

  font-weight: 800;
}


/* FOOTER */

.issue-form-footer {
  display: flex;

  justify-content: flex-end;

  align-items: center;

  gap: 10px;

  margin-top: 26px;

  padding-top: 20px;

  border-top: 1px solid #e2e8f0;
}


/* CANCEL */

.issue-cancel-btn {
  height: 44px;

  padding: 0 20px;

  border: 1px solid #dbe3ef;

  border-radius: 10px;

  background: #ffffff;

  color: #475569;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;
}


.issue-cancel-btn:hover {
  background: #f8fafc;
}


/* SUBMIT */

.issue-submit-btn {
  height: 44px;

  min-width: 135px;

  padding: 0 20px;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 8px;

  border: none;

  border-radius: 10px;

  background: #1d4ed8;

  color: #ffffff;

  font-size: 13px;

  font-weight: 800;

  cursor: pointer;

  box-shadow:
    0 6px 16px rgba(29, 78, 216, 0.20);
}


.issue-submit-btn:hover {
  background: #1e40af;
}


.issue-submit-btn:disabled,
.issue-cancel-btn:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}


/* LOADING */

.button-spinner {
  width: 15px;
  height: 15px;

  border: 2px solid rgba(255,255,255,0.35);

  border-top-color: #ffffff;

  border-radius: 50%;

  animation: issueSpin 0.7s linear infinite;
}


@keyframes issueSpin {
  to {
    transform: rotate(360deg);
  }
}


/* MOBILE */

@media (max-width: 600px) {

  .issue-option-grid {
    grid-template-columns: 1fr;
  }

  .issue-form-footer {
    flex-direction: column-reverse;
  }

  .issue-cancel-btn,
  .issue-submit-btn {
    width: 100%;
  }

}

 
  /* =====================================================
     SECTION HEADING
  ===================================================== */

  .cards-section-heading {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 20px;

    margin-bottom: 18px;
  }


  .cards-section-heading h2 {

    margin: 0;

    font-size: 22px;

    font-weight: 800;

    color: #172033;
  }


  .cards-section-heading p {

    margin: 5px 0 0;

    color: #7a879d;

    font-size: 13px;
  }


  .card-count {

    padding: 8px 13px;

    border-radius: 20px;

    background: #edf4ff;

    color: #2563eb;

    font-size: 12px;

    font-weight: 750;

    white-space: nowrap;
  }


  /* =====================================================
     GRID
  ===================================================== */

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px;
    align-items: stretch;
}

.card-item {
    min-width: 0;
    height: 100%;              /* NEW */
    display: flex;             /* NEW */
    flex-direction: column;    /* NEW */
    background: white;
    border-radius: 18px;
    padding: 28px 26px 24px;
    box-sizing: border-box;
    box-shadow:0 8px 28px rgba(15, 23, 42, 0.08);
    border: 1px solid #edf0f5;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }
  .card-item:hover {
    transform:translateY(-3px);

    box-shadow:
      0 16px 38px
      rgba(25,45,85,0.11);
  }


  /* =====================================================
     BANK CARD
  ===================================================== */

  .bank-card {

    position: relative;
    width: 100%;
    max-width: 570px;
    min-height: 225px;
    aspect-ratio: 1.586 / 1;
    margin: 0 auto;
    padding: 25px;
    box-sizing: border-box;
    border-radius: 18px;
    overflow: hidden;
    color: white;
    background:radial-gradient(circle at 90% 8%, rgba(255,255,255,0.14),transparent 32%),
      linear-gradient(
        135deg,
        #263347 0%,
        #121a2b 100%
      );

    box-shadow:
     0 16px 32px rgba(15, 23, 42, 0.25); 
  }


  .card-background-circle {

    position: absolute;

    border-radius: 50%;

    border:
      1px solid
      rgba(255,255,255,0.08);

    pointer-events: none;
  }


  .circle-one {

    width: 270px;
    height: 270px;

    right: -125px;
    top: -155px;
  }


  .circle-two {

    width: 220px;
    height: 220px;

    right: -85px;
    bottom: -145px;
  }


  .card-top {

    position: relative;

    z-index: 2;

    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 15px;
  }


  .bank-brand {

    display: flex;

    align-items: center;

    gap: 11px;
  }


  .bank-logo {

    width: 39px;
    height: 39px;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 11px;

    background:
      rgba(255,255,255,0.14);

    border:
      1px solid
      rgba(255,255,255,0.18);

    font-size: 18px;

    font-weight: 850;
  }


  .bank-name {

    font-size: 15px;

    font-weight: 850;

    letter-spacing: 1.3px;
  }


  .bank-subtitle {

    margin-top: 3px;

    font-size: 7px;

    letter-spacing: 1.8px;

    opacity: 0.52;
  }


  .card-network {

    font-size: 15px;

    font-weight: 850;

    letter-spacing: 0.7px;
  }


  /* =====================================================
     CHIP
  ===================================================== */

  .card-chip {

    position: relative;

    z-index: 2;

    width: 47px;
    height: 36px;

    margin-top: 28px;

    border-radius: 8px;

    background:
      linear-gradient(
        135deg,
        #dfc777,
        #b79b4e
      );

    box-shadow:
      inset 0 1px 1px
      rgba(255,255,255,0.35);
  }


  .chip-horizontal {

    position: absolute;

    left: 0;
    right: 0;

    top: 50%;

    height: 1px;

    background:
      rgba(75,55,15,0.45);
  }


  .chip-vertical {

    position: absolute;

    top: 0;
    bottom: 0;

    left: 50%;

    width: 1px;

    background:
      rgba(75,55,15,0.45);
  }


  .chip-small-line {

    position: absolute;

    top: 8px;
    bottom: 8px;

    left: 14px;
    right: 14px;

    border-left:
      1px solid
      rgba(75,55,15,0.30);

    border-right:
      1px solid
      rgba(75,55,15,0.30);
  }


  /* =====================================================
     CARD NUMBER
  ===================================================== */

  .card-number {

    position: relative;

    z-index: 2;

    margin-top: 18px;

    font-size: 21px;

    font-weight: 650;

    letter-spacing: 2.5px;

    white-space: nowrap;
  }


  /* =====================================================
     CARD BOTTOM
  ===================================================== */

  .card-bottom {

    position: relative;

    z-index: 2;

    display: flex;

    align-items: flex-end;

    justify-content: space-between;

    gap: 18px;

    margin-top: 18px;
  }


  .card-type-block,
  .card-validity {

    display: flex;

    flex-direction: column;

    gap: 4px;
  }


  .card-label {

    font-size: 8px;

    letter-spacing: 1.1px;

    opacity: 0.56;
  }


  .card-bottom strong {

    font-size: 11px;

    letter-spacing: 0.7px;
  }


  .card-network-small {

    margin-left: auto;

    font-size: 13px;

    font-weight: 850;
  }


  /* =====================================================
     CARD INFORMATION
  ===================================================== */
    
  .card-info {
    flex: 1;                   /* NEW */
    display: flex;             /* NEW */
    flex-direction: column; 
    padding: 24px 10px 0;
    background: white;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
  


  .card-info-header {

    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 15px;
  }


  .card-title-row {

    display: flex;

    align-items: center;

    flex-wrap: wrap;

    gap: 9px;
  }


  .card-info-header h3 {

    margin: 0;

    color: #172033;

    font-size: 18px;

    font-weight: 800;
  }


  .card-subtitle {

    margin: 5px 0 0;

    color: #8a96aa;

    font-size: 12px;
  }


  .card-id {

    padding-top: 3px;

    color: #9aa5b7;

    font-size: 10px;

    font-weight: 700;

    white-space: nowrap;

    letter-spacing: 0.5px;
  }


  /* =====================================================
     STATUS
  ===================================================== */

  .card-status {

    display: inline-flex;

    align-items: center;

    gap: 6px;

    padding: 5px 10px;

    border-radius: 20px;

    font-size: 10px;

    font-weight: 800;

    letter-spacing: 0.2px;
  }


  .status-dot {

    width: 6px;
    height: 6px;

    border-radius: 50%;

    background: currentColor;
  }


  .card-status.active {

    background: #dcfce7;

    color: #166534;
  }


  .card-status.issued {

    background: #fef3c7;

    color: #92400e;
  }


  .card-status.blocked {

    background: #fee2e2;

    color: #991b1b;
  }


  .card-status.replaced {

    background: #e5e7eb;

    color: #374151;
  }

  /* =========================================================
   SET PIN MODAL
========================================================= */

.pin-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(15, 23, 42, 0.68);
    backdrop-filter: blur(7px);
}

/* =========================================================
   MODAL
========================================================= */

.pin-modal {
    width: min(560px, 100%);
    max-height: calc(100vh - 30px);
    height: auto;
    overflow: auto;

    background: #ffffff;
    border-radius: 20px;

    box-shadow:
        0 25px 70px rgba(0, 0, 0, 0.28),
        0 8px 25px rgba(0, 0, 0, 0.12);

    animation: pinModalOpen 0.25s ease-out;
}

/* =========================================================
   HEADER
========================================================= */

.pin-modal-header {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 155px;

    padding: 28px 70px 28px 30px;

    text-align: center;

    background: linear-gradient(
        135deg,
        #2563eb 0%,
        #1d4ed8 100%
    );

    border-radius: 20px 20px 0 0;
}

.pin-modal-header > div {
    width: 100%;
}

.pin-modal-title {
    margin: 0;

    color: #ffffff;

    font-size: 30px;
    font-weight: 750;
    line-height: 1.2;
}

.pin-modal-subtitle {
    margin: 10px 0 0;

    color: rgba(255, 255, 255, 0.9);

    font-size: 15px;
    line-height: 1.5;
}

/* =========================================================
   CLOSE BUTTON
========================================================= */

.pin-close-button {
    position: absolute;
    top: 50%;
    right: 22px;

    width: 38px;
    height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    transform: translateY(-50%);

    border: none;
    border-radius: 8px;

    background: rgba(255, 255, 255, 0.22);

    color: #ffffff;

    font-size: 22px;
    font-weight: 700;

    cursor: pointer;

    transition: all 0.2s ease;
}

.pin-close-button:hover {
    background: rgba(255, 255, 255, 0.35);

    transform: translateY(-50%) scale(1.05);
}

.pin-close-button:disabled {
    cursor: not-allowed;
}

/* =========================================================
   FORM
========================================================= */

.pin-modal form {
    width: 100%;
}

/* =========================================================
   FORM GROUP
========================================================= */

.pin-form-group {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 22px 30px 0;
}

.pin-form-group label {
    display: block;

    width: 100%;
    max-width: 300px;

    margin-bottom: 9px;

    color: #334155;

    font-size: 15px;
    font-weight: 700;

    text-align: center;
}

/* =========================================================
   PIN INPUT
========================================================= */

.pin-form-group input {
    display: block;

    width: 100%;
    max-width: 290px;
    height: 48px;

    box-sizing: border-box;

    padding: 0 16px;

    border: 1px solid #cbd5e1;
    border-radius: 10px;

    background: #f8fafc;

    color: #0f172a;

    font-size: 18px;
    font-weight: 600;

    letter-spacing: 7px;

    text-align: center;

    outline: none;

    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

.pin-form-group input::placeholder {
    color: #94a3b8;
    letter-spacing: 5px;
}

.pin-form-group input:focus {
    border-color: #2563eb;

    background: #ffffff;

    box-shadow:
        0 0 0 3px rgba(37, 99, 235, 0.12);
}

/* =========================================================
   SECURITY NOTE
========================================================= */

.pin-security-note {
    margin-top: 26px;

    padding: 17px 25px;

    border-top: 1px solid #dbeafe;
    border-bottom: 1px solid #dbeafe;

    background: #f5f8ff;

    color: #52627a;

    font-size: 14px;
    font-weight: 600;

    text-align: center;
}

/* =========================================================
   FOOTER / BUTTONS
========================================================= */

.pin-form-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    gap: 12px;

    padding: 22px 30px 26px;

    border-top: 1px solid #e2e8f0;

    margin-top: 0;
}

/* Cancel */
.pin-cancel-btn {
    min-width: 120px;
    height: 46px;

    padding: 0 22px;

    border: 1px solid #dbe3ef;
    border-radius: 10px;

    background: #ffffff;

    color: #475569;

    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    transition: all 0.2s ease;
}

.pin-cancel-btn:hover:not(:disabled) {
    background: #f8fafc;

    border-color: #cbd5e1;
}

/* Submit */
.pin-submit-btn {
    min-width: 140px;
    height: 46px;

    padding: 0 24px;

    border: none;
    border-radius: 10px;

    background: linear-gradient(
        135deg,
        #2563eb,
        #1d4ed8
    );

    color: #ffffff;

    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    box-shadow:
        0 5px 14px rgba(37, 99, 235, 0.22);

    transition: all 0.2s ease;
}

.pin-submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);

    box-shadow:
        0 7px 18px rgba(37, 99, 235, 0.32);
}

.pin-submit-btn:disabled {
    opacity: 0.55;

    cursor: not-allowed;

    box-shadow: none;
}

/* =========================================================
   SCROLLBAR
========================================================= */

.pin-modal::-webkit-scrollbar {
    width: 6px;
}

.pin-modal::-webkit-scrollbar-track {
    background: transparent;
}

.pin-modal::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

/* =========================================================
   ANIMATION
========================================================= */

@keyframes pinModalOpen {
    from {
        opacity: 0;
        transform: translateY(15px) scale(0.97);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 650px) {

    .pin-modal-overlay {
        padding: 14px;
    }

    .pin-modal {
        width: 100%;
        max-height: 94vh;

        border-radius: 17px;
    }

    .pin-modal-header {
        min-height: 135px;

        padding: 24px 58px 24px 20px;

        border-radius: 17px 17px 0 0;
    }

    .pin-modal-title {
        font-size: 24px;
    }

    .pin-modal-subtitle {
        margin-top: 8px;

        font-size: 13px;
    }

    .pin-close-button {
        right: 15px;

        width: 35px;
        height: 35px;

        font-size: 20px;
    }

    .pin-form-group {
        padding: 20px 20px 0;
    }

    .pin-form-group label {
        max-width: 280px;
    }

    .pin-form-group input {
        max-width: 280px;
    }

    .pin-security-note {
        margin-top: 24px;

        padding: 15px 18px;

        font-size: 13px;
    }

    .pin-form-footer {
        padding: 18px 20px 22px;
    }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 450px) {

    .pin-modal-overlay {
        padding: 10px;
    }

    .pin-modal {
        border-radius: 15px;
    }

    .pin-modal-header {
        min-height: 125px;

        padding: 22px 52px 20px 15px;

        border-radius: 15px 15px 0 0;
    }

    .pin-modal-title {
        font-size: 21px;
    }

    .pin-modal-subtitle {
        font-size: 12px;
    }

    .pin-close-button {
        right: 12px;

        width: 33px;
        height: 33px;
    }

    .pin-form-group {
        padding: 18px 15px 0;
    }

    .pin-form-group label {
        font-size: 14px;
    }

    .pin-form-group input {
        max-width: 100%;
        height: 46px;

        font-size: 17px;
        letter-spacing: 6px;
    }

    .pin-security-note {
        margin-top: 22px;

        padding: 14px 12px;

        font-size: 12px;
    }

    .pin-form-footer {
        flex-direction: column-reverse;

        gap: 10px;

        padding: 15px;
    }

    .pin-cancel-btn,
    .pin-submit-btn {
        width: 100%;
        min-width: 0;
        height: 45px;
    }
}

/* =========================================================
   SET PIN MODAL - SINGLE SCREEN FIX
   No internal scrollbar
========================================================= */

.pin-modal-overlay {
    position: fixed;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 15px;

    overflow: hidden;
}

/* Modal must fit inside viewport */
.pin-modal {
    width: min(560px, 100%);
    max-height: calc(100vh - 30px);

    height: auto;

    overflow: hidden;

    border-radius: 20px;
}

/* =========================================================
   COMPACT HEADER
========================================================= */

.pin-modal-header {
    min-height: auto;

    padding: 24px 65px 22px 25px;

    text-align: center;
}

.pin-modal-title {
    font-size: 27px;
}

.pin-modal-subtitle {
    margin-top: 7px;

    font-size: 14px;
}

/* =========================================================
   FORM GROUPS
========================================================= */

.pin-form-group {
    padding: 16px 25px 0;
}

.pin-form-group label {
    margin-bottom: 7px;

    font-size: 14px;
}

.pin-form-group input {
    height: 44px;

    max-width: 300px;

    font-size: 17px;
}

/* =========================================================
   SECURITY NOTE
========================================================= */

.pin-security-note {
    margin-top: 18px;

    padding: 13px 18px;

    font-size: 13px;
}

/* =========================================================
   FOOTER
========================================================= */

.pin-form-footer {
    padding: 17px 25px 20px;

    gap: 10px;
}

.pin-cancel-btn,
.pin-submit-btn {
    height: 43px;
}

/* =========================================================
   SMALL HEIGHT SCREEN
========================================================= */

@media (max-height: 700px) {

    .pin-modal-overlay {
        padding: 8px;
    }

    .pin-modal {
        max-height: calc(100vh - 16px);
    }

    .pin-modal-header {
        padding: 18px 60px 17px 20px;
    }

    .pin-modal-title {
        font-size: 23px;
    }

    .pin-modal-subtitle {
        margin-top: 5px;
        font-size: 12px;
    }

    .pin-form-group {
        padding-top: 11px;
    }

    .pin-form-group input {
        height: 40px;
    }

    .pin-security-note {
        margin-top: 12px;
        padding: 10px 15px;
        font-size: 12px;
    }

    .pin-form-footer {
        padding: 13px 20px 15px;
    }

    .pin-cancel-btn,
    .pin-submit-btn {
        height: 40px;
    }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 450px) {

    .pin-modal-overlay {
        padding: 8px;
    }

    .pin-modal {
        width: 100%;
        max-height: calc(100vh - 16px);

        border-radius: 15px;
    }

    .pin-modal-header {
        padding: 20px 50px 18px 15px;

        border-radius: 15px 15px 0 0;
    }

    .pin-modal-title {
        font-size: 21px;
    }

    .pin-modal-subtitle {
        font-size: 12px;
    }

    .pin-form-group {
        padding: 14px 15px 0;
    }

    .pin-form-group input {
        width: 100%;
        max-width: 270px;
        height: 42px;
    }

    .pin-security-note {
        margin-top: 15px;

        padding: 11px 10px;

        font-size: 11px;
    }

    .pin-form-footer {
        padding: 14px 15px 16px;

        flex-direction: row;
    }

    .pin-cancel-btn,
    .pin-submit-btn {
        width: auto;
        flex: 1;

        min-width: 0;

        height: 42px;
    }
}

  /* =========================================
   CARD DETAILS MODAL
========================================= */

.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(15, 23, 42, 0.68);
    backdrop-filter: blur(6px);
}

/* Main Card Details Box */
.modal {
    width: 100%;
    max-width: 620px;
    max-height: 90vh;

    overflow-y: auto;

    background: #ffffff;
    border-radius: 20px;

    box-shadow:
        0 25px 60px rgba(0, 0, 0, 0.25),
        0 8px 25px rgba(0, 0, 0, 0.12);

    animation: cardModalOpen 0.25s ease-out;
}

/* =========================================
   MODAL HEADER
========================================= */

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 24px 28px;

    background: linear-gradient(
        135deg,
        #2563eb,
        #1d4ed8
    );

    border-radius: 20px 20px 0 0;
}

.modal-title {
    margin: 0;

    color: #ffffff;

    font-size: 25px;
    font-weight: 700;
    line-height: 1.2;
}

.modal-subtitle {
    margin: 7px 0 0;

    color: rgba(255, 255, 255, 0.85);

    font-size: 14px;
    line-height: 1.4;
}

/* =========================================
   DETAILS GRID
========================================= */

.details-grid {
    display: grid;

    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 14px;

    padding: 25px 28px;
}

/* Individual Detail Card */
.detail-item {
    display: flex;
    flex-direction: column;

    justify-content: center;

    min-height: 70px;

    padding: 14px 16px;

    background: #f8fafc;

    border: 1px solid #e2e8f0;
    border-radius: 12px;

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        border-color 0.2s ease;
}

.detail-item:hover {
    transform: translateY(-2px);

    border-color: #bfdbfe;

    box-shadow: 0 5px 15px rgba(37, 99, 235, 0.08);
}

/* Label */
.detail-item span {
    margin-bottom: 6px;

    color: #64748b;

    font-size: 12px;
    font-weight: 600;

    letter-spacing: 0.2px;
}

/* Value */
.detail-item strong {
    color: #0f172a;

    font-size: 15px;
    font-weight: 700;

    word-break: break-word;
}

/* =========================================
   SPECIAL VALUES
========================================= */

/* Status / PIN status / International status */
.detail-item strong {
    line-height: 1.4;
}

/* =========================================
   MODAL FOOTER
========================================= */

.modal-footer {
    display: flex;

    justify-content: flex-end;

    padding: 18px 28px 24px;

    border-top: 1px solid #e2e8f0;
}

/* Close Button */
.close-modal-button {
    min-width: 105px;
    height: 42px;

    padding: 0 22px;

    border: none;
    border-radius: 10px;

    background: linear-gradient(
        135deg,
        #2563eb,
        #1d4ed8
    );

    color: #ffffff;

    font-size: 14px;
    font-weight: 600;

    cursor: pointer;

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

.close-modal-button:hover {
    transform: translateY(-1px);

    background: linear-gradient(
        135deg,
        #1d4ed8,
        #1e40af
    );

    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.28);
}

.close-modal-button:active {
    transform: translateY(0);
}

/* =========================================
   MODAL SCROLLBAR
========================================= */

.modal::-webkit-scrollbar {
    width: 6px;
}

.modal::-webkit-scrollbar-track {
    background: transparent;
}

.modal::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.modal::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* =========================================
   OPEN ANIMATION
========================================= */

@keyframes cardModalOpen {
    from {
        opacity: 0;
        transform: translateY(15px) scale(0.97);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* =========================================
   MOBILE RESPONSIVE
========================================= */

@media (max-width: 650px) {

    .modal-overlay {
        padding: 12px;
    }

    .modal {
        max-height: 94vh;

        border-radius: 16px;
    }

    .modal-header {
        padding: 20px;

        border-radius: 16px 16px 0 0;
    }

    .modal-title {
        font-size: 21px;
    }

    .modal-subtitle {
        font-size: 13px;
    }

    .details-grid {
        grid-template-columns: 1fr;

        padding: 20px;

        gap: 10px;
    }

    .detail-item {
        min-height: 62px;
    }

    .modal-footer {
        padding: 15px 20px 20px;
    }

    .close-modal-button {
        width: 100%;
    }
}

  /* =====================================================
     DETAILS GRID
  ===================================================== */

  .card-details-grid {

    display: grid;

    grid-template-columns:
      1fr 1fr;

    gap: 10px;

    margin-top: 5px;
  }


  .detail-box {

    display: flex;

    align-items: center;

    gap: 10px;

    min-height: 65px;

    padding: 11px 12px;

    border:
      1px solid
      #edf0f5;

    border-radius: 12px;

    background:
      #edf0f3;
  }


  .detail-icon {

    width: 33px;
    height: 33px;

    flex-shrink: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 9px;

    font-size: 14px;

    font-weight: 800;
  }


  .detail-icon.blue {

    background: #eaf2ff;

    color: #2563eb;
  }


  .detail-icon.purple {

    background: #f0ebff;

    color: #7c3aed;
  }


  .detail-icon.green {

    background: #eafaf0;

    color: #16a05d;
  }


  .detail-icon.orange {

    background: #fff3e7;

    color: #ea580c;
  }


  .detail-icon.reward {

    background: #fff7df;

    color: #c68a00;
  }


  .detail-icon.red {

    background: #fff0f0;

    color: #dc2626;
  }


  .detail-content {

    min-width: 0;
  }


  .detail-content span {

    display: block;

    margin-bottom: 4px;

    color: #8a96aa;

    font-size: 10px;

    font-weight: 650;
  }


  .detail-content strong {

    display: block;

    color: #202b3d;

    font-size: 13px;

    font-weight: 750;
  }


  .success-icon {

    margin-right: 4px;

    color: #16a34a;

    font-weight: 900;
  }


  .reward-box {

    background:
      #fffaf0;

    border-color:
      #f5e6bd;
  }


  /* =====================================================
     VIEW BUTTON
  ===================================================== */

  .view-card-btn {

    width: 100%;

    display: flex;

    align-items: center;

    justify-content: space-between;

    margin-top: 18px;

    padding: 12px 15px;

    border:
      1px solid
      #dce3ef;

    border-radius: 10px;

    background: white;

    color: #173f98;

    font-size: 13px;

    font-weight: 750;

    cursor: pointer;

    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
  }


  .view-card-btn:hover {

    background:
      #f4f7ff;

    border-color:
      #b9cdf7;

    transform:
      translateY(-1px);
  }

    /* -----------------------------
     REPLACE CARD BUTTON
     ----------------------------- */

  .replace-card-btn {
    width: 100%;

    margin-top: 10px;

    padding: 11px 15px;

    border: 1px solid #dbe3f0;

    border-radius: 9px;

    background: #f8fafc;

    color: #1e3a8a;

    font-size: 13px;

    font-weight: 700;

    cursor: pointer;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 8px;

    transition: all 0.2s ease;
  }

  .replace-card-btn:hover {
    background: #eef4ff;

    border-color: #93b4f4;

    transform: translateY(-1px);
  }

  .replace-card-btn span {
    font-size: 18px;

    line-height: 1;
  }

  .view-arrow {

    font-size: 18px;

    line-height: 1;
  }


  /* =====================================================
     ISSUE BUTTON
  ===================================================== */

  .issue-card-btn {

    border: none;

    border-radius: 10px;

    padding: 12px 18px;

    cursor: pointer;

    font-weight: 700;

    font-size: 14px;

    background: #111827;

    color: white;

    box-shadow:
      0 7px 16px
      rgba(17,24,39,0.18);

    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }


  .issue-card-btn:hover {

    transform:
      translateY(-1px);

    box-shadow:
      0 10px 20px
      rgba(17,24,39,0.23);
  }


  .issue-card-btn span {

    font-size: 18px;

    margin-right: 5px;
  }


  .issue-card-btn.dark {

    background:
      #111827;
  }


  /* =====================================================
     ERROR
  ===================================================== */

  .cards-error {

    display: flex;

    align-items: flex-start;

    gap: 12px;

    padding: 16px 18px;

    margin-bottom: 25px;

    border-radius: 13px;

    background: #fff1f2;

    border:
      1px solid
      #fecdd3;

    color: #991b1b;
  }


  .error-icon {

    width: 32px;
    height: 32px;

    flex-shrink: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 9px;

    background: #fee2e2;

    font-size: 15px;
  }


  .cards-error strong {

    display: block;

    font-size: 13px;
  }


  .cards-error p {

    margin: 4px 0 0;

    font-size: 12px;
  }


  /* =====================================================
     EMPTY STATE
  ===================================================== */

  .no-cards {

    padding: 70px 25px;

    text-align: center;

    background: white;

    border:
      1px solid
      #e5e9f1;

    border-radius: 18px;

    box-shadow:
      0 10px 28px
      rgba(20,35,70,0.05);
  }


  .empty-card-icon {

    width: 70px;
    height: 70px;

    margin:
      0 auto 17px;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 20px;

    background: #edf4ff;

    font-size: 34px;
  }


  .no-cards h3 {

    margin: 0 0 7px;

    color: #172033;

    font-size: 20px;
  }


  .no-cards p {

    margin: 0 0 22px;

    color: #7b879b;

    font-size: 14px;
  }


  /* =====================================================
     LOADING
  ===================================================== */

  .cards-loading {

    min-height: 500px;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    color: #6b7280;
  }


  .cards-loading p {

    margin-top: 14px;

    font-size: 13px;
  }


  .loading-spinner {

    width: 38px;
    height: 38px;

    border-radius: 50%;

    border:
      3px solid
      #e5eaf2;

    border-top-color:
      #2563eb;

    animation:
      cardsSpin 0.8s linear infinite;
  }


  @keyframes cardsSpin {

    to {
      transform: rotate(360deg);
    }

  }


  /* =====================================================
     FOOTER
  ===================================================== */

  .cards-footer {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 15px;

    padding:
      20px 4px 0;

    color: #9aa5b7;

    font-size: 10px;
  }


  /* =====================================================
     RESPONSIVE
  ===================================================== */

  @media (max-width: 950px) {

    .cards-page {

      padding:
        25px 24px 40px;
    }


    .cards-grid {

      grid-template-columns:
        1fr;
    }

  }


  @media (max-width: 700px) {

    .cards-page {

      padding:
        18px 15px 30px;
    }

     .cards-page-header {
    padding: 22px;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .cards-header-left {
    width: 100%;
  }

  .cards-header-actions {
    width: 100%;
  }

  .dashboard-btn,
  .cards-page-header .issue-card-btn {
    flex: 1;
  }

    .cards-section-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .card-count {
      align-self: flex-start;
    }

    .bank-card {
       width: 100%;
       max-width: 570px;
       aspect-ratio: 1.586 / 1;
      min-height: 0;
      padding: 22px;
    }

    .card-number {
      font-size: 17px;
      letter-spacing: 1.7px;
    }

    .card-bottom {
      gap: 10px;
    }

    .card-info {
      padding: 18px;
    }

    .card-details-grid {
      grid-template-columns:
        1fr;
    }

    .card-info-header {
      flex-direction: column;
    }

    .card-id {
      padding-top: 0;
    }

    .cards-footer {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 360px) {
    .cards-page {
      padding: 12px 10px 24px;
    }

    .cards-page-header {
      padding: 16px 13px;
      margin-bottom: 20px;
      border-radius: 16px;
      gap: 15px;
    }

    .cards-header-left {
      gap: 9px;
    }

    .cards-header-icon {
      width: 44px;
      height: 44px;
      font-size: 21px;
      border-radius: 11px;
    }

    .cards-page-header h1 {
      font-size: 22px;
    }

    .cards-page-header p {
      font-size: 11px;
      line-height: 1.4;
    }

    .cards-header-actions {
      gap: 8px;
    }

    .dashboard-btn,
    .cards-page-header .issue-card-btn {
      min-height: 42px;
      padding: 9px 10px;
      font-size: 12px;
    }

    .bank-card {
      padding: 17px;
      border-radius: 15px;
    }

    .bank-logo {
      width: 34px;
      height: 34px;
      font-size: 16px;
    }

    .bank-name {
      font-size: 11px;
      letter-spacing: 1px;
    }

    .bank-subtitle {
      font-size: 6px;
      letter-spacing: 1.2px;
    }

    .card-network {
      font-size: 10px;
    }

    .card-chip {
      width: 39px;
      height: 29px;
      margin-top: 18px;
    }

    .card-number {
      margin-top: 13px;
      font-size: 11.5px;
      letter-spacing: 0.8px;
    }

    .card-bottom {
      gap: 7px;
      margin-top: 13px;
    }

    .card-label {
      font-size: 6px;
      letter-spacing: 0.7px;
    }

    .card-bottom strong {
      font-size: 8px;
    }

    .card-network-small {
      font-size: 10px;
    }

    .card-item {
      padding: 17px 15px 18px;
      border-radius: 15px;
    }

    .card-info {
      padding: 16px 4px 0;
    }

    .card-info-header h3 {
      font-size: 16px;
    }

    .card-subtitle {
      font-size: 11px;
    }

    .card-id {
      font-size: 9px;
    }

    .detail-box {
      min-height: 60px;
      padding: 10px;
    }

    .detail-content strong {
      font-size: 12px;
    }

    .view-card-btn,
    .activate-card-btn,
    .set-pin-card-btn,
    .card-action-btn,
    .manage-limits-btn,
    .rewards-btn,
    .international-usage-btn,
    .statement-btn,
    .block-card-btn,
    .replace-card-btn {
      min-height: 42px;
      font-size: 12px;
      padding: 9px 11px;
    }
  }

  @media (max-width: 420px) {
    .cards-page-header {
    padding: 20px 16px;
    border-radius: 18px;
  }

    .cards-header-left {
      gap: 11px;
    }

    .cards-header-icon {
      width: 48px;
      height: 48px;
      font-size: 23px;
    }

    .cards-page-header h1 {
      font-size: 24px;
    }

      .cards-page-header p {
    font-size: 12px;
  }

  .cards-header-actions {
    flex-direction: column;
  }

  .dashboard-btn,
  .cards-page-header .issue-card-btn {
    width: 100%;
  }

  .bank-card {
  width: 100%;
  max-width: 570px;
  aspect-ratio: 1.586 / 1;
  min-height: 0;
  padding: 19px;
}

    .bank-name {
      font-size: 13px;
    }

    .card-network {
      font-size: 12px;
    }

    .card-chip {
      width: 42px;
      height: 32px;
      margin-top: 22px;
    }

    .card-number {
      margin-top: 15px;
      font-size: 15px;
      letter-spacing: 1.3px;
    }


    .card-label {

      font-size: 7px;
    }


    .card-bottom strong {

      font-size: 9px;
    }

  }

  /* =====================================================
   INTERNATIONAL USAGE MODAL
   ===================================================== */

.international-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(7px);

    overflow: hidden;
}


/* =====================================================
   MODAL
   ===================================================== */

.international-modal {
    width: 100%;
    max-width: 680px;

    max-height: calc(100vh - 40px);

    display: flex;
    flex-direction: column;

    background: #ffffff;

    border-radius: 22px;

    overflow: hidden;

    box-shadow:
        0 25px 70px rgba(15, 23, 42, 0.35),
        0 8px 25px rgba(15, 23, 42, 0.15);

    animation: internationalModalOpen 0.25s ease-out;
}


/* =====================================================
   HEADER
   ===================================================== */

.international-modal-header {
    flex: 0 0 auto;

    display: flex;
    align-items: center;

    gap: 17px;

    padding: 25px 28px;

    background: linear-gradient(
        135deg,
        #2563eb 0%,
        #1d4ed8 55%,
        #1e40af 100%
    );

    color: #ffffff;
}


/* ICON */

.international-header-icon {
    flex: 0 0 70px;

    width: 70px;
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 18px;

    background: rgba(255, 255, 255, 0.18);

    font-size: 34px;
}


/* HEADER TEXT */

.international-header-text {
    flex: 1;

    min-width: 0;
}

.international-header-text h2 {
    margin: 0;

    color: #ffffff;

    font-size: 29px;
    line-height: 1.2;

    font-weight: 800;
}

.international-header-text p {
    margin: 7px 0 0;

    color: rgba(255, 255, 255, 0.88);

    font-size: 14px;
    line-height: 1.5;
}


/* CLOSE */

.international-close-button {
    flex: 0 0 auto;

    width: 48px;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;
    border-radius: 13px;

    background: rgba(255, 255, 255, 0.18);

    color: #ffffff;

    font-size: 30px;
    font-weight: 700;

    line-height: 1;

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.2s ease;
}

.international-close-button:hover {
    background: rgba(255, 255, 255, 0.28);

    transform: scale(1.05);
}

.international-close-button:active {
    transform: scale(0.96);
}


/* =====================================================
   BODY
   ===================================================== */

.international-modal-body {
    min-height: 0;

    flex: 1 1 auto;

    overflow-y: auto;
    overflow-x: hidden;

    padding: 28px 30px;

    background: #ffffff;
}


/* =====================================================
   CURRENT STATUS CARD
   ===================================================== */

.international-status-card {
    display: flex;
    align-items: center;

    gap: 16px;

    padding: 18px 20px;

    margin-bottom: 22px;

    border: 1px solid #dbeafe;

    border-radius: 16px;

    background: #f8fbff;
}

.international-status-icon {
    flex: 0 0 54px;

    width: 54px;
    height: 54px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 14px;

    background: #e0ecff;

    font-size: 25px;
}

.international-status-content {
    flex: 1;
}

.international-status-content span {
    display: block;

    margin-bottom: 4px;

    color: #64748b;

    font-size: 13px;
    font-weight: 600;
}

.international-status-content strong {
    display: block;

    font-size: 19px;
    font-weight: 800;
}

.international-enabled {
    color: #15803d;
}

.international-disabled {
    color: #dc2626;
}


/* =====================================================
   TOGGLE SECTION
   ===================================================== */

.international-toggle-section {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 25px;

    padding: 21px 20px;

    margin-bottom: 22px;

    border: 1px solid #e2e8f0;

    border-radius: 16px;

    background: #ffffff;
}

.international-toggle-text {
    flex: 1;

    min-width: 0;
}

.international-toggle-text strong {
    display: block;

    margin-bottom: 6px;

    color: #334155;

    font-size: 17px;
    font-weight: 800;
}

.international-toggle-text p {
    margin: 0;

    color: #71829d;

    font-size: 13px;

    line-height: 1.55;
}


/* =====================================================
   TOGGLE SWITCH
   ===================================================== */

.international-toggle {
    position: relative;

    flex: 0 0 auto;

    width: 66px;
    height: 36px;

    padding: 0;

    border: none;

    border-radius: 50px;

    background: #cbd5e1;

    cursor: pointer;

    transition:
        background 0.25s ease,
        box-shadow 0.25s ease;
}

.international-toggle.active {
    background: #2563eb;

    box-shadow:
        0 4px 12px rgba(37, 99, 235, 0.28);
}

.international-toggle:disabled {
    opacity: 0.6;

    cursor: not-allowed;
}


/* SLIDER */

.international-toggle-slider {
    position: absolute;

    top: 4px;
    left: 4px;

    width: 28px;
    height: 28px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    background: #ffffff;

    color: #2563eb;

    font-size: 16px;
    font-weight: 900;

    box-shadow:
        0 2px 5px rgba(15, 23, 42, 0.18);

    transition:
        transform 0.25s ease;
}

.international-toggle.active .international-toggle-slider {
    transform: translateX(30px);
}


/* =====================================================
   SECURITY NOTE
   ===================================================== */

.international-security-note {
    display: flex;
    align-items: flex-start;

    gap: 13px;

    padding: 18px 19px;

    border: 1px solid #bfdbfe;

    border-radius: 15px;

    background: #eff6ff;
}

.international-security-note > span {
    flex: 0 0 auto;

    font-size: 21px;
}

.international-security-note strong {
    display: block;

    margin-bottom: 4px;

    color: #1e3a8a;

    font-size: 15px;
    font-weight: 800;
}

.international-security-note p {
    margin: 0;

    color: #64748b;

    font-size: 12px;

    line-height: 1.55;
}

/* =====================================================
   INTERNATIONAL USAGE BUTTON
===================================================== */

.international-usage-btn {
  width: 100%;
  min-height:42px;
  margin-top: 10px;

  border: 1px solid #1e99b5;
  border-radius: 11px;

  background: #aad5e1;
  color: #4e4cda;

  font-size: 13px;
  font-weight: 800;

  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.international-usage-btn:hover:not(:disabled) {
  background: #61c0da;
  border-color: #116874;
  transform: translateY(-1px);
}

.international-usage-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.international-usage-btn span {
  font-size: 15px;
}


/* =====================================================
   FOOTER
   ===================================================== */

.international-modal-footer {
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    gap: 12px;

    padding: 18px 28px;

    border-top: 1px solid #e2e8f0;

    background: #ffffff;

    box-shadow:
        0 -4px 12px rgba(15, 23, 42, 0.04);
}


/* CANCEL */

.international-cancel-button {
    min-width: 120px;
    min-height: 44px;

    padding: 10px 20px;

    border: 1px solid #cbd5e1;

    border-radius: 10px;

    background: #ffffff;

    color: #475569;

    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.international-cancel-button:hover:not(:disabled) {
    background: #f8fafc;

    border-color: #94a3b8;

    transform: translateY(-1px);
}


/* UPDATE */

.international-update-button {
    min-width: 150px;
    min-height: 44px;

    padding: 10px 22px;

    border: 1px solid #2563eb;

    border-radius: 10px;

    background: #2563eb;

    color: #ffffff;

    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.international-update-button:hover:not(:disabled) {
    background: #1d4ed8;

    transform: translateY(-1px);

    box-shadow:
        0 6px 15px rgba(37, 99, 235, 0.22);
}

.international-cancel-button:disabled,
.international-update-button:disabled {
    opacity: 0.55;

    cursor: not-allowed;

    transform: none;

    box-shadow: none;
}


/* =====================================================
   SCROLLBAR
   ===================================================== */

.international-modal-body::-webkit-scrollbar {
    width: 7px;
}

.international-modal-body::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.international-modal-body::-webkit-scrollbar-thumb {
    background: #94a3b8;

    border-radius: 10px;
}

.international-modal-body::-webkit-scrollbar-thumb:hover {
    background: #64748b;
}


/* =====================================================
   ANIMATION
   ===================================================== */

@keyframes internationalModalOpen {
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}


/* =====================================================
   TABLET
   ===================================================== */

@media (max-width: 700px) {

    .international-modal-overlay {
        padding: 12px;
    }

    .international-modal {
        max-height: calc(100vh - 24px);

        border-radius: 20px;
    }

    .international-modal-header {
        padding: 20px;
    }

    .international-header-icon {
        width: 58px;
        height: 58px;

        flex-basis: 58px;

        font-size: 28px;
    }

    .international-header-text h2 {
        font-size: 24px;
    }

    .international-header-text p {
        font-size: 13px;
    }

    .international-close-button {
        width: 42px;
        height: 42px;

        font-size: 26px;
    }

    .international-modal-body {
        padding: 24px 20px;
    }
}


/* =====================================================
   MOBILE
   ===================================================== */

@media (max-width: 480px) {

    .international-modal-overlay {
        padding: 8px;
    }

    .international-modal {
        max-height: calc(100vh - 16px);

        border-radius: 17px;
    }

    .international-modal-header {
        gap: 11px;

        padding: 17px 14px;
    }

    .international-header-icon {
        width: 48px;
        height: 48px;

        flex-basis: 48px;

        border-radius: 12px;

        font-size: 23px;
    }

    .international-header-text h2 {
        font-size: 20px;
    }

    .international-header-text p {
        margin-top: 3px;

        font-size: 11px;
    }

    .international-close-button {
        width: 38px;
        height: 38px;

        border-radius: 10px;

        font-size: 23px;
    }

    .international-modal-body {
        padding: 19px 14px;
    }

    .international-status-card {
        gap: 11px;

        padding: 15px;
    }

    .international-status-icon {
        width: 45px;
        height: 45px;

        flex-basis: 45px;

        font-size: 21px;
    }

    .international-status-content strong {
        font-size: 17px;
    }

    .international-toggle-section {
        gap: 15px;

        padding: 17px 15px;
    }

    .international-toggle-text strong {
        font-size: 15px;
    }

    .international-toggle-text p {
        font-size: 11px;
    }

    .international-toggle {
        width: 60px;
        height: 34px;
    }

    .international-toggle-slider {
        width: 26px;
        height: 26px;
    }

    .international-toggle.active .international-toggle-slider {
        transform: translateX(26px);
    }

    .international-security-note {
        padding: 15px;
    }

    .international-security-note strong {
        font-size: 14px;
    }

    .international-security-note p {
        font-size: 11px;
    }

    .international-modal-footer {
        gap: 8px;

        padding: 13px 14px;
    }

    .international-cancel-button,
    .international-update-button {
        min-width: 0;

        flex: 1;

        min-height: 43px;

        padding: 9px 10px;

        font-size: 13px;
    }
}


/* =====================================================
   VERY SHORT SCREEN
   ===================================================== */

@media (max-height: 650px) {

    .international-modal-header {
        padding-top: 14px;
        padding-bottom: 14px;
    }

    .international-header-icon {
        width: 50px;
        height: 50px;

        flex-basis: 50px;

        font-size: 24px;
    }

    .international-header-text h2 {
        font-size: 22px;
    }

    .international-modal-body {
        padding-top: 16px;
        padding-bottom: 16px;
    }

    .international-status-card,
    .international-toggle-section {
        margin-bottom: 14px;
    }

    .international-security-note {
        padding: 13px 15px;
    }

    .international-modal-footer {
        padding-top: 10px;
        padding-bottom: 10px;
    }
}

/* =====================================================
   REWARDS MANAGEMENT MODAL
   ===================================================== */

.rewards-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;

    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(7px);

    overflow: hidden;
}


/* =====================================================
   MODAL
   ===================================================== */

.rewards-modal {
    width: 100%;
    max-width: 680px;

    max-height: calc(100vh - 40px);

    display: flex;
    flex-direction: column;

    background: #ffffff;

    border-radius: 22px;

    overflow: hidden;

    box-shadow:
        0 25px 70px rgba(15, 23, 42, 0.35),
        0 8px 25px rgba(15, 23, 42, 0.15);

    animation: rewardsModalOpen 0.25s ease-out;
}


/* =====================================================
   HEADER
   ===================================================== */

.rewards-modal-header {
    flex: 0 0 auto;

    display: flex;
    align-items: center;

    gap: 17px;

    padding: 25px 28px;

    background: linear-gradient(
        135deg,
        #7c3aed 0%,
        #6d28d9 55%,
        #5b21b6 100%
    );

    color: #ffffff;
}


/* HEADER ICON */

.rewards-header-icon {
    flex: 0 0 70px;

    width: 70px;
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 18px;

    background: rgba(255, 255, 255, 0.18);

    font-size: 34px;
}


/* HEADER TEXT */

.rewards-header-text {
    flex: 1;

    min-width: 0;
}

.rewards-header-text h2 {
    margin: 0;

    color: #ffffff;

    font-size: 29px;
    line-height: 1.2;

    font-weight: 800;
}

.rewards-header-text p {
    margin: 7px 0 0;

    color: rgba(255, 255, 255, 0.88);

    font-size: 14px;
    line-height: 1.5;
}


/* CLOSE BUTTON */

.rewards-close-button {
    flex: 0 0 auto;

    width: 48px;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;
    border-radius: 13px;

    background: rgba(255, 255, 255, 0.18);

    color: #ffffff;

    font-size: 30px;
    font-weight: 700;

    line-height: 1;

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.2s ease;
}

.rewards-close-button:hover {
    background: rgba(255, 255, 255, 0.28);

    transform: scale(1.05);
}

.rewards-close-button:active {
    transform: scale(0.96);
}


/* =====================================================
   BODY
   ===================================================== */

.rewards-modal-body {
    min-height: 0;

    flex: 1 1 auto;

    overflow-y: auto;
    overflow-x: hidden;

    padding: 28px 30px;

    background: #ffffff;
}


/* =====================================================
   CURRENT REWARD BALANCE
   ===================================================== */

.rewards-balance-card {
    display: flex;
    align-items: center;

    gap: 17px;

    padding: 20px;

    margin-bottom: 25px;

    border: 1px solid #ddd6fe;

    border-radius: 17px;

    background: #faf5ff;
}

.rewards-balance-icon {
    flex: 0 0 58px;

    width: 58px;
    height: 58px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 15px;

    background: #ede9fe;

    font-size: 28px;
}

.rewards-balance-content {
    flex: 1;
}

.rewards-balance-content span {
    display: block;

    margin-bottom: 3px;

    color: #64748b;

    font-size: 13px;
    font-weight: 600;
}

.rewards-balance-content strong {
    display: inline-block;

    margin-right: 7px;

    color: #6d28d9;

    font-size: 28px;
    line-height: 1.2;

    font-weight: 800;
}

.rewards-balance-content small {
    color: #7c3aed;

    font-size: 12px;
}


/* =====================================================
   FORM GROUP
   ===================================================== */

.rewards-form-group {
    margin-bottom: 24px;
}

.rewards-form-group label {
    display: block;

    margin-bottom: 10px;

    color: #334155;

    text-align: center;

    font-size: 18px;
    font-weight: 800;
}


/* =====================================================
   INPUT
   ===================================================== */

.rewards-input-wrapper {
    position: relative;

    width: 100%;
}

.rewards-input-icon {
    position: absolute;

    left: 22px;
    top: 50%;

    z-index: 2;

    transform: translateY(-50%);

    font-size: 21px;

    pointer-events: none;
}

.rewards-input-wrapper input {
    width: 100%;

    min-height: 58px;

    padding: 13px 20px 13px 60px;

    border: 1px solid #cbd5e1;

    border-radius: 14px;

    outline: none;

    background: #f8fafc;

    color: #172033;

    font-size: 19px;
    font-weight: 700;

    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

.rewards-input-wrapper input:focus {
    border-color: #7c3aed;

    background: #ffffff;

    box-shadow:
        0 0 0 4px rgba(124, 58, 237, 0.12);
}

.rewards-input-wrapper input:disabled {
    opacity: 0.65;

    cursor: not-allowed;
}


/* REMOVE NUMBER ARROWS */

.rewards-input-wrapper input::-webkit-outer-spin-button,
.rewards-input-wrapper input::-webkit-inner-spin-button {
    margin: 0;

    -webkit-appearance: none;
}

.rewards-input-wrapper input[type="number"] {
    appearance: textfield;

    -moz-appearance: textfield;
}


/* DESCRIPTION */

.rewards-form-group small {
    display: block;

    margin-top: 8px;

    color: #71829d;

    text-align: center;

    font-size: 13px;

    line-height: 1.5;
}


/* =====================================================
   INFO NOTE
   ===================================================== */

.rewards-info-note {
    display: flex;
    align-items: flex-start;

    gap: 13px;

    padding: 18px 19px;

    border: 1px solid #ddd6fe;

    border-radius: 15px;

    background: #faf5ff;
}

.rewards-info-note > span {
    flex: 0 0 auto;

    font-size: 22px;
}

.rewards-info-note > div {
    flex: 1;
}

.rewards-info-note strong {
    display: block;

    margin-bottom: 4px;

    color: #5b21b6;

    font-size: 15px;
    font-weight: 800;
}

.rewards-info-note p {
    margin: 0;

    color: #64748b;

    font-size: 12px;

    line-height: 1.55;
}


/* =====================================================
   FOOTER
   ===================================================== */

.rewards-modal-footer {
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    gap: 12px;

    padding: 18px 28px;

    border-top: 1px solid #e2e8f0;

    background: #ffffff;

    box-shadow:
        0 -4px 12px rgba(15, 23, 42, 0.04);
}


/* CANCEL */

.rewards-cancel-button {
    min-width: 120px;
    min-height: 44px;

    padding: 10px 20px;

    border: 1px solid #cbd5e1;

    border-radius: 10px;

    background: #ffffff;

    color: #475569;

    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.rewards-cancel-button:hover:not(:disabled) {
    background: #f8fafc;

    border-color: #94a3b8;

    transform: translateY(-1px);
}


/* ADD POINTS */

.rewards-add-button {
    min-width: 140px;
    min-height: 44px;

    padding: 10px 22px;

    border: 1px solid #7c3aed;

    border-radius: 10px;

    background: #7c3aed;

    color: #ffffff;

    font-size: 14px;
    font-weight: 700;

    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.rewards-add-button:hover:not(:disabled) {
    background: #6d28d9;

    transform: translateY(-1px);

    box-shadow:
        0 6px 15px rgba(124, 58, 237, 0.22);
}

.rewards-cancel-button:disabled,
.rewards-add-button:disabled {
    opacity: 0.55;

    cursor: not-allowed;

    transform: none;

    box-shadow: none;
}

/* =====================================================
   CHANGE PIN BUTTON
===================================================== */

.rewards-btn {
  width: 100%;

  height: 46px;

  margin-top: 10px;

  border: none;

  border-radius: 11px;

  background: linear-gradient(
    135deg,
    #76c9ba,
    #9cb8b6
  );

  color: #ffffff;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  box-shadow:
    0 7px 16px rgba(22, 163, 74, 0.20);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.rewards-btn:hover {
  transform: translateY(-1px);

  box-shadow:
    0 10px 20px rgba(22, 163, 74, 0.25);
}

.rewards-btn span {
  font-size: 17px;
  line-height: 1;
}

/* =====================================================
   SCROLLBAR
   ===================================================== */

.rewards-modal-body::-webkit-scrollbar {
    width: 7px;
}

.rewards-modal-body::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.rewards-modal-body::-webkit-scrollbar-thumb {
    background: #a78bfa;

    border-radius: 10px;
}

.rewards-modal-body::-webkit-scrollbar-thumb:hover {
    background: #8b5cf6;
}


/* =====================================================
   ANIMATION
   ===================================================== */

@keyframes rewardsModalOpen {
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}


/* =====================================================
   TABLET
   ===================================================== */

@media (max-width: 700px) {

    .rewards-modal-overlay {
        padding: 12px;
    }

    .rewards-modal {
        max-height: calc(100vh - 24px);

        border-radius: 20px;
    }

    .rewards-modal-header {
        padding: 20px;
    }

    .rewards-header-icon {
        width: 58px;
        height: 58px;

        flex-basis: 58px;

        font-size: 28px;
    }

    .rewards-header-text h2 {
        font-size: 24px;
    }

    .rewards-header-text p {
        font-size: 13px;
    }

    .rewards-close-button {
        width: 42px;
        height: 42px;

        font-size: 26px;
    }

    .rewards-modal-body {
        padding: 24px 20px;
    }
}


/* =====================================================
   MOBILE
   ===================================================== */

@media (max-width: 480px) {

    .rewards-modal-overlay {
        padding: 8px;
    }

    .rewards-modal {
        max-height: calc(100vh - 16px);

        border-radius: 17px;
    }

    .rewards-modal-header {
        gap: 11px;

        padding: 17px 14px;
    }

    .rewards-header-icon {
        width: 48px;
        height: 48px;

        flex-basis: 48px;

        border-radius: 12px;

        font-size: 23px;
    }

    .rewards-header-text h2 {
        font-size: 20px;
    }

    .rewards-header-text p {
        margin-top: 3px;

        font-size: 11px;
    }

    .rewards-close-button {
        width: 38px;
        height: 38px;

        border-radius: 10px;

        font-size: 23px;
    }

    .rewards-modal-body {
        padding: 19px 14px;
    }

    .rewards-balance-card {
        gap: 11px;

        padding: 15px;
    }

    .rewards-balance-icon {
        width: 45px;
        height: 45px;

        flex-basis: 45px;

        font-size: 22px;
    }

    .rewards-balance-content strong {
        font-size: 23px;
    }

    .rewards-balance-content small {
        font-size: 10px;
    }

    .rewards-form-group label {
        font-size: 15px;
    }

    .rewards-input-wrapper input {
        min-height: 52px;

        padding-left: 53px;

        font-size: 17px;
    }

    .rewards-input-icon {
        left: 18px;

        font-size: 19px;
    }

    .rewards-form-group small {
        font-size: 11px;
    }

    .rewards-info-note {
        padding: 15px;
    }

    .rewards-info-note strong {
        font-size: 14px;
    }

    .rewards-info-note p {
        font-size: 11px;
    }

    .rewards-modal-footer {
        gap: 8px;

        padding: 13px 14px;
    }

    .rewards-cancel-button,
    .rewards-add-button {
        min-width: 0;

        flex: 1;

        min-height: 43px;

        padding: 9px 10px;

        font-size: 13px;
    }
}


/* =====================================================
   VERY SHORT SCREEN
   ===================================================== */

@media (max-height: 650px) {

    .rewards-modal-header {
        padding-top: 14px;
        padding-bottom: 14px;
    }

    .rewards-header-icon {
        width: 50px;
        height: 50px;

        flex-basis: 50px;

        font-size: 24px;
    }

    .rewards-header-text h2 {
        font-size: 22px;
    }

    .rewards-modal-body {
        padding-top: 16px;
        padding-bottom: 16px;
    }

    .rewards-balance-card {
        margin-bottom: 14px;
    }

    .rewards-form-group {
        margin-bottom: 16px;
    }

    .rewards-info-note {
        padding: 13px 15px;
    }

    .rewards-modal-footer {
        padding-top: 10px;
        padding-bottom: 10px;
    }
}

/* ================================
   CARD STATEMENT MODAL
================================ */

.statement-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.68);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: statementOverlayIn 0.2s ease;
}

.statement-modal {
  width: min(1100px, 100%);
  max-height: min(85vh, 780px);
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: statementModalIn 0.25s ease;
}

.statement-modal-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
   background: linear-gradient(
        135deg,
        #2563eb 0%,
        #1d4ed8 55%,
        #1e40af 100%
    );
}

.statement-header-icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #477deb;
  font-size: 23px;
}

.statement-header-text {
  min-width: 0;
  flex: 1;
}

.statement-header-text h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.statement-header-text p {
  margin: 4px 0 0;
  color: #ffffff;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.statement-close-button {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border: none;
  border-radius: 10px;
  background: #477deb;
  color: #ffffff;
  font-size: 25px;
  line-height: 1;
  cursor: pointer;
  transition: 0.2s ease;
}

.statement-close-button:hover {
  background: #e5e7eb;
  color: #111827;
}

/* =====================================================
   VIEW STATEMENT BUTTON
===================================================== */

.statement-btn {
  width: 100%;

  height: 42px;

  margin-top: 10px;

  border: none;

  border-radius: 11px;

  background: linear-gradient(
    135deg,
    #188de0,
    #b7cfdc
  );

  color: #ffffff;

  font-size: 13px;

  font-weight: 600;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  box-shadow:
    0 7px 16px rgba(22, 163, 74, 0.20);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.statement-btn:hover {
  transform: translateY(-1px);

  box-shadow:
    0 10px 20px rgba(22, 163, 74, 0.25);
}

.statement-btn span {
  font-size: 17px;
  line-height: 1;
}

/* ---------- Body ---------- */

.statement-modal-body {
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
  padding: 22px 24px;
}

.statement-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
}

.statement-table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
  background: #ffffff;
}

.statement-table th {
  padding: 13px 14px;
  text-align: left;
  background: #477deb;
  border-bottom: 1px solid #e5e7eb;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.statement-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #374151;
  font-size: 13px;
  white-space: nowrap;
}

.statement-table tbody tr:last-child td {
  border-bottom: none;
}

.statement-table tbody tr:hover {
  background: #f8fafc;
}

.statement-type {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 7px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.statement-amount {
  color: #111827;
  white-space: nowrap;
}

.statement-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.statement-status-success,
.statement-status-completed {
  background: #dcfce7;
  color: #166534;
}

.statement-status-pending,
.statement-status-processing {
  background: #fef3c7;
  color: #92400e;
}

.statement-status-failed,
.statement-status-rejected,
.statement-status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

/* ---------- Loading ---------- */

.statement-loading {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
}

.statement-spinner {
  width: 38px;
  height: 38px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: statementSpin 0.8s linear infinite;
}

.statement-loading p {
  margin: 0;
  font-size: 14px;
}

/* ---------- Empty ---------- */

.statement-empty {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
}

.statement-empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  font-size: 30px;
  margin-bottom: 14px;
}

.statement-empty h3 {
  margin: 0 0 6px;
  color: #1f2937;
  font-size: 17px;
}

.statement-empty p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

/* ---------- Footer ---------- */

.statement-modal-footer {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
}

.statement-close-footer-button {
  min-width: 100px;
  padding: 10px 18px;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  background: #477deb;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.statement-close-footer-button:hover {
  background: #f3f4f6;
}

/* ---------- View Statement Button ---------- */

.statement-btn {
  border: none;
  cursor: pointer;
  transition: 0.2s ease;
}

.statement-btn:hover {
  transform: translateY(-1px);
}

/* ---------- Animations ---------- */

@keyframes statementOverlayIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes statementModalIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes statementSpin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- Responsive ---------- */

@media (max-width: 768px) {
  .statement-modal-overlay {
    padding: 12px;
  }

  .statement-modal {
    max-height: 90vh;
    border-radius: 16px;
  }

  .statement-modal-header {
    padding: 16px;
  }

  .statement-modal-body {
    padding: 16px;
  }

  .statement-modal-footer {
    padding: 14px 16px;
  }

  .statement-header-icon {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
    font-size: 20px;
  }

  .statement-header-text h2 {
    font-size: 17px;
  }
}

@media (max-width: 480px) {
  .statement-modal-overlay {
    padding: 8px;
  }

  .statement-modal {
    max-height: 94vh;
    border-radius: 14px;
  }

  .statement-modal-header {
    gap: 10px;
    padding: 14px;
  }

  .statement-modal-body {
    padding: 12px;
  }

  .statement-modal-footer {
    padding: 12px;
  }

  .statement-close-footer-button {
    width: 100%;
  }
}

`;

export default Cards;
