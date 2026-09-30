import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AccountDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // RESPONSIVE VIEW
  // =========================
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined" && window.innerWidth <= 1000
  );
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 700
  );

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth <= 1000);
      setIsMobile(window.innerWidth <= 700);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // =========================
  // RESPONSIVE STYLES
  // =========================
  const responsiveStyles = {
    ...styles,

    header: {
      ...styles.header,
      ...(isTablet && {
        padding: "0 4%",
      }),
      ...(isMobile && {
        minHeight: "auto",
        padding: "14px 16px",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "12px",
      }),
    },

    brandArea: {
      ...styles.brandArea,
      ...(isMobile && {
        gap: "10px",
      }),
    },

    brandIcon: {
      ...styles.brandIcon,
      ...(isMobile && {
        width: "38px",
        height: "38px",
        minWidth: "38px",
        fontSize: "18px",
      }),
    },

    brandName: {
      ...styles.brandName,
      ...(isMobile && {
        fontSize: "13px",
      }),
    },

    brandSubtitle: {
      ...styles.brandSubtitle,
      ...(isMobile && {
        fontSize: "10px",
      }),
    },

    headerButton: {
      ...styles.headerButton,
      ...(isMobile && {
        width: "100%",
        padding: "11px 14px",
      }),
    },

    container: {
      ...styles.container,
      ...(isTablet && {
        padding: "38px 20px 50px",
      }),
      ...(isMobile && {
        padding: "30px 14px 40px",
      }),
    },

    pageHeading: {
      ...styles.pageHeading,
      ...(isMobile && {
        marginBottom: "20px",
      }),
    },

    title: {
      ...styles.title,
      ...(isTablet && {
        fontSize: "30px",
      }),
      ...(isMobile && {
        fontSize: "27px",
        letterSpacing: "-0.5px",
      }),
    },

    subtitle: {
      ...styles.subtitle,
      ...(isMobile && {
        fontSize: "12px",
        lineHeight: "1.5",
      }),
    },

    detailsCard: {
      ...styles.detailsCard,
      ...(isMobile && {
        padding: "6px 14px",
        borderRadius: "15px",
      }),
    },

    detailRow: {
      ...responsiveStyles.detailRow,
      ...(isMobile && {
        minHeight: "68px",
        gap: "10px",
      }),
    },

    detailIcon: {
      ...responsiveStyles.detailIcon,
      ...(isMobile && {
        width: "38px",
        height: "38px",
        minWidth: "38px",
        borderRadius: "10px",
        fontSize: "15px",
      }),
    },

    detailContent: {
      ...styles.detailContent,
      ...(isMobile && {
        minWidth: 0,
      }),
    },

    label: {
      ...styles.label,
      ...(isMobile && {
        fontSize: "8px",
        letterSpacing: "0.7px",
      }),
    },

    value: {
      ...styles.value,
      ...(isMobile && {
        fontSize: "13px",
        overflowWrap: "anywhere",
      }),
    },

    balance: {
      ...styles.balance,
      ...(isMobile && {
        fontSize: "19px",
      }),
    },

    interest: {
      ...styles.interest,
      ...(isMobile && {
        fontSize: "14px",
      }),
    },

    copyButton: {
      ...styles.copyButton,
      ...(isMobile && {
        width: "34px",
        height: "34px",
        minWidth: "34px",
        fontSize: "14px",
      }),
    },

    statusBadge: {
      ...responsiveStyles.statusBadge,
      ...(isMobile && {
        fontSize: "8px",
        padding: "4px 8px",
      }),
    },

    securityCard: {
      ...styles.securityCard,
      ...(isMobile && {
        padding: "15px",
        alignItems: "flex-start",
        gap: "11px",
      }),
    },

    securityIcon: {
      ...styles.securityIcon,
      ...(isMobile && {
        width: "38px",
        height: "38px",
        minWidth: "38px",
        fontSize: "16px",
      }),
    },

    securityTitle: {
      ...styles.securityTitle,
      ...(isMobile && {
        fontSize: "12px",
      }),
    },

    securityText: {
      ...styles.securityText,
      ...(isMobile && {
        fontSize: "9px",
        lineHeight: "1.5",
      }),
    },

    errorBox: {
      ...styles.errorBox,
      ...(isMobile && {
        padding: "14px",
        fontSize: "12px",
      }),
    },

    loadingPage: {
      ...styles.loadingPage,
      ...(isMobile && {
        padding: "16px",
      }),
    },

    loadingCard: {
      ...styles.loadingCard,
      ...(isMobile && {
        width: "100%",
        maxWidth: "360px",
        padding: "28px 20px",
        boxSizing: "border-box",
      }),
    },

    loadingTitle: {
      ...styles.loadingTitle,
      ...(isMobile && {
        fontSize: "17px",
      }),
    },

    loadingText: {
      ...styles.loadingText,
      ...(isMobile && {
        fontSize: "11px",
        lineHeight: "1.5",
      }),
    },
  };

  if (loading) {
    return (
      <div style={responsiveStyles.loadingPage}>
        <div style={responsiveStyles.loadingCard}>
          <div style={responsiveStyles.loadingIcon}>🏦</div>

          <h2 style={responsiveStyles.loadingTitle}>
            Loading account
          </h2>

          <p style={responsiveStyles.loadingText}>
            Please wait while we fetch your account details...
          </p>

          <div style={responsiveStyles.loader}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={responsiveStyles.page}>
        <header style={responsiveStyles.header}>
          <div style={responsiveStyles.brandArea}>
            <div style={responsiveStyles.brandIcon}>🏦</div>

            <div>
              <div style={responsiveStyles.brandName}>
                AVANI BANK
              </div>

              <div style={responsiveStyles.brandSubtitle}>
                Account Details
              </div>
            </div>
          </div>

          <button
            style={responsiveStyles.headerButton}
            onClick={() => navigate("/accounts")}
          >
            ← Back to Accounts
          </button>
        </header>

        <main style={responsiveStyles.container}>
          <div style={responsiveStyles.errorBox}>
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={responsiveStyles.page}>
        <header style={responsiveStyles.header}>
          <div style={responsiveStyles.brandArea}>
            <div style={responsiveStyles.brandIcon}>🏦</div>

            <div>
              <div style={responsiveStyles.brandName}>
                AVANI BANK
              </div>

              <div style={responsiveStyles.brandSubtitle}>
                Account Details
              </div>
            </div>
          </div>
        </header>

        <main style={responsiveStyles.container}>
          <div style={responsiveStyles.errorBox}>
            Account not found.
          </div>
        </main>
      </div>
    );
  }

  const statusStyle = getStatusStyle(account.status);

  return (
    <div style={responsiveStyles.page}>

      {/* ================= HEADER ================= */}

      <header style={responsiveStyles.header}>

        <div style={responsiveStyles.brandArea}>

          <div style={responsiveStyles.brandIcon}>
            🏦
          </div>

          <div>
            <div style={responsiveStyles.brandName}>
              AVANI BANK
            </div>

            <div style={responsiveStyles.brandSubtitle}>
              Account Details
            </div>
          </div>

        </div>

        <button
          style={responsiveStyles.headerButton}
          onClick={() => navigate("/accounts")}
        >
          ← Back to Accounts
        </button>

      </header>

      {/* ================= MAIN ================= */}

      <main style={responsiveStyles.container}>

        <section style={responsiveStyles.pageHeading}>

          <p style={responsiveStyles.eyebrow}>
            ACCOUNT INFORMATION
          </p>

          <h1 style={responsiveStyles.title}>
            Account Details
          </h1>

          <p style={responsiveStyles.subtitle}>
            View your account information and details.
          </p>

        </section>

        {/* ================= DETAILS CARD ================= */}

        <section style={responsiveStyles.detailsCard}>

          {/* ACCOUNT NUMBER */}

          <div style={responsiveStyles.detailRow}>

            <div style={responsiveStyles.detailIcon}>
              💳
            </div>

            <div style={responsiveStyles.detailContent}>

              <p style={responsiveStyles.label}>
                ACCOUNT NUMBER
              </p>

              <p style={responsiveStyles.value}>
                {account.accountNumber || "N/A"}
              </p>

            </div>

            <button
              style={responsiveStyles.copyButton}
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

          <div style={responsiveStyles.detailRow}>

            <div style={responsiveStyles.detailIcon}>
              👛
            </div>

            <div style={responsiveStyles.detailContent}>

              <p style={responsiveStyles.label}>
                ACCOUNT TYPE
              </p>

              <p style={responsiveStyles.value}>
                {account.accountType || "N/A"}
              </p>

            </div>

          </div>

          {/* STATUS */}

          <div style={responsiveStyles.detailRow}>

            <div
              style={{
                ...responsiveStyles.detailIcon,
                background: "#eaf9f2",
              }}
            >
              ●
            </div>

            <div style={responsiveStyles.detailContent}>

              <p style={responsiveStyles.label}>
                ACCOUNT STATUS
              </p>

              <span
                style={{
                  ...responsiveStyles.statusBadge,
                  ...statusStyle,
                }}
              >
                ● {account.status || "ACTIVE"}
              </span>

            </div>

          </div>

          {/* BALANCE */}

          <div style={responsiveStyles.detailRow}>

            <div
              style={{
                ...responsiveStyles.detailIcon,
                background: "#eaf9f2",
                color: "#11915e",
              }}
            >
              ₹
            </div>

            <div style={responsiveStyles.detailContent}>

              <p style={responsiveStyles.label}>
                AVAILABLE BALANCE
              </p>

              <p style={responsiveStyles.balance}>
                ₹{formatCurrency(account.balance)}
              </p>

            </div>

          </div>

          {/* INTEREST */}

          <div
            style={{
              ...responsiveStyles.detailRow,
              borderBottom: "none",
            }}
          >

            <div style={responsiveStyles.detailIcon}>
              %
            </div>

            <div style={responsiveStyles.detailContent}>

              <p style={responsiveStyles.label}>
                INTEREST RATE
              </p>

              <p style={responsiveStyles.interest}>
                {account.interestRate || 0}%
              </p>

            </div>

          </div>

        </section>

        {/* ================= SECURITY CARD ================= */}

        <section style={responsiveStyles.securityCard}>

          <div style={responsiveStyles.securityIcon}>
            🛡️
          </div>

          <div>

            <h3 style={responsiveStyles.securityTitle}>
              Your account is secure
            </h3>

            <p style={responsiveStyles.securityText}>
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