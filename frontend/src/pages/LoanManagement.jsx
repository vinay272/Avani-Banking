import React from "react";
import { useNavigate } from "react-router-dom";

function LoanManagement() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = React.useState([]);
  const [loanSubmitting, setLoanSubmitting] = React.useState(false);
  const [loanMessage, setLoanMessage] = React.useState("");
  const [loanMessageType, setLoanMessageType] = React.useState("");
  const [myLoans, setMyLoans] = React.useState([]);
  const [loansLoading, setLoansLoading] = React.useState(false);

  const [activeLoanService, setActiveLoanService] = React.useState("");

  const [eligibilityForm, setEligibilityForm] = React.useState({
    loanType: "PERSONAL",
    requestedAmount: "",
    tenureMonths: "24",
    monthlyIncome: "",
    employmentType: "SALARIED",
  });

  const [eligibilityResult, setEligibilityResult] = React.useState(null);
  const [eligibilityLoading, setEligibilityLoading] = React.useState(false);

  const [creditScore, setCreditScore] = React.useState(null);
  const [creditScoreLoading, setCreditScoreLoading] = React.useState(false);
  const [creditScoreError, setCreditScoreError] = React.useState("");

  const [repaymentLoans, setRepaymentLoans] = React.useState([]);
  const [selectedRepaymentLoanId, setSelectedRepaymentLoanId] =
    React.useState("");
  const [repaymentSchedule, setRepaymentSchedule] = React.useState([]);
  const [repaymentLoading, setRepaymentLoading] = React.useState(false);
  const [repaymentError, setRepaymentError] = React.useState("");

  const [foreclosureLoans, setForeclosureLoans] = React.useState([]);
  const [selectedForeclosureLoanId, setSelectedForeclosureLoanId] =
    React.useState("");
  const [foreclosureAmount, setForeclosureAmount] = React.useState(null);
  const [foreclosureReason, setForeclosureReason] = React.useState("");
  const [foreclosureLoading, setForeclosureLoading] = React.useState(false);
  const [foreclosureError, setForeclosureError] = React.useState("");

  const [npaLoans, setNpaLoans] = React.useState([]);
  const [selectedNpaLoanId, setSelectedNpaLoanId] = React.useState("");
  const [npaLoading, setNpaLoading] = React.useState(false);
  const [npaError, setNpaError] = React.useState("");
  const [npaMessage, setNpaMessage] = React.useState("");

  const [emiForm, setEmiForm] = React.useState({
    loanAmount: "",
    annualInterestRate: "12",
    tenureMonths: "24",
  });

  const [emiResult, setEmiResult] = React.useState(null);
  const [emiLoading, setEmiLoading] = React.useState(false);

  const [loanForm, setLoanForm] = React.useState({
    accountId: "",
    loanType: "PERSONAL",
    requestedAmount: "",
    tenureMonths: "24",
    purpose: "",
    monthlyIncome: "",
    employmentType: "SALARIED",
  });

  const loadAccounts = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const response = await fetch(
      "http://localhost:8080/api/accounts",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to load accounts");
    }

    const data = await response.json();

    const activeAccounts = Array.isArray(data)
      ? data.filter(
          (account) =>
            String(account.status).toUpperCase() === "ACTIVE",
        )
      : [];

    setAccounts(activeAccounts);

    if (activeAccounts.length > 0) {
      setLoanForm((previous) => ({
        ...previous,
        accountId: String(activeAccounts[0].id),
      }));
    }
  } catch (error) {
    console.error("Account loading error:", error);
  }
};

React.useEffect(() => {
  loadAccounts();
}, []);

  React.useEffect(() => {
    loadMyLoans();
  }, []);

  const loadMyLoans = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      setLoansLoading(true);

      const response = await fetch("http://localhost:8080/api/loans", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();

      let data = [];

      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        data = [];
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            text ||
            "Unable to load loan applications.",
        );
      }

      setMyLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Loan loading error:", error);
      setMyLoans([]);
    } finally {
      setLoansLoading(false);
    }
  };

  const handleEligibilityCheck = async (event) => {
    event.preventDefault();

    try {
      setEligibilityLoading(true);
      setEligibilityResult(null);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/loans/eligibility",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loanType: eligibilityForm.loanType,
            requestedAmount: Number(eligibilityForm.requestedAmount),
            tenureMonths: Number(eligibilityForm.tenureMonths),
            monthlyIncome: Number(eligibilityForm.monthlyIncome),
            employmentType: eligibilityForm.employmentType,
          }),
        },
      );

      const text = await response.text();

      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            text ||
            "Unable to calculate eligibility.",
        );
      }

      setEligibilityResult(data);
    } catch (error) {
      console.error("Eligibility error:", error);

      setLoanMessage(error?.message || "Unable to calculate loan eligibility.");
      setLoanMessageType("error");
    } finally {
      setEligibilityLoading(false);
    }
  };

  const handleEmiCalculate = async (event) => {
    event.preventDefault();

    try {
      setEmiLoading(true);
      setEmiResult(null);

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/loans/emi", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanAmount: Number(emiForm.loanAmount),
          annualInterestRate: Number(emiForm.annualInterestRate),
          tenureMonths: Number(emiForm.tenureMonths),
        }),
      });

      const text = await response.text();

      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || text || "Unable to calculate EMI.",
        );
      }

      setEmiResult(data);
    } catch (error) {
      console.error("EMI error:", error);

      setLoanMessage(error?.message || "Unable to calculate EMI.");
      setLoanMessageType("error");
    } finally {
      setEmiLoading(false);
    }
  };

  const handleSubmitForReview = async (loanId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoanMessage("Session expired. Please login again.");
        setLoanMessageType("error");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/loans/${loanId}/submit-review`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const text = await response.text();

      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            text ||
            "Unable to submit loan for review.",
        );
      }

      setLoanMessage(
        `Loan #${loanId} has been submitted for review successfully.`,
      );
      setLoanMessageType("success");

      await loadMyLoans();
    } catch (error) {
      console.error("Submit review error:", error);

      setLoanMessage(error?.message || "Unable to submit loan for review.");
      setLoanMessageType("error");
    }
  };

  const handleLoanFormChange = (event) => {
    const { name, value } = event.target;

    setLoanForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setLoanMessage("");
    setLoanMessageType("");
  };

  const handleLoanApplication = async (event) => {
    event.preventDefault();

    setLoanMessage("");
    setLoanMessageType("");

    const token = localStorage.getItem("token");

    if (!token) {
      setLoanMessage("Session expired. Please login again.");
      setLoanMessageType("error");
      return;
    }

    if (!loanForm.accountId) {
      setLoanMessage("Please select an account.");
      setLoanMessageType("error");
      return;
    }

    try {
      setLoanSubmitting(true);

      const response = await fetch("http://localhost:8080/api/loans/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: Number(loanForm.accountId),
          loanType: loanForm.loanType,
          requestedAmount: Number(loanForm.requestedAmount),
          tenureMonths: Number(loanForm.tenureMonths),
          purpose: loanForm.purpose,
          monthlyIncome: Number(loanForm.monthlyIncome),
          employmentType: loanForm.employmentType,
        }),
      });

      const text = await response.text();

      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || text || "Loan application failed.",
        );
      }

      setLoanMessage(
        `Loan application submitted successfully. Loan ID: ${data?.id ?? "N/A"}`,
      );
      setLoanMessageType("success");
      await loadMyLoans();
      setLoanForm((previous) => ({
        ...previous,
        requestedAmount: "",
        purpose: "",
        monthlyIncome: "",
      }));
    } catch (error) {
      console.error("Loan application error:", error);

      setLoanMessage(error?.message || "Unable to submit loan application.");
      setLoanMessageType("error");
    } finally {
      setLoanSubmitting(false);
    }
  };

  const loanTypes = [
    {
      name: "Personal Loan",
      icon: "👤",
      description: "For personal and immediate financial needs.",
    },
    {
      name: "Home Loan",
      icon: "🏠",
      description: "Finance your dream home with flexible tenure.",
    },
    {
      name: "Car Loan",
      icon: "🚗",
      description: "Get financing for your new or used vehicle.",
    },
    {
      name: "Education Loan",
      icon: "🎓",
      description: "Support higher education and academic expenses.",
    },
    {
      name: "Business Loan",
      icon: "💼",
      description: "Funding support for business requirements.",
    },
    {
      name: "Gold Loan",
      icon: "🪙",
      description: "Secure financing against eligible gold assets.",
    },
  ];

  const features = [
    {
      title: "Loan Application",
      icon: "📝",
      description: "Apply for a new loan and track your application.",
    },
    {
      title: "Eligibility Calculator",
      icon: "📊",
      description: "Check your estimated loan eligibility.",
    },
    {
      title: "Credit Score",
      icon: "⭐",
      description: "View your current banking credit score.",
    },
    {
      title: "EMI Calculator",
      icon: "🧮",
      description: "Calculate EMI, interest and total repayment.",
    },
    {
      title: "My Loans",
      icon: "💳",
      description: "View your existing loan applications and status.",
    },
    {
      title: "Repayment Schedule",
      icon: "📅",
      description: "View installments and repayment details.",
    },
    {
      title: "Foreclosure",
      icon: "🔒",
      description: "Close your active loan by paying the outstanding amount.",
    },
    {
      title: "NPA Monitoring",
      icon: "⚠️",
      description: "Monitor overdue and non-performing loans.",
    },
  ];

  const handleCreditScoreCheck = async () => {
    setCreditScoreLoading(true);
    setCreditScoreError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/loans/credit-score",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to fetch credit score");
      }

      setCreditScore(data);
    } catch (error) {
      console.error("Credit Score Error:", error);
      setCreditScoreError(error.message || "Unable to fetch credit score");
    } finally {
      setCreditScoreLoading(false);
    }
  };

  const loadRepaymentLoans = async () => {
    try {
      setRepaymentError("");

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/loans", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to load loans.",
        );
      }

      setRepaymentLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Repayment loans error:", error);
      setRepaymentError(error?.message || "Unable to load your loans.");
    }
  };

  const loadForeclosureLoans = async () => {
    try {
      setForeclosureError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await fetch("http://localhost:8080/api/loans", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to load loans.",
        );
      }

      const activeLoans = Array.isArray(data)
        ? data.filter(
            (loan) => String(loan.status || "").toUpperCase() === "ACTIVE",
          )
        : [];

      setForeclosureLoans(activeLoans);

      if (activeLoans.length > 0) {
        setSelectedForeclosureLoanId(String(activeLoans[0].id));
      }
    } catch (error) {
      console.error("Foreclosure loans error:", error);
      setForeclosureLoans([]);
      setForeclosureError(error?.message || "Unable to load active loans.");
    }
  };

  const loadNpaLoans = async () => {
    try {
      setNpaLoading(true);
      setNpaError("");
      setNpaMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await fetch("http://localhost:8080/api/loans/npa", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();

let data = [];

if (responseText.trim()) {
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error("NPA JSON Parse Error:", parseError);
    throw new Error("NPA API returned an invalid response.");
  }
}

if (!response.ok) {
  throw new Error(
    data?.message ||
      data?.error ||
      `Unable to load NPA loans. HTTP ${response.status}`,
  );
}

      const loans = Array.isArray(data) ? data : [];

      setNpaLoans(loans);

      if (loans.length === 0) {
        setNpaMessage("No NPA loans found.");
        setSelectedNpaLoanId("");
      } else {
        setSelectedNpaLoanId(String(loans[0].id));
      }
    } catch (error) {
      console.error("NPA Loans Error:", error);
      setNpaLoans([]);
      setSelectedNpaLoanId("");
      setNpaError(error?.message || "Unable to load NPA loans.");
    } finally {
      setNpaLoading(false);
    }
  };

  const handleRepaymentSchedule = async () => {
    if (!selectedRepaymentLoanId) {
      setRepaymentError("Please select a loan first.");
      return;
    }

    try {
      setRepaymentLoading(true);
      setRepaymentError("");
      setRepaymentSchedule([]);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/api/loans/${selectedRepaymentLoanId}/repayment-schedule`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to load repayment schedule.",
        );
      }

      setRepaymentSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Repayment schedule error:", error);
      setRepaymentError(error?.message || "Unable to load repayment schedule.");
    } finally {
      setRepaymentLoading(false);
    }
  };

  const handleForeclosure = async () => {
    try {
      setForeclosureLoading(true);
      setForeclosureError("");

      if (!selectedForeclosureLoanId) {
        throw new Error("Please select a loan.");
      }

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await fetch(
        `http://localhost:8080/api/loans/${selectedForeclosureLoanId}/foreclose`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            foreclosureReason:
              foreclosureReason.trim() || "Loan foreclosed by customer",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Unable to foreclose loan.",
        );
      }

      setForeclosureAmount(
        data?.foreclosureAmount ??
          data?.approvedAmount ??
          data?.requestedAmount ??
          null,
      );

      setForeclosureReason("");

      alert(
        `Loan foreclosed successfully.\nForeclosure Amount: ₹${Number(
          data?.foreclosureAmount ??
            data?.approvedAmount ??
            data?.requestedAmount ??
            0,
        ).toLocaleString("en-IN")}`,
      );

      await loadForeclosureLoans();
      await loadMyLoans();
      await loadAccounts();
    } catch (error) {
      console.error("Foreclosure Error:", error);
      setForeclosureError(error?.message || "Unable to foreclose loan.");
    } finally {
      setForeclosureLoading(false);
    }
  };

  const styles = {
    loanHeader: {
      background:
        "linear-gradient(135deg, #102a6b 0%, #173b8c 48%, #2563eb 100%)",
      color: "#ffffff",
      borderRadius: "20px",
      padding: "26px 32px",
      marginBottom: "24px",
      maxHeight: "100px",
      display: "flex",
      alignItems: "center",
      boxSizing: "border-box",
      boxShadow: "0 16px 38px rgba(23, 59, 140, 0.18)",
      overflow: "hidden",
    },

    loanHeaderContent: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "24px",
      flexWrap: "wrap",
    },

    loanHeaderLeft: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      minWidth: 0,
      flex: "1 1 520px",
    },

    loanHeaderIcon: {
      width: "58px",
      height: "58px",
      minWidth: "58px",
      borderRadius: "16px",
      background: "rgba(255,255,255,0.14)",
      border: "1px solid rgba(255,255,255,0.22)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "27px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
    },

    loanHeaderText: {
      minWidth: 0,
    },

    loanEyebrow: {
      margin: "0 0 5px",
      fontSize: "10px",
      fontWeight: "800",
      letterSpacing: "1.6px",
      color: "#cbd8ff",
    },

    loanTitle: {
      margin: 0,
      fontSize: "clamp(28px, 3vw, 38px)",
      lineHeight: "1.12",
      fontWeight: "800",
      letterSpacing: "-0.8px",
      color: "#ffffff",
    },

    loanSubtitle: {
      margin: "8px 0 0",
      fontSize: "12px",
      lineHeight: "1.5",
      color: "#dbe5ff",
      maxWidth: "650px",
    },

    dashboardButton: {
      border: "1px solid rgba(255,255,255,0.30)",
      background: "#ffffff",
      color: "#190fd8",
      padding: "11px 17px",
      borderRadius: "11px",
      fontSize: "12px",
      fontWeight: "700",
      cursor: "pointer",
      whiteSpace: "nowrap",
      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      flexShrink: 0,
      marginBottom: 0,
    },
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .loan-page {
          min-height: 100vh;
          background: #f5f8fc;
          padding: 25px 32px ;
          font-family: Inter, Arial, sans-serif;
          color: #172033;
        }

        .loan-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .loan-header {
          background: linear-gradient(135deg, #173b8c, #2563eb);
          max-height: 100px;
          color: white;
          border-radius: 18px;
          padding: 30px 34px;
          margin-bottom: 24px;
          box-shadow: 0 14px 35px rgba(23, 59, 140, 0.18);
        }

        .loan-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .loan-eyebrow {
          //margin: 0 0 7px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.2px;
          opacity: 0.82;
        }

        .loan-title {
          //margin: 0;
          font-size: 32px;
          font-weight: 800;
        }

        .loan-subtitle {
          margin: 8px 10px;
          font-size: 14px;
          opacity: 0.88;
          
          
        }

        .dashboard-button {
          border: 1px solid rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.1);
          color: white;
          padding: 12px 19px;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          //white-space: nowrap;
          margin-bottom: 80px;
        }

        .section-card {
          background: white;
          border: 1px solid #e2e8f2;
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 22px;
          box-shadow: 0 8px 25px rgba(20,35,70,0.05);
        }

        .section-heading {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
          color:black;
        }

        .section-description {
          margin: 6px 0 20px;
          color: #71809a;
          font-size: 13px;
          
        }

        .loan-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .loan-type-card {
          border: 1px solid #e1e7f0;
          border-radius: 16px;
          padding: 19px;
          background: #fbfcff;
          transition: 0.2s ease;
        }

        .loan-type-card:hover {
          transform: translateY(-2px);
          border-color: #9eb7ed;
          box-shadow: 0 8px 20px rgba(37,99,235,0.08);
        }

        .loan-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #edf4ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          margin-bottom: 12px;
        }

        .loan-type-name {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
        }

        .loan-type-description {
          margin: 6px 0 0;
          color: #75839a;
          font-size: 11px;
          line-height: 1.45;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .feature-card {
          border: 1px solid #e1e7f0;
          border-radius: 16px;
          padding: 18px;
          background: white;
          cursor: pointer;
          text-align: left;
          transition: 0.2s ease;
        }

        .feature-card:hover {
          border-color: #8eace9;
          background: #f8fbff;
          transform: translateY(-2px);
        }

        .feature-icon {
          font-size: 23px;
          margin-bottom: 11px;
        }

        .feature-title {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color:black;
        }

        .feature-description {
          margin: 6px 0 0;
          color: #75839a;
          font-size: 11px;
          line-height: 1.45;
        }

        .loan-footer {
          text-align: center;
          color: #8793a8;
          font-size: 11px;
          padding-top: 5px;
        }

        @media (max-width: 900px) {
          .loan-types-grid,
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .loan-page {
            padding: 15px 10px 30px;
          }

          .loan-header {
            padding: 23px 19px;
            border-radius: 17px;
          }

          .loan-header-content {
            align-items: flex-start;
            flex-direction: column;
          }

          .loan-title {
            font-size: 27px;
          }

          .dashboard-button {
            width: 100%;
          }

          .section-card {
            padding: 19px;
          }

          .loan-types-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="loan-page">
        <div className="loan-container">
          <div style={styles.loanHeader}>
            <div style={styles.loanHeaderContent}>
              <div style={styles.loanHeaderLeft}>
                <div style={styles.loanHeaderIcon}>🏦</div>

                <div style={styles.loanHeaderText}>
                  <p style={styles.loanEyebrow}>
                    AVANI BANK • LOAN SERVICES
                  </p>

                  <h1 style={styles.loanTitle}>
                    Loan Management
                  </h1>

                  <p style={styles.loanSubtitle}>
                    Apply for loans, check eligibility, calculate EMI and manage
                    your loan journey securely.
                  </p>
                </div>
              </div>

              <button
                type="button"
                style={styles.dashboardButton}
                onClick={() => navigate("/dashboard")}
              >
                ← Dashboard
              </button>
            </div>
          </div>

          <div className="section-card">
            <h2 className="section-heading">Loan Types</h2>

            <p className="section-description">
              Choose the loan category that matches your financial requirement.
            </p>

            <div className="loan-types-grid">
              {loanTypes.map((loan) => (
                <div key={loan.name} className="loan-type-card">
                  <div className="loan-icon">{loan.icon}</div>

                  <h3 className="loan-type-name">{loan.name}</h3>

                  <p className="loan-type-description">{loan.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card loan-applications-section">
            <h2 className="section-heading">Apply for a Loan</h2>

            <p className="section-description">
              Submit your loan application with your income and employment
              details.
            </p>

            <form onSubmit={handleLoanApplication}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    Source Account
                  </label>

                  <select
                    name="accountId"
                    value={loanForm.accountId}
                    onChange={handleLoanFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      background: "#413f3f",
                    }}
                  >
                    {accounts.length === 0 ? (
                      <option value="">Loading accounts...</option>
                    ) : (
                      accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.accountNumber} — {account.accountType} — ₹
                          {Number(account.balance || 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            },
                          )}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    Loan Type
                  </label>

                  <select
                    name="loanType"
                    value={loanForm.loanType}
                    onChange={handleLoanFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      background: "#413f3f",
                    }}
                  >
                    <option value="PERSONAL">Personal Loan</option>
                    <option value="HOME">Home Loan</option>
                    <option value="CAR">Car Loan</option>
                    <option value="EDUCATION">Education Loan</option>
                    <option value="BUSINESS">Business Loan</option>
                    <option value="GOLD">Gold Loan</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    Requested Amount (₹)
                  </label>

                  <input
                    type="number"
                    name="requestedAmount"
                    value={loanForm.requestedAmount}
                    onChange={handleLoanFormChange}
                    min="1"
                    step="0.01"
                    placeholder="Enter loan amount"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      background: "#413f3f",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    Tenure (Months)
                  </label>

                  <input
                    type="number"
                    name="tenureMonths"
                    value={loanForm.tenureMonths}
                    onChange={handleLoanFormChange}
                    min="1"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    Employment Type
                  </label>

                  <select
                    value={eligibilityForm.employmentType}
                    onChange={(e) =>
                      setEligibilityForm((prev) => ({
                        ...prev,
                        employmentType: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "11px",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="SALARIED">Salaried</option>
                    <option value="SELF_EMPLOYED">Self Employed</option>
                    <option value="BUSINESS">Business</option>
                    <option value="STUDENT">Student</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    Monthly Income (₹)
                  </label>

                  <input
                    type="number"
                    name="monthlyIncome"
                    value={loanForm.monthlyIncome}
                    onChange={handleLoanFormChange}
                    min="1"
                    step="0.01"
                    placeholder="Enter monthly income"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                    }}
                  />
                </div>

                {/* <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    Employment Type
                  </label>

                  <select
                    name="employmentType"
                    value={loanForm.employmentType}
                    onChange={handleLoanFormChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      background: "white",
                    }}
                  >
                    <option value="SALARIED">Salaried</option>
                    <option value="SELF_EMPLOYED">Self Employed</option>
                    <option value="BUSINESS">Business Owner</option>
                    <option value="STUDENT">Student</option>
                  </select>
                
              </div> */}
              </div>

              <div style={{ marginTop: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  Loan Purpose
                </label>

                <textarea
                  name="purpose"
                  value={loanForm.purpose}
                  onChange={handleLoanFormChange}
                  placeholder="Explain why you need this loan"
                  required
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #dce3ee",
                    borderRadius: "10px",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {loanMessage && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background:
                      loanMessageType === "success" ? "#ecfdf3" : "#fff1f2",
                    color:
                      loanMessageType === "success" ? "#087443" : "#b42318",
                    fontSize: "13px",
                    fontWeight: "700",
                  }}
                >
                  {loanMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loanSubmitting}
                style={{
                  marginTop: "18px",
                  width: "100%",
                  border: "none",
                  borderRadius: "11px",
                  padding: "13px 18px",
                  background: loanSubmitting ? "#94a3b8" : "#2563eb",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: loanSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {loanSubmitting
                  ? "Submitting Application..."
                  : "Submit Loan Application"}
              </button>
            </form>
          </div>

          <div className="section-card">
            <h2 className="section-heading">My Loan Applications</h2>

            <p className="section-description">
              View your submitted loan applications and their current status.
            </p>

            {loansLoading ? (
              <div
                style={{
                  padding: "25px",
                  textAlign: "center",
                  color: "#71809a",
                  fontSize: "13px",
                }}
              >
                Loading your loan applications...
              </div>
            ) : myLoans.length === 0 ? (
              <div
                style={{
                  padding: "25px",
                  textAlign: "center",
                  border: "1px dashed #d8e0ec",
                  borderRadius: "14px",
                  color: "#71809a",
                  fontSize: "13px",
                  background: "#fbfcff",
                }}
              >
                You have no loan applications yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {myLoans.map((loan) => {
                  const status = String(loan.status || "UNKNOWN").toUpperCase();

                  const statusBackground =
                    status === "APPROVED"
                      ? "#ecfdf3"
                      : status === "REJECTED"
                        ? "#fff1f2"
                        : status === "ACTIVE"
                          ? "#ecfdf3"
                          : status === "NPA"
                            ? "#fff1f2"
                            : "#fff7e8";

                  const statusColor =
                    status === "APPROVED"
                      ? "#087443"
                      : status === "REJECTED"
                        ? "#b42318"
                        : status === "ACTIVE"
                          ? "#087443"
                          : status === "NPA"
                            ? "#b42318"
                            : "#9a6700";

                  return (
                    <div
                      key={loan.id}
                      style={{
                        border: "1px solid #e1e7f0",
                        borderRadius: "15px",
                        padding: "18px",
                        background: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "15px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color: "#7b879a",
                              fontWeight: "700",
                            }}
                          >
                            LOAN APPLICATION #{loan.id}
                          </p>

                          <h3
                            style={{
                              margin: "5px 0 0",
                              fontSize: "16px",
                              fontWeight: "800",
                            }}
                          >
                            {loan.loanType || "Loan"}
                          </h3>
                        </div>

                        <span
                          style={{
                            padding: "7px 11px",
                            borderRadius: "20px",
                            background: statusBackground,
                            color: statusColor,
                            fontSize: "11px",
                            fontWeight: "800",
                          }}
                        >
                          {status === "APPLIED" && (
                            <button
                              type="button"
                              onClick={() => handleSubmitForReview(loan.id)}
                              style={{
                                border: "none",
                                borderRadius: "9px",
                                padding: "8px 12px",
                                background: "#2563eb",
                                color: "white",
                                fontSize: "11px",
                                fontWeight: "800",
                                cursor: "pointer",
                              }}
                            >
                              Submit for Review
                            </button>
                          )}

                          {status.replaceAll("_", " ")}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "12px",
                          marginTop: "18px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "10px",
                              color: "#8490a8",
                            }}
                          >
                            Requested Amount
                          </p>

                          <strong
                            style={{
                              display: "block",
                              marginTop: "4px",
                              fontSize: "13px",
                            }}
                          >
                            ₹
                            {Number(loan.requestedAmount || 0).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                              },
                            )}
                          </strong>
                        </div>

                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "10px",
                              color: "#8490a8",
                            }}
                          >
                            Tenure
                          </p>

                          <strong
                            style={{
                              display: "block",
                              marginTop: "4px",
                              fontSize: "13px",
                            }}
                          >
                            {loan.tenureMonths || 0} months
                          </strong>
                        </div>

                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "10px",
                              color: "#8490a8",
                            }}
                          >
                            Application Date
                          </p>

                          <strong
                            style={{
                              display: "block",
                              marginTop: "4px",
                              fontSize: "13px",
                            }}
                          >
                            {loan.applicationDate || "-"}
                          </strong>
                        </div>
                      </div>

                      {loan.approvedAmount != null && (
                        <div
                          style={{
                            marginTop: "14px",
                            paddingTop: "14px",
                            borderTop: "1px solid #edf0f5",
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "12px",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "10px",
                                color: "#8490a8",
                              }}
                            >
                              Approved Amount
                            </p>

                            <strong
                              style={{
                                display: "block",
                                marginTop: "4px",
                                fontSize: "13px",
                              }}
                            >
                              ₹
                              {Number(loan.approvedAmount).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                },
                              )}
                            </strong>
                          </div>

                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "10px",
                                color: "#8490a8",
                              }}
                            >
                              Interest Rate
                            </p>

                            <strong
                              style={{
                                display: "block",
                                marginTop: "4px",
                                fontSize: "13px",
                              }}
                            >
                              {loan.interestRate ?? "-"}%
                            </strong>
                          </div>

                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "10px",
                                color: "#8490a8",
                              }}
                            >
                              EMI
                            </p>

                            <strong
                              style={{
                                display: "block",
                                marginTop: "4px",
                                fontSize: "13px",
                              }}
                            >
                              {loan.emiAmount != null
                                ? `₹${Number(loan.emiAmount).toLocaleString(
                                    "en-IN",
                                    {
                                      minimumFractionDigits: 2,
                                    },
                                  )}`
                                : "-"}
                            </strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="section-card">
            <h2 className="section-heading">Loan Services</h2>

            <p className="section-description">
              Manage your loan application, eligibility and repayment
              information.
            </p>

            <div className="features-grid">
              {features.map((feature) => (
                <button
                  key={feature.title}
                  type="button"
                  className="feature-card"
                  onClick={() => {
                    setActiveLoanService(feature.title);

                    if (feature.title === "Foreclosure") {
                      loadForeclosureLoans();
                    }

                    if (feature.title === "NPA Monitoring") {
                      loadNpaLoans();
                    }
                  }}
                >
                  <div className="feature-icon">{feature.icon}</div>

                  <h3 className="feature-title">{feature.title}</h3>

                  <p className="feature-description">{feature.description}</p>
                </button>
              ))}
            </div>
          </div>
          {activeLoanService && (
            <div className="section-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "10px",
                      color: "#2563eb",
                      fontWeight: "800",
                      letterSpacing: "0.8px",
                    }}
                  >
                    AVANI BANK • LOAN SERVICE
                  </p>

                  <h2 className="section-heading" style={{ marginTop: "5px" }}>
                    {activeLoanService}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveLoanService("")}
                  style={{
                    border: "1px solid #dce3ee",
                    background: "#ffffff",
                    color: "#536176",
                    borderRadius: "9px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  ✕ Close
                </button>
              </div>

              {activeLoanService === "Loan Application" && (
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    background: "#f8fbff",
                    border: "1px solid #e1e8f3",
                  }}
                >
                  <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>
                    Apply for a New Loan
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#71809a",
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    Use the loan application form above to submit your
                    application.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      document.querySelector("form")?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                    style={{
                      marginTop: "15px",
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      padding: "11px 16px",
                      borderRadius: "9px",
                      cursor: "pointer",
                      fontWeight: "800",
                    }}
                  >
                    Go to Application Form →
                  </button>
                </div>
              )}

              {activeLoanService === "My Loans" && (
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    background: "#f8fbff",
                    border: "1px solid #e1e8f3",
                  }}
                >
                  <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>
                    Your Loan Applications
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#71809a",
                      fontSize: "12px",
                    }}
                  >
                    Your submitted loan applications are shown in the My Loan
                    Applications section above.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      document
                        .querySelector(".loan-applications-section")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        })
                    }
                    style={{
                      marginTop: "15px",
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      padding: "11px 16px",
                      borderRadius: "9px",
                      cursor: "pointer",
                      fontWeight: "800",
                    }}
                  >
                    View My Loans →
                  </button>
                </div>
              )}

              {activeLoanService === "Eligibility Calculator" && (
                <form onSubmit={handleEligibilityCheck}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Loan Type
                      </label>

                      <select
                        value={eligibilityForm.loanType}
                        onChange={(e) =>
                          setEligibilityForm((prev) => ({
                            ...prev,
                            loanType: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "11px",
                          border: "1px solid #dce3ee",
                          borderRadius: "10px",
                        }}
                      >
                        <option value="PERSONAL">Personal Loan</option>
                        <option value="HOME">Home Loan</option>
                        <option value="CAR">Car Loan</option>
                        <option value="EDUCATION">Education Loan</option>
                        <option value="BUSINESS">Business Loan</option>
                        <option value="GOLD">Gold Loan</option>
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Requested Amount (₹)
                      </label>

                      <input
                        type="number"
                        min="1"
                        required
                        value={eligibilityForm.requestedAmount}
                        onChange={(e) =>
                          setEligibilityForm((prev) => ({
                            ...prev,
                            requestedAmount: e.target.value,
                          }))
                        }
                        placeholder="100000"
                        style={{
                          width: "100%",
                          padding: "11px",
                          border: "1px solid #dce3ee",
                          borderRadius: "10px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Tenure (Months)
                      </label>

                      <input
                        type="number"
                        min="1"
                        required
                        value={eligibilityForm.tenureMonths}
                        onChange={(e) =>
                          setEligibilityForm((prev) => ({
                            ...prev,
                            tenureMonths: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "11px",
                          border: "1px solid #dce3ee",
                          borderRadius: "10px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Monthly Income (₹)
                      </label>

                      <input
                        type="number"
                        min="1"
                        required
                        value={eligibilityForm.monthlyIncome}
                        onChange={(e) =>
                          setEligibilityForm((prev) => ({
                            ...prev,
                            monthlyIncome: e.target.value,
                          }))
                        }
                        placeholder="40000"
                        style={{
                          width: "100%",
                          padding: "11px",
                          border: "1px solid #dce3ee",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={eligibilityLoading}
                    style={{
                      marginTop: "17px",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 18px",
                      background: "#2563eb",
                      color: "white",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    {eligibilityLoading
                      ? "Calculating..."
                      : "Check Eligibility"}
                  </button>

                  {eligibilityResult && (
                    <div
                      style={{
                        marginTop: "18px",
                        padding: "18px",
                        borderRadius: "14px",
                        background: "#f8fbff",
                        border: "1px solid #dce7f8",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 15px",
                          fontSize: "16px",
                        }}
                      >
                        Eligibility Result
                      </h3>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <small>Maximum EMI</small>
                          <strong style={{ display: "block" }}>
                            ₹
                            {Number(
                              eligibilityResult.maximumEligibleEmi || 0,
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </strong>
                        </div>

                        <div>
                          <small>Maximum Eligible Amount</small>
                          <strong style={{ display: "block" }}>
                            ₹
                            {Number(
                              eligibilityResult.maximumEligibleAmount || 0,
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </strong>
                        </div>

                        <div>
                          <small>Estimated EMI</small>
                          <strong style={{ display: "block" }}>
                            ₹
                            {Number(
                              eligibilityResult.estimatedEmi || 0,
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </strong>
                        </div>

                        <div>
                          <small>Result</small>
                          <strong
                            style={{
                              display: "block",
                              marginTop: "3px",
                              color:
                                eligibilityResult.eligibilityStatus ===
                                "ELIGIBLE"
                                  ? "#087443"
                                  : "#b42318",
                            }}
                          >
                            {eligibilityResult.eligibilityStatus || "-"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {activeLoanService === "Credit Score" && (
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "#71809a",
                      fontSize: "12px",
                    }}
                  >
                    Check your Avani Bank credit score and score category.
                  </p>

                  <button
                    type="button"
                    onClick={handleCreditScoreCheck}
                    disabled={creditScoreLoading}
                    style={{
                      marginTop: "17px",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 18px",
                      background: creditScoreLoading ? "#94a3b8" : "#2563eb",
                      color: "white",
                      fontWeight: "800",
                      cursor: creditScoreLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {creditScoreLoading ? "Checking..." : "Check Credit Score"}
                  </button>

                  {creditScoreError && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        color: "#be123c",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {creditScoreError}
                    </div>
                  )}

                  {creditScore && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "25px",
                        borderRadius: "16px",
                        background: "#f8fbff",
                        border: "1px solid #dce7f8",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "42px",
                            fontWeight: "900",
                            color: "#2563eb",
                          }}
                        >
                          {creditScore.creditScore}
                        </div>

                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: "11px",
                            color: "#71809a",
                          }}
                        >
                          Credit Score
                        </p>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                          marginTop: "20px",
                        }}
                      >
                        <div
                          style={{
                            padding: "14px",
                            borderRadius: "12px",
                            background: "#ffffff",
                            border: "1px solid #e5eaf2",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#71809a",
                              marginBottom: "5px",
                            }}
                          >
                            Category
                          </div>

                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: "800",
                              color: "#15803d",
                            }}
                          >
                            {creditScore.category}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "14px",
                            borderRadius: "12px",
                            background: "#ffffff",
                            border: "1px solid #e5eaf2",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#71809a",
                              marginBottom: "5px",
                            }}
                          >
                            Risk Level
                          </div>

                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: "800",
                              color: "#c2410c",
                            }}
                          >
                            {creditScore.riskLevel}
                          </div>
                        </div>
                      </div>

                      {creditScore.message && (
                        <div
                          style={{
                            marginTop: "14px",
                            padding: "13px",
                            borderRadius: "10px",
                            background: "#ffffff",
                            border: "1px solid #e5eaf2",
                            fontSize: "12px",
                            lineHeight: "1.5",
                            color: "#475569",
                          }}
                        >
                          <strong>Assessment:</strong> {creditScore.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeLoanService === "EMI Calculator" && (
                <form onSubmit={handleEmiCalculate}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Loan Amount (₹)
                      </label>

                      <input
                        type="number"
                        min="1"
                        required
                        value={emiForm.loanAmount}
                        onChange={(e) =>
                          setEmiForm((prev) => ({
                            ...prev,
                            loanAmount: e.target.value,
                          }))
                        }
                        placeholder="100000"
                        style={{
                          width: "100%",
                          padding: "11px",
                          border: "1px solid #dce3ee",
                          borderRadius: "10px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Interest Rate (%)
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={emiForm.annualInterestRate}
                        onChange={(e) =>
                          setEmiForm((prev) => ({
                            ...prev,
                            annualInterestRate: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "11px",
                          border: "1px solid #dce3ee",
                          borderRadius: "10px",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Tenure (Months)
                      </label>

                      <input
                        type="number"
                        min="1"
                        required
                        value={emiForm.tenureMonths}
                        onChange={(e) =>
                          setEmiForm((prev) => ({
                            ...prev,
                            tenureMonths: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "11px",
                          border: "1px solid #dce3ee",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={emiLoading}
                    style={{
                      marginTop: "17px",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 18px",
                      background: "#2563eb",
                      color: "white",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    {emiLoading ? "Calculating..." : "Calculate EMI"}
                  </button>

                  {emiResult && (
                    <div
                      style={{
                        marginTop: "20px",
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          padding: "18px",
                          borderRadius: "14px",
                          background: "#f8fbff",
                          border: "1px solid #dce7f8",
                        }}
                      >
                        <small>Monthly EMI</small>

                        <strong
                          style={{
                            display: "block",
                            marginTop: "5px",
                            fontSize: "17px",
                          }}
                        >
                          ₹
                          {Number(emiResult.monthlyEmi || 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            },
                          )}
                        </strong>
                      </div>

                      <div
                        style={{
                          padding: "18px",
                          borderRadius: "14px",
                          background: "#f8fbff",
                          border: "1px solid #dce7f8",
                        }}
                      >
                        <small>Total Interest</small>

                        <strong
                          style={{
                            display: "block",
                            marginTop: "5px",
                            fontSize: "17px",
                          }}
                        >
                          ₹
                          {Number(emiResult.totalInterest || 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            },
                          )}
                        </strong>
                      </div>

                      <div
                        style={{
                          padding: "18px",
                          borderRadius: "14px",
                          background: "#f8fbff",
                          border: "1px solid #dce7f8",
                        }}
                      >
                        <small>Total Repayment</small>

                        <strong
                          style={{
                            display: "block",
                            marginTop: "5px",
                            fontSize: "17px",
                          }}
                        >
                          ₹
                          {Number(emiResult.totalRepayment || 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            },
                          )}
                        </strong>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {activeLoanService === "Repayment Schedule" && (
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "#71809a",
                      fontSize: "12px",
                    }}
                  >
                    View your loan EMI repayment schedule and installment
                    details.
                  </p>

                  <div
                    style={{
                      marginTop: "17px",
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "12px",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Select Loan
                      </label>

                      <select
                        value={selectedRepaymentLoanId}
                        onChange={(e) => {
                          setSelectedRepaymentLoanId(e.target.value);
                          setRepaymentSchedule([]);
                          setRepaymentError("");
                        }}
                        onFocus={() => {
                          if (repaymentLoans.length === 0) {
                            loadRepaymentLoans();
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "11px",
                          border: "1px solid #dce3ee",
                          borderRadius: "10px",
                          background: "black",
                        }}
                      >
                        <option value="">Select a loan</option>

                        {repaymentLoans.map((loan) => (
                          <option key={loan.id} value={loan.id}>
                            {loan.loanType} — ₹
                            {Number(
                              loan.approvedAmount || loan.requestedAmount || 0,
                            ).toLocaleString("en-IN")}{" "}
                            — {loan.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleRepaymentSchedule}
                      disabled={repaymentLoading}
                      style={{
                        border: "none",
                        borderRadius: "10px",
                        padding: "12px 18px",
                        background: repaymentLoading ? "#94a3b8" : "#2563eb",
                        color: "white",
                        fontWeight: "800",
                        cursor: repaymentLoading ? "not-allowed" : "pointer",
                      }}
                    >
                      {repaymentLoading ? "Loading..." : "View Schedule"}
                    </button>
                  </div>

                  {repaymentError && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        color: "#be123c",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {repaymentError}
                    </div>
                  )}

                  {repaymentSchedule.length > 0 && (
                    <div
                      style={{
                        marginTop: "20px",
                        overflowX: "auto",
                        border: "1px solid #dce7f8",
                        borderRadius: "14px",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: "11px",
                          minWidth: "850px",
                        }}
                      >
                        <thead>
                          <tr style={{ background: "#f8fbff" }}>
                            <th style={{ padding: "12px", textAlign: "left" }}>
                              EMI No.
                            </th>
                            <th style={{ padding: "12px", textAlign: "left" }}>
                              Due Date
                            </th>
                            <th style={{ padding: "12px", textAlign: "right" }}>
                              Principal
                            </th>
                            <th style={{ padding: "12px", textAlign: "right" }}>
                              Interest
                            </th>
                            <th style={{ padding: "12px", textAlign: "right" }}>
                              EMI
                            </th>
                            <th style={{ padding: "12px", textAlign: "right" }}>
                              Remaining
                            </th>
                            <th
                              style={{ padding: "12px", textAlign: "center" }}
                            >
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {repaymentSchedule.map((installment) => (
                            <tr key={installment.id}>
                              <td style={{ padding: "12px" }}>
                                {installment.installmentNumber}
                              </td>

                              <td style={{ padding: "12px" }}>
                                {installment.dueDate}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "right",
                                }}
                              >
                                ₹
                                {Number(
                                  installment.principalAmount || 0,
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "right",
                                }}
                              >
                                ₹
                                {Number(
                                  installment.interestAmount || 0,
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "right",
                                  fontWeight: "700",
                                }}
                              >
                                ₹
                                {Number(
                                  installment.emiAmount || 0,
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "right",
                                }}
                              >
                                ₹
                                {Number(
                                  installment.remainingBalance || 0,
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>

                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  fontWeight: "700",
                                }}
                              >
                                {installment.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {selectedRepaymentLoanId &&
                    !repaymentLoading &&
                    !repaymentError &&
                    repaymentSchedule.length === 0 && (
                      <div
                        style={{
                          marginTop: "18px",
                          padding: "15px",
                          borderRadius: "12px",
                          background: "#f6d1d1",
                          border: "1px solid #fed7aa",
                          color: "#9a3412",
                          fontSize: "12px",
                        }}
                      >
                        No repayment schedule found for this loan.
                      </div>
                    )}
                </div>
              )}

              {activeLoanService === "Foreclosure" && (
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
                    marginTop: "20px",
                  }}
                >
                  <h2 style={{ marginBottom: "8px" }}>Loan Foreclosure</h2>

                  <p
                    style={{
                      color: "#667085",
                      marginBottom: "20px",
                    }}
                  >
                    Close your active loan by paying the outstanding amount.
                  </p>

                  {foreclosureError && (
                    <div
                      style={{
                        background: "#ffecec",
                        color: "#c62828",
                        padding: "12px",
                        borderRadius: "10px",
                        marginBottom: "15px",
                      }}
                    >
                      {foreclosureError}
                    </div>
                  )}

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "600",
                        marginBottom: "7px",
                      }}
                    >
                      Select Active Loan
                    </label>

                    <select
                      value={selectedForeclosureLoanId}
                      onChange={(e) => {
                        setSelectedForeclosureLoanId(e.target.value);
                        setForeclosureAmount(null);
                        setForeclosureError("");
                      }}
                      onFocus={() => {
                        if (foreclosureLoans.length === 0) {
                          loadForeclosureLoans();
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "11px",
                        border: "1px solid #dce3ee",
                        borderRadius: "10px",
                        background: "black",
                        color: "white",
                      }}
                    >
                      <option value="">Select a loan</option>

                      {foreclosureLoans.map((loan) => (
                        <option key={loan.id} value={loan.id}>
                          {loan.loanType} — ₹
                          {Number(
                            loan.approvedAmount ||
                              loan.disbursedAmount ||
                              loan.requestedAmount ||
                              0,
                          ).toLocaleString("en-IN")}{" "}
                          — {loan.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "600",
                        marginBottom: "7px",
                      }}
                    >
                      Foreclosure Reason
                    </label>

                    <textarea
                      value={foreclosureReason}
                      onChange={(e) => setForeclosureReason(e.target.value)}
                      placeholder="Enter reason for foreclosure"
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "11px",
                        border: "1px solid #dce3ee",
                        borderRadius: "10px",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {foreclosureAmount !== null && (
                    <div
                      style={{
                        background: "#f3f8ff",
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "18px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#667085",
                          marginBottom: "5px",
                        }}
                      >
                        Foreclosure Amount
                      </div>

                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                        }}
                      >
                        ₹
                        {Number(foreclosureAmount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleForeclosure}
                    disabled={foreclosureLoading || !selectedForeclosureLoanId}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "none",
                      borderRadius: "10px",
                      background:
                        foreclosureLoading || !selectedForeclosureLoanId
                          ? "#9ca3af"
                          : "#111827",
                      color: "white",
                      fontWeight: "600",
                      cursor:
                        foreclosureLoading || !selectedForeclosureLoanId
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {foreclosureLoading
                      ? "Processing Foreclosure..."
                      : "Foreclose Loan"}
                  </button>
                </div>
              )}

              {activeLoanService === "NPA Monitoring" && (
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
                    marginTop: "20px",
                  }}
                >
                  <h2 style={{ marginBottom: "8px" }}>NPA Monitoring</h2>

                  <p style={{ color: "#667085", marginBottom: "20px" }}>
                    Monitor your non-performing loans, overdue days, and NPA
                    status.
                  </p>

                  {npaError && (
                    <div
                      style={{
                        background: "#fff1f0",
                        color: "#c62828",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        marginBottom: "16px",
                      }}
                    >
                      {npaError}
                    </div>
                  )}

                  {npaLoading && (
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: "14px",
                        borderRadius: "10px",
                        marginBottom: "16px",
                      }}
                    >
                      Loading NPA loans...
                    </div>
                  )}

                  {npaMessage && !npaError && !npaLoading && (
                    <div
                      style={{
                        background: "#f8fafc",
                        color: "#475467",
                        padding: "14px",
                        borderRadius: "10px",
                        marginBottom: "16px",
                      }}
                    >
                      {npaMessage}
                    </div>
                  )}

                  {npaLoans.length > 0 && (
                    <>
                      <div style={{ marginBottom: "18px" }}>
                        <label
                          style={{
                            display: "block",
                            fontWeight: "600",
                            marginBottom: "8px",
                          }}
                        >
                          Select NPA Loan
                        </label>

                        <select
                          value={selectedNpaLoanId}
                          onChange={(e) => setSelectedNpaLoanId(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "11px",
                            border: "1px solid #dce3ee",
                            borderRadius: "10px",
                            background: "black",
                            color: "white",
                          }}
                        >
                          <option value="">Select a loan</option>

                          {npaLoans.map((loan) => (
                            <option key={loan.id} value={loan.id}>
                              {loan.loanType} — ₹
                              {Number(
                                loan.approvedAmount ||
                                  loan.disbursedAmount ||
                                  loan.requestedAmount ||
                                  0,
                              ).toLocaleString("en-IN")}{" "}
                              — NPA
                            </option>
                          ))}
                        </select>
                      </div>

                      {(() => {
                        const selectedLoan = npaLoans.find(
                          (loan) =>
                            String(loan.id) === String(selectedNpaLoanId),
                        );

                        if (!selectedLoan) {
                          return null;
                        }

                        return (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: "14px",
                              marginTop: "10px",
                            }}
                          >
                            <div
                              style={{
                                background: "#f8fafc",
                                padding: "16px",
                                borderRadius: "12px",
                              }}
                            >
                              <div
                                style={{
                                  color: "#667085",
                                  fontSize: "13px",
                                  marginBottom: "6px",
                                }}
                              >
                                Loan Type
                              </div>

                              <div style={{ fontWeight: "700" }}>
                                {selectedLoan.loanType || "N/A"}
                              </div>
                            </div>

                            <div
                              style={{
                                background: "#f8fafc",
                                padding: "16px",
                                borderRadius: "12px",
                              }}
                            >
                              <div
                                style={{
                                  color: "#667085",
                                  fontSize: "13px",
                                  marginBottom: "6px",
                                }}
                              >
                                Loan Amount
                              </div>

                              <div style={{ fontWeight: "700" }}>
                                ₹
                                {Number(
                                  selectedLoan.approvedAmount ||
                                    selectedLoan.disbursedAmount ||
                                    selectedLoan.requestedAmount ||
                                    0,
                                ).toLocaleString("en-IN")}
                              </div>
                            </div>

                            <div
                              style={{
                                background: "#fff7ed",
                                padding: "16px",
                                borderRadius: "12px",
                              }}
                            >
                              <div
                                style={{
                                  color: "#9a3412",
                                  fontSize: "13px",
                                  marginBottom: "6px",
                                }}
                              >
                                Status
                              </div>

                              <div
                                style={{
                                  fontWeight: "700",
                                  color: "#c2410c",
                                }}
                              >
                                {selectedLoan.status || "NPA"}
                              </div>
                            </div>

                            <div
                              style={{
                                background: "#fff7ed",
                                padding: "16px",
                                borderRadius: "12px",
                              }}
                            >
                              <div
                                style={{
                                  color: "#9a3412",
                                  fontSize: "13px",
                                  marginBottom: "6px",
                                }}
                              >
                                Overdue Days
                              </div>

                              <div
                                style={{
                                  fontWeight: "700",
                                  color: "#c2410c",
                                }}
                              >
                                {selectedLoan.overdueDays ?? 0} days
                              </div>
                            </div>

                            <div
                              style={{
                                background: "#f8fafc",
                                padding: "16px",
                                borderRadius: "12px",
                              }}
                            >
                              <div
                                style={{
                                  color: "#667085",
                                  fontSize: "13px",
                                  marginBottom: "6px",
                                }}
                              >
                                NPA Date
                              </div>

                              <div style={{ fontWeight: "700" }}>
                                {selectedLoan.npaDate || "N/A"}
                              </div>
                            </div>

                            <div
                              style={{
                                background: "#f8fafc",
                                padding: "16px",
                                borderRadius: "12px",
                              }}
                            >
                              <div
                                style={{
                                  color: "#667085",
                                  fontSize: "13px",
                                  marginBottom: "6px",
                                }}
                              >
                                NPA Reason
                              </div>

                              <div style={{ fontWeight: "700" }}>
                                {selectedLoan.npaReason || "N/A"}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <button
                        type="button"
                        onClick={loadNpaLoans}
                        disabled={npaLoading}
                        style={{
                          marginTop: "20px",
                          padding: "11px 18px",
                          border: "none",
                          borderRadius: "10px",
                          background: "#111827",
                          color: "#ffffff",
                          cursor: npaLoading ? "not-allowed" : "pointer",
                          opacity: npaLoading ? 0.6 : 1,
                        }}
                      >
                        {npaLoading ? "Refreshing..." : "Refresh NPA Status"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {activeLoanService !== "Loan Application" &&
                activeLoanService !== "My Loans" &&
                activeLoanService !== "Eligibility Calculator" &&
                activeLoanService !== "Credit Score" &&
                activeLoanService !== "EMI Calculator" &&
                activeLoanService !== "Repayment Schedule" &&
                activeLoanService !== "Foreclosure" &&
                activeLoanService !== "NPA Monitoring" &&  (
                  <div
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      background: "#f8fbff",
                      border: "1px solid #e1e8f3",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 8px",
                        fontSize: "16px",
                      }}
                    >
                      {activeLoanService}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#71809a",
                        fontSize: "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      This service is being connected to the Avani Bank loan
                      backend. The complete calculator, score, repayment and
                      loan-management functionality will be enabled here.
                    </p>
                  </div>
                )}
            </div>
          )}
          <div className="loan-footer">
            © 2026 Avani Bank • Secure Digital Banking
          </div>
        </div>
      </div>
    </>
  );
}

export default LoanManagement;
