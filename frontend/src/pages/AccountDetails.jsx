import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AccountDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:8080/api/accounts/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("customer");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to fetch account details."
          );
        }

        const data = await response.json();

        setAccount(data);
      } catch (err) {
        console.error("Account Details Error:", err);

        setError(
          err.message || "Unable to load account details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [id, navigate]);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusStyle = (status) => {
    const normalized = status?.toUpperCase();

    if (normalized === "FROZEN") {
      return {
        background: "#fff1f1",
        color: "#d63c3c",
        border: "1px solid #f4cccc",
      };
    }

    if (normalized === "CLOSED") {
      return {
        background: "#f1f3f5",
        color: "#6b7280",
        border: "1px solid #dfe3e8",
      };
    }

    return {
      background: "#ecfdf5",
      color: "#14875a",
      border: "1px solid #c9efdd",
    };
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>🏦</div>

          <h2 style={styles.loadingTitle}>
            Loading account
          </h2>

          <p style={styles.loadingText}>
            Please wait while we fetch your account details...
          </p>

          <div style={styles.loader}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.brandArea}>
            <div style={styles.brandIcon}>🏦</div>

            <div>
              <div style={styles.brandName}>
                AVANI BANK
              </div>

              <div style={styles.brandSubtitle}>
                Account Details
              </div>
            </div>
          </div>

          <button
            style={styles.headerButton}
            onClick={() => navigate("/accounts")}
          >
            ← Back to Accounts
          </button>
        </header>

        <main style={styles.container}>
          <div style={styles.errorBox}>
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.brandArea}>
            <div style={styles.brandIcon}>🏦</div>

            <div>
              <div style={styles.brandName}>
                AVANI BANK
              </div>

              <div style={styles.brandSubtitle}>
                Account Details
              </div>
            </div>
          </div>
        </header>

        <main style={styles.container}>
          <div style={styles.errorBox}>
            Account not found.
          </div>
        </main>
      </div>
    );
  }

  const statusStyle = getStatusStyle(account.status);

  return (
    <div style={styles.page}>

      {/* ================= HEADER ================= */}

      <header style={styles.header}>

        <div style={styles.brandArea}>

          <div style={styles.brandIcon}>
            🏦
          </div>

          <div>
            <div style={styles.brandName}>
              AVANI BANK
            </div>

            <div style={styles.brandSubtitle}>
              Account Details
            </div>
          </div>

        </div>

        <button
          style={styles.headerButton}
          onClick={() => navigate("/accounts")}
        >
          ← Back to Accounts
        </button>

      </header>

      {/* ================= MAIN ================= */}

      <main style={styles.container}>

        <section style={styles.pageHeading}>

          <p style={styles.eyebrow}>
            ACCOUNT INFORMATION
          </p>

          <h1 style={styles.title}>
            Account Details
          </h1>

          <p style={styles.subtitle}>
            View your account information and details.
          </p>

        </section>

        {/* ================= DETAILS CARD ================= */}

        <section style={styles.detailsCard}>

          {/* ACCOUNT NUMBER */}

          <div style={styles.detailRow}>

            <div style={styles.detailIcon}>
              💳
            </div>

            <div style={styles.detailContent}>

              <p style={styles.label}>
                ACCOUNT NUMBER
              </p>

              <p style={styles.value}>
                {account.accountNumber || "N/A"}
              </p>

            </div>

            <button
              style={styles.copyButton}
              onClick={() =>
                navigator.clipboard?.writeText(
                  account.accountNumber || ""
                )
              }
            >
              ⧉
            </button>

          </div>

          {/* ACCOUNT TYPE */}

          <div style={styles.detailRow}>

            <div style={styles.detailIcon}>
              👛
            </div>

            <div style={styles.detailContent}>

              <p style={styles.label}>
                ACCOUNT TYPE
              </p>

              <p style={styles.value}>
                {account.accountType || "N/A"}
              </p>

            </div>

          </div>

          {/* STATUS */}

          <div style={styles.detailRow}>

            <div
              style={{
                ...styles.detailIcon,
                background: "#eaf9f2",
              }}
            >
              ●
            </div>

            <div style={styles.detailContent}>

              <p style={styles.label}>
                ACCOUNT STATUS
              </p>

              <span
                style={{
                  ...styles.statusBadge,
                  ...statusStyle,
                }}
              >
                ● {account.status || "ACTIVE"}
              </span>

            </div>

          </div>

          {/* BALANCE */}

          <div style={styles.detailRow}>

            <div
              style={{
                ...styles.detailIcon,
                background: "#eaf9f2",
                color: "#11915e",
              }}
            >
              ₹
            </div>

            <div style={styles.detailContent}>

              <p style={styles.label}>
                AVAILABLE BALANCE
              </p>

              <p style={styles.balance}>
                ₹{formatCurrency(account.balance)}
              </p>

            </div>

          </div>

          {/* INTEREST */}

          <div
            style={{
              ...styles.detailRow,
              borderBottom: "none",
            }}
          >

            <div style={styles.detailIcon}>
              %
            </div>

            <div style={styles.detailContent}>

              <p style={styles.label}>
                INTEREST RATE
              </p>

              <p style={styles.interest}>
                {account.interestRate || 0}%
              </p>

            </div>

          </div>

        </section>

        {/* ================= SECURITY CARD ================= */}

        <section style={styles.securityCard}>

          <div style={styles.securityIcon}>
            🛡️
          </div>

          <div>

            <h3 style={styles.securityTitle}>
              Your account is secure
            </h3>

            <p style={styles.securityText}>
              Your account information is protected
              with bank-level security.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  header: {
    minHeight: "78px",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    background:
      "linear-gradient(135deg, #102354 0%, #173f9d 48%, #2563d4 100%)",
    boxSizing: "border-box",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  brandIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  brandName: {
    color: "#fff",
    fontSize: "15px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  brandSubtitle: {
    color: "rgba(255,255,255,0.75)",
    marginTop: "3px",
    fontSize: "11px",
  },

  headerButton: {
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    borderRadius: "12px",
    padding: "11px 17px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  container: {
    width: "100%",
    maxWidth: "850px",
    margin: "0 auto",
    padding: "48px 24px 60px",
    boxSizing: "border-box",
  },

  pageHeading: {
    textAlign: "center",
    marginBottom: "28px",
  },

  eyebrow: {
    margin: 0,
    color: "#2457c6",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.8px",
  },

  title: {
    margin: "8px 0 6px",
    color: "#172442",
    fontSize: "34px",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: 0,
    color: "#78849b",
    fontSize: "13px",
  },

  detailsCard: {
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "18px",
    padding: "10px 20px",
    boxShadow:
      "0 10px 30px rgba(25,45,85,0.06)",
  },

  detailRow: {
    minHeight: "78px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    borderBottom: "1px solid #edf0f5",
  },

  detailIcon: {
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "12px",
    background: "#edf3ff",
    color: "#245fd0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    fontWeight: "800",
  },

  detailContent: {
    flex: 1,
  },

  label: {
    margin: 0,
    color: "#71809b",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  value: {
    margin: "5px 0 0",
    color: "#182743",
    fontSize: "15px",
    fontWeight: "700",
  },

  balance: {
    margin: "5px 0 0",
    color: "#182743",
    fontSize: "22px",
    fontWeight: "800",
  },

  interest: {
    margin: "5px 0 0",
    color: "#245dcc",
    fontSize: "16px",
    fontWeight: "800",
  },

  copyButton: {
    width: "38px",
    height: "38px",
    border: "1px solid #e2e7ef",
    background: "#fff",
    borderRadius: "10px",
    color: "#60708c",
    cursor: "pointer",
    fontSize: "16px",
  },

  statusBadge: {
    display: "inline-block",
    marginTop: "6px",
    padding: "5px 10px",
    borderRadius: "12px",
    fontSize: "9px",
    fontWeight: "800",
  },

  securityCard: {
    marginTop: "20px",
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 6px 20px rgba(25,45,85,0.04)",
  },

  securityIcon: {
    width: "43px",
    height: "43px",
    minWidth: "43px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, #153d9a, #2868d8)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  securityTitle: {
    margin: 0,
    color: "#24304a",
    fontSize: "13px",
  },

  securityText: {
    margin: "4px 0 0",
    color: "#8993a8",
    fontSize: "10px",
  },

  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffd0d0",
    color: "#d93434",
    borderRadius: "12px",
    padding: "18px",
    textAlign: "center",
    fontSize: "14px",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingCard: {
    background: "#fff",
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
    color: "#1d2b47",
    margin: "12px 0 5px",
  },

  loadingText: {
    color: "#8993a8",
    fontSize: "12px",
  },

  loader: {
    width: "27px",
    height: "27px",
    border: "3px solid #dfe6f2",
    borderTop: "3px solid #2457c6",
    borderRadius: "50%",
    margin: "18px auto 0",
    animation: "spin 0.8s linear infinite",
  },
};

export default AccountDetails;