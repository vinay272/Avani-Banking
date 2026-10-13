import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

// =====================================================
// PAYMENT OPTIONS
// =====================================================

const paymentOptions = [
  "UPI Transfer",
  "NEFT",
  "RTGS",
  "IMPS",
  "QR Payment",
  "Bill Payment",
  "Recharge",
  "Auto-Pay",
  "Scheduled Payment",
  "Transaction Receipts",
];

function Payments() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("avani-theme") === "dark";
  });

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(localStorage.getItem("avani-theme") === "dark");
    };

    // Theme changes from another page/tab
    window.addEventListener("storage", syncTheme);

    // Check current theme whenever Payments is opened
    syncTheme();

    return () => {
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  // =====================================================
  // PAYMENT SELECTION
  // =====================================================

  const [selectedPayment, setSelectedPayment] = useState("UPI Transfer");

  const [transferMode, setTransferMode] = useState("upi");

  // =====================================================
  // UPI / BANK FORM STATES
  // =====================================================

  const [receiverUpiId, setReceiverUpiId] = useState("");

  const [receiverAccountNumber, setReceiverAccountNumber] = useState("");

  const [receiverIfscCode, setReceiverIfscCode] = useState("");

  const [amount, setAmount] = useState("");

  // =====================================================
  // QR PAYMENT STATES
  // =====================================================

  const [qrUpiId, setQrUpiId] = useState("vinay@avani");

  const [qrReceiverName, setQrReceiverName] = useState("");

  const [qrAmount, setQrAmount] = useState("");

  const [qrUpiUrl, setQrUpiUrl] = useState("");

  const [qrTransactionReference, setQrTransactionReference] = useState("");

  // =====================================================
  // BILL PAYMENT STATES
  // =====================================================

  const [billCategory, setBillCategory] = useState("ELECTRICITY");

  const [billBillerName, setBillBillerName] = useState("");

  const [billConsumerNumber, setBillConsumerNumber] = useState("");

  const [billAmount, setBillAmount] = useState("");

  const [billTransaction, setBillTransaction] = useState(null);

  // =====================================================
  // RECHARGE STATES
  // =====================================================

  const [rechargeMobile, setRechargeMobile] = useState("");
  const [rechargeOperator, setRechargeOperator] = useState("Jio");
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeSuccess, setRechargeSuccess] = useState(null);

  // =====================================================
  // AUTO-PAY STATES
  // =====================================================

  const [autoPayAccountId, setAutoPayAccountId] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [autoPayBillerName, setAutoPayBillerName] = useState("");
  const [autoPayBillerReference, setAutoPayBillerReference] = useState("");
  const [autoPayAmount, setAutoPayAmount] = useState("");
  const [autoPayFrequency, setAutoPayFrequency] = useState("MONTHLY");
  const [autoPayStartDate, setAutoPayStartDate] = useState("");

  const [autoPays, setAutoPays] = useState([]);
  const [autoPayLoading, setAutoPayLoading] = useState(false);

  // =====================================================
  // SCHEDULED PAYMENT STATES
  // =====================================================

  const [scheduledPaymentAccountId, setScheduledPaymentAccountId] =
    useState("");

  const [scheduledPaymentType, setScheduledPaymentType] = useState("NEFT");

  const [
    scheduledPaymentReceiverAccountNumber,
    setScheduledPaymentReceiverAccountNumber,
  ] = useState("");

  const [
    scheduledPaymentReceiverIfscCode,
    setScheduledPaymentReceiverIfscCode,
  ] = useState("");

  const [scheduledPaymentAmount, setScheduledPaymentAmount] = useState("");

  const [scheduledPaymentDate, setScheduledPaymentDate] = useState("");

  const [scheduledPayments, setScheduledPayments] = useState([]);

  const [scheduledPaymentLoading, setScheduledPaymentLoading] = useState(false);

  // =====================================================
  // COMMON STATES
  // =====================================================

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  // =====================================================
  // TRANSACTION RECEIPT STATES
  // =====================================================

  const [transactionReceipts, setTransactionReceipts] = useState([]);

  const [receiptLoading, setReceiptLoading] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // =====================================================
  // CLEAR MESSAGE
  // =====================================================

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // AUTH ERROR
  // =====================================================

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customer");

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // COMMON RESPONSE PARSER
  // =====================================================

  const parseResponse = async (response) => {
    const responseText = await response.text();

    let data = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          message: responseText,
        };
      }
    }

    return data;
  };

  // =====================================================
  // LOAD TRANSACTION RECEIPTS
  // =====================================================

  const loadTransactionReceipts = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setReceiptLoading(true);
      clearMessage();

      const [sentResponse, receivedResponse] = await Promise.all([
        fetch("http://localhost:8080/api/transactions/sent", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://localhost:8080/api/transactions/received", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (
        sentResponse.status === 401 ||
        sentResponse.status === 403 ||
        receivedResponse.status === 401 ||
        receivedResponse.status === 403
      ) {
        handleAuthError();
        return;
      }

      const sentData = await parseResponse(sentResponse);

      const receivedData = await parseResponse(receivedResponse);

      if (!sentResponse.ok) {
        throw new Error(
          sentData.message ||
            sentData.error ||
            "Failed to load sent transactions",
        );
      }

      if (!receivedResponse.ok) {
        throw new Error(
          receivedData.message ||
            receivedData.error ||
            "Failed to load received transactions",
        );
      }

      const sentTransactions = Array.isArray(sentData) ? sentData : [];

      const receivedTransactions = Array.isArray(receivedData)
        ? receivedData
        : [];

      // Combine both lists
      const combinedTransactions = [
        ...sentTransactions,
        ...receivedTransactions,
      ];

      // Remove duplicate transactions
      const uniqueTransactions = Array.from(
        new Map(
          combinedTransactions.map((transaction) => [
            transaction.id,
            transaction,
          ]),
        ).values(),
      );

      // Latest transaction first
      uniqueTransactions.sort(
        (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate),
      );

      setTransactionReceipts(uniqueTransactions);
    } catch (error) {
      console.error("Load Transaction Receipts Error:", error);

      setMessage(error.message || "Unable to load transaction receipts");

      setMessageType("error");
    } finally {
      setReceiptLoading(false);
    }
  };

  // =====================================================
  // VIEW TRANSACTION RECEIPT
  // =====================================================

  const handleViewReceipt = async (transactionId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setReceiptLoading(true);
      clearMessage();

      const response = await fetch(
        `http://localhost:8080/api/transactions/${transactionId}/receipt`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await parseResponse(response);

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load transaction receipt",
        );
      }

      setSelectedReceipt(data);
    } catch (error) {
      console.error("View Receipt Error:", error);

      setMessage(error.message || "Unable to load transaction receipt");

      setMessageType("error");
    } finally {
      setReceiptLoading(false);
    }
  };

  // =====================================================
  // BANK TRANSFER VALIDATION
  // =====================================================

  const validateBankTransfer = () => {
    const account = receiverAccountNumber.trim();

    const ifsc = receiverIfscCode.trim().toUpperCase();

    const transferAmount = Number(amount);

    if (!account) {
      return "Receiver account number is required";
    }

    if (!/^\d+$/.test(account)) {
      return "Please enter a valid account number";
    }

    if (!ifsc) {
      return "Receiver IFSC code is required";
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      return "Invalid IFSC code format";
    }

    if (!amount || !Number.isFinite(transferAmount)) {
      return "Please enter a valid transfer amount";
    }

    if (transferAmount <= 0) {
      return "Transfer amount must be greater than 0";
    }

    return null;
  };

  // =====================================================
  // UPI TRANSFER
  // =====================================================

  const handleUpiTransfer = async (e) => {
    e.preventDefault();

    clearMessage();

    if (!receiverUpiId.trim()) {
      setMessage("Receiver UPI ID is required");
      setMessageType("error");
      return;
    }

    if (!receiverUpiId.includes("@")) {
      setMessage("Please enter a valid UPI ID");
      setMessageType("error");
      return;
    }

    const transferAmount = Number(amount);

    if (!amount || !Number.isFinite(transferAmount) || transferAmount <= 0) {
      setMessage("Transfer amount must be greater than 0");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/api/upi/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverUpiId: receiverUpiId.trim().toLowerCase(),
          amount: transferAmount,
        }),
      });

      const data = await parseResponse(response);

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || "UPI transfer failed");
      }

      setMessage(
        `₹${transferAmount.toLocaleString(
          "en-IN",
        )} transferred successfully via UPI`,
      );

      setMessageType("success");

      setReceiverUpiId("");
      setAmount("");
    } catch (error) {
      console.error("UPI Transfer Error:", error);

      setMessage(error.message || "Something went wrong during UPI transfer");

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ACCOUNT / NEFT / RTGS / IMPS TRANSFER
  // =====================================================

  const handleBankTransfer = async (e, transferType) => {
    e.preventDefault();

    clearMessage();

    const validationError = validateBankTransfer();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    const account = receiverAccountNumber.trim();

    const ifsc = receiverIfscCode.trim().toUpperCase();

    const transferAmount = Number(amount);

    // -------------------------------------------------
    // SELF TRANSFER
    // -------------------------------------------------

    let customer = null;

    try {
      customer = JSON.parse(localStorage.getItem("customer") || "null");
    } catch {
      customer = null;
    }

    if (customer?.accountNumber && customer.accountNumber === account) {
      setMessage("You cannot transfer money to your own account");

      setMessageType("error");
      return;
    }

    // -------------------------------------------------
    // TOKEN
    // -------------------------------------------------

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");

      setMessageType("error");
      return;
    }

    // -------------------------------------------------
    // ENDPOINT
    // -------------------------------------------------

    let endpoint = "http://localhost:8080/api/transactions/transfer";

    if (transferType === "NEFT") {
      endpoint = "http://localhost:8080/api/transactions/neft";
    }

    if (transferType === "RTGS") {
      endpoint = "http://localhost:8080/api/transactions/rtgs";
    }

    if (transferType === "IMPS") {
      endpoint = "http://localhost:8080/api/transactions/imps";
    }

    try {
      setLoading(true);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverAccountNumber: account,
          receiverIfscCode: ifsc,
          amount: transferAmount,
        }),
      });

      const data = await parseResponse(response);

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `${transferType} transfer failed`,
        );
      }

      setMessage(
        `₹${transferAmount.toLocaleString(
          "en-IN",
        )} transferred successfully via ${transferType}`,
      );

      setMessageType("success");

      setReceiverAccountNumber("");
      setReceiverIfscCode("");
      setAmount("");
    } catch (error) {
      console.error(`${transferType} Transfer Error:`, error);

      setMessage(
        error.message || `Something went wrong during ${transferType} transfer`,
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // QR PAYMENT
  // =====================================================

  const handleGenerateQr = async (e) => {
    e.preventDefault();

    clearMessage();

    setQrTransactionReference("");

    const upiId = qrUpiId.trim().toLowerCase();

    const name = qrReceiverName.trim();

    const value = Number(qrAmount);

    if (!upiId || !upiId.includes("@")) {
      setMessage("Please enter a valid UPI ID");
      setMessageType("error");
      return;
    }

    if (!name) {
      setMessage("Receiver name is required");
      setMessageType("error");
      return;
    }

    if (!qrAmount || !Number.isFinite(value) || value <= 0) {
      setMessage("Payment amount must be greater than 0");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/api/payments/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          upiId,
          receiverName: name,
          amount: value,
        }),
      });

      const data = await parseResponse(response);

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "QR payment generation failed",
        );
      }

      setQrUpiUrl(data.upiUrl || "");

      setQrTransactionReference(data.transactionReference || "");

      setMessage(
        `QR code generated successfully. Reference: ${
          data.transactionReference || "N/A"
        }`,
      );

      setMessageType("success");
    } catch (error) {
      console.error("QR Payment Error:", error);

      setQrUpiUrl("");
      setQrTransactionReference("");

      setMessage(
        error.message || "Something went wrong while generating the QR code.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // QR IMAGE
  // =====================================================

  const getQrImageUrl = () => {
    if (!qrUpiUrl) {
      return "";
    }

    return (
      "https://api.qrserver.com/v1/create-qr-code/" +
      "?size=320x320&margin=10&data=" +
      encodeURIComponent(qrUpiUrl)
    );
  };

  // =====================================================
  // OPEN UPI APP
  // =====================================================

  const openUpiApp = () => {
    if (qrUpiUrl) {
      window.location.href = qrUpiUrl;
    }
  };

  // =====================================================
  // BILL PAYMENT
  // =====================================================

  const handleBillPayment = async (e) => {
    e.preventDefault();

    clearMessage();
    setBillTransaction(null);

    const category = billCategory.trim().toUpperCase();

    const billerName = billBillerName.trim();

    const consumerNumber = billConsumerNumber.trim();

    const value = Number(billAmount);

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!category) {
      setMessage("Please select a bill category");
      setMessageType("error");
      return;
    }

    if (!billerName) {
      setMessage("Biller name is required");
      setMessageType("error");
      return;
    }

    if (!consumerNumber) {
      setMessage("Consumer number is required");
      setMessageType("error");
      return;
    }

    if (!/^[A-Za-z0-9\-\/]+$/.test(consumerNumber)) {
      setMessage("Please enter a valid consumer number");
      setMessageType("error");
      return;
    }

    if (!billAmount || !Number.isFinite(value) || value <= 0) {
      setMessage("Bill payment amount must be greater than 0");
      setMessageType("error");
      return;
    }

    // -------------------------------------------------
    // TOKEN
    // -------------------------------------------------

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    // -------------------------------------------------
    // API
    // -------------------------------------------------

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8080/api/payments/bill", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          billerCategory: category,

          billerName: billerName,

          consumerNumber: consumerNumber,

          amount: value,
        }),
      });

      const data = await parseResponse(response);

      // -------------------------------------------------
      // AUTH ERROR
      // -------------------------------------------------

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      // -------------------------------------------------
      // ERROR
      // -------------------------------------------------

      if (!response.ok) {
        throw new Error(data.message || data.error || "Bill payment failed");
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setBillTransaction(data);

      const paidAmount = Number(data.amount ?? value);

      const transactionId = data.id
        ? `Transaction ID: ${data.id}`
        : "Payment successful";

      setMessage(
        `₹${paidAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} bill paid successfully. ${transactionId}`,
      );

      setMessageType("success");

      // Clear form after success
      setBillBillerName("");
      setBillConsumerNumber("");
      setBillAmount("");
    } catch (error) {
      console.error("Bill Payment Error:", error);

      setMessage(
        error.message ||
          "Something went wrong while processing the bill payment.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // AUTO-PAY API
  // =====================================================
  // -----------------------------------------------------
  // LOAD MY ACCOUNTS
  // -----------------------------------------------------

  const loadAccounts = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setAccountsLoading(true);

      const response = await fetch("http://localhost:8080/api/accounts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load accounts",
        );
      }

      setAccounts(Array.isArray(data) ? data : []);

      // Automatically select first account
      if (Array.isArray(data) && data.length > 0) {
        setAutoPayAccountId(String(data[0].id));
        setScheduledPaymentAccountId(String(data[0].id));
      }
    } catch (error) {
      console.error("Load Accounts Error:", error);

      setMessage(error.message || "Unable to load your accounts");

      setMessageType("error");
    } finally {
      setAccountsLoading(false);
    }
  };
  // -----------------------------------------------------
  // LOAD AUTO-PAYS
  // -----------------------------------------------------

  const loadAutoPays = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setAutoPayLoading(true);

      const response = await fetch("http://localhost:8080/api/autopay", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load Auto-Pay records",
        );
      }

      setAutoPays(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Auto-Pay Error:", error);

      setMessage(error.message || "Unable to load Auto-Pay records");

      setMessageType("error");
    } finally {
      setAutoPayLoading(false);
    }
  };

  // -----------------------------------------------------
  // CREATE AUTO-PAY
  // -----------------------------------------------------

  const handleCreateAutoPay = async (e) => {
    e.preventDefault();
    clearMessage();

    const accountId = Number(autoPayAccountId);
    const amountValue = Number(autoPayAmount);

    if (!autoPayAccountId || !Number.isInteger(accountId) || accountId <= 0) {
      setMessage("Please enter a valid Account ID");
      setMessageType("error");
      return;
    }

    if (!autoPayBillerName.trim()) {
      setMessage("Biller name is required");
      setMessageType("error");
      return;
    }

    if (!autoPayBillerReference.trim()) {
      setMessage("Biller reference is required");
      setMessageType("error");
      return;
    }

    if (!autoPayAmount || !Number.isFinite(amountValue) || amountValue <= 0) {
      setMessage("Auto-Pay amount must be greater than 0");
      setMessageType("error");
      return;
    }

    if (!autoPayStartDate) {
      setMessage("Please select a start date");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setAutoPayLoading(true);

      const response = await fetch("http://localhost:8080/api/autopay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: accountId,
          billerName: autoPayBillerName.trim(),
          billerReference: autoPayBillerReference.trim(),
          amount: amountValue,
          frequency: autoPayFrequency,
          startDate: autoPayStartDate,
        }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create Auto-Pay",
        );
      }

      setMessage(`Auto-Pay created successfully. Auto-Pay ID: ${data.id}`);

      setMessageType("success");

      // Clear form
      setAutoPayBillerName("");
      setAutoPayBillerReference("");
      setAutoPayAmount("");
      setAutoPayFrequency("MONTHLY");
      setAutoPayStartDate("");

      // Refresh list
      await loadAutoPays();
    } catch (error) {
      console.error("Create Auto-Pay Error:", error);

      setMessage(
        error.message || "Something went wrong while creating Auto-Pay",
      );

      setMessageType("error");
    } finally {
      setAutoPayLoading(false);
    }
  };

  // -----------------------------------------------------
  // PAUSE AUTO-PAY
  // -----------------------------------------------------

  const handlePauseAutoPay = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setAutoPayLoading(true);
      clearMessage();

      const response = await fetch(
        `http://localhost:8080/api/autopay/${id}/pause`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to pause Auto-Pay",
        );
      }

      setMessage("Auto-Pay paused successfully");
      setMessageType("success");

      await loadAutoPays();
    } catch (error) {
      console.error("Pause Auto-Pay Error:", error);

      setMessage(error.message || "Unable to pause Auto-Pay");

      setMessageType("error");
    } finally {
      setAutoPayLoading(false);
    }
  };

  // -----------------------------------------------------
  // RESUME AUTO-PAY
  // -----------------------------------------------------

  const handleResumeAutoPay = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setAutoPayLoading(true);
      clearMessage();

      const response = await fetch(
        `http://localhost:8080/api/autopay/${id}/resume`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to resume Auto-Pay",
        );
      }

      setMessage("Auto-Pay resumed successfully");
      setMessageType("success");

      await loadAutoPays();
    } catch (error) {
      console.error("Resume Auto-Pay Error:", error);

      setMessage(error.message || "Unable to resume Auto-Pay");

      setMessageType("error");
    } finally {
      setAutoPayLoading(false);
    }
  };

  // -----------------------------------------------------
  // CANCEL AUTO-PAY
  // -----------------------------------------------------

  const handleCancelAutoPay = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setAutoPayLoading(true);
      clearMessage();

      const response = await fetch(
        `http://localhost:8080/api/autopay/${id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to cancel Auto-Pay",
        );
      }

      setMessage("Auto-Pay cancelled successfully");
      setMessageType("success");

      await loadAutoPays();
    } catch (error) {
      console.error("Cancel Auto-Pay Error:", error);

      setMessage(error.message || "Unable to cancel Auto-Pay");

      setMessageType("error");
    } finally {
      setAutoPayLoading(false);
    }
  };

  // -----------------------------------------------------
  // DELETE AUTO-PAY
  // -----------------------------------------------------

  const handleDeleteAutoPay = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this Auto-Pay?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setAutoPayLoading(true);
      clearMessage();

      const response = await fetch(`http://localhost:8080/api/autopay/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        throw new Error(
          data.message || data.error || "Failed to delete Auto-Pay",
        );
      }

      setMessage("Auto-Pay deleted successfully");
      setMessageType("success");

      await loadAutoPays();
    } catch (error) {
      console.error("Delete Auto-Pay Error:", error);

      setMessage(error.message || "Unable to delete Auto-Pay");

      setMessageType("error");
    } finally {
      setAutoPayLoading(false);
    }
  };

  // =====================================================
  // SCHEDULED PAYMENT API
  // =====================================================

  // -----------------------------------------------------
  // LOAD SCHEDULED PAYMENTS
  // -----------------------------------------------------

  const loadScheduledPayments = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setScheduledPaymentLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/scheduled-payments",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load Scheduled Payments",
        );
      }

      setScheduledPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Scheduled Payments Error:", error);

      setMessage(error.message || "Unable to load Scheduled Payments");

      setMessageType("error");
    } finally {
      setScheduledPaymentLoading(false);
    }
  };
  // =====================================================
  // SCHEDULED PAYMENT ACTIONS
  // =====================================================

  // -----------------------------------------------------
  // CREATE SCHEDULED PAYMENT
  // -----------------------------------------------------

  const handleCreateScheduledPayment = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    if (!scheduledPaymentAccountId) {
      setMessage("Please select an account.");
      setMessageType("error");
      return;
    }

    if (!scheduledPaymentReceiverAccountNumber.trim()) {
      setMessage("Receiver account number is required.");
      setMessageType("error");
      return;
    }

    if (!scheduledPaymentReceiverIfscCode.trim()) {
      setMessage("Receiver IFSC code is required.");
      setMessageType("error");
      return;
    }

    if (!scheduledPaymentAmount || Number(scheduledPaymentAmount) <= 0) {
      setMessage("Amount must be greater than zero.");
      setMessageType("error");
      return;
    }

    if (!scheduledPaymentDate) {
      setMessage("Please select a scheduled date.");
      setMessageType("error");
      return;
    }

    try {
      setScheduledPaymentLoading(true);
      clearMessage();

      const response = await fetch(
        "http://localhost:8080/api/scheduled-payments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: Number(scheduledPaymentAccountId),
            paymentType: scheduledPaymentType,
            receiverAccountNumber: scheduledPaymentReceiverAccountNumber.trim(),
            receiverIfscCode: scheduledPaymentReceiverIfscCode
              .trim()
              .toUpperCase(),
            receiverUpiId: null,
            amount: Number(scheduledPaymentAmount),
            scheduledDate: scheduledPaymentDate,
          }),
        },
      );

      const data = await parseResponse(response);

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create Scheduled Payment",
        );
      }

      setMessage("Scheduled Payment created successfully.");
      setMessageType("success");

      setScheduledPaymentReceiverAccountNumber("");
      setScheduledPaymentReceiverIfscCode("");
      setScheduledPaymentAmount("");
      setScheduledPaymentDate("");

      await loadScheduledPayments();
    } catch (error) {
      console.error("Create Scheduled Payment Error:", error);

      setMessage(error.message || "Unable to create Scheduled Payment");
      setMessageType("error");
    } finally {
      setScheduledPaymentLoading(false);
    }
  };

  // -----------------------------------------------------
  // PAUSE SCHEDULED PAYMENT
  // -----------------------------------------------------

  const handlePauseScheduledPayment = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setScheduledPaymentLoading(true);
      clearMessage();

      const response = await fetch(
        `http://localhost:8080/api/scheduled-payments/${id}/pause`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await parseResponse(response);

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to pause Scheduled Payment",
        );
      }

      setMessage("Scheduled Payment paused successfully.");
      setMessageType("success");

      await loadScheduledPayments();
    } catch (error) {
      console.error("Pause Scheduled Payment Error:", error);

      setMessage(error.message || "Unable to pause Scheduled Payment");
      setMessageType("error");
    } finally {
      setScheduledPaymentLoading(false);
    }
  };

  // -----------------------------------------------------
  // RESUME SCHEDULED PAYMENT
  // -----------------------------------------------------

  const handleResumeScheduledPayment = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setScheduledPaymentLoading(true);
      clearMessage();

      const response = await fetch(
        `http://localhost:8080/api/scheduled-payments/${id}/resume`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await parseResponse(response);

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to resume Scheduled Payment",
        );
      }

      setMessage("Scheduled Payment resumed successfully.");
      setMessageType("success");

      await loadScheduledPayments();
    } catch (error) {
      console.error("Resume Scheduled Payment Error:", error);

      setMessage(error.message || "Unable to resume Scheduled Payment");
      setMessageType("error");
    } finally {
      setScheduledPaymentLoading(false);
    }
  };

  // -----------------------------------------------------
  // CANCEL SCHEDULED PAYMENT
  // -----------------------------------------------------

  const handleCancelScheduledPayment = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this Scheduled Payment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setScheduledPaymentLoading(true);
      clearMessage();

      const response = await fetch(
        `http://localhost:8080/api/scheduled-payments/${id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await parseResponse(response);

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to cancel Scheduled Payment",
        );
      }

      setMessage("Scheduled Payment cancelled successfully.");
      setMessageType("success");

      await loadScheduledPayments();
    } catch (error) {
      console.error("Cancel Scheduled Payment Error:", error);

      setMessage(error.message || "Unable to cancel Scheduled Payment");
      setMessageType("error");
    } finally {
      setScheduledPaymentLoading(false);
    }
  };

  // -----------------------------------------------------
  // DELETE SCHEDULED PAYMENT
  // -----------------------------------------------------

  const handleDeleteScheduledPayment = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this Scheduled Payment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setScheduledPaymentLoading(true);
      clearMessage();

      const response = await fetch(
        `http://localhost:8080/api/scheduled-payments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await parseResponse(response);

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to delete Scheduled Payment",
        );
      }

      setMessage("Scheduled Payment deleted successfully.");
      setMessageType("success");

      await loadScheduledPayments();
    } catch (error) {
      console.error("Delete Scheduled Payment Error:", error);

      setMessage(error.message || "Unable to delete Scheduled Payment");
      setMessageType("error");
    } finally {
      setScheduledPaymentLoading(false);
    }
  };
  // =====================================================
  // PAYMENT CHANGE
  // =====================================================

  const handlePaymentChange = (option) => {
    setSelectedPayment(option);

    clearMessage();

    // Bank / UPI
    setReceiverAccountNumber("");
    setReceiverIfscCode("");
    setReceiverUpiId("");
    setAmount("");

    // Bill
    setBillBillerName("");
    setBillConsumerNumber("");
    setBillAmount("");
    setBillTransaction(null);
    setBillCategory("ELECTRICITY");

    // QR
    setQrTransactionReference("");

    // Auto-Pay
    if (option === "Auto-Pay") {
      loadAccounts();
      loadAutoPays();
    }

    // Scheduled Payment
    if (option === "Scheduled Payment") {
      loadAccounts();
      loadScheduledPayments();
    }

    // Transaction Receipts
    if (option === "Transaction Receipts") {
      setSelectedReceipt(null);
      loadTransactionReceipts();
    }

    //UPI
    if (option === "UPI Transfer") {
      setTransferMode("upi");
    }

    if (option !== "QR Payment") {
      setQrUpiUrl("");
    }
  };

  // =====================================================
  // CHANGE UPI MODE
  // =====================================================

  const changeTransferMode = (mode) => {
    setTransferMode(mode);

    clearMessage();

    setReceiverAccountNumber("");
    setReceiverIfscCode("");
    setReceiverUpiId("");
    setAmount("");
  };

  // =====================================================
  // DESCRIPTION
  // =====================================================

  const getDescription = () => {
    switch (selectedPayment) {
      case "UPI Transfer":
        return "Send money instantly using UPI or bank account details.";

      case "NEFT":
        return "Transfer money securely using NEFT.";

      case "RTGS":
        return "Transfer high-value payments securely using RTGS.";

      case "IMPS":
        return "Transfer money instantly using IMPS.";

      case "QR Payment":
        return "Generate a UPI QR code and open it directly in a UPI app.";

      case "Bill Payment":
        return "Pay electricity, water, gas, broadband and other bills securely.";

      case "Recharge":
        return "Recharge your mobile and other services securely.";

      case "Auto-Pay":
        return "Manage recurring payments securely.";

      case "Scheduled Payment":
        return "Schedule your payments for a future date.";

      default:
        return `Manage your ${selectedPayment.toLowerCase()} payments securely.`;
    }
  };

  // =====================================================
  // RECHARGE
  // =====================================================

  const handleRecharge = async (e) => {
    e.preventDefault();
    console.log("🔥 RECHARGE BUTTON CLICKED");

    // setMessage("");

    const mobile = rechargeMobile.trim();
    const operator = rechargeOperator.trim();
    const value = Number(rechargeAmount);

    clearMessage();

    // Mobile validation
    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      setMessageType("error");
      return;
    }

    // Operator validation
    if (!operator) {
      setMessage("Please select a mobile operator.");
      setMessageType("error");
      return;
    }

    // Amount validation
    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Recharge amount must be greater than 0.");
      setMessageType("error");
      return;
    }

    // JWT token
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Login session expired. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      console.log("📱 Mobile:", mobile);
      console.log("📡 Operator:", operator);
      console.log("💰 Amount:", value);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/recharge", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          mobileNumber: mobile,
          operator: operator,
          amount: value,
        }),
      });

      const data = await parseResponse(response);

      console.log("🔵 Recharge Response:", response.status);
      console.log("🟢 Recharge Data:", data);

      if (response.ok && data.status === "SUCCESS") {
        setRechargeSuccess(data);
      }

      // =========================
      // AUTH ERROR
      // =========================

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      // =========================
      // API ERROR
      // =========================

      if (!response.ok) {
        throw new Error(data.message || data.error || "Recharge failed");
      }

      // =========================
      // SUCCESS
      // =========================

      if (data.status === "SUCCESS") {
        const transactionId = data.id ? `Transaction ID: ${data.id}` : "";

        setMessage(
          `₹${value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} recharge successful! ${transactionId}`,
        );

        setMessageType("success");

        // Clear form
        setRechargeMobile("");
        setRechargeAmount("");
      }
    } catch (error) {
      console.error("Recharge Error:", error);

      setMessage(
        error.message || "Something went wrong while processing recharge.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <style>{`

                * {
                    box-sizing: border-box;
                }

                .payments-page {
                    min-height: 100vh;
                    width: 100%;
                    background: #f5f8fd;
                    padding: 34px 40px 50px;
                    font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        Arial,
                        sans-serif;
                    color: #172033;
                }

                .payments-container {
                    width: 100%;
                    max-width: 1450px;
                    margin: 0 auto;
                }

                /* =========================================
                   HEADER
                ========================================= */

                .payments-header {
                    max-height: 100px;
                    background:
                        linear-gradient(
                            135deg,
                            #102354 0%, #173f9d 48%, #2563d4 100%
                        );
                    border-radius: 22px;
                    padding: 4px 32px;
                    color: white;
                    box-shadow:
                        0 18px 40px
                        rgba(20, 58, 135, 0.20);
                    margin-bottom: 24px;
                }

                .payments-header-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 30px;
                }

                .payments-eyebrow {
                    margin: 0 0 8px;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 1.5px;
                    color:
                        rgba(255,255,255,0.75);
                }

                .payments-title {
                    margin: 0;
                    font-size: 34px;
                    font-weight: 800;
                }

                .payments-subtitle {
                    margin: 8px 0 0;
                    font-size: 15px;
                    color:
                        rgba(255,255,255,0.82);
                }

                .dashboard-button {
                    flex-shrink: 0;
                    border:
                        1px solid
                        rgba(255,255,255,0.35);
                    background: #ffffff;
                    color: #173b8c;
                    padding: 13px 22px;
                    border-radius: 11px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                }

                /* =========================================
                   MAIN CARD
                ========================================= */

                .payments-card {
                    background: white;
                    border:
                        1px solid #e3eaf4;
                    border-radius: 22px;
                    box-shadow:
                        0 12px 35px
                        rgba(20,35,70,0.07);
                    overflow: hidden;
                }

                /* =========================================
                   PAYMENT OPTIONS
                ========================================= */

                .payment-options-wrapper {
                    padding: 20px 24px 0;
                    border-bottom:
                        1px solid #edf1f6;
                    background: white;
                }

                .payment-options {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding-bottom: 18px;
                    scrollbar-width: thin;
                }

                .payment-option {
                    flex-shrink: 0;
                    border:
                        1px solid #dbe3ef;
                    background: white;
                    color: #52627a;
                    padding: 12px 19px;
                    border-radius: 11px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .payment-option:hover {
                    border-color: #2563eb;
                    color: #2563eb;
                    background: #f5f8ff;
                }

                .payment-option.active {
                    border-color: transparent;
                    color: white;
                    background:
                        linear-gradient(
                            135deg,
                            #173b8c,
                            #2563eb
                        );
                    box-shadow:
                        0 7px 17px
                        rgba(37,99,235,0.22);
                }

                /* =========================================
                   CONTENT
                ========================================= */

                .payment-content {
                    padding: 32px 38px 38px;
                }

                .payment-content-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 28px;
                }

                .payment-content-title {
                    margin: 0;
                    font-size: 25px;
                    font-weight: 800;
                }

                .payment-content-description {
                    margin: 7px 0 0;
                    font-size: 14px;
                    color: #71809a;
                }

                .secure-badge {
                    padding: 9px 14px;
                    border-radius: 22px;
                    background: #eef9f2;
                    color: #158047;
                    font-size: 12px;
                    font-weight: 800;
                    white-space: nowrap;
                }

                /* =========================================
                   COMMON LAYOUT
                ========================================= */

                .payment-layout {
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1.45fr)
                        minmax(300px, 0.85fr);
                    gap: 25px;
                }

                .form-card,
                .qr-form-card,
                .bill-form-card {
                    border:
                        1px solid #e3eaf3;
                    border-radius: 18px;
                    padding: 27px;
                    background: white;
                    box-shadow:
                        0 5px 18px
                        rgba(30,45,80,0.03);
                }

                /* =========================================
                   UPI MODE TABS
                ========================================= */

                .transfer-mode-tabs {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border-bottom:
                        1px solid #e5ebf3;
                    margin-bottom: 24px;
                }

                .transfer-mode-button {
                    position: relative;
                    border: none;
                    background: transparent;
                    color: #71809a;
                    padding: 13px 12px;
                    font-size: 14px;
                    font-weight: 750;
                    cursor: pointer;
                }

                .transfer-mode-button.active {
                    color: #1d4ed8;
                }

                .transfer-mode-button.active::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: -1px;
                    height: 3px;
                    border-radius:
                        4px 4px 0 0;
                    background:
                        linear-gradient(
                            90deg,
                            #173b8c,
                            #2563eb
                        );
                }

                .transfer-mode-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    margin-right: 8px;
                    border-radius: 8px;
                    background: #edf4ff;
                    color: #2563eb;
                    font-size: 11px;
                    vertical-align: middle;
                }

                /* =========================================
                   FORM HEADING
                ========================================= */

                .form-heading {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                    margin-bottom: 22px;
                }

                .form-icon {
                    width: 46px;
                    height: 46px;
                    min-width: 46px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 13px;
                    background: #e8f1ff;
                    color: #1d4ed8;
                    font-size: 13px;
                    font-weight: 800;
                }

                .form-icon.bank {
                    background: #eef8f2;
                    color: #158047;
                }

                .form-heading h4 {
                    margin: 0;
                    font-size: 17px;
                }

                .form-heading p {
                    margin: 4px 0 0;
                    font-size: 12px;
                    color: #8490a8;
                }

                /* =========================================
                   FORM
                ========================================= */

                .transfer-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                    
                }

                .form-group label {
                    font-size: 12px;
                    font-weight: 750;
                    color: #526078;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-prefix {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform:
                        translateY(-50%);
                    color: #64748b;
                    font-size: 15px;
                    font-weight: 700;
                    pointer-events: none;
                }

                .form-group input,
                .bill-select {
                    width: 100%;
                    height: 49px;
                    border:
                        1px solid #dbe3ed;
                    border-radius: 10px;
                    outline: none;
                    padding: 0 14px;
                    background: #fbfcfe;
                    color: #172033;
                    font-size: 14px;
                    transition:
                        border-color .2s ease,
                        box-shadow .2s ease;
                }

                .form-group input.with-prefix {
                    padding-left: 40px;
                }

                .form-group input::placeholder {
                    color: #a1aabc;
                }

                .form-group input:focus,
                .bill-select:focus {
                    border-color: #2563eb;
                    background: white;
                    box-shadow:
                        0 0 0 3px
                        rgba(37,99,235,0.09);
                }

                .ifsc-helper {
                    margin-top: 4px;
                    font-size: 10px;
                    color: #8b96a8;
                }

                /* =========================================
                   BUTTON
                ========================================= */

                .transfer-button {
                    width: 100%;
                    height: 50px;
                    border: none;
                    border-radius: 10px;
                    margin-top: 4px;
                    background:
                        linear-gradient(
                            135deg,
                            #173b8c,
                            #2563eb
                        );
                    color: white;
                    font-size: 14px;
                    font-weight: 750;
                    cursor: pointer;
                    box-shadow:
                        0 8px 18px
                        rgba(37,99,235,0.20);
                }

                .transfer-button:hover:not(:disabled) {
                    transform:
                        translateY(-1px);
                }

                .transfer-button:disabled {
                    opacity: .65;
                    cursor: not-allowed;
                }

                /* =========================================
                   INFO CARD
                ========================================= */

                .info-card,
                .bill-info-card {
                    border-radius: 18px;
                    padding: 27px;
                    background:
                        linear-gradient(
                            145deg,
                            #f5f8ff,
                            #eef4ff
                        );
                    border:
                        1px solid #dce7fb;
                }

                .info-icon {
                    width: 45px;
                    height: 45px;
                    border-radius: 13px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    font-size: 20px;
                    margin-bottom: 17px;
                }

                .info-card h4,
                .bill-info-card h4 {
                    margin: 0 0 8px;
                    font-size: 17px;
                }

                .info-card p,
                .bill-info-card > p {
                    margin: 0;
                    color: #718096;
                    font-size: 13px;
                    line-height: 1.7;
                }

                .info-list {
                    list-style: none;
                    margin: 20px 0 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .info-list li {
                    display: flex;
                    gap: 9px;
                    align-items: flex-start;
                    font-size: 12px;
                    color: #526078;
                    line-height: 1.5;
                }

                .check {
                    color: #16a05d;
                    font-weight: 900;
                }

                /* =========================================
                   MESSAGE
                ========================================= */

                .payment-message {
                    margin-top: 18px;
                    padding: 13px 15px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 650;
                    line-height: 1.5;
                }

                .payment-message.success {
                    background: #ecfdf3;
                    border:
                        1px solid #b9ebcd;
                    color: #117a45;
                }

                .payment-message.error {
                    background: #fff2f2;
                    border:
                        1px solid #fecaca;
                    color: #b42318;
                }

                /* =========================================
                   QR PAYMENT
                ========================================= */

                .qr-layout {
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1.1fr)
                        minmax(320px, 0.9fr);
                    gap: 25px;
                }

                .qr-preview-card {
                    border:
                        1px solid #e3eaf3;
                    border-radius: 18px;
                    padding: 27px;
                    background:
                        linear-gradient(
                            145deg,
                            #f5f8ff,
                            #eef4ff
                        );
                    border-color: #dce7fb;
                    text-align: center;
                    box-shadow:
                        0 5px 18px
                        rgba(30,45,80,0.03);
                }

                .qr-image-box {
                    width: 300px;
                    max-width: 100%;
                    min-height: 300px;
                    margin:
                        0 auto 18px;
                    padding: 10px;
                    border-radius: 18px;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .qr-image {
                    width: 280px;
                    height: 280px;
                    max-width: 100%;
                    display: block;
                }

                .qr-empty {
                    color: #8490a8;
                    font-size: 13px;
                    line-height: 1.6;
                    padding: 55px 25px;
                }

                .qr-details {
                    background: white;
                    border:
                        1px solid #e1e7f0;
                    border-radius: 14px;
                    padding: 17px 18px;
                    text-align: left;
                    margin-bottom: 15px;
                }

                .qr-detail-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 8px 0;
                    font-size: 13px;
                }

                .qr-detail-row span {
                    color: #8490a8;
                }

                .qr-detail-row strong {
                    color: #172033;
                    text-align: right;
                    word-break: break-word;
                }

                .qr-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .qr-action-button {
                    height: 48px;
                    border-radius: 10px;
                    border:
                        1px solid #dbe3ef;
                    background: white;
                    color: #173b8c;
                    font-size: 13px;
                    font-weight: 750;
                    cursor: pointer;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .qr-action-button.primary {
                    border-color: transparent;
                    color: white;
                    background:
                        linear-gradient(
                            135deg,
                            #173b8c,
                            #2563eb
                        );
                }

                .qr-action-button.disabled {
                    opacity: .5;
                    pointer-events: none;
                }

                /* =========================================
                   BILL PAYMENT
                ========================================= */

                .bill-layout {
                    display: grid;
                    grid-template-columns:
                        minmax(0, 1.25fr)
                        minmax(300px, 0.75fr);
                    gap: 25px;
                }

                .bill-category-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(2, minmax(0, 1fr));
                    gap: 10px;
                }

                .bill-category-button {
                    min-height: 48px;
                    border:
                        1px solid #dbe3ed;
                    border-radius: 10px;
                    background: #fbfcfe;
                    color: #526078;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 9px 12px;
                }

                .bill-category-button:hover {
                    border-color: #2563eb;
                    color: #2563eb;
                    background: #f5f8ff;
                }

                .bill-category-button.active {
                    border-color: #2563eb;
                    background: #edf4ff;
                    color: #1d4ed8;
                }

                .bill-summary {
                    margin-top: 20px;
                    padding: 16px;
                    border-radius: 13px;
                    background: white;
                    border:
                        1px solid #e1e7f0;
                }

                .bill-summary-title {
                    margin: 0 0 8px;
                    font-size: 13px;
                    font-weight: 800;
                    color: #26344a;
                }

                .bill-summary-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 8px 0;
                    font-size: 13px;
                }

                .bill-summary-row span {
                    color: #8490a8;
                }

                .bill-summary-row strong {
                    color: #172033;
                    text-align: right;
                    word-break: break-word;
                }

                /* =========================================
                       RECHARGE BUTTON
                   ========================================= */


                .recharge-button {
    width: 100%;
    min-height: 45px;
    margin-top:15px;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    transition: all 0.2s ease;
}

.recharge-button:hover:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.recharge-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.recharge-operator {
    width: 100%;
    height: 40px;
    padding: 10px 14px;
    background: #e2eaf3;
    color: #111827;
    border: 1px solid #dbe3ef;
    border-radius: 8px;
    font-size: 15px;
    box-sizing: border-box;
    cursor: pointer;
    outline: none;
}
.recharge-operator:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
}

/* =====================================================
   RECHARGE SUCCESS CARD
   ===================================================== */

.recharge-success {
  width: 100%;
  box-sizing: border-box;
  margin-top: 18px;
  padding: 24px;
  border-radius: 16px;

  background: #ffffff;
  border: 1px solid #dce8f5;

  box-shadow: 0 8px 24px rgba(30, 80, 150, 0.08);

  animation: rechargeSuccessIn 0.35s ease-out;
}

/* Success heading */

.recharge-success .form-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.recharge-success .form-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;
  background: #eaf8ef;

  font-size: 24px;
}

/* Heading text */

.recharge-success h4 {
  margin: 0 0 5px;

  font-size: 18px;
  font-weight: 700;

  color: #168344;
}

.recharge-success .form-heading p {
  margin: 0;

  font-size: 13px;
  line-height: 1.5;

  color: #718096;
}


/* =====================================================
   TRANSACTION DETAILS
   ===================================================== */

.recharge-success-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  padding: 16px;

  border-radius: 12px;
  background: #f7fafc;
  border: 1px solid #e7eef5;
}

.recharge-success-details p {
  margin: 0;
  padding: 12px;

  border-radius: 9px;
  background: #ffffff;

  font-size: 14px;
  line-height: 1.5;

  color: #4a5568;

  word-break: break-word;
}

.recharge-success-details strong {
  color: #1a365d;
  font-weight: 600;
}


/* =====================================================
   SUCCESS STATUS
   ===================================================== */

.recharge-success-details p:last-child {
  color: #168344;
  font-weight: 700;
}

.recharge-success-details p:last-child strong {
  color: #168344;
}


/* =====================================================
   ANIMATION
   ===================================================== */

@keyframes rechargeSuccessIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}


/* =====================================================
   TABLET
   ===================================================== */

@media (max-width: 768px) {

  .recharge-success {
    padding: 20px;
    margin-top: 15px;
    border-radius: 14px;
  }

  .recharge-success .form-heading {
    gap: 12px;
  }

  .recharge-success .form-icon {
    width: 44px;
    height: 44px;
    min-width: 44px;
    font-size: 22px;
  }

  .recharge-success h4 {
    font-size: 17px;
  }

  .recharge-success .form-heading p {
    font-size: 12px;
  }

  .recharge-success-details {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px;
  }

}


/* =====================================================
   MOBILE
   ===================================================== */

@media (max-width: 480px) {

  .recharge-success {
    padding: 16px;
    margin-top: 12px;

    border-radius: 12px;
  }

  .recharge-success .form-heading {
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 16px;
  }

  .recharge-success .form-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;

    border-radius: 11px;
    font-size: 20px;
  }

  .recharge-success h4 {
    font-size: 16px;
  }

  .recharge-success .form-heading p {
    font-size: 11px;
  }

  .recharge-success-details {
    padding: 10px;
    border-radius: 10px;
  }

  .recharge-success-details p {
    padding: 10px;

    font-size: 13px;
  }
}

/* =====================================================
   AUTO-PAY STYLING
===================================================== */

.autopay-list-section {
    margin-top: 35px;
}

.autopay-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.autopay-frequency {
    width: 100%;
    height: 40px;
    padding: 10px 14px;
    background: #e2eaf3;
    color: #111827;
    border: 1px solid #dbe3ef;
    border-radius: 8px;
    font-size: 15px;
    box-sizing: border-box;
    cursor: pointer;
    outline: none;
}

.autopay-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 22px;
    box-shadow: 0 5px 18px rgba(0, 0, 0, 0.06);
}

.autopay-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}

.autopay-card-header h3 {
    margin: 0 0 6px 0;
    font-size: 20px;
    font-weight: 700;
}

.autopay-card-header span {
    color: #6b7280;
    font-size: 14px;
}

.autopay-status {
    padding: 7px 14px;
    border-radius: 20px;
    font-size: 12px !important;
    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;
}

.autopay-status.active {
    background: #dcfce7;
    color: #15803d;
}

.autopay-status.paused {
    background: #fef3c7;
    color: #b45309;
}

.autopay-status.cancelled {
    background: #fee2e2;
    color: #dc2626;
}

.autopay-status.completed {
    background: #dbeafe;
    color: #2563eb;
}

.autopay-details {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    padding: 16px 0;
    border-top: 1px solid #eeeeee;
    border-bottom: 1px solid #eeeeee;
}

.autopay-details div {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.autopay-details strong {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
}

.autopay-details span {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
}

.autopay-actions {
    display: flex;
    gap: 10px;
    margin-top: 18px;
    flex-wrap: wrap;
}

.autopay-actions .transfer-button {
    min-width: 100px;
    padding: 10px 18px;
}

.no-data {
    padding: 25px;
    text-align: center;
    color: #6b7280;
    background: #f9fafb;
    border-radius: 12px;
}

/* Auto-Pay mobile responsive */
@media (max-width: 768px) {

    .autopay-details {
        grid-template-columns: repeat(2, 1fr);
    }

    .autopay-card-header {
        align-items: flex-start;
    }
}

@media (max-width: 480px) {

    .autopay-details {
        grid-template-columns: 1fr;
    }

    .autopay-card-header {
        flex-direction: column;
    }

    .autopay-actions {
        flex-direction: column;
    }

    .autopay-actions .transfer-button {
        width: 100%;
    }
}

/* =====================================================
   TRANSACTION RECEIPT
===================================================== */

.receipt-print-area {
    position: relative;
}

.receipt-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #dbe4f0;
}

.receipt-bank-logo {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 14px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: #e8f1ff;
    font-size: 22px;
}

.receipt-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 850;
    letter-spacing: .3px;
    color: #173b8c;
}

.receipt-header p {
    margin: 4px 0 0;
    font-size: 11px;
    color: #71809a;
}

.receipt-success-badge {
    margin-left: auto;

    padding: 7px 11px;
    border-radius: 20px;

    background: #eaf8f0;
    color: #158047;

    font-size: 10px;
    font-weight: 850;
    white-space: nowrap;
}

.receipt-details {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.receipt-detail-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.receipt-detail-row span {
    color: #71809a;
    font-size: 12px;
}

.receipt-detail-row strong {
    color: #172033;
    font-size: 12px;
    text-align: right;
    word-break: break-word;
}

.receipt-detail-row.amount-row {
    padding: 14px;
    border-radius: 12px;
    background: #f1f8f4;
}

.receipt-detail-row.amount-row span {
    color: #526078;
    font-weight: 700;
}

.receipt-detail-row.amount-row strong {
    color: #158047;
    font-size: 22px;
    font-weight: 850;
}

.receipt-status {
    color: #158047 !important;
    font-weight: 850 !important;
}

.receipt-divider {
    height: 1px;
    background: #e3eaf3;
    margin: 3px 0;
}

.receipt-footer {
    margin-top: 22px;
    padding-top: 15px;
    border-top: 1px dashed #d5deea;
    text-align: center;
}

.receipt-footer p {
    margin: 0 0 5px;
    font-size: 10px;
    color: #8490a8;
}

.receipt-footer span {
    font-size: 10px;
    color: #526078;
    font-weight: 750;
}

.receipt-print-button {
    margin-top: 20px !important;
}


/* =====================================================
   PRINT RECEIPT
===================================================== */

@media print {

    body * {
        visibility: hidden !important;
    }

    .receipt-print-area,
    .receipt-print-area * {
        visibility: visible !important;
    }

    .receipt-print-area {
        position: absolute !important;

        left: 50% !important;
        top: 20px !important;

        transform: translateX(-50%) !important;

        width: 680px !important;
        max-width: 90vw !important;

        padding: 35px !important;

        background: white !important;

        border: 1px solid #dbe4f0 !important;
        border-radius: 14px !important;

        box-shadow: none !important;
    }

    .receipt-print-button {
        display: none !important;
    }

    .receipt-header {
        border-bottom: 1px solid #dbe4f0 !important;
    }

    @page {
        size: A4;
        margin: 15mm;
    }
}

                /* =========================================
                   COMING SOON
                ========================================= */

                .coming-soon {
                    min-height: 300px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    border:
                        1px dashed #d7dfeb;
                    border-radius: 17px;
                    background: #fbfcfe;
                    padding: 30px;
                }

                .coming-soon-icon {
                    width: 58px;
                    height: 58px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 15px;
                    background: #e8f1ff;
                    font-size: 24px;
                    margin-bottom: 15px;
                }

                .coming-soon h4 {
                    margin: 0;
                    font-size: 18px;
                }

                .coming-soon p {
                    margin: 7px 0 0;
                    font-size: 13px;
                    color: #8490a8;
                }

                /* =========================================
                   FOOTER
                ========================================= */

                .payments-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    padding: 18px 5px 0;
                    color: #8a96aa;
                    font-size: 11px;
                }
/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1024px) {

    .payments-page {
        padding: 24px 20px 40px;
    }

    .payments-header {
        padding: 16px 24px;
    }

    .payments-title {
        font-size: 30px;
    }

    .payment-content {
        padding: 28px 28px 32px;
    }

    .payment-layout,
    .qr-layout,
    .bill-layout,
    .autopay-layout {
        grid-template-columns: 1fr;
    }
}


/* =========================================
   TABLET
========================================= */

@media (max-width: 768px) {

    .payments-page {
        padding: 18px 14px 30px;
    }

    .payments-container {
        width: 100%;
        max-width: 100%;
    }

    .payments-header {
        max-height: none;
        min-height: 0;
        padding: 20px;
        border-radius: 18px;
    }

    .payments-header-content {
        gap: 18px;
        align-items: flex-start;
    }

    .payments-title {
        font-size: 28px;
    }

    .payments-subtitle {
        font-size: 13px;
    }

    .dashboard-button {
        padding: 11px 16px;
        font-size: 13px;
    }

    .payment-options-wrapper {
        padding: 16px 16px 0;
    }

    .payment-options {
        gap: 8px;
        padding-bottom: 14px;
        -webkit-overflow-scrolling: touch;
    }

    .payment-option {
        padding: 11px 15px;
        font-size: 13px;
    }

    .payment-content {
        padding: 24px 20px 28px;
    }

    .payment-content-header {
        align-items: flex-start;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 22px;
    }

    .payment-content-title {
        font-size: 22px;
    }

    .payment-content-description {
        font-size: 13px;
    }

    .secure-badge {
        align-self: flex-start;
    }

    .payment-layout,
    .qr-layout,
    .bill-layout,
    .autopay-layout {
        grid-template-columns: 1fr;
        gap: 18px;
    }

    .form-card,
    .info-card,
    .qr-form-card,
    .qr-preview-card,
    .bill-form-card,
    .bill-info-card,
    .payment-form {
        width: 100%;
        min-width: 0;
        padding: 22px;
    }

    .transfer-mode-tabs {
        width: 100%;
    }

    .payments-footer {
        flex-wrap: wrap;
    }
}


/* =========================================
   MOBILE
========================================= */

@media (max-width: 600px) {

    .payments-page {
        padding: 10px 8px 24px;
    }

    .payments-header {
        padding: 20px 17px;
        border-radius: 16px;
        margin-bottom: 16px;
    }

    .payments-header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .payments-eyebrow {
        font-size: 10px;
        letter-spacing: 1.1px;
        margin-bottom: 6px;
    }

    .payments-title {
        font-size: 25px;
        line-height: 1.15;
    }

    .payments-subtitle {
        font-size: 12px;
        line-height: 1.5;
        margin-top: 6px;
    }

    .dashboard-button {
        width: 100%;
        min-height: 44px;
    }

    .payments-card {
        border-radius: 17px;
    }

    .payment-options-wrapper {
        padding: 14px 12px 0;
    }

    .payment-options {
        gap: 7px;
        padding-bottom: 12px;
    }

    .payment-option {
        padding: 10px 13px;
        border-radius: 9px;
        font-size: 12px;
        white-space: nowrap;
    }

    .payment-content {
        padding: 20px 14px 24px;
    }

    .payment-content-title {
        font-size: 20px;
        line-height: 1.25;
    }

    .payment-content-description {
        font-size: 12px;
        line-height: 1.5;
    }

    .secure-badge {
        display: none;
    }

    .form-card,
    .info-card,
    .qr-form-card,
    .qr-preview-card,
    .bill-form-card,
    .bill-info-card,
    .payment-form {
        padding: 17px;
        border-radius: 14px;
    }

    .transfer-mode-tabs {
        grid-template-columns: 1fr 1fr;
        margin-bottom: 18px;
    }

    .transfer-mode-button {
        padding: 11px 8px;
        font-size: 12px;
    }

    .qr-actions {
        grid-template-columns: 1fr !important;
    }

    .bill-category-grid {
        grid-template-columns: 1fr !important;
    }

    .autopay-details {
        grid-template-columns: 1fr !important;
        gap: 12px;
    }

    .autopay-card {
        padding: 17px;
        border-radius: 14px;
    }

    .autopay-card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .autopay-card-header h3 {
        font-size: 18px;
    }

    .autopay-card-header span {
        font-size: 12px;
    }

    .autopay-actions {
        flex-direction: column;
        width: 100%;
    }

    .autopay-actions .transfer-button {
        width: 100%;
        min-width: 0;
    }

    .payments-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 7px;
    }

    /* Receipt */

    .receipt-header {
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 10px;
    }

    .receipt-success-badge {
        margin-left: 0;
        width: auto;
    }

    .receipt-detail-row {
        align-items: flex-start;
        flex-direction: column;
        gap: 4px;
    }

    .receipt-detail-row strong {
        text-align: left;
        width: 100%;
    }

    .receipt-detail-row.amount-row {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .receipt-detail-row.amount-row strong {
        width: auto;
        text-align: right;
    }
}


/* =========================================
   SMALL MOBILE
========================================= */

@media (max-width: 430px) {

    .payments-page {
        padding: 8px 6px 20px;
    }

    .payments-header {
        padding: 17px 14px;
    }

    .payments-title {
        font-size: 23px;
    }

    .payments-subtitle {
        font-size: 11.5px;
    }

    .payment-options-wrapper {
        padding-left: 9px;
        padding-right: 9px;
    }

    .payment-option {
        padding: 9px 11px;
        font-size: 11px;
    }

    .payment-content {
        padding: 18px 11px 22px;
    }

    .payment-content-title {
        font-size: 18px;
    }

    .form-card,
    .info-card,
    .qr-form-card,
    .qr-preview-card,
    .bill-form-card,
    .bill-info-card,
    .payment-form {
        padding: 14px;
    }

    .autopay-card {
        padding: 14px;
    }

    .receipt-print-area {
        width: 100% !important;
        max-width: 100% !important;
    }

    .receipt-header h3 {
        font-size: 16px;
    }

    .receipt-detail-row.amount-row strong {
        font-size: 18px;
    }
}


/* =========================================
   VERY SMALL MOBILE
========================================= */

@media (max-width: 360px) {

    .payments-page {
        padding: 6px 5px 18px;
    }

    .payments-header {
        padding: 15px 12px;
        border-radius: 14px;
    }

    .payments-title {
        font-size: 21px;
    }

    .payments-subtitle {
        font-size: 11px;
    }

    .payment-content {
        padding: 16px 9px 20px;
    }

    .payment-content-title {
        font-size: 17px;
    }

    .payment-option {
        padding: 8px 10px;
        font-size: 10.5px;
    }

    .form-card,
    .info-card,
    .qr-form-card,
    .qr-preview-card,
    .bill-form-card,
    .bill-info-card,
    .payment-form {
        padding: 12px;
        border-radius: 12px;
    }

    .autopay-card {
        padding: 12px;
    }

    .receipt-detail-row.amount-row {
        padding: 11px;
    }

    .receipt-detail-row.amount-row strong {
        font-size: 17px;
    }
}

/* =========================================
   DARK MODE
========================================= */

.payments-dark-mode {
    background: #0b1220 !important;
    color: #e8eef7 !important;
}

/* Main Card */

.payments-dark-mode .payments-card {
    background: #111a2b !important;
    border-color: #26344b !important;
    box-shadow: 0 12px 35px rgba(0,0,0,0.22) !important;
}

/* Payment Options */

.payments-dark-mode .payment-options-wrapper {
    background: #111a2b !important;
    border-bottom-color: #26344b !important;
}

.payments-dark-mode .payment-option {
    background: #172235 !important;
    border-color: #30405a !important;
    color: #aebbd0 !important;
}

.payments-dark-mode .payment-option:hover {
    background: #1d2c45 !important;
    border-color: #4f8df7 !important;
    color: #7eabff !important;
}

.payments-dark-mode .payment-option.active {
    color: #ffffff !important;
    background: linear-gradient(
        135deg,
        #173b8c,
        #2563eb
    ) !important;
    border-color: transparent !important;
}

/* Content */

.payments-dark-mode .payment-content {
    background: #111a2b !important;
}

.payments-dark-mode .payment-content-title {
    color: #e8eef7 !important;
}

.payments-dark-mode .payment-content-description {
    color: #8997ac !important;
}

/* Form Cards */

.payments-dark-mode .form-card,
.payments-dark-mode .info-card,
.payments-dark-mode .qr-form-card,
.payments-dark-mode .qr-preview-card,
.payments-dark-mode .bill-form-card,
.payments-dark-mode .bill-info-card,
.payments-dark-mode .payment-form,
.payments-dark-mode .autopay-card,
.payments-dark-mode .scheduled-payment-card,
.payments-dark-mode .receipt-card,
.payments-dark-mode .receipt-preview-card {
    background: #111a2b !important;
    border-color: #26344b !important;
    box-shadow: 0 7px 24px rgba(0,0,0,0.16) !important;
}

/* Labels */

.payments-dark-mode label {
    color: #b8c4d6 !important;
}

/* Inputs */

.payments-dark-mode input,
.payments-dark-mode select,
.payments-dark-mode textarea {
    background: #172235 !important;
    color: #e8eef7 !important;
    border-color: #34445e !important;
}

.payments-dark-mode input::placeholder,
.payments-dark-mode textarea::placeholder {
    color: #71809a !important;
}

.payments-dark-mode input:focus,
.payments-dark-mode select:focus,
.payments-dark-mode textarea:focus {
    border-color: #4f8df7 !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(79,141,247,0.14) !important;
}

/* Select option */

.payments-dark-mode select option {
    background: #172235 !important;
    color: #e8eef7 !important;
}

/* UPI Tabs */

.payments-dark-mode .transfer-mode-tabs {
    border-bottom-color: #26344b !important;
}

.payments-dark-mode .transfer-mode-button {
    color: #8795aa !important;
}

.payments-dark-mode .transfer-mode-button.active {
    color: #6fa0ff !important;
}

/* Headings inside Cards */

.payments-dark-mode h2,
.payments-dark-mode h3,
.payments-dark-mode h4 {
    color: #e8eef7;
}

.payments-dark-mode p {
    color: inherit;
}

/* Info Text */

.payments-dark-mode .info-text,
.payments-dark-mode .form-description,
.payments-dark-mode .helper-text {
    color: #8795aa !important;
}

/* Secure Badge */

.payments-dark-mode .secure-badge {
    background: #123323 !important;
    color: #65d995 !important;
}

/* Buttons */

.payments-dark-mode button {
    color: inherit;
}

.payments-dark-mode .dashboard-button {
    background: #ffffff !important;
    color: #173b8c !important;
}

.payments-dark-mode .dashboard-button:hover {
    background: #edf3ff !important;
}

/* Secondary Buttons */

.payments-dark-mode .secondary-button {
    background: #1a2940 !important;
    color: #b9c8dd !important;
    border-color: #34445e !important;
}

/* Transaction / Receipt Areas */

.payments-dark-mode .receipt-header,
.payments-dark-mode .receipt-detail-row,
.payments-dark-mode .transaction-row {
    border-color: #26344b !important;
}

.payments-dark-mode .receipt-detail-row span {
    color: #8795aa !important;
}

.payments-dark-mode .receipt-detail-row strong {
    color: #dce5f1 !important;
}

/* Success */

.payments-dark-mode .success-message,
.payments-dark-mode .success-box {
    background: #123323 !important;
    border-color: #245c3c !important;
    color: #72dda0 !important;
}

/* Error */

.payments-dark-mode .error-message,
.payments-dark-mode .error-box {
    background: #351b22 !important;
    border-color: #63303b !important;
    color: #ff9da9 !important;
}

/* Warning */

.payments-dark-mode .warning-message,
.payments-dark-mode .warning-box {
    background: #332b17 !important;
    border-color: #665525 !important;
    color: #f2d477 !important;
}

/* Empty / Coming Soon */

.payments-dark-mode .coming-soon {
    background: #111a2b !important;
    border-color: #26344b !important;
}

.payments-dark-mode .coming-soon h3 {
    color: #dce5f1 !important;
}

.payments-dark-mode .coming-soon p {
    color: #8795aa !important;
}

/* Auto Pay */

.payments-dark-mode .autopay-card-header {
    border-bottom-color: #26344b !important;
}

.payments-dark-mode .autopay-card-header h3 {
    color: #e8eef7 !important;
}

.payments-dark-mode .autopay-card-header span {
    color: #8795aa !important;
}

.payments-dark-mode .autopay-details {
    color: #b8c4d6 !important;
}

/* Footer */

.payments-dark-mode .payments-footer {
    color: #71809a !important;
}

/* QR */

.payments-dark-mode .qr-preview-card img {
    background: #ffffff !important;
    border-radius: 10px;
}

/* Scrollbar */

.payments-dark-mode .payment-options::-webkit-scrollbar {
    height: 6px;
}

.payments-dark-mode .payment-options::-webkit-scrollbar-track {
    background: #172235;
}

.payments-dark-mode .payment-options::-webkit-scrollbar-thumb {
    background: #34445e;
    border-radius: 10px;
}

            `}</style>

      {/* =====================================================
                PAGE
            ===================================================== */}

      <div className={`payments-page ${darkMode ? "payments-dark-mode" : ""}`}>
        <div className="payments-container">
          {/* =================================================
                        HEADER
                    ================================================= */}

          <div className="payments-header">
            <div className="payments-header-content">
              <div>
                <p className="payments-eyebrow">{t("Secure • Reliable • Digital Banking")}</p>

                <h1 className="payments-title">{t("Payments")}</h1>

                <p className="payments-subtitle">
                  {t("Transfer money, pay bills and manage all your payments securely.")}
                </p>
              </div>

              <button
                type="button"
                className="dashboard-button"
                onClick={() => navigate("/dashboard")}
              >
                ← {t("Dashboard")}
              </button>
            </div>
          </div>

          {/* =================================================
                        MAIN CARD
                    ================================================= */}

          <div className="payments-card">
            {/* =================================================
                            PAYMENT OPTIONS
                        ================================================= */}

            <div className="payment-options-wrapper">
              <div className="payment-options">
                {paymentOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      selectedPayment === option
                        ? "payment-option active"
                        : "payment-option"
                    }
                    onClick={() => handlePaymentChange(option)}
                  >
                    {t(option)}
                  </button>
                ))}
              </div>
            </div>

            {/* =================================================
                            CONTENT
                        ================================================= */}

            <div className="payment-content">
              <div className="payment-content-header">
                <div>
                  <h2 className="payment-content-title">{t(selectedPayment)}</h2>

                  <p className="payment-content-description">
                    {t(getDescription())}
                  </p>
                </div>

                <div className="secure-badge">🔒 {t("Secure")}</div>
              </div>

              {/* =================================================
                                UPI TRANSFER
                            ================================================= */}

              {selectedPayment === "UPI Transfer" && (
                <div className="payment-layout">
                  <div className="form-card">
                    <div className="transfer-mode-tabs">
                      <button
                        type="button"
                        className={
                          transferMode === "upi"
                            ? "transfer-mode-button active"
                            : "transfer-mode-button"
                        }
                        onClick={() => changeTransferMode("upi")}
                      >
                        <span className="transfer-mode-icon">UPI</span>
                        UPI ID
                      </button>

                      <button
                        type="button"
                        className={
                          transferMode === "account"
                            ? "transfer-mode-button active"
                            : "transfer-mode-button"
                        }
                        onClick={() => changeTransferMode("account")}
                      >
                        <span className="transfer-mode-icon">🏦</span>
                        Account Number
                      </button>
                    </div>

                    {/* UPI MODE */}

                    {transferMode === "upi" && (
                      <>
                        <div className="form-heading">
                          <div className="form-icon">UPI</div>

                          <div>
                            <h4>{t("UPI Transfer")}</h4>

                            <p>{t("Transfer money using receiver UPI ID")}</p>
                          </div>
                        </div>

                        <form
                          className="transfer-form"
                          onSubmit={handleUpiTransfer}
                        >
                          <div className="form-group">
                            <label>{t("Receiver UPI ID")}</label>

                            <input
                              type="text"
                              placeholder={t("example@avani")}
                              value={receiverUpiId}
                              onChange={(e) => setReceiverUpiId(e.target.value)}
                              autoComplete="off"
                              disabled={loading}
                            />
                          </div>

                          <div className="form-group">
                            <label>{t("Transfer Amount")}</label>

                            <div className="input-wrapper">
                              <span className="input-prefix">₹</span>

                              <input
                                className="with-prefix"
                                type="number"
                                placeholder={t("Enter amount")}
                                min="1"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={loading}
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="transfer-button"
                            disabled={loading}
                          >
                            {loading
                              ? t("Processing UPI...")
                              : t("Transfer via UPI →")}
                          </button>
                        </form>
                      </>
                    )}

                    {/* ACCOUNT MODE */}

                    {transferMode === "account" && (
                      <>
                        <div className="form-heading">
                          <div className="form-icon bank">🏦</div>

                          <div>
                            <h4>{t("Account Transfer")}</h4>

                            <p>
                              Transfer directly using account number and IFSC
                            </p>
                          </div>
                        </div>

                        <form
                          className="transfer-form"
                          onSubmit={(e) => handleBankTransfer(e, "TRANSFER")}
                        >
                          <div className="form-group">
                            <label>{t("Receiver Account Number")}</label>

                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder={t("Enter account number")}
                              value={receiverAccountNumber}
                              onChange={(e) =>
                                setReceiverAccountNumber(e.target.value)
                              }
                              autoComplete="off"
                              disabled={loading}
                            />
                          </div>

                          <div className="form-group">
                            <label>{t("Receiver IFSC Code")}</label>

                            <input
                              type="text"
                              placeholder={t("Example: AVNB0000001")}
                              value={receiverIfscCode}
                              onChange={(e) =>
                                setReceiverIfscCode(
                                  e.target.value.toUpperCase(),
                                )
                              }
                              maxLength={11}
                              autoComplete="off"
                              disabled={loading}
                            />

                            <span className="ifsc-helper">
                              11-character bank branch IFSC code
                            </span>
                          </div>

                          <div className="form-group">
                            <label>{t("Transfer Amount")}</label>

                            <div className="input-wrapper">
                              <span className="input-prefix">₹</span>

                              <input
                                className="with-prefix"
                                type="number"
                                placeholder={t("Enter amount")}
                                min="1"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={loading}
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="transfer-button"
                            disabled={loading}
                          >
                            {loading
                              ? t("Processing Transfer...")
                              : t("Transfer to Account →")}
                          </button>
                        </form>
                      </>
                    )}

                    {message && (
                      <div
                        className={
                          messageType === "success"
                            ? "payment-message success"
                            : "payment-message error"
                        }
                      >
                        {message}
                      </div>
                    )}
                  </div>

                  <div className="info-card">
                    <div className="info-icon">🔐</div>

                    <h4>{t("Secure Account Payments")}</h4>

                    <p>
                      Your bank transfer is authenticated and verified securely
                      through Avani Bank.
                    </p>

                    <ul className="info-list">
                      <li>
                        <span className="check">✓</span>

                        <span>{t("Account number verification")}</span>
                      </li>

                      <li>
                        <span className="check">✓</span>

                        <span>{t("IFSC code verification")}</span>
                      </li>

                      <li>
                        <span className="check">✓</span>

                        <span>{t("JWT authenticated transfer")}</span>
                      </li>

                      <li>
                        <span className="check">✓</span>

                        <span>{t("Transaction recorded in history")}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* =================================================
                                NEFT / RTGS / IMPS
                            ================================================= */}

              {(selectedPayment === "NEFT" ||
                selectedPayment === "RTGS" ||
                selectedPayment === "IMPS") && (
                <div className="payment-layout">
                  <div className="form-card">
                    <div className="form-heading">
                      <div className="form-icon bank">
                        {selectedPayment === "NEFT"
                          ? "NF"
                          : selectedPayment === "RTGS"
                            ? "RT"
                            : "IP"}
                      </div>

                      <div>
                        <h4>{selectedPayment} Transfer</h4>

                        <p>Transfer money securely using {selectedPayment}</p>
                      </div>
                    </div>

                    <form
                      className="transfer-form"
                      onSubmit={(e) => handleBankTransfer(e, selectedPayment)}
                    >
                      <div className="form-group">
                        <label>{t("Receiver Account Number")}</label>

                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder={t("Enter account number")}
                          value={receiverAccountNumber}
                          onChange={(e) =>
                            setReceiverAccountNumber(e.target.value)
                          }
                          autoComplete="off"
                          disabled={loading}
                        />
                      </div>

                      <div className="form-group">
                        <label>{t("Receiver IFSC Code")}</label>

                        <input
                          type="text"
                          placeholder={t("Example: AVNB0000001")}
                          value={receiverIfscCode}
                          onChange={(e) =>
                            setReceiverIfscCode(e.target.value.toUpperCase())
                          }
                          maxLength={11}
                          autoComplete="off"
                          disabled={loading}
                        />

                        <span className="ifsc-helper">
                          11-character bank branch IFSC code
                        </span>
                      </div>

                      <div className="form-group">
                        <label>{t("Transfer Amount")}</label>

                        <div className="input-wrapper">
                          <span className="input-prefix">₹</span>

                          <input
                            className="with-prefix"
                            type="number"
                            placeholder={t("Enter amount")}
                            min="1"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="transfer-button"
                        disabled={loading}
                      >
                        {loading
                          ? `Processing ${selectedPayment}...`
                          : `Transfer via ${selectedPayment} →`}
                      </button>
                    </form>

                    {message && (
                      <div
                        className={
                          messageType === "success"
                            ? "payment-message success"
                            : "payment-message error"
                        }
                      >
                        {message}
                      </div>
                    )}
                  </div>

                  <div className="info-card">
                    <div className="info-icon">🔐</div>

                    <h4>Secure {selectedPayment} Payments</h4>

                    <p>
                      Transfer money securely to an active Avani Bank account
                      using
                      {` ${selectedPayment}`}.
                    </p>

                    <ul className="info-list">
                      <li>
                        <span className="check">✓</span>

                        <span>{t("Receiver account verified")}</span>
                      </li>

                      <li>
                        <span className="check">✓</span>

                        <span>{t("IFSC code verified")}</span>
                      </li>

                      <li>
                        <span className="check">✓</span>

                        <span>{t("JWT authenticated transaction")}</span>
                      </li>

                      <li>
                        <span className="check">✓</span>

                        <span>{t("Transaction recorded in banking history")}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* =================================================
                                QR PAYMENT
                            ================================================= */}

              {selectedPayment === "QR Payment" && (
                <div className="qr-layout">
                  <div className="qr-form-card">
                    <div className="form-heading">
                      <div className="form-icon bank">QR</div>

                      <div>
                        <h4>{t("Generate UPI QR Code")}</h4>

                        <p>{t("Create a payment QR using UPI details.")}</p>
                      </div>
                    </div>

                    <form className="transfer-form" onSubmit={handleGenerateQr}>
                      <div className="form-group">
                        <label>{t("UPI ID")}</label>

                        <input
                          type="text"
                          placeholder={t("example@upi")}
                          value={qrUpiId}
                          onChange={(e) => setQrUpiId(e.target.value)}
                          autoComplete="off"
                          disabled={loading}
                        />
                      </div>

                      <div className="form-group">
                        <label>{t("Receiver Name")}</label>

                        <input
                          type="text"
                          placeholder={t("Enter receiver name")}
                          value={qrReceiverName}
                          onChange={(e) => setQrReceiverName(e.target.value)}
                          autoComplete="off"
                          disabled={loading}
                        />
                      </div>

                      <div className="form-group">
                        <label>{t("Payment Amount")}</label>

                        <div className="input-wrapper">
                          <span className="input-prefix">₹</span>

                          <input
                            className="with-prefix"
                            type="number"
                            placeholder={t("Enter amount")}
                            min="1"
                            step="0.01"
                            value={qrAmount}
                            onChange={(e) => setQrAmount(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="transfer-button"
                        disabled={loading}
                      >
                        {loading ? "Generating QR..." : "Generate QR Code →"}
                      </button>
                    </form>

                    {message && (
                      <div
                        className={
                          messageType === "success"
                            ? "payment-message success"
                            : "payment-message error"
                        }
                      >
                        {message}
                      </div>
                    )}
                  </div>

                  <div className="qr-preview-card">
                    <div className="qr-image-box">
                      {qrUpiUrl ? (
                        <img
                          src={getQrImageUrl()}
                          alt="UPI Payment QR Code"
                          className="qr-image"
                        />
                      ) : (
                        <div className="qr-empty">
                          Your generated UPI QR code will appear here.
                        </div>
                      )}
                    </div>

                    <div className="qr-details">
                      <div className="qr-detail-row">
                        <span>{t("UPI ID")}</span>

                        <strong>{qrUpiId || "—"}</strong>
                      </div>

                      <div className="qr-detail-row">
                        <span>{t("Amount")}</span>

                        <strong>
                          {qrAmount
                            ? `₹${Number(qrAmount).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "—"}
                        </strong>
                      </div>

                      <div className="qr-detail-row">
                        <span>{t("Name")}</span>

                        <strong>{qrReceiverName || "—"}</strong>
                      </div>

                      {qrTransactionReference && (
                        <div className="qr-detail-row">
                          <span>{t("Reference")}</span>

                          <strong>{qrTransactionReference}</strong>
                        </div>
                      )}
                    </div>

                    <div className="qr-actions">
                      <a
                        href={getQrImageUrl() || "#"}
                        download="avani-bank-upi-qr.png"
                        className={
                          qrUpiUrl
                            ? "qr-action-button"
                            : "qr-action-button disabled"
                        }
                      >
                        ↓ Download QR
                      </a>

                      <button
                        type="button"
                        className={
                          qrUpiUrl
                            ? "qr-action-button primary"
                            : "qr-action-button primary disabled"
                        }
                        onClick={openUpiApp}
                        disabled={!qrUpiUrl}
                      >
                        Open UPI App
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* =====================================================
     RECHARGE
===================================================== */}

              {selectedPayment === "Recharge" && (
                <>
                  {/* ================= MOBILE RECHARGE FORM ================= */}

                  <div className="form-card">
                    <div className="form-heading">
                      <div className="form-icon bank">📱</div>

                      <div>
                        <h4>{t("Mobile Recharge")}</h4>

                        <p>{t("Recharge your mobile number securely.")}</p>
                      </div>
                    </div>

                    <form onSubmit={handleRecharge}>
                      {/* MOBILE NUMBER */}

                      <div className="form-group">
                        <label>{t("Mobile Number")}</label>

                        <input
                          type="tel"
                          value={rechargeMobile}
                          onChange={(e) =>
                            setRechargeMobile(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          placeholder={t("Enter 10-digit mobile number")}
                          maxLength={10}
                          disabled={loading}
                        />
                      </div>

                      {/* OPERATOR */}

                      <div className="form-group">
                        <label>{t("Operator")}</label>

                        <select
                          className="recharge-operator"
                          value={rechargeOperator}
                          onChange={(e) => setRechargeOperator(e.target.value)}
                          disabled={loading}
                        >
                          <option value="Jio">Jio</option>
                          <option value="Airtel">Airtel</option>
                          <option value="Vi">VI</option>
                          <option value="BSNL">BSNL</option>
                        </select>
                      </div>

                      {/* AMOUNT */}

                      <div className="form-group">
                        <label>{t("Recharge Amount")}</label>

                        <input
                          type="number"
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                          placeholder={t("Enter recharge amount")}
                          min="1"
                          step="0.01"
                          disabled={loading}
                        />
                      </div>

                      {/* BUTTON */}

                      <button
                        type="submit"
                        className="recharge-button"
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Recharge Now"}
                      </button>
                    </form>
                  </div>

                  {/* ================= RECHARGE SUCCESS ================= */}

                  {rechargeSuccess && (
                    <div className="form-card recharge-success">
                      <div className="form-heading">
                        <div className="form-icon bank">✅</div>

                        <div>
                          <h4>{t("Recharge Successful")}</h4>

                          <p>
                            Your mobile recharge has been completed
                            successfully.
                          </p>
                        </div>
                      </div>

                      <div className="recharge-success-details">
                        <p>
                          <strong>{t("Amount:")}</strong> ₹{rechargeSuccess.amount}
                        </p>

                        <p>
                          <strong>{t("Mobile Number:")}</strong>{" "}
                          {rechargeSuccess.receiverAccountNumber}
                        </p>

                        <p>
                          <strong>{t("Operator:")}</strong> {rechargeOperator}
                        </p>

                        <p>
                          <strong>{t("Transaction ID:")}</strong> {rechargeSuccess.id}
                        </p>

                        <p>
                          <strong>{t("Status:")}</strong> {rechargeSuccess.status}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* =====================================================
    AUTO-PAY
===================================================== */}

              {selectedPayment === "Auto-Pay" && (
                <div className="payment-form">
                  <div className="form-header">
                    <h2>{t("Auto-Pay")}</h2>
                    <p>{t("Schedule automatic payments for your bills")}</p>
                  </div>

                  {/* Create Auto-Pay Form */}
                  <form onSubmit={handleCreateAutoPay}>
                    <div className="form-row">
                      {/* Account */}
                      <div className="form-group">
                        <label>{t("Payment Account")}</label>

                        <select
                          className="bill-select"
                          value={autoPayAccountId}
                          onChange={(e) => setAutoPayAccountId(e.target.value)}
                          disabled={accountsLoading}
                          required
                        >
                          <option value="">
                            {accountsLoading
                              ? "Loading accounts..."
                              : "Select account"}
                          </option>

                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.accountNumber}
                              {" — "}
                              {account.accountType}
                              {" — ₹"}
                              {Number(account.balance || 0).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Biller Name */}
                      <div className="form-group">
                        <label>{t("Biller Name")}</label>
                        <input
                          type="text"
                          value={autoPayBillerName}
                          onChange={(e) => setAutoPayBillerName(e.target.value)}
                          placeholder={t("e.g. Jio, Airtel, Electricity")}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      {/* Biller Reference */}
                      <div className="form-group">
                        <label>{t("Biller Reference")}</label>
                        <input
                          type="text"
                          value={autoPayBillerReference}
                          onChange={(e) =>
                            setAutoPayBillerReference(e.target.value)
                          }
                          placeholder={t("Mobile / Consumer Number")}
                          required
                        />
                      </div>

                      {/* Amount */}
                      <div className="form-group">
                        <label>{t("Amount (₹)")}</label>
                        <input
                          type="number"
                          value={autoPayAmount}
                          onChange={(e) => setAutoPayAmount(e.target.value)}
                          placeholder={t("Enter amount")}
                          min="1"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      {/* Frequency */}
                      <div className="form-group">
                        <label>{t("Frequency")}</label>

                        <select
                          className="autopay-frequency"
                          value={autoPayFrequency}
                          onChange={(e) => setAutoPayFrequency(e.target.value)}
                          required
                        >
                          <option value="DAILY">{t("Daily")}</option>
                          <option value="WEEKLY">{t("Weekly")}</option>
                          <option value="MONTHLY">{t("Monthly")}</option>
                          <option value="YEARLY">{t("Yearly")}</option>
                        </select>
                      </div>

                      {/* Start Date */}
                      <div className="form-group">
                        <label>{t("Start Date")}</label>

                        <input
                          type="date"
                          value={autoPayStartDate}
                          onChange={(e) => setAutoPayStartDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="transfer-button"
                      disabled={autoPayLoading}
                    >
                      {autoPayLoading ? "Processing..." : "Create Auto-Pay"}
                    </button>
                  </form>

                  {/* Existing Auto-Pay Records */}
                  <div className="autopay-list-section">
                    <div className="form-header">
                      <h2>{t("My Auto-Pay")}</h2>
                      <p>{t("Manage your scheduled automatic payments")}</p>
                    </div>

                    {autoPayLoading && autoPays.length === 0 ? (
                      <p className="no-data">{t("Loading Auto-Pay records...")}</p>
                    ) : autoPays.length === 0 ? (
                      <p className="no-data">{t("No Auto-Pay scheduled yet.")}</p>
                    ) : (
                      <div className="autopay-list">
                        {autoPays.map((autoPay) => (
                          <div className="autopay-card" key={autoPay.id}>
                            <div className="autopay-card-header">
                              <div>
                                <h3>{autoPay.billerName}</h3>
                                <span>{autoPay.billerReference}</span>
                              </div>

                              <span
                                className={`autopay-status ${String(
                                  autoPay.status,
                                ).toLowerCase()}`}
                              >
                                {autoPay.status}
                              </span>
                            </div>

                            <div className="autopay-details">
                              <div>
                                <strong>{t("Amount")}</strong>
                                <span>₹{autoPay.amount}</span>
                              </div>

                              <div>
                                <strong>{t("Frequency")}</strong>
                                <span>{autoPay.frequency}</span>
                              </div>

                              <div>
                                <strong>{t("Next Due")}</strong>
                                <span>{autoPay.nextDueDate}</span>
                              </div>

                              <div>
                                <strong>{t("Account ID")}</strong>
                                <span>{autoPay.account?.id}</span>
                              </div>
                            </div>

                            <div className="autopay-actions">
                              {autoPay.status === "ACTIVE" && (
                                <button
                                  type="button"
                                  className="transfer-button"
                                  onClick={() => handlePauseAutoPay(autoPay.id)}
                                >
                                  Pause
                                </button>
                              )}

                              {autoPay.status === "PAUSED" && (
                                <button
                                  type="button"
                                  className="transfer-button"
                                  onClick={() =>
                                    handleResumeAutoPay(autoPay.id)
                                  }
                                >
                                  Resume
                                </button>
                              )}

                              {(autoPay.status === "ACTIVE" ||
                                autoPay.status === "PAUSED") && (
                                <button
                                  type="button"
                                  className="transfer-button"
                                  onClick={() =>
                                    handleCancelAutoPay(autoPay.id)
                                  }
                                >
                                  Cancel
                                </button>
                              )}

                              <button
                                type="button"
                                className="transfer-button"
                                onClick={() => handleDeleteAutoPay(autoPay.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =================================================
    SCHEDULED PAYMENT
================================================= */}

              {selectedPayment === "Scheduled Payment" && (
                <div className="autopay-layout">
                  {/* =========================================
        CREATE SCHEDULED PAYMENT
    ========================================= */}

                  <div className="payment-form">
                    <div className="form-header">
                      <h2>{t("Schedule a Payment")}</h2>

                      <p>{t("Schedule a one-time payment for a future date.")}</p>
                    </div>

                    <form onSubmit={handleCreateScheduledPayment}>
                      <div className="form-row">
                        {/* Account */}

                        <div className="form-group">
                          <label>{t("Debit Account")}</label>

                          <select
                            value={scheduledPaymentAccountId}
                            onChange={(e) =>
                              setScheduledPaymentAccountId(e.target.value)
                            }
                            required
                            disabled={
                              scheduledPaymentLoading || accountsLoading
                            }
                          >
                            <option value="">
                              {accountsLoading
                                ? "Loading accounts..."
                                : "Select account"}
                            </option>

                            {accounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.accountNumber}
                                {" — "}
                                {account.accountType}
                                {" — ₹"}
                                {Number(account.balance || 0).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Payment Type */}

                        <div className="form-group">
                          <label>{t("Payment Type")}</label>

                          <select
                            value={scheduledPaymentType}
                            onChange={(e) =>
                              setScheduledPaymentType(e.target.value)
                            }
                            required
                            disabled={scheduledPaymentLoading}
                          >
                            <option value="NEFT">NEFT</option>

                            <option value="RTGS">RTGS</option>

                            <option value="IMPS">IMPS</option>
                          </select>

                          <span className="ifsc-helper">
                            One-time bank transfer
                          </span>
                        </div>
                      </div>

                      <div className="form-row">
                        {/* Receiver Account */}

                        <div className="form-group">
                          <label>{t("Receiver Account Number")}</label>

                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder={t("Enter receiver account number")}
                            value={scheduledPaymentReceiverAccountNumber}
                            onChange={(e) =>
                              setScheduledPaymentReceiverAccountNumber(
                                e.target.value,
                              )
                            }
                            maxLength={20}
                            autoComplete="off"
                            required
                            disabled={scheduledPaymentLoading}
                          />
                        </div>

                        {/* IFSC */}

                        <div className="form-group">
                          <label>{t("Receiver IFSC Code")}</label>

                          <input
                            type="text"
                            placeholder={t("Enter IFSC code")}
                            value={scheduledPaymentReceiverIfscCode}
                            onChange={(e) =>
                              setScheduledPaymentReceiverIfscCode(
                                e.target.value.toUpperCase(),
                              )
                            }
                            maxLength={11}
                            autoComplete="off"
                            required
                            disabled={scheduledPaymentLoading}
                          />

                          <span className="ifsc-helper">
                            11-character bank branch IFSC code
                          </span>
                        </div>
                      </div>

                      <div className="form-row">
                        {/* Amount */}

                        <div className="form-group">
                          <label>{t("Payment Amount")}</label>

                          <div className="input-wrapper">
                            <span className="input-prefix">₹</span>

                            <input
                              className="with-prefix"
                              type="number"
                              placeholder={t("Enter amount")}
                              min="1"
                              step="0.01"
                              value={scheduledPaymentAmount}
                              onChange={(e) =>
                                setScheduledPaymentAmount(e.target.value)
                              }
                              required
                              disabled={scheduledPaymentLoading}
                            />
                          </div>
                        </div>

                        {/* Scheduled Date */}

                        <div className="form-group">
                          <label>{t("Scheduled Date")}</label>

                          <input
                            type="date"
                            value={scheduledPaymentDate}
                            onChange={(e) =>
                              setScheduledPaymentDate(e.target.value)
                            }
                            min={new Date().toISOString().split("T")[0]}
                            required
                            disabled={scheduledPaymentLoading}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="transfer-button"
                        disabled={scheduledPaymentLoading || accountsLoading}
                      >
                        {scheduledPaymentLoading
                          ? "Processing..."
                          : "Schedule Payment →"}
                      </button>
                    </form>
                  </div>

                  {/* =========================================
        SCHEDULED PAYMENT LIST
    ========================================= */}

                  <div className="autopay-list-section">
                    <div className="form-header">
                      <h2>{t("Your Scheduled Payments")}</h2>

                      <p>
                        View and manage your upcoming and completed scheduled
                        payments.
                      </p>
                    </div>

                    {scheduledPaymentLoading &&
                    scheduledPayments.length === 0 ? (
                      <p className="no-data">{t("Loading Scheduled Payments...")}</p>
                    ) : scheduledPayments.length === 0 ? (
                      <p className="no-data">{t("No Scheduled Payments found.")}</p>
                    ) : (
                      <div className="autopay-list">
                        {scheduledPayments.map((scheduledPayment) => (
                          <div
                            className="autopay-card"
                            key={scheduledPayment.id}
                          >
                            {/* Card Header */}

                            <div className="autopay-card-header">
                              <div>
                                <h3>
                                  {scheduledPayment.paymentType}
                                  {" Payment"}
                                </h3>

                                <span>
                                  Receiver:{" "}
                                  {scheduledPayment.receiverAccountNumber}
                                </span>
                              </div>

                              <span
                                className={`autopay-status ${String(
                                  scheduledPayment.status,
                                ).toLowerCase()}`}
                              >
                                {scheduledPayment.status}
                              </span>
                            </div>

                            {/* Details */}

                            <div className="autopay-details">
                              <div>
                                <strong>{t("Amount")}</strong>

                                <span>
                                  ₹
                                  {Number(
                                    scheduledPayment.amount || 0,
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>

                              <div>
                                <strong>{t("IFSC")}</strong>

                                <span>{scheduledPayment.receiverIfscCode}</span>
                              </div>

                              <div>
                                <strong>{t("Scheduled Date")}</strong>

                                <span>{scheduledPayment.scheduledDate}</span>
                              </div>

                              <div>
                                <strong>{t("Payment Type")}</strong>

                                <span>{scheduledPayment.paymentType}</span>
                              </div>
                            </div>

                            {/* =================================
                    ACTION BUTTONS
                ================================= */}

                            <div className="autopay-actions">
                              {/* SCHEDULED */}

                              {scheduledPayment.status === "SCHEDULED" && (
                                <>
                                  <button
                                    type="button"
                                    className="transfer-button"
                                    disabled={scheduledPaymentLoading}
                                    onClick={() =>
                                      handlePauseScheduledPayment(
                                        scheduledPayment.id,
                                      )
                                    }
                                  >
                                    Pause
                                  </button>

                                  <button
                                    type="button"
                                    className="transfer-button"
                                    disabled={scheduledPaymentLoading}
                                    onClick={() =>
                                      handleCancelScheduledPayment(
                                        scheduledPayment.id,
                                      )
                                    }
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {/* PAUSED */}

                              {scheduledPayment.status === "PAUSED" && (
                                <>
                                  <button
                                    type="button"
                                    className="transfer-button"
                                    disabled={scheduledPaymentLoading}
                                    onClick={() =>
                                      handleResumeScheduledPayment(
                                        scheduledPayment.id,
                                      )
                                    }
                                  >
                                    Resume
                                  </button>

                                  <button
                                    type="button"
                                    className="transfer-button"
                                    disabled={scheduledPaymentLoading}
                                    onClick={() =>
                                      handleCancelScheduledPayment(
                                        scheduledPayment.id,
                                      )
                                    }
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {/* DELETE */}

                              {scheduledPayment.status !== "COMPLETED" && (
                                <button
                                  type="button"
                                  className="transfer-button"
                                  disabled={scheduledPaymentLoading}
                                  onClick={() =>
                                    handleDeleteScheduledPayment(
                                      scheduledPayment.id,
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =====================================================
    TRANSACTION RECEIPTS
===================================================== */}

              {selectedPayment === "Transaction Receipts" && (
                <div className="payment-layout">
                  <div className="form-card">
                    <div className="form-heading">
                      <div className="form-icon bank">🧾</div>

                      <div>
                        <h4>{t("Transaction Receipts")}</h4>

                        <p>{t("View your completed transaction receipts")}</p>
                      </div>
                    </div>

                    {receiptLoading ? (
                      <div className="coming-soon">
                        <div className="coming-soon-icon">⏳</div>

                        <h4>{t("Loading Transactions...")}</h4>

                        <p>
                          Please wait while we load your transaction history.
                        </p>
                      </div>
                    ) : transactionReceipts.length === 0 ? (
                      <div className="coming-soon">
                        <div className="coming-soon-icon">🧾</div>

                        <h4>{t("No Transactions Found")}</h4>

                        <p>
                          Your transaction receipts will appear here after a
                          successful payment.
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {transactionReceipts.map((transaction) => (
                          <div
                            key={transaction.id}
                            style={{
                              border: "1px solid #e3eaf3",
                              borderRadius: "14px",
                              padding: "16px",
                              background: "#fbfcfe",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "15px",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "800",
                                  color: "#172033",
                                }}
                              >
                                {transaction.transactionType}
                              </div>

                              <div
                                style={{
                                  marginTop: "5px",
                                  fontSize: "12px",
                                  color: "#718096",
                                }}
                              >
                                Transaction ID: {transaction.id}
                              </div>

                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "12px",
                                  color: "#718096",
                                }}
                              >
                                {transaction.transactionDate
                                  ? new Date(
                                      transaction.transactionDate,
                                    ).toLocaleString("en-IN")
                                  : "Date unavailable"}
                              </div>
                            </div>

                            <div
                              style={{
                                textAlign: "right",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "800",
                                  color: "#158047",
                                }}
                              >
                                ₹
                                {Number(transaction.amount).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </div>

                              <button
                                type="button"
                                className="transfer-button"
                                style={{
                                  width: "auto",
                                  height: "40px",
                                  padding: "0 15px",
                                  marginTop: "8px",
                                  fontSize: "12px",
                                }}
                                onClick={() =>
                                  handleViewReceipt(transaction.id)
                                }
                              >
                                🧾 View Receipt
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RECEIPT PREVIEW */}

                  <div className="info-card receipt-print-area">
                    {!selectedReceipt ? (
                      <>
                        <div className="info-icon">🧾</div>

                        <h4>{t("Transaction Receipt")}</h4>

                        <p>
                          Select any transaction from the list to view its
                          complete receipt.
                        </p>

                        <ul className="info-list">
                          <li>
                            <span className="check">✓</span>

                            <span>{t("Transaction ID")}</span>
                          </li>

                          <li>
                            <span className="check">✓</span>

                            <span>{t("Amount and status")}</span>
                          </li>

                          <li>
                            <span className="check">✓</span>

                            <span>{t("Sender and receiver details")}</span>
                          </li>

                          <li>
                            <span className="check">✓</span>

                            <span>{t("Transaction date and type")}</span>
                          </li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <div className="receipt-header">
                          <div className="receipt-bank-logo">🏦</div>

                          <div>
                            <h3>AVANI BANK</h3>

                            <p>{t("Digital Banking Transaction Receipt")}</p>
                          </div>

                          <div className="receipt-success-badge">✓ SUCCESS</div>

                          <div className="info-icon">🧾</div>

                          <div>
                            <h4
                              style={{
                                margin: 0,
                              }}
                            >
                              Payment Receipt
                            </h4>

                            <p>Avani Bank</p>
                          </div>
                        </div>

                        <div className="receipt-details">
                          <div className="receipt-detail-row">
                            <span>{t("Transaction ID")}</span>
                            <strong>#{selectedReceipt.id}</strong>
                          </div>

                          <div className="receipt-detail-row">
                            <span>{t("Transaction Type")}</span>
                            <strong>{selectedReceipt.transactionType}</strong>
                          </div>

                          <div className="receipt-detail-row amount-row">
                            <span>{t("Amount")}</span>

                            <strong>
                              ₹
                              {Number(selectedReceipt.amount).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </strong>
                          </div>

                          <div className="receipt-divider"></div>

                          <div className="receipt-detail-row">
                            <span>{t("From Account")}</span>

                            <strong>
                              {selectedReceipt.senderAccountNumber}
                            </strong>
                          </div>

                          <div className="receipt-detail-row">
                            <span>{t("To Account / Reference")}</span>

                            <strong>
                              {selectedReceipt.receiverAccountNumber}
                            </strong>
                          </div>

                          <div className="receipt-detail-row">
                            <span>{t("Status")}</span>

                            <strong className="receipt-status">
                              ✓ {selectedReceipt.status}
                            </strong>
                          </div>

                          <div className="receipt-detail-row">
                            <span>{t("Transaction Date")}</span>

                            <strong>
                              {selectedReceipt.transactionDate
                                ? new Date(
                                    selectedReceipt.transactionDate,
                                  ).toLocaleString("en-IN")
                                : "N/A"}
                            </strong>
                          </div>
                        </div>

                        <div className="receipt-footer">
                          <p>
                            This is a digitally generated transaction receipt.
                          </p>

                          <span>{t("AVANI BANK • Secure Digital Banking")}</span>
                        </div>
                        <div>
                          <strong>{t("Transaction ID")}</strong>

                          <div>#{selectedReceipt.id}</div>
                        </div>

                        <div>
                          <strong>{t("Transaction Type")}</strong>

                          <div>{selectedReceipt.transactionType}</div>
                        </div>

                        <div>
                          <strong>{t("Amount")}</strong>

                          <div
                            style={{
                              fontSize: "22px",
                              fontWeight: "800",
                              color: "#158047",
                            }}
                          >
                            ₹
                            {Number(selectedReceipt.amount).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </div>
                        </div>

                        <div>
                          <strong>{t("From Account")}</strong>

                          <div>{selectedReceipt.senderAccountNumber}</div>
                        </div>

                        <div>
                          <strong>{t("To Account / Reference")}</strong>

                          <div>{selectedReceipt.receiverAccountNumber}</div>
                        </div>

                        <div>
                          <strong>{t("Status")}</strong>

                          <div
                            style={{
                              color: "#158047",
                              fontWeight: "800",
                            }}
                          >
                            ✓ {selectedReceipt.status}
                          </div>
                        </div>

                        <div>
                          <strong>{t("Transaction Date")}</strong>

                          <div>
                            {selectedReceipt.transactionDate
                              ? new Date(
                                  selectedReceipt.transactionDate,
                                ).toLocaleString("en-IN")
                              : "N/A"}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="transfer-button receipt-print-button"
                          style={{
                            marginTop: "22px",
                          }}
                          onClick={() => window.print()}
                        >
                          🖨️ Print / Save as PDF
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* =================================================
                                BILL PAYMENT
                  ================================================= */}

              {selectedPayment === "Bill Payment" && (
                <div className="bill-layout">
                  {/* =========================================
                                        BILL FORM
                      ========================================= */}

                  <div className="bill-form-card">
                    <div className="form-heading">
                      <div className="form-icon bank">🧾</div>

                      <div>
                        <h4>{t("Pay Your Bill")}</h4>

                        <p>
                          Enter biller and consumer details to make a secure
                          payment.
                        </p>
                      </div>
                    </div>

                    <form
                      className="transfer-form"
                      onSubmit={handleBillPayment}
                    >
                      {/* BILL CATEGORY */}

                      <div className="form-group">
                        <label>{t("Bill Category")}</label>

                        <div className="bill-category-grid">
                          {[
                            ["ELECTRICITY", "⚡ Electricity"],
                            ["WATER", "💧 Water"],
                            ["GAS", "🔥 Gas"],
                            ["BROADBAND", "🌐 Broadband"],
                            ["MOBILE", "📱 Mobile"],
                            ["DTH", "📺 DTH"],
                            ["INSURANCE", "🛡 Insurance"],
                            ["CREDIT_CARD", "💳 Credit Card"],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              className={
                                billCategory === value
                                  ? "bill-category-button active"
                                  : "bill-category-button"
                              }
                              onClick={() => {
                                setBillCategory(value);
                                clearMessage();
                                setBillTransaction(null);
                              }}
                              disabled={loading}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* BILLER NAME */}

                      <div className="form-group">
                        <label>{t("Biller Name")}</label>

                        <input
                          type="text"
                          placeholder={t("Example: Avani Electricity")}
                          value={billBillerName}
                          onChange={(e) => setBillBillerName(e.target.value)}
                          autoComplete="off"
                          disabled={loading}
                        />
                      </div>

                      {/* CONSUMER NUMBER */}

                      <div className="form-group">
                        <label>{t("Consumer Number")}</label>

                        <input
                          type="text"
                          placeholder={t("Enter consumer / account number")}
                          value={billConsumerNumber}
                          onChange={(e) =>
                            setBillConsumerNumber(e.target.value)
                          }
                          autoComplete="off"
                          disabled={loading}
                        />

                        <span className="ifsc-helper">
                          Enter the consumer or service account number provided
                          by the biller.
                        </span>
                      </div>

                      {/* AMOUNT */}

                      <div className="form-group">
                        <label>{t("Bill Amount")}</label>

                        <div className="input-wrapper">
                          <span className="input-prefix">₹</span>

                          <input
                            className="with-prefix"
                            type="number"
                            placeholder={t("Enter bill amount")}
                            min="1"
                            step="0.01"
                            value={billAmount}
                            onChange={(e) => setBillAmount(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="transfer-button"
                        disabled={loading}
                      >
                        {loading ? "Processing Bill Payment..." : "Pay Bill →"}
                      </button>
                    </form>

                    {message && (
                      <div
                        className={
                          messageType === "success"
                            ? "payment-message success"
                            : "payment-message error"
                        }
                      >
                        {message}
                      </div>
                    )}
                  </div>

                  {/* =========================================
                                        BILL INFO
                                    ========================================= */}

                  <div className="bill-info-card">
                    <div className="info-icon">🧾</div>

                    <h4>{t("Secure Bill Payment")}</h4>

                    <p>
                      Pay your electricity, water, gas, broadband and other
                      service bills securely from your Avani Bank account.
                    </p>

                    {/* BILL SUMMARY */}

                    <div className="bill-summary">
                      <p className="bill-summary-title">{t("Payment Summary")}</p>

                      <div className="bill-summary-row">
                        <span>{t("Category")}</span>

                        <strong>{billCategory || "—"}</strong>
                      </div>

                      <div className="bill-summary-row">
                        <span>{t("Biller")}</span>

                        <strong>{billBillerName || "—"}</strong>
                      </div>

                      <div className="bill-summary-row">
                        <span>{t("Consumer No.")}</span>

                        <strong>{billConsumerNumber || "—"}</strong>
                      </div>

                      <div className="bill-summary-row">
                        <span>{t("Amount")}</span>

                        <strong>
                          {billAmount
                            ? `₹${Number(billAmount).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "—"}
                        </strong>
                      </div>
                    </div>

                    {/* SUCCESS TRANSACTION DETAILS */}

                    {billTransaction && (
                      <div className="bill-summary">
                        <p className="bill-summary-title">
                          Transaction Details
                        </p>

                        <div className="bill-summary-row">
                          <span>{t("Status")}</span>

                          <strong>{billTransaction.status || "SUCCESS"}</strong>
                        </div>

                        <div className="bill-summary-row">
                          <span>{t("Transaction ID")}</span>

                          <strong>{billTransaction.id || "—"}</strong>
                        </div>

                        <div className="bill-summary-row">
                          <span>{t("Paid Amount")}</span>

                          <strong>
                            ₹
                            {Number(billTransaction.amount || 0).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </strong>
                        </div>

                        <div className="bill-summary-row">
                          <span>{t("Type")}</span>

                          <strong>
                            {billTransaction.transactionType || "BILL_PAYMENT"}
                          </strong>
                        </div>
                      </div>
                    )}

                    <ul className="info-list">
                      <li>
                        <span className="check">✓</span>

                        <span>{t("JWT authenticated payment")}</span>
                      </li>

                      <li>
                        <span className="check">✓</span>

                        <span>{t("Sender account and balance verified")}</span>
                      </li>

                      <li>
                        <span className="check">✓</span>

                        <span>{t("Bill transaction recorded")}</span>
                      </li>

                      <li>
                        <span className="check">✓</span>

                        <span>{t("Secure Avani Bank payment processing")}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* =================================================
                                OTHER MODULES
                            ================================================= */}

              {/* {(selectedPayment === "Recharge" ||
                selectedPayment === "Auto-Pay" ||
                selectedPayment === "Scheduled Payment") && (
                <div className="coming-soon">
                  <div className="coming-soon-icon">💳</div>

                  <h4>{selectedPayment}</h4>

                  <p>{selectedPayment} 
                    
                  </p>
                </div>
              )} */}
            </div>
          </div>

          {/* =================================================
                        FOOTER
                    ================================================= */}

          <div className="payments-footer">
            <span>© 2026 Avani Bank</span>

            <span>{t("Secure Banking • Privacy • Terms")}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Payments;
