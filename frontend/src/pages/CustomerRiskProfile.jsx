import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerRiskProfile() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [riskProfile, setRiskProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // LOAD CUSTOMER + RISK PROFILE
  // =========================

  useEffect(() => {
    loadRiskProfile();
  }, []);

  const loadRiskProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      // Get logged-in customer
      const customerResponse = await fetch(
        "http://localhost:8080/api/customers/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        customerResponse.status === 401 ||
        customerResponse.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("customer");
        navigate("/login",{
        replace: true,  
        });
        return;
      }

      if (!customerResponse.ok) {
        throw new Error("Unable to fetch customer details.");
      }

      const customerData = await customerResponse.json();

      setCustomer(customerData);
      console.log("CUSTOMER ID:", customerData.id);

      // Get risk profile
      const riskResponse = await fetch(
        `http://localhost:8080/api/risk-profile/customer/${customerData.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Profile doesn't exist

      if (riskResponse.status === 404) {
        setRiskProfile(null);
        return;
      }

      // Token problem

      if (
        riskResponse.status === 401 ||
        riskResponse.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("customer");
        navigate("/login",{
        replace: true,
      });
        return;
      }

      if (!riskResponse.ok) {
        throw new Error("Unable to fetch risk profile.");
      }

      const riskData = await riskResponse.json();

    // =========================
    // SET RISK PROFILE
    // =========================

      setRiskProfile(riskData);
    } catch (err) {
      console.error("Risk Profile Error:", err);
      setRiskProfile(null);
      setError(
        err.message || "Unable to load risk profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RISK LEVEL STYLE
  // =========================

  const getRiskStyle = (level) => {
    const normalized = level?.toUpperCase();

    if (normalized === "LOW") {
      return {
        background: "#ecfdf5",
        color: "#15803d",
        border: "1px solid #bbf7d0",
      };
    }

    if (normalized === "MEDIUM") {
      return {
        background: "#fff8e7",
        color: "#9a6700",
        border: "1px solid #f3dfaa",
      };
    }

    if (normalized === "HIGH") {
      return {
        background: "#fff1f1",
        color: "#b42318",
        border: "1px solid #fecaca",
      };
    }

    return {
      background: "#f1f5f9",
      color: "#64748b",
      border: "1px solid #e2e8f0",
    };
  };

  // =========================
  // RISK SCORE
  // =========================

  const riskScore = Number(
    riskProfile?.riskScore || 0
  );

  const scorePercentage = Math.min(
    Math.max(riskScore, 0),
    100
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            🛡️
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Risk Profile
          </h2>

          <p style={styles.loadingText}>
            Please wait while we fetch your risk profile...
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
          HEADER
      ========================= */}

      <header style={styles.header}>

        <div>
          <div style={styles.brand}>
            AVANI BANK
          </div>

          <h1 style={styles.title}>
            Customer Risk Profile
          </h1>

          <p style={styles.subtitle}>
            View your current customer risk assessment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={styles.dashboardButton}
        >
          ← Dashboard
        </button>

      </header>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div style={styles.errorMessage}>
          ⚠️ {error}
        </div>
      )}

      {/* =========================
          CUSTOMER INFORMATION
      ========================= */}

      <div style={styles.customerCard}>

        <div style={styles.customerAvatar}>
          {customer?.fullName
            ?.charAt(0)
            ?.toUpperCase() || "C"}
        </div>

        <div style={styles.customerInfo}>

          <p style={styles.customerLabel}>
            CUSTOMER
          </p>

          <h2 style={styles.customerName}>
            {customer?.fullName || "Customer"}
          </h2>

          <p style={styles.customerEmail}>
            {customer?.email || "Email unavailable"}
          </p>

        </div>

        <div style={styles.accountInfo}>

          <p style={styles.customerLabel}>
            ACCOUNT NUMBER
          </p>

          <strong style={styles.accountNumber}>
            {customer?.accountNumber || "N/A"}
          </strong>

        </div>

      </div>

      {/* =========================
          NO PROFILE
      ========================= */}

      {!riskProfile ? (

        <div style={styles.emptyCard}>

          <div style={styles.emptyIcon}>
            🛡️
          </div>

          <h2 style={styles.emptyTitle}>
            Risk Profile Not Available
          </h2>

          <p style={styles.emptyText}>
            A customer risk profile has not been
            created for your account yet.
          </p>

          <button
            type="button"
            onClick={loadRiskProfile}
            style={styles.retryButton}
          >
            Refresh
          </button>

        </div>

      ) : (

        <>
          {/* =========================
              MAIN RISK CARD
          ========================= */}

          <div style={styles.mainCard}>

            <div style={styles.cardHeader}>

              <div>

                <p style={styles.cardEyebrow}>
                  CURRENT ASSESSMENT
                </p>

                <h2 style={styles.cardTitle}>
                  Risk Assessment
                </h2>

              </div>

              <div
                style={{
                  ...styles.riskBadge,
                  ...getRiskStyle(
                    riskProfile.riskLevel
                  ),
                }}
              >
                {riskProfile.riskLevel ||
                  "UNKNOWN"}
              </div>

            </div>

            <div style={styles.riskContent}>

              {/* SCORE */}

              <div style={styles.scoreSection}>

                <div style={styles.scoreCircle}>

                  <div style={styles.scoreNumber}>
                    {riskScore}
                  </div>

                  <div style={styles.scoreText}>
                    / 100
                  </div>

                </div>

                <div>

                  <p style={styles.scoreLabel}>
                    RISK SCORE
                  </p>

                  <h3 style={styles.scoreTitle}>
                    {riskProfile.riskLevel ||
                      "Not Available"} Risk
                  </h3>

                  <p style={styles.scoreDescription}>
                    Your current risk assessment
                    score is {riskScore} out of 100.
                  </p>

                </div>

              </div>

              {/* SCORE BAR */}

              <div style={styles.scoreBarSection}>

                <div style={styles.scoreBarHeader}>

                  <span>
                    Risk Score
                  </span>

                  <strong>
                    {riskScore}/100
                  </strong>

                </div>

                <div style={styles.scoreBar}>
                  <div
                    style={{
                      ...styles.scoreBarFill,
                      width: `${scorePercentage}%`,
                    }}
                  ></div>
                </div>

                <div style={styles.scoreScale}>
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>

              </div>

            </div>

          </div>

          {/* =========================
              PROFILE DETAILS
          ========================= */}

          <div style={styles.detailsCard}>

            <div style={styles.cardHeader}>

              <div>

                <p style={styles.cardEyebrow}>
                  PROFILE DETAILS
                </p>

                <h2 style={styles.cardTitle}>
                  Risk Information
                </h2>

              </div>

            </div>

            <div style={styles.detailsGrid}>

              <div style={styles.detailItem}>

                <span style={styles.detailLabel}>
                  Risk Level
                </span>

                <span
                  style={{
                    ...styles.smallRiskBadge,
                    ...getRiskStyle(
                      riskProfile.riskLevel
                    ),
                  }}
                >
                  {riskProfile.riskLevel}
                </span>

              </div>

              <div style={styles.detailItem}>

                <span style={styles.detailLabel}>
                  Risk Score
                </span>

                <strong style={styles.detailValue}>
                  {riskScore} / 100
                </strong>

              </div>

              <div style={styles.detailItem}>

                <span style={styles.detailLabel}>
                  Created
                </span>

                <strong style={styles.detailValue}>
                  {riskProfile.createdAt
                    ? new Date(
                        riskProfile.createdAt
                      ).toLocaleDateString("en-IN")
                    : "N/A"}
                </strong>

              </div>

              <div style={styles.detailItem}>

                <span style={styles.detailLabel}>
                  Last Updated
                </span>

                <strong style={styles.detailValue}>
                  {riskProfile.updatedAt
                    ? new Date(
                        riskProfile.updatedAt
                      ).toLocaleDateString("en-IN")
                    : "N/A"}
                </strong>

              </div>

            </div>

          </div>

          {/* =========================
              REMARKS
          ========================= */}

          <div style={styles.remarksCard}>

            <div style={styles.remarksIcon}>
              ℹ️
            </div>

            <div>

              <h3 style={styles.remarksTitle}>
                Assessment Remarks
              </h3>

              <p style={styles.remarksText}>
                {riskProfile.remarks ||
                  "No remarks have been added to this risk profile."}
              </p>

            </div>

          </div>

        </>
      )}

      {/* =========================
          INFORMATION
      ========================= */}

      <div style={styles.infoBox}>

        <span style={styles.infoIcon}>
          🔒
        </span>

        <div>

          <strong style={styles.infoTitle}>
            Risk Profile Information
          </strong>

          <p style={styles.infoText}>
            This page displays the risk profile
            currently associated with your customer
            account. Risk information is maintained
            by the bank's verification system.
          </p>

        </div>

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
      "linear-gradient(135deg, #f5f7fb 0%, #eef3f9 100%)",
    padding: "25px32px",
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
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "2px",
    color: "#f2f5fa",
    marginBottom: "5px",
  },

  title: {
    margin: 0,
    fontSize: "29px",
    fontWeight: "800",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#cad5e6",
    fontSize: "13px",
  },

  dashboardButton: {
    border: "1px solid #d9e0ea",
    background: "#ffffff",
    color: "#26344a",
    borderRadius: "10px",
    padding: "10px 16px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow:
      "0 4px 12px rgba(20,35,60,0.05)",
  },

  errorMessage: {
    maxWidth: "1100px",
    margin: "0 auto 16px",
    padding: "12px 15px",
    borderRadius: "10px",
    background: "#fff1f1",
    border: "1px solid #ffd0d0",
    color: "#b42318",
    fontSize: "12px",
    fontWeight: "600",
  },

  customerCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "18px 20px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 7px 22px rgba(30,45,70,0.05)",
  },

  customerAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "800",
    flexShrink: 0,
  },

  customerInfo: {
    flex: 1,
    minWidth: 0,
  },

  customerLabel: {
    margin: 0,
    color: "#97a0b0",
    fontSize: "8px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  customerName: {
    margin: "3px 0 2px",
    fontSize: "15px",
    fontWeight: "800",
    color: "#1d2944",
  },

  customerEmail: {
    margin: 0,
    color: "#7c879a",
    fontSize: "10px",
  },

  accountInfo: {
    textAlign: "right",
    paddingLeft: "20px",
    borderLeft: "1px solid #edf0f5",
  },

  accountNumber: {
    display: "block",
    marginTop: "4px",
    color: "#253453",
    fontSize: "12px",
  },

  mainCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "23px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    boxShadow:
      "0 8px 25px rgba(30,45,70,0.06)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
    marginBottom: "22px",
  },

  cardEyebrow: {
    margin: 0,
    color: "#5572af",
    fontSize: "8px",
    letterSpacing: "1.5px",
    fontWeight: "800",
  },

  cardTitle: {
    margin: "4px 0 0",
    fontSize: "19px",
    fontWeight: "800",
    color: "#1d2944",
  },

  riskBadge: {
    padding: "7px 12px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },

  riskContent: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "35px",
    alignItems: "center",
  },

  scoreSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  scoreCircle: {
    width: "105px",
    height: "105px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #edf3ff, #f5f8ff)",
    border: "8px solid #e1eaff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  scoreNumber: {
    fontSize: "29px",
    fontWeight: "800",
    color: "#173b8c",
    lineHeight: "1",
  },

  scoreText: {
    marginTop: "4px",
    color: "#8993a8",
    fontSize: "10px",
  },

  scoreLabel: {
    margin: 0,
    color: "#9aa2b2",
    fontSize: "8px",
    letterSpacing: "1px",
    fontWeight: "800",
  },

  scoreTitle: {
    margin: "5px 0",
    color: "#263553",
    fontSize: "17px",
  },

  scoreDescription: {
    margin: 0,
    color: "#7c879a",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  scoreBarSection: {
    padding: "18px",
    background: "#f8fafc",
    border: "1px solid #edf0f5",
    borderRadius: "12px",
  },

  scoreBarHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#67748a",
    fontSize: "10px",
    fontWeight: "700",
    marginBottom: "9px",
  },

  scoreBar: {
    height: "9px",
    background: "#e6ebf3",
    borderRadius: "20px",
    overflow: "hidden",
  },

  scoreBarFill: {
    height: "100%",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg, #2457c6, #6a8fe5)",
    transition: "width 0.5s ease",
  },

  scoreScale: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "6px",
    color: "#9ba4b3",
    fontSize: "8px",
  },

  detailsCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "23px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    boxShadow:
      "0 8px 25px rgba(30,45,70,0.05)",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
  },

  detailItem: {
    padding: "14px",
    background: "#f8fafc",
    border: "1px solid #edf0f5",
    borderRadius: "10px",
    minWidth: 0,
  },

  detailLabel: {
    display: "block",
    color: "#9099a9",
    fontSize: "9px",
    marginBottom: "7px",
    fontWeight: "700",
  },

  detailValue: {
    color: "#273550",
    fontSize: "12px",
  },

  smallRiskBadge: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "9px",
    fontWeight: "800",
  },

  remarksCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "18px",
    background: "#f7f9fc",
    border: "1px solid #e4eaf2",
    borderRadius: "13px",
    display: "flex",
    gap: "12px",
  },

  remarksIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "#e9f0ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    flexShrink: 0,
  },

  remarksTitle: {
    margin: 0,
    color: "#33435c",
    fontSize: "12px",
  },

  remarksText: {
    margin: "5px 0 0",
    color: "#718096",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  infoBox: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "15px 17px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    background: "#f5f8fc",
    border: "1px solid #e1e8f1",
    borderRadius: "11px",
  },

  infoIcon: {
    fontSize: "15px",
  },

  infoTitle: {
    display: "block",
    color: "#33435a",
    fontSize: "10px",
  },

  infoText: {
    margin: "4px 0 0",
    color: "#778397",
    fontSize: "9px",
    lineHeight: "1.5",
  },

  emptyCard: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    padding: "55px 20px",
    background: "#ffffff",
    border: "1px solid #e4e9f0",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow:
      "0 8px 25px rgba(30,45,70,0.05)",
  },

  emptyIcon: {
    width: "58px",
    height: "58px",
    margin: "0 auto 12px",
    borderRadius: "50%",
    background: "#eef3fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#25314d",
  },

  emptyText: {
    maxWidth: "420px",
    margin: "7px auto 15px",
    color: "#7d8799",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  retryButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "9px 16px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  loadingPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f7fb, #edf2fb)",
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
    borderRadius: "18px",
    padding: "35px",
    textAlign: "center",
    boxShadow:
      "0 15px 40px rgba(25,45,85,0.08)",
  },

  loadingIcon: {
    fontSize: "40px",
  },

  loadingTitle: {
    margin: "13px 0 5px",
    fontSize: "18px",
    color: "#25314d",
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
    animation: "riskSpin 0.8s linear infinite",
  },
};

// =====================================================
// LOADER ANIMATION
// =====================================================

const styleElement = document.createElement("style");

styleElement.innerHTML = `
  @keyframes riskSpin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`;

if (!document.head.contains(styleElement)) {
  document.head.appendChild(styleElement);
}

export default CustomerRiskProfile;