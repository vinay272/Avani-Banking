import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BalanceInquiry() {
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1000);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
      setIsTablet(window.innerWidth <= 1000);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const responsiveStyles = getResponsiveStyles(isTablet, isMobile);

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8080/api/accounts",
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
          throw new Error("Unable to fetch account balance.");
        }

        const data = await response.json();

        console.log("Balance Inquiry API Response:", data);

        if (Array.isArray(data) && data.length > 0) {
          setAccount(data[0]);
        } else {
          setAccount(null);
        }

      } catch (err) {
        console.error("Balance Inquiry Error:", err);

        setError(
          err.message || "Unable to load account balance."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [navigate]);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div style={responsiveStyles.loadingPage}>
        <div style={responsiveStyles.loadingCard}>
          <div style={responsiveStyles.loadingIcon}>₹</div>

          <h2 style={responsiveStyles.loadingTitle}>
            Checking Balance
          </h2>

          <p style={responsiveStyles.loadingText}>
            Please wait while we fetch your account balance...
          </p>

          <div style={responsiveStyles.loader}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={responsiveStyles.page}>

      {/* ================= NAVBAR ================= */}

      <header style={responsiveStyles.navbar}>

        <div style={responsiveStyles.brandArea}>

          <div style={responsiveStyles.brandIcon}>
            🏦
          </div>

          <div>
            <div style={responsiveStyles.brandName}>
              AVANI BANK
            </div>

            <div style={responsiveStyles.brandSubtitle}>
              Balance Inquiry
            </div>
          </div>

        </div>

        <button
          style={responsiveStyles.backButton}
          onClick={() => navigate("/accounts")}
        >
          ← Account Management
        </button>

      </header>

      {/* ================= MAIN ================= */}

      <main style={responsiveStyles.container}>

        <section style={responsiveStyles.pageHeader}>

          <p style={responsiveStyles.eyebrow}>
            ACCOUNT SERVICES
          </p>

          <h1 style={responsiveStyles.title}>
            Balance Inquiry
          </h1>

          <p style={responsiveStyles.subtitle}>
            Check your current account balance and account status.
          </p>

        </section>

        {/* ================= ERROR ================= */}

        {error && (
          <div style={responsiveStyles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* ================= BALANCE CARD ================= */}

        {account ? (

          <section style={responsiveStyles.balanceCard}>

            <div style={responsiveStyles.balanceIcon}>
              ₹
            </div>

            <p style={responsiveStyles.label}>
              AVAILABLE BALANCE
            </p>

            <h2 style={responsiveStyles.balance}>
              ₹{formatCurrency(account.balance)}
            </h2>

            <div style={responsiveStyles.divider}></div>

            <div style={responsiveStyles.accountInfo}>

              <div>
                <p style={responsiveStyles.infoLabel}>
                  ACCOUNT NUMBER
                </p>

                <p style={responsiveStyles.infoValue}>
                  {account.accountNumber || "N/A"}
                </p>
              </div>

              <div>
                <p style={responsiveStyles.infoLabel}>
                  ACCOUNT TYPE
                </p>

                <p style={responsiveStyles.infoValue}>
                  {account.accountType || "N/A"}
                </p>
              </div>

              <div>
                <p style={responsiveStyles.infoLabel}>
                  STATUS
                </p>

                <p style={responsiveStyles.status}>
                  ● {account.status || "ACTIVE"}
                </p>
              </div>

            </div>

          </section>

        ) : (

          <div style={responsiveStyles.emptyCard}>

            <div style={responsiveStyles.emptyIcon}>
              🏦
            </div>

            <h3 style={responsiveStyles.emptyTitle}>
              No Account Found
            </h3>

            <p style={responsiveStyles.emptyText}>
              We could not find an account associated with your profile.
            </p>

          </div>

        )}

        {/* ================= BACK BUTTON ================= */}

        <div style={responsiveStyles.bottomActions}>

          <button
            style={responsiveStyles.primaryButton}
            onClick={() => navigate("/accounts")}
          >
            ← Back to Account Management
          </button>

        </div>

      </main>

      {/* ================= FOOTER ================= */}

      <footer style={responsiveStyles.footer}>

        <div>
          © {new Date().getFullYear()} Avani Bank
        </div>

        <div>
          Secure • Reliable • Digital Banking
        </div>

      </footer>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
  },

  navbar: {
    minHeight: "72px",
     background:
      "linear-gradient(135deg, #102354 0%, #173f9d 48%, #2563d4 100%)",
    borderBottom: "1px solid #e8ecf2",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxSizing: "border-box",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  brandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #102354, #2457c6)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  brandName: {
    fontSize: "15px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#ffffff",
  },

  brandSubtitle: {
    marginTop: "2px",
    fontSize: "10px",
    color: "#8993a8",
  },

  backButton: {
    border: "1px solid #e1e6ef",
    background: "#ffffff",
    color: "#42516d",
    borderRadius: "9px",
    padding: "9px 15px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "45px 24px 60px",
    boxSizing: "border-box",
  },

  pageHeader: {
    textAlign: "center",
    marginBottom: "35px",
  },

  eyebrow: {
    margin: 0,
    color: "#2457c6",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.7px",
  },

  title: {
    margin: "8px 0 8px",
    fontSize: "36px",
    color: "#15213d",
    letterSpacing: "-0.7px",
  },

  subtitle: {
    margin: 0,
    color: "#7d879b",
    fontSize: "14px",
  },

  errorBox: {
    background: "#fff8e8",
    border: "1px solid #f5dfaa",
    color: "#8b650e",
    padding: "13px 16px",
    borderRadius: "10px",
    fontSize: "12px",
    marginBottom: "20px",
  },

  balanceCard: {
    background: "#ffffff",
    border: "1px solid #e4e9f1",
    borderRadius: "22px",
    padding: "45px",
    textAlign: "center",
    boxShadow:
      "0 12px 35px rgba(24,43,83,0.07)",
  },

  balanceIcon: {
    width: "70px",
    height: "70px",
    margin: "0 auto 20px",
    borderRadius: "20px",
    background: "#ecfdf5",
    color: "#11895b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "800",
  },

  label: {
    margin: 0,
    color: "#8993a8",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  balance: {
    margin: "8px 0 30px",
    fontSize: "44px",
    color: "#182440",
    letterSpacing: "-1px",
  },

  divider: {
    height: "1px",
    background: "#e8ecf2",
    marginBottom: "25px",
  },

  accountInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    textAlign: "left",
  },

  infoLabel: {
    margin: 0,
    color: "#929bad",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  infoValue: {
    margin: "6px 0 0",
    color: "#253657",
    fontSize: "14px",
    fontWeight: "700",
  },

  status: {
    margin: "6px 0 0",
    color: "#14875a",
    fontSize: "14px",
    fontWeight: "800",
  },

  bottomActions: {
    display: "flex",
    justifyContent: "center",
    marginTop: "25px",
  },

  primaryButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #173b8c, #2563c7)",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e8ecf2",
    borderRadius: "18px",
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "17px",
    background: "#eef3f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
  },

  emptyTitle: {
    margin: "14px 0 6px",
    fontSize: "17px",
    color: "#25314d",
  },

  emptyText: {
    margin: 0,
    color: "#929bad",
    fontSize: "12px",
  },

  footer: {
    borderTop: "1px solid #e5e9f0",
    background: "#ffffff",
    padding: "18px 6%",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    color: "#939baa",
    fontSize: "9px",
    boxSizing: "border-box",
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
    borderRadius: "20px",
    padding: "35px",
    textAlign: "center",
    boxShadow:
      "0 15px 40px rgba(25,45,85,0.08)",
  },

  loadingIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto",
    borderRadius: "17px",
    background: "#ecfdf5",
    color: "#11895b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "800",
  },

  loadingTitle: {
    margin: "15px 0 6px",
    fontSize: "18px",
    color: "#1c2947",
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
    animation: "spin 0.8s linear infinite",
  },
};

const getResponsiveStyles = (isTablet, isMobile) => ({
  ...styles,
  navbar: {
    ...styles.navbar,
    ...(isTablet && {
      padding: "0 4%",
    }),
    ...(isMobile && {
      minHeight: "auto",
      padding: "14px 18px",
      flexDirection: "column",
      alignItems: "stretch",
      gap: "12px",
    }),
  },
  brandArea: {
    ...styles.brandArea,
    ...(isMobile && {
      justifyContent: "center",
    }),
  },
  backButton: {
    ...styles.backButton,
    ...(isMobile && {
      width: "100%",
      padding: "11px 14px",
      fontSize: "12px",
    }),
  },
  container: {
    ...styles.container,
    ...(isTablet && {
      padding: "35px 20px 50px",
    }),
    ...(isMobile && {
      padding: "28px 14px 40px",
    }),
  },
  pageHeader: {
    ...styles.pageHeader,
    ...(isMobile && {
      marginBottom: "24px",
    }),
  },
  title: {
    ...styles.title,
    ...(isTablet && {
      fontSize: "32px",
    }),
    ...(isMobile && {
      fontSize: "28px",
      lineHeight: 1.15,
    }),
  },
  subtitle: {
    ...styles.subtitle,
    ...(isMobile && {
      fontSize: "13px",
      lineHeight: 1.5,
    }),
  },
  errorBox: {
    ...styles.errorBox,
    ...(isMobile && {
      padding: "12px 13px",
      fontSize: "11px",
    }),
  },
  balanceCard: {
    ...styles.balanceCard,
    ...(isTablet && {
      padding: "35px",
    }),
    ...(isMobile && {
      padding: "28px 18px",
      borderRadius: "18px",
    }),
  },
  balanceIcon: {
    ...styles.balanceIcon,
    ...(isMobile && {
      width: "60px",
      height: "60px",
      borderRadius: "17px",
      fontSize: "26px",
      marginBottom: "16px",
    }),
  },
  balance: {
    ...styles.balance,
    ...(isTablet && {
      fontSize: "40px",
    }),
    ...(isMobile && {
      fontSize: "34px",
      lineHeight: 1.15,
      overflowWrap: "anywhere",
      marginBottom: "24px",
    }),
  },
  accountInfo: {
    ...styles.accountInfo,
    ...(isTablet && {
      gap: "14px",
    }),
    ...(isMobile && {
      gridTemplateColumns: "1fr",
      gap: "16px",
      textAlign: "center",
    }),
  },
  infoValue: {
    ...styles.infoValue,
    ...(isMobile && {
      fontSize: "13px",
      overflowWrap: "anywhere",
    }),
  },
  status: {
    ...styles.status,
    ...(isMobile && {
      fontSize: "13px",
    }),
  },
  bottomActions: {
    ...styles.bottomActions,
    ...(isMobile && {
      marginTop: "20px",
    }),
  },
  primaryButton: {
    ...styles.primaryButton,
    ...(isMobile && {
      width: "100%",
      padding: "13px 16px",
      fontSize: "12px",
    }),
  },
  emptyCard: {
    ...styles.emptyCard,
    ...(isMobile && {
      minHeight: "220px",
      padding: "24px 18px",
      borderRadius: "16px",
    }),
  },
  emptyText: {
    ...styles.emptyText,
    ...(isMobile && {
      lineHeight: 1.5,
      maxWidth: "280px",
    }),
  },
  footer: {
    ...styles.footer,
    ...(isMobile && {
      padding: "15px 18px",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "6px",
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
      padding: "28px 20px",
      borderRadius: "18px",
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
      lineHeight: 1.5,
    }),
  },
});

export default BalanceInquiry;