import { useNavigate } from "react-router-dom";

// =====================================================
// TIME BASED GREETING
// =====================================================

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";

  return "Good Night";
};

// =====================================================
// ADMIN DASHBOARD
// =====================================================

function AdminDashboard() {
  const navigate = useNavigate();

  // ===================================================
  // STYLES
  // ===================================================

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f7fb",
      color: "#1d2b4f",
      fontFamily:
        "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    // =================================================
    // HEADER
    // =================================================

    header: {
      minHeight: "76px",
      background:
        "linear-gradient(135deg, #0b3b8f 0%, #174fae 55%, #2867d6 100%)",
      color: "#ffffff",
      padding: "0 5%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      boxShadow: "0 4px 18px rgba(15,61,145,.16)",
      boxSizing: "border-box",
    },

    brandArea: {
      display: "flex",
      alignItems: "center",
      gap: "13px",
    },

    brandIcon: {
      width: "42px",
      height: "42px",
      borderRadius: "12px",
      background: "rgba(255,255,255,.15)",
      border: "1px solid rgba(255,255,255,.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "21px",
      flexShrink: 0,
    },

    brand: {
      margin: 0,
      fontSize: "19px",
      fontWeight: 800,
      letterSpacing: ".8px",
    },

    subtitle: {
      margin: "4px 0 0",
      fontSize: "9px",
      opacity: 0.78,
      letterSpacing: "1.2px",
      fontWeight: 600,
    },

    navRight: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    adminBadge: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      background: "rgba(255,255,255,.13)",
      border: "1px solid rgba(255,255,255,.22)",
      color: "#ffffff",
      padding: "8px 12px",
      borderRadius: "20px",
      fontSize: "9px",
      fontWeight: 800,
      letterSpacing: ".6px",
      whiteSpace: "nowrap",
    },

    onlineDot: {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#55e6a5",
      boxShadow: "0 0 0 3px rgba(85,230,165,.15)",
    },

    logoutButton: {
      border: "1px solid rgba(255,255,255,.3)",
      background: "rgba(255,255,255,.1)",
      color: "#ffffff",
      padding: "9px 15px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: 700,
      transition: "all .2s ease",
    },

    // =================================================
    // MAIN CONTAINER
    // =================================================

    container: {
      width: "90%",
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "30px 0 50px",
      boxSizing: "border-box",
    },

    // =================================================
    // BREADCRUMB
    // =================================================

    breadcrumb: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
      marginBottom: "22px",
      fontSize: "10px",
      color: "#8994a8",
      fontWeight: 600,
    },

    breadcrumbActive: {
      color: "#2457c6",
      fontWeight: 700,
    },

    // =================================================
    // GREETING
    // =================================================

    greetingCard: {
      background:
        "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
      border: "1px solid #e5eaf2",
      borderRadius: "18px",
      padding: "25px 27px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "25px",
      boxShadow: "0 8px 30px rgba(25,50,95,.045)",
      marginBottom: "28px",
      boxSizing: "border-box",
    },

    greetingLeft: {
      minWidth: 0,
    },

    greetingSmall: {
      margin: "0 0 7px",
      color: "#2457c6",
      fontSize: "11px",
      fontWeight: 800,
      letterSpacing: ".8px",
      textTransform: "uppercase",
    },

    greetingTitle: {
      margin: 0,
      fontSize: "27px",
      lineHeight: 1.2,
      color: "#14254a",
      fontWeight: 750,
      letterSpacing: "-.5px",
    },

    greetingSubtitle: {
      margin: "8px 0 0",
      color: "#7d879b",
      fontSize: "12px",
      lineHeight: 1.6,
      maxWidth: "650px",
    },

    greetingIcon: {
      width: "76px",
      height: "76px",
      borderRadius: "20px",
      background:
        "linear-gradient(135deg, #edf4ff 0%, #dfeaff 100%)",
      border: "1px solid #d9e5fb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "34px",
      flexShrink: 0,
    },

    // =================================================
    // SECTION HEADER
    // =================================================

    section: {
      marginTop: "28px",
    },

    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: "15px",
      gap: "15px",
    },

    sectionEyebrow: {
      margin: "0 0 4px",
      color: "#2457c6",
      fontSize: "9px",
      fontWeight: 800,
      letterSpacing: "1.3px",
    },

    sectionTitle: {
      margin: 0,
      fontSize: "17px",
      color: "#1d2b4f",
      fontWeight: 750,
    },

    sectionDescription: {
      margin: "4px 0 0",
      fontSize: "11px",
      color: "#8a94a7",
    },

    // =================================================
    // MANAGEMENT CARDS
    // =================================================

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "17px",
    },

    card: {
      position: "relative",
      background: "#ffffff",
      border: "1px solid #e5eaf1",
      borderRadius: "16px",
      padding: "21px",
      boxShadow: "0 7px 25px rgba(24,43,83,.035)",
      cursor: "pointer",
      textAlign: "left",
      transition:
        "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
      boxSizing: "border-box",
      overflow: "hidden",
    },

    cardTopLine: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      background:
        "linear-gradient(90deg, #174fae, #4b82e8)",
    },

    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "15px",
    },

    icon: {
      width: "48px",
      height: "48px",
      borderRadius: "13px",
      background: "#eef4ff",
      border: "1px solid #dce8fc",
      color: "#2457c6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "21px",
      flexShrink: 0,
    },

    cardArrow: {
      width: "29px",
      height: "29px",
      borderRadius: "50%",
      background: "#f4f7fc",
      color: "#54709f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "15px",
      flexShrink: 0,
    },

    cardTitle: {
      margin: "17px 0 7px",
      fontSize: "14px",
      color: "#1f2f53",
      fontWeight: 750,
    },

    cardText: {
      margin: 0,
      fontSize: "11px",
      lineHeight: 1.65,
      color: "#8993a7",
    },

    cardFooter: {
      marginTop: "17px",
      paddingTop: "13px",
      borderTop: "1px solid #eef1f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    cardAction: {
      fontSize: "10px",
      color: "#2457c6",
      fontWeight: 750,
    },

    secureLabel: {
      fontSize: "9px",
      color: "#8d98aa",
      fontWeight: 600,
    },

    // =================================================
    // QUICK ACCESS
    // =================================================

    quickGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "13px",
    },

    quickCard: {
      background: "#ffffff",
      border: "1px solid #e5eaf1",
      borderRadius: "13px",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      cursor: "pointer",
      textAlign: "left",
      boxShadow: "0 5px 18px rgba(24,43,83,.025)",
      transition:
        "transform .2s ease, box-shadow .2s ease",
      boxSizing: "border-box",
    },

    quickIcon: {
      width: "38px",
      height: "38px",
      borderRadius: "10px",
      background: "#f1f5fc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "17px",
      flexShrink: 0,
    },

    quickTitle: {
      margin: 0,
      fontSize: "11px",
      color: "#253657",
      fontWeight: 750,
    },

    quickText: {
      margin: "3px 0 0",
      fontSize: "9px",
      color: "#919aab",
    },

    // =================================================
    // SYSTEM STATUS
    // =================================================

    statusPanel: {
      marginTop: "28px",
      background: "#ffffff",
      border: "1px solid #e5eaf1",
      borderRadius: "16px",
      padding: "19px 21px",
      boxShadow: "0 6px 22px rgba(24,43,83,.03)",
    },

    statusHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
      marginBottom: "16px",
    },

    statusTitle: {
      margin: 0,
      fontSize: "13px",
      color: "#243452",
      fontWeight: 750,
    },

    statusBadge: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "#ecfaf4",
      color: "#16845b",
      padding: "6px 10px",
      borderRadius: "15px",
      fontSize: "9px",
      fontWeight: 750,
    },

    statusGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(170px, 1fr))",
      gap: "10px",
    },

    statusItem: {
      background: "#f8fafc",
      border: "1px solid #edf0f4",
      borderRadius: "10px",
      padding: "11px 12px",
    },

    statusItemTop: {
      display: "flex",
      alignItems: "center",
      gap: "7px",
    },

    statusDot: {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: "#25a873",
      flexShrink: 0,
    },

    statusItemTitle: {
      margin: 0,
      fontSize: "10px",
      color: "#344463",
      fontWeight: 700,
    },

    statusItemText: {
      margin: "4px 0 0 14px",
      fontSize: "8px",
      color: "#929bad",
    },

    // =================================================
    // FOOTER
    // =================================================

    footer: {
      marginTop: "35px",
      paddingTop: "17px",
      borderTop: "1px solid #e4e8ef",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
      color: "#929bad",
      fontSize: "9px",
    },

    footerBrand: {
      fontWeight: 750,
      color: "#68758c",
    },
  };

  // ===================================================
  // ADMIN MODULES
  // ===================================================

  const adminModules = [
    {
      icon: "📊",
      title: "Reports & Executive Dashboard",
      text:
        "Monitor banking KPIs, financial performance, compliance reports, branch analytics and executive-level insights.",
      path: "/admin/reports",
    },

    {
      icon: "🛡️",
      title: "Fraud & Risk Management",
      text:
        "Monitor fraud alerts, suspicious activities, risk levels, security events and fraud investigation records.",
      path: "/admin/fraud",
    },

    {
      icon: "🎧",
      title: "Customer Support",
      text:
        "Manage customer complaints, service requests, branch appointments, feedback and support conversations.",
      path: "/admin/customer-support",
    },

     {
      icon: "⚖️",
      title: "Compliance & Audit",
      text:
      "Monitor audit logs, regulatory compliance, AML, KYC, transaction monitoring and data retention policies.",
      path: "/admin/compliance",
    },

    {
      icon: "🏢",
      title: "Branch Management",
      text:"Manage branch operations, branch staff, branch performance, branch locations and branch services.",
      path: "/admin/branch-management",
    }
  ];

  // ===================================================
  // QUICK ACCESS
  // ===================================================

  const quickAccess = [
    {
      icon: "📈",
      title: "Executive Reports",
      text: "Banking analytics",
      path: "/admin/reports",
    },

    {
      icon: "🚨",
      title: "Fraud Alerts",
      text: "Security monitoring",
      path: "/admin/fraud",
    },

    {
      icon: "🎧",
      title: "Support Center",
      text: "Customer services",
      path: "/admin/customer-support",
    },

    {
      icon: "🔐",
      title: "Security Panel",
      text: "Risk management",
      path: "/admin/fraud",
    },
  ];

  // ===================================================
  // NAVIGATION
  // ===================================================

  const handleLogout = () => {
    navigate("/admin/login");
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div style={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <header style={styles.header}>

        <div style={styles.brandArea}>

          <div style={styles.brandIcon}>
            🏦
          </div>

          <div>
            <h1 style={styles.brand}>
              AVANI BANK
            </h1>

            <p style={styles.subtitle}>
              ADMINISTRATION & MANAGEMENT PORTAL
            </p>
          </div>

        </div>

        <div style={styles.navRight}>

          <div style={styles.adminBadge}>
            <span style={styles.onlineDot}></span>
            ADMIN SECURITY PANEL
          </div>

          <button
            type="button"
            style={styles.logoutButton}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "rgba(255,255,255,.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "rgba(255,255,255,.1)";
            }}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main style={styles.container}>

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div style={styles.breadcrumb}>
          <span>AVANI BANK</span>

          <span>›</span>

          <span style={styles.breadcrumbActive}>
            Admin Dashboard
          </span>
        </div>

        {/* =================================================
            GREETING
        ================================================= */}

        <section style={styles.greetingCard}>

          <div style={styles.greetingLeft}>

            <p style={styles.greetingSmall}>
              {getGreeting()} · Administrator
            </p>

            <h2 style={styles.greetingTitle}>
              Welcome to Avani Bank Admin 👋
            </h2>

            <p style={styles.greetingSubtitle}>
              Manage banking operations, monitor security,
              support customers and review executive insights
              from your centralized administration portal.
            </p>

          </div>

          <div style={styles.greetingIcon}>
            🏦
          </div>

        </section>

        {/* =================================================
            MANAGEMENT MODULES
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div>
              <p style={styles.sectionEyebrow}>
                ADMINISTRATION
              </p>

              <h3 style={styles.sectionTitle}>
                Management Modules
              </h3>

              <p style={styles.sectionDescription}>
                Access the core administrative functions of Avani Bank.
              </p>
            </div>

          </div>

          <div style={styles.grid}>

            {adminModules.map((module) => (

              <button
                key={module.path}
                type="button"
                style={styles.card}
                onClick={() => navigate(module.path)}

                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-4px)";

                  e.currentTarget.style.boxShadow =
                    "0 14px 32px rgba(24,43,83,.09)";

                  e.currentTarget.style.borderColor =
                    "#d4e0f5";
                }}

                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";

                  e.currentTarget.style.boxShadow =
                    "0 7px 25px rgba(24,43,83,.035)";

                  e.currentTarget.style.borderColor =
                    "#e5eaf1";
                }}
              >

                <div style={styles.cardTopLine}></div>

                <div style={styles.cardHeader}>

                  <div style={styles.icon}>
                    {module.icon}
                  </div>

                  <div style={styles.cardArrow}>
                    →
                  </div>

                </div>

                <h4 style={styles.cardTitle}>
                  {module.title}
                </h4>

                <p style={styles.cardText}>
                  {module.text}
                </p>

                <div style={styles.cardFooter}>

                  <span style={styles.cardAction}>
                    Open Module →
                  </span>

                  <span style={styles.secureLabel}>
                    Secure Access
                  </span>

                </div>

              </button>

            ))}

          </div>

        </section>

        {/* =================================================
            QUICK ACCESS
        ================================================= */}

        <section style={styles.section}>

          <div style={styles.sectionHeader}>

            <div>
              <p style={styles.sectionEyebrow}>
                QUICK ACCESS
              </p>

              <h3 style={styles.sectionTitle}>
                Frequently Used Services
              </h3>
            </div>

          </div>

          <div style={styles.quickGrid}>

            {quickAccess.map((item) => (

              <button
                key={`${item.title}-${item.path}`}
                type="button"
                style={styles.quickCard}
                onClick={() => navigate(item.path)}

                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-2px)";

                  e.currentTarget.style.boxShadow =
                    "0 9px 24px rgba(24,43,83,.07)";
                }}

                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0)";

                  e.currentTarget.style.boxShadow =
                    "0 5px 18px rgba(24,43,83,.025)";
                }}
              >

                <div style={styles.quickIcon}>
                  {item.icon}
                </div>

                <div>
                  <p style={styles.quickTitle}>
                    {item.title}
                  </p>

                  <p style={styles.quickText}>
                    {item.text}
                  </p>
                </div>

              </button>

            ))}

          </div>

        </section>

        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

        <section style={styles.statusPanel}>

          <div style={styles.statusHeader}>

            <h3 style={styles.statusTitle}>
              System Status
            </h3>

            <div style={styles.statusBadge}>
              <span style={styles.statusDot}></span>
              All Systems Operational
            </div>

          </div>

          <div style={styles.statusGrid}>

            <div style={styles.statusItem}>

              <div style={styles.statusItemTop}>
                <span style={styles.statusDot}></span>

                <p style={styles.statusItemTitle}>
                  Banking Platform
                </p>
              </div>

              <p style={styles.statusItemText}>
                Operational
              </p>

            </div>

            <div style={styles.statusItem}>

              <div style={styles.statusItemTop}>
                <span style={styles.statusDot}></span>

                <p style={styles.statusItemTitle}>
                  Security Services
                </p>
              </div>

              <p style={styles.statusItemText}>
                Operational
              </p>

            </div>

            <div style={styles.statusItem}>

              <div style={styles.statusItemTop}>
                <span style={styles.statusDot}></span>

                <p style={styles.statusItemTitle}>
                  Customer Support
                </p>
              </div>

              <p style={styles.statusItemText}>
                Operational
              </p>

            </div>

            <div style={styles.statusItem}>

              <div style={styles.statusItemTop}>
                <span style={styles.statusDot}></span>

                <p style={styles.statusItemTitle}>
                  Reporting Services
                </p>
              </div>

              <p style={styles.statusItemText}>
                Operational
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer style={styles.footer}>

          <span style={styles.footerBrand}>
            AVANI BANK · ADMINISTRATION PORTAL
          </span>

          <span>
            Secure Banking Management System
          </span>

        </footer>

      </main>

    </div>
  );
}

export default AdminDashboard;