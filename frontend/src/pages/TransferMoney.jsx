import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TransferMoney() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [transferType, setTransferType] = useState("TRANSFER");

  const [receiverAccountNumber, setReceiverAccountNumber] =
    useState("");

  const [receiverIfscCode, setReceiverIfscCode] =
    useState("");

  const [amount, setAmount] = useState("");

  const [customer, setCustomer] = useState(null);

  const [loadingCustomer, setLoadingCustomer] =
    useState(true);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // LOAD LOGGED-IN CUSTOMER
  // =====================================================

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      setLoadingCustomer(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

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

      // =================================================
      // AUTH ERROR
      // =================================================

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // =================================================
      // OTHER ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          "Unable to load account information."
        );
      }

      const data = await response.json();

      console.log("CUSTOMER DATA:", data);

      setCustomer(data);
    } catch (err) {
      console.error(
        "Customer loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load account information."
      );
    } finally {
      setLoadingCustomer(false);
    }
  };

  // =====================================================
  // CHANGE TRANSFER TYPE
  // =====================================================

  const handleTransferTypeChange = (type) => {
    setTransferType(type);

    // Clear old messages
    setError("");
    setMessage("");

    // Clear IFSC when Account Transfer selected
    if (type === "TRANSFER") {
      setReceiverIfscCode("");
    }
  };

  // =====================================================
  // TRANSFER MONEY
  // =====================================================

  const handleTransfer = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setMessage("");
    setError("");

    // ===================================================
    // CLEAN VALUES
    // ===================================================

    const receiver =
      receiverAccountNumber.trim();

    const ifsc =
      receiverIfscCode.trim().toUpperCase();

    const transferAmount = Number(amount);

    // ===================================================
    // RECEIVER ACCOUNT VALIDATION
    // ===================================================

    if (!receiver) {
      setError(
        "Please enter receiver account number."
      );

      return;
    }

    // ===================================================
    // IFSC VALIDATION
    // Only required for NEFT / RTGS / IMPS
    // ===================================================

    if (transferType !== "TRANSFER") {
      if (!ifsc) {
        setError(
          "Please enter receiver IFSC code."
        );

        return;
      }

      // Standard 11-character IFSC format
      const ifscPattern =
        /^[A-Z]{4}0[A-Z0-9]{6}$/;

      if (!ifscPattern.test(ifsc)) {
        setError(
          "Please enter a valid 11-character IFSC code."
        );

        return;
      }
    }

    // ===================================================
    // AMOUNT VALIDATION
    // ===================================================

    if (
      !amount ||
      !Number.isFinite(transferAmount)
    ) {
      setError(
        "Please enter a valid amount."
      );

      return;
    }

    if (transferAmount <= 0) {
      setError(
        "Transfer amount must be greater than 0."
      );

      return;
    }

    // ===================================================
    // OWN ACCOUNT VALIDATION
    // ===================================================

    if (
      customer?.accountNumber &&
      customer.accountNumber === receiver
    ) {
      setError(
        "You cannot transfer money to your own account."
      );

      return;
    }

    // ===================================================
    // TOKEN
    // ===================================================

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Login session expired. Please login again."
      );

      navigate("/login", {
        replace: true,
      });

      return;
    }

    // ===================================================
    // START TRANSFER
    // ===================================================

    try {
      setLoading(true);

      // ===============================================
      // SELECT BACKEND ENDPOINT
      // ===============================================

      let endpoint = "";

      switch (transferType) {
        case "NEFT":
          endpoint =
            "http://localhost:8080/api/transactions/neft";
          break;

        case "RTGS":
          endpoint =
            "http://localhost:8080/api/transactions/rtgs";
          break;

        case "IMPS":
          endpoint =
            "http://localhost:8080/api/transactions/imps";
          break;

        case "TRANSFER":
        default:
          endpoint =
            "http://localhost:8080/api/transactions/transfer";
          break;
      }

      // ===============================================
      // REQUEST BODY
      // ===============================================

      const requestBody = {
        receiverAccountNumber: receiver,
        amount: transferAmount,
      };

      // IFSC required only for NEFT / RTGS / IMPS
      if (transferType !== "TRANSFER") {
        requestBody.receiverIfscCode = ifsc;
      }

      // ===============================================
      // DEBUG
      // ===============================================

      console.log(
        "================================="
      );

      console.log(
        "TRANSFER TYPE:",
        transferType
      );

      console.log(
        "TRANSFER ENDPOINT:",
        endpoint
      );

      console.log(
        "TRANSFER REQUEST:",
        requestBody
      );

      console.log(
        "================================="
      );

      // ===============================================
      // API CALL
      // ===============================================

      const response = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            requestBody
          ),
        }
      );

      // ===============================================
      // READ RESPONSE
      // ===============================================

      const responseText =
        await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = {
          message: responseText,
        };
      }

      console.log(
        "TRANSFER RESPONSE:",
        data
      );

      // ===============================================
      // AUTH ERROR
      // ===============================================

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      // ===============================================
      // API ERROR
      // ===============================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            `${transferType} transfer failed. Please try again.`
        );
      }

      // ===============================================
      // SUCCESS MESSAGE
      // ===============================================

      let successText =
        "Money transferred successfully.";

      if (transferType === "NEFT") {
        successText =
          "NEFT transfer completed successfully.";
      }

      if (transferType === "RTGS") {
        successText =
          "RTGS transfer completed successfully.";
      }

      if (transferType === "IMPS") {
        successText =
          "IMPS transfer completed successfully.";
      }

      setMessage(successText);

      // ===============================================
      // CLEAR FORM
      // ===============================================

      setReceiverAccountNumber("");
      setReceiverIfscCode("");
      setAmount("");

      // ===============================================
      // REFRESH BALANCE
      // ===============================================

      await loadCustomer();

    } catch (err) {
      console.error(
        `${transferType} transfer error:`,
        err
      );

      setError(
        err.message ||
          "Something went wrong while processing the transfer."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loadingCustomer) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.loader}></div>

          <p>
            Loading account information...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* =================================================
            HEADER
        ================================================= */}

        <div style={styles.header}>

          <div>
            <p style={styles.smallTitle}>
              AVANI BANK
            </p>

            <h1 style={styles.title}>
              Transfer Money
            </h1>

            <p style={styles.subtitle}>
              Send money securely to another
              Avani Bank account.
            </p>
          </div>

          <div style={styles.headerRight}>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              style={styles.dashboardButton}
            >
              ← Dashboard
            </button>

            <div style={styles.icon}>
              ⇄
            </div>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div style={styles.errorTop}>
            ⚠ {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (
          <div style={styles.successTop}>
            ✓ {message}
          </div>
        )}

        {/* =================================================
            BALANCE CARD
        ================================================= */}

        <div style={styles.balanceCard}>

          <div>

            <p style={styles.balanceLabel}>
              Available Balance
            </p>

            <h2 style={styles.balance}>
              ₹
              {customer?.balance != null
                ? Number(
                    customer.balance
                  ).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )
                : "0.00"}
            </h2>

            <p style={styles.accountText}>
              Account:{" "}
              {customer?.accountNumber ||
                "Not available"}
            </p>

          </div>

          <div style={styles.balanceIcon}>
            ₹
          </div>

        </div>

        {/* =================================================
            TRANSFER CARD
        ================================================= */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <h2 style={styles.cardTitle}>
              Make a Transfer
            </h2>

            <span style={styles.secure}>
              🔒 Secure
            </span>

          </div>

          <form onSubmit={handleTransfer}>

            {/* =============================================
                TRANSFER TYPE
            ============================================= */}

            <div style={styles.field}>

              <label style={styles.label}>
                Transfer Type
              </label>

              <div style={styles.transferTypes}>

                {/* ACCOUNT TRANSFER */}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleTransferTypeChange(
                      "TRANSFER"
                    )
                  }
                  style={{
                    ...styles.transferTypeButton,

                    ...(transferType ===
                    "TRANSFER"
                      ? styles.transferTypeActive
                      : {}),
                  }}
                >

                  <span
                    style={
                      styles.transferTypeIcon
                    }
                  >
                    ⇄
                  </span>

                  <span>
                    Account Transfer
                  </span>

                </button>

                {/* NEFT */}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleTransferTypeChange(
                      "NEFT"
                    )
                  }
                  style={{
                    ...styles.transferTypeButton,

                    ...(transferType ===
                    "NEFT"
                      ? styles.transferTypeActive
                      : {}),
                  }}
                >

                  <span
                    style={
                      styles.transferTypeIcon
                    }
                  >
                    🏦
                  </span>

                  <span>
                    NEFT
                  </span>

                </button>

                {/* RTGS */}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleTransferTypeChange(
                      "RTGS"
                    )
                  }
                  style={{
                    ...styles.transferTypeButton,

                    ...(transferType ===
                    "RTGS"
                      ? styles.transferTypeActive
                      : {}),
                  }}
                >

                  <span
                    style={
                      styles.transferTypeIcon
                    }
                  >
                    ⚡
                  </span>

                  <span>
                    RTGS
                  </span>

                </button>

                {/* IMPS */}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleTransferTypeChange(
                      "IMPS"
                    )
                  }
                  style={{
                    ...styles.transferTypeButton,

                    ...(transferType ===
                    "IMPS"
                      ? styles.transferTypeActive
                      : {}),
                  }}
                >

                  <span
                    style={
                      styles.transferTypeIcon
                    }
                  >
                    🚀
                  </span>

                  <span>
                    IMPS
                  </span>

                </button>

              </div>

            </div>

            {/* =============================================
                RECEIVER ACCOUNT NUMBER
            ============================================= */}

            <div style={styles.field}>

              <label style={styles.label}>
                Receiver Account Number
              </label>

              <input
                type="text"
                value={
                  receiverAccountNumber
                }
                onChange={(e) =>
                  setReceiverAccountNumber(
                    e.target.value
                  )
                }
                placeholder="Enter receiver account number"
                style={styles.input}
                disabled={loading}
                autoComplete="off"
                inputMode="numeric"
              />

            </div>

            {/* =============================================
                IFSC CODE
                Only NEFT / RTGS / IMPS
            ============================================= */}

            {transferType !==
              "TRANSFER" && (

              <div style={styles.field}>

                <label style={styles.label}>
                  Receiver IFSC Code
                </label>

                <input
                  type="text"
                  value={
                    receiverIfscCode
                  }
                  onChange={(e) =>
                    setReceiverIfscCode(
                      e.target.value
                        .toUpperCase()
                    )
                  }
                  placeholder="Enter receiver IFSC code"
                  style={{
                    ...styles.input,
                    textTransform:
                      "uppercase",
                  }}
                  disabled={loading}
                  autoComplete="off"
                  maxLength={11}
                />

                <p
                  style={
                    styles.fieldHint
                  }
                >
                  Required for{" "}
                  {transferType} transfer
                </p>

              </div>

            )}

            {/* =============================================
                AMOUNT
            ============================================= */}

            <div style={styles.field}>

              <label style={styles.label}>
                Transfer Amount
              </label>

              <div
                style={
                  styles.amountBox
                }
              >

                <span
                  style={
                    styles.currency
                  }
                >
                  ₹
                </span>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  style={
                    styles.amountInput
                  }
                  disabled={loading}
                  inputMode="decimal"
                />

              </div>

            </div>

            {/* =============================================
                TRANSFER INFORMATION
            ============================================= */}

            <div
              style={
                styles.transferInfo
              }
            >

              <span
                style={
                  styles.transferInfoIcon
                }
              >
                ℹ
              </span>

              <span>
                {transferType ===
                "TRANSFER"
                  ? "Account-to-account transfer"
                  : `${transferType} transfer requires receiver IFSC code.`}
              </span>

            </div>

            {/* =============================================
                SUBMIT BUTTON
            ============================================= */}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,

                opacity: loading
                  ? 0.7
                  : 1,

                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >

              {loading
                ? "Processing..."
                : `Transfer Money →`}

            </button>

          </form>

        </div>

        {/* =================================================
            INFORMATION CARDS
        ================================================= */}

        <div style={styles.infoGrid}>

          <div style={styles.infoCard}>

            <div style={styles.infoIcon}>
              🛡️
            </div>

            <div>

              <h3
                style={
                  styles.infoTitle
                }
              >
                Secure Transfer
              </h3>

              <p
                style={
                  styles.infoText
                }
              >
                Your transaction is
                processed securely.
              </p>

            </div>

          </div>

          <div style={styles.infoCard}>

            <div style={styles.infoIcon}>
              ⚡
            </div>

            <div>

              <h3
                style={
                  styles.infoTitle
                }
              >
                Fast Processing
              </h3>

              <p
                style={
                  styles.infoText
                }
              >
                Select the transfer
                method that suits you.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = {

  // =======================================================
  // PAGE
  // =======================================================

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily:
      "Inter, Arial, sans-serif",
    color: "#172033",
    boxSizing: "border-box",
  },

  // =======================================================
  // CONTAINER
  // =======================================================

  container: {
    width: "100%",
    maxWidth: "850px",
    margin: "0 auto",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  // =======================================================
  // HEADER
  // =======================================================

  header: {
    background:
      "linear-gradient(135deg, #102354 0%, #173b8c 55%, #2457c6 100%)",

    color: "white",

    borderRadius: "20px",

    padding: "30px",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: "20px",

    boxSizing: "border-box",

    boxShadow:
      "0 15px 35px rgba(18,51,120,0.18)",
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

  headerRight: {
    display: "flex",

    alignItems: "center",

    gap: "14px",

    marginLeft: "auto",
  },

  smallTitle: {
    margin: 0,

    fontSize: "11px",

    letterSpacing: "2px",

    opacity: 0.7,

    fontWeight: "700",
  },

  title: {
    margin: "8px 0 5px",

    fontSize: "30px",

    fontWeight: "800",
  },

  subtitle: {
    margin: 0,

    fontSize: "13px",

    color: "#d7e2ff",

    lineHeight: "1.5",
  },

  icon: {
    width: "55px",

    height: "55px",

    borderRadius: "15px",

    background:
      "rgba(255,255,255,0.13)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "25px",

    flexShrink: 0,
  },

  // =======================================================
  // ERROR
  // =======================================================

  errorTop: {
    marginTop: "18px",

    padding: "12px 14px",

    borderRadius: "9px",

    background: "#fff0f0",

    color: "#d13c3c",

    fontSize: "12px",

    fontWeight: "600",

    border:
      "1px solid #ffd6d6",

    lineHeight: "1.5",
  },

  // =======================================================
  // SUCCESS
  // =======================================================

  successTop: {
    marginTop: "18px",

    padding: "12px 14px",

    borderRadius: "9px",

    background: "#eaf8f0",

    color: "#168653",

    fontSize: "12px",

    fontWeight: "600",

    border:
      "1px solid #c9efd9",
  },

  // =======================================================
  // BALANCE CARD
  // =======================================================

  balanceCard: {
    marginTop: "22px",

    background:
      "linear-gradient(135deg, #172b4d, #2457a8)",

    color: "white",

    borderRadius: "18px",

    padding: "25px 30px",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    boxShadow:
      "0 10px 25px rgba(20,45,90,0.15)",
  },

  balanceLabel: {
    margin: 0,

    fontSize: "11px",

    color: "#cbd8f2",

    fontWeight: "700",
  },

  balance: {
    margin: "7px 0 4px",

    fontSize: "28px",

    fontWeight: "800",
  },

  accountText: {
    margin: 0,

    fontSize: "11px",

    color: "#cbd8f2",
  },

  balanceIcon: {
    width: "52px",

    height: "52px",

    borderRadius: "14px",

    background:
      "rgba(255,255,255,0.12)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "22px",

    fontWeight: "800",
  },

  // =======================================================
  // MAIN CARD
  // =======================================================

  card: {
    background: "white",

    marginTop: "22px",

    padding: "30px",

    borderRadius: "18px",

    border:
      "1px solid #e9edf4",

    boxShadow:
      "0 8px 30px rgba(20,35,70,0.06)",

    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: "15px",

    marginBottom: "25px",
  },

  cardTitle: {
    margin: 0,

    fontSize: "20px",

    color: "#172033",

    fontWeight: "800",
  },

  secure: {
    fontSize: "11px",

    color: "#168653",

    background: "#eaf8f0",

    padding: "7px 10px",

    borderRadius: "8px",

    fontWeight: "600",

    whiteSpace: "nowrap",
  },

  // =======================================================
  // FIELD
  // =======================================================

  field: {
    marginBottom: "20px",
  },

  label: {
    display: "block",

    marginBottom: "8px",

    fontSize: "12px",

    fontWeight: "700",

    color: "#526078",
  },

  // =======================================================
  // INPUT
  // =======================================================

  input: {
    width: "100%",

    height: "50px",

    padding: "0 15px",

    border:
      "1px solid #dfe5ee",

    borderRadius: "10px",

    outline: "none",

    fontSize: "14px",

    boxSizing: "border-box",

    background: "#ffffff",

    color: "#172033",
  },

  fieldHint: {
    margin: "6px 0 0",

    fontSize: "10px",

    color: "#8993a8",
  },

  // =======================================================
  // TRANSFER TYPE
  // =======================================================

  transferTypes: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    gap: "10px",
  },

  transferTypeButton: {
    minHeight: "70px",

    border:
      "1px solid #dfe5ee",

    borderRadius: "10px",

    background: "#ffffff",

    color: "#526078",

    fontSize: "11px",

    fontWeight: "700",

    cursor: "pointer",

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    justifyContent: "center",

    gap: "6px",

    padding: "8px",

    transition:
      "all 0.2s ease",

    boxSizing: "border-box",
  },

  transferTypeActive: {
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",

    color: "white",

    border:
      "1px solid #173b8c",

    boxShadow:
      "0 5px 15px rgba(23,59,140,0.18)",
  },

  transferTypeIcon: {
    fontSize: "20px",

    lineHeight: "1",
  },

  // =======================================================
  // AMOUNT
  // =======================================================

  amountBox: {
    height: "50px",

    display: "flex",

    alignItems: "center",

    border:
      "1px solid #dfe5ee",

    borderRadius: "10px",

    padding: "0 15px",

    boxSizing: "border-box",

    background: "#ffffff",
  },

  currency: {
    fontSize: "18px",

    fontWeight: "700",

    color: "#172033",

    flexShrink: 0,
  },

  amountInput: {
    width: "100%",

    height: "46px",

    border: "none",

    outline: "none",

    padding: "0 10px",

    fontSize: "18px",

    boxSizing: "border-box",

    background: "transparent",

    color: "#172033",
  },

  // =======================================================
  // TRANSFER INFO
  // =======================================================

  transferInfo: {
    display: "flex",

    alignItems: "center",

    gap: "8px",

    padding: "11px 12px",

    marginBottom: "15px",

    borderRadius: "9px",

    background: "#f5f8ff",

    color: "#64748b",

    fontSize: "11px",

    lineHeight: "1.4",
  },

  transferInfoIcon: {
    width: "18px",

    height: "18px",

    borderRadius: "50%",

    background: "#dce8ff",

    color: "#173b8c",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "11px",

    fontWeight: "800",

    flexShrink: 0,
  },

  // =======================================================
  // SUBMIT BUTTON
  // =======================================================

  button: {
    width: "100%",

    height: "50px",

    border: "none",

    borderRadius: "10px",

    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",

    color: "white",

    fontSize: "14px",

    fontWeight: "700",

    marginTop: "5px",

    transition:
      "opacity 0.2s ease",
  },

  // =======================================================
  // INFORMATION CARDS
  // =======================================================

  infoGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: "15px",

    marginTop: "18px",
  },

  infoCard: {
    background: "white",

    border:
      "1px solid #e9edf4",

    borderRadius: "14px",

    padding: "18px",

    display: "flex",

    alignItems: "center",

    gap: "13px",

    boxSizing: "border-box",
  },

  infoIcon: {
    width: "40px",

    height: "40px",

    borderRadius: "10px",

    background: "#edf3ff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    flexShrink: 0,
  },

  infoTitle: {
    margin: 0,

    fontSize: "13px",

    color: "#172033",
  },

  infoText: {
    margin: "4px 0 0",

    fontSize: "10px",

    color: "#8993a8",

    lineHeight: "1.5",
  },

  // =======================================================
  // LOADING
  // =======================================================

  loadingContainer: {
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

    border:
      "3px solid #dce4ef",

    borderTop:
      "3px solid #172b4d",

    borderRadius: "50%",

    marginBottom: "12px",

    animation:
      "spin 1s linear infinite",
  },
};

export default TransferMoney;